# 🎙️ Sentiment Analyzer
> **Conversation Text Analyzer and Sentiment Detector**

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Uvicorn-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Cerebras AI](https://img.shields.io/badge/AI%20Model-Cerebras%20gpt--oss--120b-FF6F00)](https://cerebras.ai/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)

An enterprise-ready **Conversation Intelligence & Sentiment Analysis Platform** built to analyze customer service phone calls, detect turn-by-turn emotional trajectories, calculate vital call center KPIs, and provide sentence-level reasoning powered by **Python FastAPI** and **Cerebras AI (`gpt-oss-120b`)**.

---

## 🏗️ System Architecture & Execution Flow

```mermaid
flowchart TD
    subgraph S1["1. User Ingestion (Frontend UI)"]
        A["User uploads .txt transcript or pastes dialogue into text editor"]
    end

    subgraph S2["2. API Dispatch (REST API)"]
        B["React dispatches authenticated POST /api/analyze request"]
    end

    subgraph S3["3. Orchestration & Validation (FastAPI)"]
        C["• Guardrail Validation: Rejects gibberish & non-dialogue text\n• Dialogue Dissection: Segments multi-speaker turns\n• Metrics Pre-computation: Calculates talk-time % per speaker"]
    end

    subgraph S4["4. AI Reasoning & Extraction (Cerebras LLM)"]
        D["• Structured JSON Prompting sent to Cerebras gpt-oss-120b\n• LLM extracts Sentiment, CSAT, Emotions & Turn-by-Turn Reasoning\n• Zero-Downtime Heuristic Fallback Engine ensures 100% uptime"]
    end

    subgraph S5["5. Dashboard Visualization (Frontend UI)"]
        E["• KPI Cards: Full Call Summary, CSAT 1-5, Talk Share Bars\n• Charts: Sentiment Progression Arc (X: Turns, Y: Polarity)\n• Chat View: Filterable turn-by-turn sentences with AI drawer"]
    end

    S1 --> S2 --> S3 --> S4 --> S5
```

---

## 🔄 Detailed Step-by-Step Flow (What Happens & What is Done)

### Step 1: User Ingestion (`Frontend Layer`)
- The user uploads a customer support `.txt` file or pastes raw dialogue directly into the plain-text editor.
- The interface features live word and line counters with drag-and-drop support.

### Step 2: Request Dispatch (`REST API`)
- The frontend packages the transcript payload and sends an authenticated `POST /api/analyze` request to the Python FastAPI backend with JWT authorization.

### Step 3: Input Validation & Dialogue Segmentation (`FastAPI Orchestrator`)
- **Guardrail Check**: The orchestrator verifies that the input contains readable conversational language and rejects random keyboard mashing, symbol noise, plain articles, or single-speaker monologues with friendly error feedback.
- **Multi-Speaker Segmentation**: Intelligently parses dialogue turns for 2+ participants (e.g., `Agent (Alex)`, `Customer 1 (Jane)`, `Customer 2 (Tom)`), whether on separate lines or inline in a continuous block.
- **Speaker Metrics Computation**: Computes exact word counts, dialogue turn counts, and percentage talk-share for every participant.

### Step 4: AI Sentiment & KPI Extraction (`Cerebras gpt-oss-120b`)
- The backend sends a zero-shot, structured prompt to **Cerebras AI (`gpt-oss-120b`)** enforcing a strict JSON schema.
- The model analyzes the conversational arc and extracts:
  - **Overall Polarity**: Positive, Negative, or Neutral with confidence percentage.
  - **Call Center KPIs**: CSAT rating (1.0 to 5.0), Resolution Status, Escalation Risk, and Agent Empathy rating.
  - **Executive Call Summary**: Unclipped overview of caller concerns, agent handling, and resolution.
  - **Turn-by-Turn Sentence Analysis**: Sentiment polarity score, discrete emotion classification (Satisfaction, Frustration, Relief, Anger, Confusion, Joy), and explicit 1-sentence reasoning for every line.
- **Resilience Fallback**: If cloud API limits are encountered, the built-in heuristic NLP analyzer executes seamlessly with zero downtime.

### Step 5: Dashboard Visualization (`React + Recharts Layer`)
- The frontend receives the structured intelligence payload and renders the interactive dashboard:
  - **Executive KPI Cards**: Displays overall sentiment, complete untruncated Call Summary, color-coded speaker talk-share bars, and CSAT rating.
  - **Sentiment Progression Arc**: Visualizes the emotional journey of the conversation on an interactive area chart (X-axis: Turn sequence, Y-axis: Polarity score).
  - **Sentence Breakdown**: Interactive chat list where users can filter turns by speaker or emotion and expand AI explanations.

---

## 📋 What is Done

### 1. 📂 Ingestion & Strict Format Validation
- Accepts **`.txt` transcript file uploads** or **direct copy-pasted conversation text**.
- **Smart Dialogue Turn Extraction**: Automatically detects and separates turns for single or multi-speaker conference calls (e.g. `Agent (Alex): ...`, `Customer 1 (Jane): ...`, `Customer 2 (Tom): ...`).
- **Format & Gibberish Guardrails**: Detects and rejects non-dialogue inputs (e.g., essays, news articles, single monologues, or random keyboard mashing) with actionable guidance.

### 2. 📊 Call Center KPI Intelligence
- **Overall Sentiment**: Categorized as *Positive*, *Negative*, or *Neutral* with confidence percentage and contextual explanation.
- **Call Summary**: Complete, unclipped executive overview detailing the customer's initial problem, the agent's actions, and the final outcome.
- **Speakers Involved & Talk Share**: Exact participant count with real-time percentage talk-time bars and word counts.
- **Customer Satisfaction (CSAT)**: 1.0 to 5.0 rating scale computed from dialogue polarity shifts.
- **Resolution Status**: Evaluates if the issue is *Resolved*, *Partially Resolved*, or *Escalated*.
- **Escalation Risk**: Automated risk level assessment (*Low*, *Medium*, *High*).
- **Agent Empathy Score**: Evaluates agent professionalism, reassurance, and de-escalation effectiveness.

### 3. 📈 Visual Sentiment Analytics
- **Sentiment Progression Arc**: Interactive area chart plotting emotional movement throughout the dialogue:
  - **X-Axis**: Dialogue Turn Number (1, 2, 3, ... N).
  - **Y-Axis**: Polarity Level (`Positive (+1)`, `Neutral (0)`, `Negative (-1)`).
- **Emotion Frequency Breakdown**: Quantifies primary emotional signals (*Satisfaction*, *Relief*, *Joy*, *Frustration*, *Confusion*, *Anger*).
- **Speaker Polarity Comparison**: Side-by-side comparison of Agent vs. Customer sentiment.

### 4. 🔍 Turn-by-Turn Sentence Analysis
- Searchable and filterable chat view (filter by speaker or sentiment).
- Every sentence displays its detected sentiment, discrete emotion tag, polarity score, and an expandable AI explanation drawer.

### 5. 🔐 User Authentication & Session Security
- User registration and login backed by an embedded SQLite database (`sentiment_app.db`).
- Secure password hashing with `bcrypt` and JWT token-based authentication.

---

## 🛠️ What is Used (Tech Stack)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Component-based UI and blazing-fast development bundle |
| **Styling** | Tailwind CSS | Modern, responsive dashboard design |
| **Icons & Charts** | Lucide React, Recharts | Icons and interactive data visualizations |
| **Backend** | Python 3.14, FastAPI, Uvicorn | High-performance asynchronous REST API server |
| **Database & Auth** | SQLite, bcrypt, PyJWT | Embedded user credentials storage and token authorization |
| **AI Inference** | Cerebras API (`gpt-oss-120b`) | High-speed LLM inference for sentiment and reasoning |
| **Fallback Engine** | Python NLP Heuristics | Zero-downtime offline fallback engine |

---

## 🚀 How to Run Locally

### Prerequisites
- **Python** (v3.10+)
- **Node.js** (v18+) & **npm**

---

### Option 1: 1-Click Launch (Windows)
Double-click **`start.bat`** in the project root (or run `.\start.bat` in terminal).  
It automatically starts both the Python Backend and React Frontend in two windows!

---

### Option 2: Manual Terminal Commands

#### 1. Start Backend (FastAPI + Uvicorn)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 5000
```
> Backend runs at `http://localhost:5000`  
> Interactive Swagger API Docs: `http://localhost:5000/docs`

#### 2. Start Frontend (React + Vite)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
> Open your browser at `http://localhost:3000`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Login and receive a JWT Bearer token |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile |
| `POST` | `/api/analyze` | Analyze conversation transcript (JSON string or `.txt` file upload) |
| `GET` | `/api/health` | Health check and server status |

---

## 📝 License
MIT License. Built for the Sentiment Analysis & Call Intelligence assignment.
