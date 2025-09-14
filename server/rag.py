from langchain_community.document_loaders import RecursiveUrlLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import getpass
import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import List, Tuple
from qdrant_client import QdrantClient


from langchain_community.docstore.in_memory import InMemoryDocstore
from langchain_community.vectorstores import FAISS
from langchain_qdrant import QdrantVectorStore

from langchain_community.document_loaders import WebBaseLoader


from qdrant_client.http.models import Distance, SparseVectorParams, VectorParams


load_dotenv()

if not os.environ.get("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY not found in environment. Please set it in your .env file.")

loader = RecursiveUrlLoader(
    "https://developer.atlan.com/",
    max_depth=3,       # go 3 levels deep
    prevent_outside=True,
)

# urls = ["https://docs.atlan.com/", "https://developer.atlan.com/"]  # or specific API refs


docs = loader.load()
print(docs[0].metadata)


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

all_splits = text_splitter.split_documents(docs)




embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")






# # Docker - Qdrant Cloud (commented out)
vector_store = QdrantVectorStore.from_documents(
    all_splits,
    embeddings,
    url="https://1ba32a1f-70ca-4a33-91c8-33974fd96e3e.europe-west3-0.gcp.cloud.qdrant.io",
    collection_name="atlan",
    force_recreate=True,
    api_key=os.environ.get("API_KEY"),
)


# # # Qdrant local client (commented out)
# # client = QdrantClient(path="./vectorStore")


# # Check if collection exists before creating (commented out)
# collection_name = "demo_collection"
# collections = client.get_collections().collections
# collection_names = [c.name for c in collections]
# if collection_name not in collection_names:
#     client.create_collection(
#         collection_name=collection_name,
#         vectors_config=VectorParams(size=768, distance=Distance.COSINE),
#     )


# vector_store = QdrantVectorStore(
#     client=client,
#     collection_name=collection_name,
#     embedding=embeddings,
# )

# _ = vector_store.add_documents(documents=all_splits)




# Test  similarity search
results = vector_store.similarity_search(
    "What is Atlan?",
    k=2,
)
print(results)
