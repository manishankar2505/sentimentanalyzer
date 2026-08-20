# Sentiment Analyzer (Full-Stack + AI)

A production-ready Full-Stack Sentiment Analysis and Call Center Intelligence platform built with **React** (Frontend), **Python FastAPI & Uvicorn** (Backend Orchestration), and **Cerebras AI** (`gpt-oss-120b`).

---

## 🎯 Architecture Overview

```
[ React / Vite Frontend ]  ──(HTTP / REST)──>  [ FastAPI Backend (Uvicorn) ]  ──(JSON Prompt)──>  [ Cerebras AI: gpt-oss-120b ]
    • User Auth (JWT)                               • SQLite DB (Users)                                  • Structured Extraction
    • Drag & Drop .txt Upload                       • Structured Schema Validation                       • Multi-Turn Sentiment
    • Visual Charts & Timeline                      • Fallback Resilience Engine                         • Emotion & KPI Analytics
    • Filterable Turn Analysis
```

---

## ✨ Features

1. **Authentication (User Login & Register)**:
   - Embedded SQLite database (`sentiment_app.db`, `users` table).
   - Secure password hashing with `bcrypt` and JWT token authentication.
   - Standard Sign In and Create Account screens.

2. **Conversation Input & Upload**:
   - Drag-and-drop `.txt` conversation file uploader.
   - Built-in sample call selector (Billing Dispute, Tech Support, Service Outage Escalation, Enterprise Inquiry).
   - Real-time textarea input with live word and line counts.

3. **Sentiment & Call Intelligence Dashboard**:
   - **Overall Sentiment**: Positive / Negative / Neutral with confidence percentage and AI reasoning.
   - **Phone Call KPIs**:
     - Customer Satisfaction Score (CSAT / 5.0)
     - Agent Empathy & Politeness Score (out of 5.0)
     - Issue Resolution Status (Resolved / Partially Resolved / Escalated)
     - Escalation Risk (Low / Medium / High)
     - Talk-to-Listen Ratio (% Agent vs % Customer)
     - Estimated Call Duration and Turn Metrics
   - **Interactive Visual Charts**:
     - Sentiment Distribution Donut Chart
     - Sentiment Progression Arc (tracks sentiment shifts turn-by-turn across the call)
     - Emotion Detection Bar Chart (Joy, Frustration, Relief, Satisfaction, Confusion, Anger)
     - Customer vs Agent Sentiment Comparison
   - **Sentence-Level Sentiment Analysis**:
     - Turn-by-turn chat view with speaker avatars and sentiment badges.
     - Search bar and filters (Filter by Speaker or Sentiment).
     - Expandable AI reasoning drawer for each sentence.
   - **Executive Summary & Action Items**:
     - Concise call summary, key discussion topics, and next steps checklist.
   - **Export Report**: Download full analysis report in **JSON** or formatted **Text (.txt)**.

---

## 🚀 Running on VS Code (Quick Start)

### 1. Open the project in VS Code
Open the `SentimentAnalysis` folder in VS Code (`File` -> `Open Folder`).

### 2. Start the Backend (FastAPI + Uvicorn)
Open a terminal in VS Code:
```bash
cd backend
python -m uvicorn main:app --reload --port 5000
```
*Backend runs on `http://localhost:5000`* (Interactive Swagger API docs available at `http://localhost:5000/docs`).

### 3. Start the Frontend (React + Vite)
Open a second terminal tab in VS Code:
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 4. Open in Browser
Visit **`http://localhost:3000`** in your browser.

---

## 📂 Project Structure

```
SentimentAnalysis/
├── backend/
│   ├── .env                      # API keys & configurations
│   ├── main.py                   # FastAPI application & REST endpoints
│   ├── database.py               # SQLite database & User auth models
│   ├── cerebras_client.py        # Cerebras AI (gpt-oss-120b) prompt orchestration
│   ├── fallback_analyzer.py      # Rule-based NLP fallback engine
│   ├── requirements.txt          # Python dependencies
│   └── sentiment_app.db          # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx         # User Authentication screen
│   │   │   ├── Navbar.jsx        # Navigation & sample selector
│   │   │   ├── FileUpload.jsx    # Drag-and-drop .txt uploader & editor
│   │   │   ├── Dashboard.jsx     # Master analytics dashboard
│   │   │   ├── KpiCards.jsx      # Call center KPIs (CSAT, Empathy, Resolution)
│   │   │   ├── SentimentCharts.jsx # Recharts (Donut, Timeline Arc, Emotion Bar)
│   │   │   ├── SentenceAnalysis.jsx # Filterable turn-by-turn sentence analysis
│   │   │   ├── SummaryCard.jsx   # Conversation summary & action items
│   │   │   └── SettingsModal.jsx # Cerebras API key configuration modal
│   │   ├── data/
│   │   │   └── sampleTranscripts.js # Built-in phone call scenarios
│   │   ├── services/
│   │   │   └── api.js            # Axios API client
│   │   ├── App.jsx               # Application root
│   │   ├── main.jsx              # React DOM entry
│   │   └── index.css             # Tailwind CSS styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── sample_transcripts/           # Demo .txt files for instant testing
│   ├── call_sample_1_billing_frustration.txt
│   ├── call_sample_2_tech_support_success.txt
│   ├── call_sample_3_mixed_escalation.txt
│   └── call_sample_4_inquiry_neutral.txt
├── .vscode/                      # VS Code tasks & run configs
├── start.bat                     # 1-Click double-click runner
└── README.md
```
