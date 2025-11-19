##🚀 Zero-Draft: Autonomous Legal Email & Contract Automation using AI Agents + RAG


Introduction

Legal teams today handle high volumes of unstructured emails, contract requests, and policy questions.
This leads to:

Slow turnaround time

Repetitive manual drafting

Difficulty tracking incoming legal requests

Inefficient document generation workflow

Zero-Draft solves these problems using an AI agent–powered LangGraph workflow that can read emails, understand attachments, retrieve legal context, and auto-draft contracts or replies — all before a lawyer even opens the dashboard.

Using multimodal LLMs, RAG, Pinecone, ChromaDB, and FastAPI, the system automates ~80% of legal operational work.

Features
📬 AI-Powered Legal Email Ingestion

Continuously reads unread emails from Gmail

Extracts:

Email text

Attachments (PDF, DOCX)

Metadata

Converts PDFs to images for multimodal processing

🧠 Legal Categorization with AI Agents

Every email is categorized into:

Legal Query

Contract Draft Request

Legal Review Request

Spam / Unrelated

This enables structured routing inside the workflow.

📄 Automated Contract Drafting (Contract RAG)

Detects contract type (NDA, Offer Letter, SA, MSA, etc.)

Retrieves templates from Pinecone Vector DB

Fills contract details automatically:

Names

Dates

Scope

Jurisdiction

Clauses

🔍 Legal Query Answering (Query RAG)

Converts user questions into high-quality queries

Searches ChromaDB legal playbook

Generates clear, structured responses

Ensures zero hallucination using internal RAG context

✔ Quality Assurance Agent

Ensures tone, correctness, compliance, and formatting

Proofreads AI-generated contracts & email drafts

Guarantees professional legal formatting

🖥 Human Review Dashboard

Built using React + Tailwind + ReactQuill

Lawyers can:

Edit generated draft

Add comments

Approve or reject drafts

Export final contract to PDF

Track document status in MongoDB

How It Works

Email Monitoring

GmailTools fetches unread emails

Extracts text + attachments

Converts attachments into usable formats

Categorization
Multimodal Categorizer Agent (Gemini/Groq) determines intent

Execution Pipelines

Legal Query: Query-RAG (ChromaDB) → Writer Agent → Proofreader

Contract Draft: Template Retrieval (Pinecone) → ContractWriter Agent

Spam: Instantly ignored

Save Draft

Contracts saved to MongoDB

Replies saved as Gmail Draft

Review Stage

Lawyer reviews in FastAPI dashboard

Edits + approves

Exports final PDF

System Flowchart

🔽 Insert your PNG workflow diagram below this line
(replace with your uploaded PNG)

![zero-draft-system-flow](workflow.png)

Tech Stack

LangGraph – Workflow state machine

Gemini/Groq LLMs – Multimodal reasoning and text generation

Pinecone – Contract template vector store

ChromaDB – Legal RAG knowledge base

FastAPI – Backend & API

React + Tailwind + ReactQuill – Review dashboard

MongoDB – Document + metadata storage

Gmail API – Email ingestion

pdf2image – PDF page conversion for multimodal inputs

How to Run
Prerequisites

Python 3.9+

Google Gemini API Key

Groq API Key (optional)

Pinecone Key

Gmail API credentials

MongoDB URI

Required libraries (requirements.txt)

Setup

Clone the repository

git clone https://github.com/yourname/zero-draft.git
cd zero-draft


Create & activate a virtual environment

python -m venv venv
source venv/bin/activate
# Windows: venv\Scripts\activate


Install dependencies

pip install -r requirements.txt


Add environment variables

Create a .env file:

GEMINI_API_KEY=
GROQ_API_KEY=
PINECONE_API_KEY=
CHROMA_DB_PATH=
MONGO_URI=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
MY_EMAIL=your_email@gmail.com

Running the System
Start the main ingestion + workflow
python main.py


This will:

Fetch emails

Categorize

Trigger RAG pipeline

Auto-generate drafts

Save to MongoDB

Run the Backend API
uvicorn backend.main:app --reload


Backend available at:

http://localhost:8000/docs

http://localhost:8000/playground (if LangServe enabled)

Start Dashboard
cd dashboard
npm install
npm run dev


Dashboard runs on http://localhost:5173 (or similar).

Customization

You can modify:

Agent prompts → located in the prompts/ directory

Contract templates → stored in Pinecone

Legal Playbook (RAG content) → stored in ChromaDB

Dashboard UI → /dashboard/src/

To rebuild your vector index after adding new templates:

python create_contract_index.py


To rebuild your legal knowledge base:

python create_legal_index.py