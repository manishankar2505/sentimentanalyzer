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
        
        # Only show top header on page 2 onwards so page 1 title is never crowded
        if self._pageNumber > 1:
            self.drawString(54, letter[1] - 36, "Sentiment Analyzer • Project Report & Technical Details")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
            
        # Running Bottom Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 36, page_text)
        self.drawString(54, 36, "Sentiment Analyzer • Conversation Text Analyzer and Sentiment Detector")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 48, letter[0] - 54, 48)
        self.restoreState()

def build_pdf(filename="Sentiment_Analyzer_Project_Report.pdf"):
    # Generous margins to prevent any text clipping
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=45,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    PRIMARY = colors.HexColor("#0284c7")     # Sky Blue 600
    DARK_BLUE = colors.HexColor("#0f172a")   # Slate 900
    TEXT_COLOR = colors.HexColor("#334155")  # Slate 700
    LIGHT_BG = colors.HexColor("#f8fafc")    # Slate 50
    CARD_BG = colors.HexColor("#f0f9ff")     # Sky 50
    BORDER_COLOR = colors.HexColor("#e2e8f0")# Slate 200

    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=DARK_BLUE,
        spaceBefore=8,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'MainSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=PRIMARY,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=DARK_BLUE,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=TEXT_COLOR,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=TEXT_COLOR,
        leftIndent=12,
        spaceAfter=3
    )

    table_cell = ParagraphStyle(
        'TableCell_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=TEXT_COLOR
    )

    table_header = ParagraphStyle(
        'TableHeader_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11.5,
        textColor=colors.white
    )

    story = []

    # Title & Subtitle (Clear, spacious, zero clipping)
    story.append(Paragraph("Sentiment Analyzer", title_style))
    story.append(Paragraph("Conversation Text Analyzer and Sentiment Detector — Project Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=0, spaceAfter=12))

    # SECTION 1: INTRODUCTION
    story.append(Paragraph("1. Introduction", h1_style))
    story.append(Paragraph(
        "When customers call customer support, a lot happens during that conversation. A customer might start off angry about a wrong charge on their bill, get calm as the agent explains what went wrong, and end the call happy once the refund goes through.",
        body_style
    ))
    story.append(Paragraph(
        "In most call centers, managers have to manually listen to these calls or read long text transcripts one by one to see how well the agent performed and whether the customer was satisfied. This manual review is slow, takes a lot of time, and only covers a small fraction of total calls.",
        body_style
    ))
    story.append(Paragraph(
        "We built the <b>Sentiment Analyzer</b> to automate this entire process. You simply upload a <code>.txt</code> transcript file or paste conversation text into the box. The application reads the conversation line by line, identifies who is speaking, tracks how customer and agent feelings change from start to finish, calculates important call center scores (like CSAT, resolution status, and agent empathy), and gives you a clear summary of what happened. If someone pastes random gibberish or a non-dialogue essay, the system catches it immediately and asks them to provide a proper conversation transcript.",
        body_style
    ))

    # SECTION 2: TECH STACK USED & WHY IT WAS USED
    story.append(Paragraph("2. Tech Stack Used and Why We Chose Each Tool", h1_style))
    story.append(Paragraph(
        "Here is the list of tools and technologies we used in this project and the straightforward reasons why each one was chosen:",
        body_style
    ))

    tech_data = [
        [
            Paragraph("<b>Tool / Technology</b>", table_header),
            Paragraph("<b>Where It Is Used</b>", table_header),
            Paragraph("<b>Why We Used It (Simple Explanation)</b>", table_header)
        ],
        [
            Paragraph("<b>React 18</b>", table_cell),
            Paragraph("Frontend (UI)", table_cell),
            Paragraph("React lets us build clean, interactive components. When analysis data comes back from the server, React updates all cards, charts, and sentence lists instantly without reloading the webpage.", table_cell)
        ],
        [
            Paragraph("<b>Vite</b>", table_cell),
            Paragraph("Frontend Bundler", table_cell),
            Paragraph("Vite starts up instantly and updates your screen in milliseconds while coding. When building for production, it packs everything into small, fast-loading files.", table_cell)
        ],
        [
            Paragraph("<b>Tailwind CSS</b>", table_cell),
            Paragraph("Styling & Design", table_cell),
            Paragraph("Instead of writing hundreds of lines of custom CSS files, Tailwind lets us style buttons, cards, colors, and layouts directly in the HTML with simple classes. It makes the UI look modern and responsive across laptops, tablets, and phones.", table_cell)
        ],
        [
            Paragraph("<b>Recharts</b>", table_cell),
            Paragraph("Charts & Graphs", table_cell),
            Paragraph("Recharts is an easy-to-use charting library for React. We used it to build the <b>Sentiment Progression Arc</b> (showing how mood changes turn by turn), the sentiment donut, and emotion bars.", table_cell)
        ],
        [
            Paragraph("<b>Python FastAPI</b>", table_cell),
            Paragraph("Backend API", table_cell),
            Paragraph("FastAPI is fast, lightweight, and very easy to write in Python. It automatically checks that incoming data is in the right format, handles errors cleanly, and gives us automatic API documentation at <code>/docs</code>.", table_cell)
        ],
        [
            Paragraph("<b>Uvicorn</b>", table_cell),
            Paragraph("Python Web Server", table_cell),
            Paragraph("Uvicorn is the server that actually runs our FastAPI code. It manages asynchronous connections and handles multiple incoming requests at the same time without slowing down.", table_cell)
        ],
        [
            Paragraph("<b>SQLite & bcrypt</b>", table_cell),
            Paragraph("Database & Login", table_cell),
            Paragraph("SQLite stores registered users inside a simple local file (<code>sentiment_app.db</code>) with zero setup needed. <code>bcrypt</code> scrambles user passwords so they are never saved in plain text.", table_cell)
        ],
        [
            Paragraph("<b>Cerebras AI (gpt-oss-120b)</b>", table_cell),
            Paragraph("AI Language Model", table_cell),
            Paragraph("Cerebras runs the <code>gpt-oss-120b</code> AI model at super-fast inference speeds. We ask it to read the conversation and give us back clean structured JSON with sentiment, emotions, and reasons for each sentence.", table_cell)
        ],
        [
            Paragraph("<b>Python NLP Fallback</b>", table_cell),
            Paragraph("Backup Engine", table_cell),
            Paragraph("If the AI model runs out of free API quota or the internet drops, this built-in Python backup code takes over automatically. It calculates scores and sentiment locally so the application never crashes.", table_cell)
        ]
    ]
    t_tech = Table(tech_data, colWidths=[1.4*inch, 1.1*inch, 4.3*inch])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), DARK_BLUE),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, LIGHT_BG]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_tech)
    story.append(Spacer(1, 8))

    # SECTION 3: ARCHITECTURE & EXPLANATION
    story.append(Paragraph("3. Architecture and How the System Is Structured", h1_style))
    story.append(Paragraph(
        "The project is divided into three simple, separate parts so that everything is clean and easy to understand:",
        body_style
    ))
    story.append(Paragraph("<b>1. The Frontend (React UI):</b> What the user sees and interacts with. It handles user sign-in, lets you drag and drop transcript files, view KPI summary cards, explore the progression arc chart, and read sentence-by-sentence explanations.", bullet_style))
    story.append(Paragraph("<b>2. The Backend Orchestrator (Python FastAPI):</b> The brain in the middle. It handles user authentication, checks that the pasted text is a real conversation (rejecting gibberish or essays), breaks the text into speaker turns, and talks to the AI model.", bullet_style))
    story.append(Paragraph("<b>3. The AI & Fallback Layer (Cerebras AI + Local NLP):</b> Receives the conversation from FastAPI, figures out the sentiment, emotions, and CSAT scores, and returns clean structured data back to the backend.", bullet_style))

    # SECTION 4: WORKING OF THE APPLICATION
    story.append(Paragraph("4. Summary and Working of the Application (Step-by-Step)", h1_style))
    story.append(Paragraph("Here is what happens step-by-step from the moment a user opens the app to when the results show up on the screen:", body_style))
    story.append(Paragraph("<b>Step 1 — Sign In:</b> You register or sign in with your email and password. If you enter the wrong password, the screen displays a clear red error message: <i>'Invalid email or password. Please check your credentials.'</i> Once logged in, you stay logged in.", bullet_style))
    story.append(Paragraph("<b>Step 2 — Paste or Upload Transcript:</b> You can drag and drop a <code>.txt</code> conversation file or paste dialogue directly into the text box. As you type, word and line counters update in real time.", bullet_style))
    story.append(Paragraph("<b>Step 3 — Format & Garbage Check:</b> When you click 'Analyze', the backend inspects the text. If you typed random keyboard mashing (like <code>asdfghjkl</code>), symbols (<code>!@#$%^&*</code>), or pasted an essay with no speaker turns, it stops and tells you: <i>'Invalid Transcript Format: The text is not formatted as a conversation. Please provide at least 2 dialogue turns formatted with speaker labels (e.g., Agent: ... and Customer: ... on separate lines).'</i>", bullet_style))
    story.append(Paragraph("<b>Step 4 — Smart Speaker Turn Splitting:</b> If the text is valid, the parser splits it into individual turns. It handles complex multi-person conference calls (e.g. <i>Agent (Alex)</i>, <i>Customer 1 (Jane)</i>, <i>Customer 2 (Tom)</i>) whether lines are on separate lines or pasted as one long continuous paragraph.", bullet_style))
    story.append(Paragraph("<b>Step 5 — AI Sentiment & KPI Calculation:</b> The backend asks the Cerebras AI model to evaluate the call. It calculates:", bullet_style))
    story.append(Paragraph("• <b>Overall Sentiment & Confidence:</b> Whether the call was Positive, Negative, or Neutral.", bullet_style))
    story.append(Paragraph("• <b>Call Summary:</b> A complete summary of what the customer wanted, what the agent did, and how the call finished.", bullet_style))
    story.append(Paragraph("• <b>Speaker Talk Share:</b> Who talked the most (e.g., 48% Agent, 29% Customer 1, 23% Customer 2).", bullet_style))
    story.append(Paragraph("• <b>CSAT Score & Empathy:</b> Customer satisfaction on a 1.0 to 5.0 scale and how helpful the agent was.", bullet_style))
    story.append(Paragraph("• <b>Resolution Status:</b> Whether the problem was Resolved, Escalated, or Pending.", bullet_style))
    story.append(Paragraph("<b>Step 6 — Displaying Results on the Dashboard:</b> The frontend receives the data and renders:", bullet_style))
    story.append(Paragraph("• <b>KPI Cards:</b> Call summary, CSAT score, speaker percentage bars, and resolution badge.", bullet_style))
    story.append(Paragraph("• <b>Sentiment Progression Arc:</b> An area chart showing the emotional shift from Turn 1 to the end (with X-axis as Dialogue Turns and Y-axis as Polarity). Clicking any point lets you inspect that exact sentence.", bullet_style))
    story.append(Paragraph("• <b>Sentence Analysis:</b> A turn-by-turn chat view with emotion tags (Joy, Frustration, Relief, etc.) and an expandable explanation for every single line.", bullet_style))
    story.append(Spacer(1, 6))

    # SECTION 5: WHERE IT IS DEPLOYED
    story.append(Paragraph("5. Where It Is Deployed and How It Works Online", h1_style))
    story.append(Paragraph(
        "The application is fully deployed and live on <b>Vercel</b>. Vercel hosts both the React frontend and runs the Python backend serverless API. Whenever we make changes and push code to the GitHub repository, Vercel automatically rebuilds and deploys the newest version within 1 minute with zero downtime.",
        body_style
    ))
    story.append(Paragraph(
        "You can also run it locally on your machine with 1 click by double-clicking the <code>start.bat</code> file in the folder, which launches both the Python server and React website automatically.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # SECTION 6: PROJECT LINKS AT THE VERY END
    story.append(Paragraph("6. Project Links", h1_style))
    
    links_data = [
        [
            Paragraph("<b>Live Application URL:</b>", table_cell),
            Paragraph("<font color='#0284c7'><u>https://sentimentanalyzer-xi.vercel.app</u></font>", table_cell)
        ],
        [
            Paragraph("<b>GitHub Repository URL:</b>", table_cell),
            Paragraph("<font color='#0284c7'><u>https://github.com/manishankar2505/sentimentanalyzer</u></font>", table_cell)
        ]
    ]
    t_links = Table(links_data, colWidths=[1.8*inch, 5.0*inch])
    t_links.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_links)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Clean Human PDF Successfully Built: {filename}")

if __name__ == "__main__":
    out_file = os.path.join(os.path.dirname(__file__), "Sentiment_Analyzer_Project_Report.pdf")
    build_pdf(out_file)
