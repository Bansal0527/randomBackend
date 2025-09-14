
from dotenv import load_dotenv
from fastapi import File, UploadFile

    
from fastapi import FastAPI
from pydantic import BaseModel
import json
from typing import List, Dict, Any
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
import os
# from rag import get_rag_response  # Import the RAG function
from google import genai


import getpass
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import List, Tuple
from fastapi.middleware.cors import CORSMiddleware
# from qdrant_client import QdrantClient
# from langchain_qdrant import QdrantVectorStore
from langchain_community.vectorstores import FAISS

from langchain_qdrant import QdrantVectorStore, RetrievalMode
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
import time
import asyncio
from collections import deque
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify ["http://localhost:3000"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rate limiter for Gemini API (10 requests per minute)
class RateLimiter:
    def __init__(self, max_requests: int = 10, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
    
    async def wait_if_needed(self):
        """Wait if necessary to respect rate limits"""
        now = datetime.now()
        
        # Remove requests older than time window
        while self.requests and self.requests[0] < now - timedelta(seconds=self.time_window):
            self.requests.popleft()
        
        # If we're at the limit, wait until we can make another request
        if len(self.requests) >= self.max_requests:
            oldest_request = self.requests[0]
            wait_time = (oldest_request + timedelta(seconds=self.time_window) - now).total_seconds()
            if wait_time > 0:
                print(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                await asyncio.sleep(wait_time + 0.1)  # Add small buffer
                return await self.wait_if_needed()  # Recursive call to check again
        
        # Record this request
        self.requests.append(now)

# Global rate limiter instance
gemini_rate_limiter = RateLimiter(max_requests=10, time_window=60)


load_dotenv()
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment. Please set it in your .env file.")
client = genai.Client(api_key=GOOGLE_API_KEY)

qdrant_client = QdrantClient(path="./vectorStore")

# Local directory for FAISS storage (relative path for deployment compatibility)


def get_rag_response(query: str, k: int = 3) -> Tuple[str, List[str]]:
    """
    Get RAG response for a query using the FAISS vector store and LLM.
    Returns tuple of (answer, sources)
    """
    # API key loaded from .env
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        

        
#         vector_store = QdrantVectorStore(
#         client=qdrant_client,
#         collection_name="demo_collection",
#         embedding=embeddings,
#         retrieval_mode=RetrievalMode.DENSE,
# )
    
    
        vector_store = QdrantVectorStore.from_existing_collection(
        embedding=embeddings,
        url="https://1ba32a1f-70ca-4a33-91c8-33974fd96e3e.europe-west3-0.gcp.cloud.qdrant.io",
        collection_name="atlan",
        api_key=api_key=os.environ.get("API_KEY"),,
    )

        # Search for relevant documents
        retriever = vector_store.as_retriever()
        results = retriever.invoke(query)
        print(results)
        
        if not results:
            return "I couldn't find relevant information in the documentation.", []
        
        # Extract content and sources
        context = "\n\n".join([doc.page_content for doc in results])
        sources = [doc.metadata.get("source", "https://docs.atlan.com/") for doc in results]
        print(sources)
        
        # Generate answer using LLM with context
        prompt = f"""
        Based on the following context from Atlan documentation, answer the user's question.
        If the context doesn't contain enough information, say so.
        
        Context:
        {context}
        
        Question: {query}
        
        Answer:
        """
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", api_key=GOOGLE_API_KEY)
        response = llm.invoke(prompt)
        print("Raw Response from Gemini:", response)
        answer = response.content if hasattr(response, 'content') else str(response)
        
        return answer, sources
        
    except Exception as e:
        print(f"Error in RAG response: {e}")
        return f"Error generating response: {str(e)}", []


class Ticket(BaseModel):
    subject: str
    body: str

async def classify_ticket(subject: str, body: str) -> Dict[str, str]:
    """
    Use Gemini LLM to classify ticket text into topic, sentiment, and priority.
    """
    # Wait for rate limit if needed
    await gemini_rate_limiter.wait_if_needed()
    
    prompt = f"""
    Classify the following customer support ticket. Return only a JSON object with these fields:
    - topic: One of [How-to, Product, Connector, Lineage, API/SDK, SSO, Glossary, Best practices, Sensitive data]
    - sentiment: One of [Frustrated, Curious, Angry, Neutral]
    - priority: One of [P0, P1, P2]

    Ticket subject: {subject}
    Ticket body: {body}
    
    Return only the JSON object, no other text.
    """
    
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents=prompt
    )
    
    # Clean and parse the response
    response_text = response.text.strip()
    print("Raw Response from Gemini:", response_text)
    
    # Remove markdown code blocks if present
    if response_text.startswith("```json"):
        response_text = response_text[7:]  # Remove ```json
    if response_text.startswith("```"):
        response_text = response_text[3:]   # Remove ```
    if response_text.endswith("```"):
        response_text = response_text[:-3]  # Remove trailing ```
    
    response_text = response_text.strip()
    
    try:
        # Parse the cleaned JSON
        classification = json.loads(response_text)
        return classification
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON: {e}")
        print(f"Cleaned response: {response_text}")
        # Return default values if parsing fails
        return {
            "topic": "Product",
            "sentiment": "Neutral",
            "priority": "P1"
        }


def generate_rag_response(text: str, topic: str) -> tuple[str, List[str]]:
    """
    Use RAG pipeline for relevant topics, else route message.
    """
    rag_topics = ["How-to", "Product", "Best practices", "API/SDK", "SSO"]
    if topic in rag_topics:
        # Use RAG pipeline to search and answer
        answer, sources = get_rag_response(text)
        return answer, sources
    else:
        return f"This ticket has been classified as a '{topic}' issue and routed to the appropriate team.", []

@app.get("/")
def home():
    return {"message": "Hello World"}

@app.post("/classify-tickets")
async def classify_tickets():
    # Load sample tickets from file
    with open("sample_tickets.json") as f:
        tickets = json.load(f)
    results = []
    for ticket in tickets:
        classification = await classify_ticket(ticket["subject"], ticket["body"])
        results.append({
            "id": ticket["id"],
            "subject": ticket["subject"],
            "body": ticket["body"],
            **classification
        })
    return results

@app.post("/classify-ticket")
async def classify_single_ticket(ticket: Ticket):
    classification = await classify_ticket(ticket.subject, ticket.body)
    return {
        "id": ticket.id,
        **classification
    }


@app.post("/generate-response")
async def generate_response(ticket: Ticket):
    classification = await classify_ticket(ticket.subject, ticket.body)
    query = f"{ticket.subject} {ticket.body}"
    answer, sources =  generate_rag_response(query, classification["topic"])
    return {
        "internal_analysis": classification,
        "final_response": answer,
        "sources": sources
    }



@app.post("/upload-tickets")
async def upload_tickets(file: UploadFile = File(...)):
    contents = await file.read()
    tickets = json.loads(contents)
    results = []
    
    print(f"Processing {len(tickets)} tickets with rate limiting...")
    
    for i, ticket in enumerate(tickets):
        print(f"Processing ticket {i+1}/{len(tickets)}: {ticket.get('id', 'unknown')}")
        classification = await classify_ticket(ticket["subject"], ticket["body"])
        results.append({
            "id": ticket["id"],
            "subject": ticket["subject"],
            "body": ticket["body"],
            **classification
        })
        
        # Log progress every 5 tickets
        if (i + 1) % 5 == 0:
            print(f"Completed {i+1}/{len(tickets)} tickets")
    
    print(f"Successfully processed all {len(tickets)} tickets")
    return results
