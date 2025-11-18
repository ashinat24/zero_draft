from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from pinecone import Pinecone, ServerlessSpec
import os
import time
from dotenv import load_dotenv

from pymongo import MongoClient
from dotenv import load_dotenv
import time


MONGO_URI = os.getenv("MONGO_URI")


client = MongoClient(MONGO_URI)
db = client["email_automation"]
emails_collection = db["emails"]

class ContractRAGAgent:
    def __init__(self, template_dir: str = "documents/"):
        print("🔹 Initializing Contract RAG Agent (Pinecone backend)...")

        load_dotenv()
        PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "contract-rags")

        if not PINECONE_API_KEY:
            raise ValueError("❌ Missing Pinecone API key in .env")

        pc = Pinecone(api_key=PINECONE_API_KEY)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        embed_dim = 768

        # Check if index exists, create if missing
        existing_indexes = [idx["name"] for idx in pc.list_indexes()]
        if INDEX_NAME not in existing_indexes:
            print(f"🪶 Creating new Pinecone index `{INDEX_NAME}`...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=embed_dim,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
            while not pc.describe_index(INDEX_NAME).status["ready"]:
                time.sleep(1)

        index = pc.Index(INDEX_NAME)
        self.vector_store = PineconeVectorStore(index=index, embedding=embeddings)
        self.retriever = self.vector_store.as_retriever(search_type="similarity", search_kwargs={"k": 4})

        # ----------------- Load and Upload Templates if Index is Empty -----------------
        loader = PyPDFDirectoryLoader(template_dir)
        raw_docs = loader.load()

        if not raw_docs:
            print(f"⚠️ No documents found in '{template_dir}' folder. Add templates before running.")
        else:
            stats = index.describe_index_stats()
            vector_count = stats.get("total_vector_count", 0)

            if vector_count == 0:
                print(f"📄 Uploading {len(raw_docs)} contract templates to Pinecone...")
                splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=200)
                docs = splitter.split_documents(raw_docs)
                uuids = [f"id{i}" for i in range(len(docs))]
                self.vector_store.add_documents(docs, ids=uuids)
                print("✅ Templates successfully uploaded to Pinecone.")
            else:
                print("📦 Pinecone index already has data — skipping upload.")

        # ----------------- LLM and Prompt -----------------
        self.llm = ChatGoogleGenerativeAI(model="gemini-flash-latest", temperature=0.3)

        self.prompt = ChatPromptTemplate.from_template("""
        You are a contract generation assistant.
        You will receive an email body and retrieved contract templates.

        Your task:
        1. Identify which type of contract or document the email is referring to.
        2. Use the templates provided in the context to generate a draft version.
        3. Fill in details such as name, date, amount, or other specifics from the email body.
        4. Ensure the tone and formatting match a formal business contract.

        Email Body:
        {email_body}

        Retrieved Templates:
        {context}

        ---
        Respond with the completed contract draft only, without extra commentary.
        """)

        self.rag_chain = (
            {"context": self.retriever, "email_body": RunnablePassthrough()}
            | self.prompt
            | self.llm
            | StrOutputParser()
        )

        print("✅ Contract RAG Agent (Pinecone) initialized successfully.")

    def generate_contract(self, email_body: str, email_meta: dict = None):
        """
        Generate a completed contract based on the email body and templates,
        then store it in MongoDB under 'contract_data'.
        """
        print("🧾 Generating contract draft from email body...")

        try:
            result = self.rag_chain.invoke(email_body)
            print("✅ Contract draft successfully generated.")
        except Exception as e:
            print(f"❌ Error during contract generation: {e}")
            result = "Error generating contract draft."

        # Build the record to save
        contract_record = {
            "timestamp": time.time(),
            "email_body": email_body,
            "contract_data": result,
        }

        # Optionally add email metadata (sender, subject, threadId, etc.)
        if email_meta:
            contract_record.update({
                "sender": email_meta.get("sender", "Unknown"),
                "subject": email_meta.get("subject", "No Subject"),
                "threadId": email_meta.get("threadId", ""),
                "messageId": email_meta.get("messageId", ""),
            })

        try:
            emails_collection.insert_one(contract_record)
            print("💾 Contract draft saved to MongoDB (field: contract_data).")
        except Exception as db_err:
            print(f"⚠️ Failed to save contract draft in DB: {db_err}")

        return result

