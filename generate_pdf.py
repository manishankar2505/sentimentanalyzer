import sys
import os
import subprocess

try:
    import reportlab
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "reportlab"])
    import reportlab

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8.5)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Running Top Header on later pages
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "Sentiment Analyzer • Full Technical & Architecture Report")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
            
        # Running Bottom Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_text)
        self.drawString(54, 36, "Conversation Text Analyzer & Sentiment Detector — Technical Documentation")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)
        self.restoreState()

def build_pdf(filename="Sentiment_Analyzer_Project_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    PRIMARY = colors.HexColor("#0284c7")      # Sky Blue 600
    DARK_BLUE = colors.HexColor("#0f172a")    # Slate 900
    TEXT_COLOR = colors.HexColor("#334155")   # Slate 700
    LIGHT_BG = colors.HexColor("#f8fafc")     # Slate 50
    CARD_BG = colors.HexColor("#f0f9ff")      # Sky 50
    BORDER_COLOR = colors.HexColor("#e2e8f0") # Slate 200

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=DARK_BLUE,
        spaceAfter=3
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=DARK_BLUE,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=TEXT_COLOR,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=TEXT_COLOR,
        leftIndent=12,
        spaceAfter=3
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=TEXT_COLOR
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []

    # Title & Subtitle Header
    story.append(Paragraph("Sentiment Analyzer & Conversation Intelligence System", title_style))
    story.append(Paragraph("Comprehensive Technical Specification, Architectural Blueprint & Operational Guide", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=0, spaceAfter=10))

    # Links Callout Box
    links_data = [
        [
            Paragraph("<b>Live Production URL:</b>", table_cell),
            Paragraph("<font color='#0284c7'><u>https://sentimentanalyzer-xi.vercel.app</u></font>", table_cell)
        ],
        [
            Paragraph("<b>GitHub Repository:</b>", table_cell),
            Paragraph("<font color='#0284c7'><u>https://github.com/manishankar2505/sentimentanalyzer</u></font>", table_cell)
        ],
        [
            Paragraph("<b>Core AI Engine:</b>", table_cell),
            Paragraph("Cerebras Cloud Inference (<code>gpt-oss-120b</code>) + Python Multi-Speaker NLP Fallback", table_cell)
        ],
        [
            Paragraph("<b>Deployment Target:</b>", table_cell),
            Paragraph("Vercel Serverless Production (Automated CI/CD via GitHub)", table_cell)
        ]
    ]
    t_links = Table(links_data, colWidths=[1.7*inch, 5.1*inch])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_links)
    story.append(Spacer(1, 8))

    # SECTION 1: INTRODUCTION
    story.append(Paragraph("1. Introduction & Problem Statement", h1_style))
    story.append(Paragraph(
        "In enterprise contact centers and customer success departments, thousands of customer conversations take place across voice and chat channels daily. Uncovering customer satisfaction, tracking emotional escalation, auditing agent performance, and distilling key takeaways has historically been a slow, manual, and cost-prohibitive sampling process.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Sentiment Analyzer</b> is an automated, full-stack conversation text analyzer and sentiment detector designed to solve this challenge. It ingests raw conversation transcripts, enforces strict format and intelligibility guardrails, extracts multi-dimensional emotional arcs and critical call KPIs (CSAT, Resolution Status, Escalation Risk, Empathy score), and presents interactive visualizations through a modern React dashboard.",
        body_style
    ))

    # SECTION 2: TECH STACK & WHY USED
    story.append(Paragraph("2. Tech Stack Used & Technical Rationale", h1_style))
    story.append(Paragraph(
        "Every layer of the application was carefully selected to deliver high performance, clean architectural decoupling, data integrity, and a premium user experience.",
        body_style
    ))

    tech_table_data = [
        [
            Paragraph("<b>Tool / Library</b>", table_header),
            Paragraph("<b>Layer</b>", table_header),
            Paragraph("<b>Why It Was Used (Technical Justification & Benefits)</b>", table_header)
        ],
        [
            Paragraph("<b>React 18</b>", table_cell),
            Paragraph("Frontend UI", table_cell),
            Paragraph("Provides a component-driven declarative architecture, seamless reactive state management, and smooth DOM re-rendering when analyzing large conversation transcripts.", table_cell)
        ],
        [
            Paragraph("<b>Vite</b>", table_cell),
            Paragraph("Build Tool", table_cell),
            Paragraph("Offers blazing-fast Hot Module Replacement (HMR) during development and highly optimized Rollup production bundling with minimal asset overhead.", table_cell)
        ],
        [
            Paragraph("<b>Tailwind CSS</b>", table_cell),
            Paragraph("Styling", table_cell),
            Paragraph("Utility-first responsive framework that ensures design consistency, semantic color badges (Emerald/Rose/Amber), and responsive layout scaling across all screen sizes.", table_cell)
        ],
        [
            Paragraph("<b>Recharts</b>", table_cell),
            Paragraph("Data Viz", table_cell),
            Paragraph("Declarative, SVG-based charting library tailored for React. Used to construct the custom <b>Sentiment Progression Arc</b>, interactive Polarity Donut, and Emotion frequency charts.", table_cell)
        ],
        [
            Paragraph("<b>Python FastAPI</b>", table_cell),
            Paragraph("Backend API", table_cell),
            Paragraph("Asynchronous ASGI framework delivering ultra-low latency, native Pydantic schema validation, robust HTTP exception handling, and auto-generated Swagger API documentation.", table_cell)
        ],
        [
            Paragraph("<b>Uvicorn</b>", table_cell),
            Paragraph("ASGI Server", table_cell),
            Paragraph("Lightning-fast ASGI web server implementation for Python that manages asynchronous event loops and handles concurrent API analysis requests efficiently.", table_cell)
        ],
        [
            Paragraph("<b>SQLite & bcrypt</b>", table_cell),
            Paragraph("Database & Auth", table_cell),
            Paragraph("Self-contained, serverless embedded database with zero external dependencies. Integrated with salted bcrypt password hashing and PyJWT tokens for secure authentication.", table_cell)
        ],
        [
            Paragraph("<b>Cerebras AI (gpt-oss-120b)</b>", table_cell),
            Paragraph("LLM Engine", table_cell),
            Paragraph("Ultra-high throughput cloud inference model utilized for structured zero-shot prompt orchestration to extract nuanced sentiment polarities, emotions, and turn reasoning.", table_cell)
        ],
        [
            Paragraph("<b>Heuristic NLP Engine</b>", table_cell),
            Paragraph("Resilience Layer", table_cell),
            Paragraph("A custom-built multi-speaker fallback NLP engine that parses complex multi-party dialogues and derives CSAT ratings and talk-time shares even under API quota limits.", table_cell)
        ]
    ]
    t_tech = Table(tech_table_data, colWidths=[1.4*inch, 1.0*inch, 4.4*inch])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK_BLUE),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 8))

    # SECTION 3: ARCHITECTURE & EXPLANATION
    story.append(Paragraph("3. System Architecture & Detailed Layer Breakdown", h1_style))
    story.append(Paragraph(
        "The platform is structured on a clean 3-tier decoupled architecture guaranteeing that data flow is unidirectional, testable, and fault-tolerant:",
        body_style
    ))
    story.append(Paragraph("<b>1. Presentation Layer (React 18 Client):</b> Manages user authentication, file ingestion (.txt drag-and-drop or raw paste), interactive chart rendering with custom tooltips, and sentence filtering drawers.", bullet_style))
    story.append(Paragraph("<b>2. Orchestration & Security Layer (Python FastAPI Backend):</b> Houses the SQLite database, validates incoming payload structure, filters out unintelligible/garbage inputs, parses speaker turns across multi-party calls, and computes talk-time distributions.", bullet_style))
    story.append(Paragraph("<b>3. AI & Reasoning Layer (Cerebras AI + Local Heuristics):</b> Interacts with Cerebras <code>gpt-oss-120b</code> via structured JSON schema prompting to evaluate sentiment and calculate CSAT and Empathy metrics, with automated fallback resilience.", bullet_style))

    # SECTION 4: WORKING OF THE APPLICATION
    story.append(Paragraph("4. Working of the Application (Step-by-Step Lifecycle)", h1_style))
    story.append(Paragraph("<b>Step 1 — Authentication:</b> The user registers or signs in. Passwords are encrypted with <code>bcrypt</code>, and a JWT Bearer token is issued and stored in local storage for session management. Incorrect credentials return a clear 401 error.", bullet_style))
    story.append(Paragraph("<b>Step 2 — Transcript Ingestion:</b> The user drops a <code>.txt</code> file or pastes a call transcript. The UI displays dynamic word and line counters.", bullet_style))
    story.append(Paragraph("<b>Step 3 — Guardrail Validation:</b> The backend inspects the input. If the user submits non-conversational text (such as an essay, news story, single-speaker monologue, or keyboard spam like <code>asdfghjkl</code>), the engine immediately halts and returns a descriptive error guiding the user to provide proper dialogue turns.", bullet_style))
    story.append(Paragraph("<b>Step 4 — Smart Turn Extraction:</b> The engine segments multi-speaker transcripts (e.g. <code>Agent (Alex)</code>, <code>Customer 1 (Jane)</code>, <code>Customer 2 (Tom)</code>), whether lines are separated by line breaks or pasted inline in a continuous stream.", bullet_style))
    story.append(Paragraph("<b>Step 5 — AI Synthesis & KPI Computation:</b> Cerebras LLM evaluates the dialogue and returns overall sentiment, confidence score, full unclipped Call Summary, CSAT rating (1.0–5.0), Resolution Status, Escalation Risk, and discrete emotion badges for every turn.", bullet_style))
    story.append(Paragraph("<b>Step 6 — Visual Dashboard Presentation:</b> The React client renders the complete analytics suite with the Sentiment Progression Arc, Donut distribution, and filterable turn-by-turn chat view.", bullet_style))
    story.append(Spacer(1, 6))

    # SECTION 5: SUMMARY OF KEY FEATURES
    story.append(Paragraph("5. Summary of Core Features & Derived Intelligence", h1_style))
    story.append(Paragraph("• <b>Call Summary KPI:</b> Displays an unclipped, full executive summary outlining the caller's initial inquiry, the agent's troubleshooting steps, and the final resolution.", bullet_style))
    story.append(Paragraph("• <b>Speakers & Talk Share:</b> Reports the exact count of participants (e.g., 3 Persons) and renders color-coded percentage talk-time bars based on word count.", bullet_style))
    story.append(Paragraph("• <b>Sentiment Progression Arc:</b> Area chart plotting emotional movement throughout the dialogue with explicit X (Dialogue Turn sequence) and Y (Polarity: Positive +1, Neutral 0, Negative -1) axes.", bullet_style))
    story.append(Paragraph("• <b>CSAT & Empathy Scoring:</b> Computes a 1.0 to 5.0 satisfaction index and evaluates agent professionalism.", bullet_style))
    story.append(Paragraph("• <b>Turn-by-Turn Sentence Analysis:</b> Searchable chat view with emotion tags and expandable AI reasoning explaining why each statement received its sentiment score.", bullet_style))
    story.append(Paragraph("• <b>Report Export:</b> 1-click export of analysis data to formatted Plain Text (.txt) or raw JSON.", bullet_style))
    story.append(Spacer(1, 6))

    # SECTION 6: DEPLOYMENT & LINKS
    story.append(Paragraph("6. Deployment Infrastructure & Application Links", h1_style))
    story.append(Paragraph("<b>Where It Is Deployed:</b>", h2_style))
    story.append(Paragraph("• The application is deployed on <b>Vercel Production</b> utilizing a serverless architecture configured via <code>vercel.json</code>. The frontend is built and served globally via edge CDNs, and API routes are routed directly to the Python backend. Continuous deployment is triggered on every Git commit to the <code>main</code> branch.", body_style))
    
    story.append(Paragraph("<b>Application Links:</b>", h2_style))
    story.append(Paragraph("• <b>Live Application:</b> <font color='#0284c7'><u>https://sentimentanalyzer-xi.vercel.app</u></font>", bullet_style))
    story.append(Paragraph("• <b>GitHub Repository:</b> <font color='#0284c7'><u>https://github.com/manishankar2505/sentimentanalyzer</u></font>", bullet_style))
    
    story.append(Paragraph("<b>How to Run Locally:</b>", h2_style))
    story.append(Paragraph("• <b>1-Click Windows Launcher:</b> Double-click <code>start.bat</code> in the repository root.", bullet_style))
    story.append(Paragraph("• <b>Manual:</b> Run <code>cd backend && uvicorn main:app --port 5000</code> and in another terminal run <code>cd frontend && npm run dev</code>.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully Generated: {filename}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "Sentiment_Analyzer_Project_Report.pdf")
    build_pdf(out_file)
