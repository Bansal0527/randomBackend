# AI Ticket System - Atlan

An intelligent customer support ticket classification and response system that automatically categorizes support tickets and generates contextual responses using RAG (Retrieval Augmented Generation) architecture.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │    │                     │
│   Next.js Frontend  │────│   FastAPI Backend   │────│  Google Gemini API  │
│                     │    │                     │    │                     │
│  • Dashboard        │    │  • Rate Limiting    │    │  • Classification   │
│  • File Upload      │    │  • Async Processing │    │  • Response Gen.    │
│  • Ticket Display   │    │  • CORS Enabled     │    │                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
                                      │
                                      │
                           ┌─────────────────────┐    ┌─────────────────────┐
                           │                     │    │                     │
                           │  RAG System         │────│  Vector Database    │
                           │                     │    │                     │
                           │  • Document Loader  │    │  • Qdrant           │
                           │  • Text Splitter    │    │                     │
                           │  • Embeddings       │    │                     │
                           │  • Context Retrieval│    │                     │
                           └─────────────────────┘    └─────────────────────┘
```

## 🚀 Features

### Core Functionality
- **Intelligent Ticket Classification**: Automatically categorizes tickets by:
  - **Topic**: How-to, Product, Connector, Lineage, API/SDK, SSO, Glossary, Best practices, Sensitive data
  - **Sentiment**: Frustrated, Curious, Angry, Neutral
  - **Priority**: P0, P1, P2

- **RAG-Powered Response Generation**: 
  - Searches Atlan documentation for relevant context
  - Generates accurate, contextual responses
  - Provides source references for transparency

- **Bulk Processing**: Upload JSON files with multiple tickets for batch classification

- **Rate Limiting**: Intelligent rate limiting to respect Gemini API limits (10 requests/minute)

### User Interface
- Clean, modern dashboard built with Next.js
- Real-time processing feedback
- Responsive design for all devices
- File upload with drag-and-drop support

## 🔧 Technology Stack

### Frontend
- **Next.js 15.5.3**: React framework with App Router
- **React 19.1.0**: Modern React with latest features
- **TailwindCSS 4**: Utility-first CSS framework
- **ESLint**: Code linting and quality assurance

### Backend
- **FastAPI**: High-performance async API framework
- **Python 3.12**: Modern Python with type hints
- **Pydantic**: Data validation and serialization
- **asyncio**: Asynchronous processing for scalability

### AI & ML
- **Google Gemini 2.0 Flash**: LLM for classification and response generation
- **LangChain**: Framework for LLM application development
- **Google Text Embeddings**: High-quality vector embeddings
- **Qdrant**: Vector database for semantic search

### Infrastructure
- **CORS**: Cross-origin resource sharing enabled
- **Rate Limiting**: Custom implementation for API protection
- **Environment Variables**: Secure configuration management

## 🏗️ Major Design Decisions & Trade-offs



### 1. **Asynchronous Processing with Rate Limiting**
**Decision**: Custom rate limiter with sliding window algorithm
- **Trade-off**: Processing time vs. API compliance
- **Rationale**: Ensures reliable operation within Gemini's 10 req/min limit while maintaining responsiveness

### 2. **Structured Classification Schema**
**Decision**: Predefined categories for topic, sentiment, and priority
- **Trade-off**: Flexibility vs. consistency
- **Rationale**: Enables reliable automation and integration with existing support workflows

### 3. **RAG Architecture for Documentation**
**Decision**: Real-time document retrieval vs. pre-computed responses
- **Trade-off**: Response latency vs. accuracy and freshness
- **Rationale**: Ensures up-to-date information from Atlan documentation with acceptable latency


## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.10+
- **Google AI Studio API Key** (for Gemini access)
- **Git** for version control

## 🛠️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-ticket-system-atlan
```

### 2. Backend Setup

#### Navigate to server directory
```bash
cd server
```

#### Create and activate virtual environment
```bash
python -m venv ticketenv
source ticketenv/bin/activate  # On Windows: ticketenv\Scripts\activate
```

#### Install dependencies
```bash
pip install -r requirements.txt
```

#### Configure environment variables
```bash
# Create .env file
touch .env

# Add your Google API key
echo "GOOGLE_API_KEY=your_google_api_key_here" >> .env
```

#### Initialize vector database (one-time setup)
```bash
# Run the RAG setup script to populate vector database
python rag.py
```

#### Start the backend server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Open new terminal and navigate to frontend directory
```bash
cd frontend
```

#### Install dependencies
```bash
npm install
```

#### Start the development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🔑 Environment Configuration

### Required Environment Variables

Create a `.env` file in the `server` directory:

```env
# Google AI Studio API Key (Required)
GOOGLE_API_KEY=your_google_api_key_here

# Optional: Qdrant Cloud Configuration
QDRANT_URL=your_qdrant_cloud_url
QDRANT_API_KEY=your_qdrant_api_key
```

### Getting Google API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create a new project or select existing one
3. Generate an API key
4. Add billing information (required for production use)

## 📊 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/classify-tickets` | Classify sample tickets |
| `POST` | `/classify-ticket` | Classify single ticket |
| `POST` | `/upload-tickets` | Bulk classify from JSON file |
| `POST` | `/generate-response` | Generate RAG response for ticket |

### Example Usage

#### Classify Single Ticket
```bash
curl -X POST "http://localhost:8000/classify-ticket" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "SSO login issues",
    "body": "Users cannot authenticate with Azure AD"
  }'
```

#### Upload Bulk Tickets
```bash
curl -X POST "http://localhost:8000/upload-tickets" \
  -F "file=@tickets.json"
```

## 📁 Project Structure

```
ai-ticket-system-atlan/
├── README.md
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Tag.js
│   │   │   └── TicketCard.js
│   │   ├── ask/
│   │   │   └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── types.js
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
├── server/
│   ├── main.py              # FastAPI application
│   ├── rag.py              # RAG setup and document processing
│   ├── requirements.txt     # Python dependencies
│   ├── sample_tickets.json  # Sample data for testing
│   └── vectorStore/        # Vector database storage
└── vectorStore/
    └── collection/
        └── demo_collection/
```

## 🧪 Testing

### Backend Testing
```bash
cd server
python -c "import requests; print(requests.get('http://localhost:8000').json())"
```

### Frontend Testing
```bash
cd frontend
npm run lint
```

### Sample Data
The project includes `sample_tickets.json` with realistic support tickets for testing the classification system.

## 🚀 Deployment

### Backend Deployment
1. Ensure all environment variables are set
2. Install production dependencies
3. Use ASGI server like Gunicorn:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend Deployment
```bash
cd frontend
npm run build
npm start
```

## 🔄 Rate Limiting Details

The system implements intelligent rate limiting for the Gemini API:

- **Limit**: 10 requests per minute (as per Gemini API)
- **Strategy**: Sliding window with automatic wait periods
- **Behavior**: Queues requests and processes them safely
- **Monitoring**: Logs progress for large batch operations



## 🆘 Troubleshooting

### Common Issues

1. **"GOOGLE_API_KEY not found"**
   - Ensure `.env` file exists in `server` directory
   - Verify API key is valid and has necessary permissions

2. **Vector database not found**
   - Run `python rag.py` to initialize the vector database
   - Check Qdrant connection settings


3. **Rate limiting delays**
   - Normal behavior for large batches
   - Monitor console logs for progress



---

