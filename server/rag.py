from langchain_community.document_loaders import RecursiveUrlLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import getpass
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import List, Tuple

# import faiss
# from langchain_community.docstore.in_memory import InMemoryDocstore
# from langchain_community.vectorstores import FAISS
from langchain_qdrant import QdrantVectorStore




print("API KEY : ", os.environ.get("GOOGLE_API_KEY"))
if not os.environ.get("GOOGLE_API_KEY"):
  os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter API key for Google Gemini: ")

loader = RecursiveUrlLoader(
    "https://docs.atlan.com/",

)

docs = loader.load()
docs[0].metadata


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

all_splits = text_splitter.split_documents(docs)




embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")

# embedding_dim = len(embeddings.embed_query("hello world"))
# index = faiss.IndexFlatL2(embedding_dim)

# vector_store = FAISS(
#     embedding_function=embeddings,
#     index=index,
#     docstore=InMemoryDocstore(),
#     index_to_docstore_id={},
# )

# # Index chunks
# _ = vector_store.add_documents(documents=all_splits)

# vectorStore = QdrantVectorStore.from_existing_collection(
#     embedding=embeddings,
#     collection_name="docs",
#     url="http://localhost:6333",
# )


qdrant = QdrantVectorStore.from_documents(
    all_splits,
    embeddings,
    url="http://localhost:6333",
    collection_name="my_documents",
    force_recreate=True,
)

# _ = vector_store.add_documents(documents=all_splits)


# def get_rag_response(query: str, k: int = 3) -> Tuple[str, List[str]]:
#     """
#     Get RAG response for a query using the vector store and LLM.
#     Returns tuple of (answer, sources)
#     """
#     try:
#         # Search for relevant documents
#         results = qdrant.similarity_search(query, k=k)
        
#         if not results:
#             return "I couldn't find relevant information in the documentation.", []
        
#         # Extract content and sources
#         context = "\n\n".join([doc.page_content for doc in results])
#         sources = [doc.metadata.get("source", "https://developer.atlan.com/") for doc in results]
        
#         # Generate answer using LLM with context
#         prompt = f"""
#         Based on the following context from Atlan documentation, answer the user's question.
#         If the context doesn't contain enough information, say so.
        
#         Context:
#         {context}
        
#         Question: {query}
        
#         Answer:
#         """
        
#         response = llm.invoke(prompt)
#         answer = response.content if hasattr(response, 'content') else str(response)
        
#         return answer, sources
        
#     except Exception as e:
#         print(f"Error in RAG response: {e}")
#         return f"Error generating response: {str(e)}", []


results = qdrant.similarity_search(
    "What is Atlan?",
    k=2,
)
print(results)