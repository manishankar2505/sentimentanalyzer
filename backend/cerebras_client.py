import os
import json
import re
import requests
from fallback_analyzer import compute_fallback_analysis, validate_transcript_intelligibility

DEFAULT_API_KEY = os.getenv("CEREBRAS_API_KEY", "csk-45dcwn5dh492n3f489w9t9ynxf46dec9253wcvt94fxvtjjv")
DEFAULT_MODEL = os.getenv("CEREBRAS_MODEL", "gpt-oss-120b")

SYSTEM_PROMPT = """
You are an expert AI Sentiment & Customer Support Call Intelligence Analyst.
Analyze the provided phone call conversation transcript and return a detailed, mathematically consistent JSON analysis.

IMPORTANT VALIDATION RULE:
If the input text is completely unintelligible, repetitive keyboard gibberish (e.g. asdfghjk, random numbers/symbols), or completely lacks recognizable dialogue/words, respond strictly with this JSON:
{
  "error": "unintelligible_input",
  "message": "The provided text does not appear to be a valid or intelligible conversation transcript. Please provide a clear dialogue transcript."
}

Otherwise, respond strictly in the following JSON format without any surrounding markdown code fences or backticks:
{
  "overall": {
    "sentiment": "Positive" | "Negative" | "Neutral",
    "confidence": <integer percentage 0-100>,
    "reasoning": "<clear explanation of why this overall sentiment was determined>",
    "breakdown": {
      "positive": <integer percentage 0-100>,
      "negative": <integer percentage 0-100>,
      "neutral": <integer percentage 0-100>
    }
  },
  "kpis": {
    "csatScore": <decimal 1.0 to 5.0>,
    "csatMax": 5.0,
    "agentEmpathyScore": <decimal 1.0 to 5.0>,
    "resolutionStatus": "Resolved" | "Partially Resolved" | "Unresolved" | "Escalated",
    "escalationRisk": "Low" | "Medium" | "High",
    "talkToListenRatio": "<e.g. 52% Agent / 48% Customer>",
    "totalTurns": <integer count of dialogue lines>,
    "estimatedCallDuration": "<e.g. 3 min (340 words)>"
  },
  "summary": {
    "headline": "<1-line punchy summary of the call>",
    "overview": "<2-3 sentence executive summary of caller concern, agent handling, and final outcome>",
    "keyTopics": ["<Topic 1>", "<Topic 2>", "<Topic 3>"],
    "actionItems": ["<Action item 1>", "<Action item 2>"]
  },
  "emotions": [
    { "emotion": "<Emotion name, e.g. Joy/Frustration/Relief/Satisfaction/Confusion/Anger/Neutral>", "count": <integer>, "percentage": <integer> }
  ],
  "speakerComparison": {
    "customer": {
      "sentiment": "Positive" | "Negative" | "Neutral",
      "positiveTurns": <integer>,
      "negativeTurns": <integer>
    },
    "agent": {
      "sentiment": "Positive" | "Negative" | "Neutral",
      "positiveTurns": <integer>,
      "negativeTurns": <integer>
    }
  },
  "sentences": [
    {
      "index": 1,
      "speaker": "<Agent or Customer or Speaker Name>",
      "text": "<Exact line text>",
      "sentiment": "Positive" | "Negative" | "Neutral",
      "score": <decimal 0.00 to 1.00>,
      "emotion": "<e.g. Relief, Frustration, Joy, Neutral, etc.>",
      "reasoning": "<brief 1-sentence reasoning for this sentence's sentiment>"
    }
  ]
}
"""

def analyze_with_cerebras(transcript_text: str, custom_api_key: str = None, custom_model: str = None):
    # 1. First run local intelligibility check
    is_valid, err_msg = validate_transcript_intelligibility(transcript_text)
    if not is_valid:
        return {
            "success": False,
            "error": err_msg,
            "is_unintelligible": True
        }

    api_key = custom_api_key or DEFAULT_API_KEY
    model = custom_model or DEFAULT_MODEL

    try:
        print(f"Calling Cerebras AI API (Model: {model})...")
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Here is the conversation transcript to analyze:\n\n{transcript_text}"}
            ],
            "temperature": 0.1,
            "max_tokens": 4000
        }
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "SentimentAnalyzer-Python/1.0"
        }

        resp = requests.post("https://api.cerebras.ai/v1/chat/completions", json=payload, headers=headers, timeout=30)
        
        if resp.status_code == 200:
            content = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "").strip()
            if content.startswith("```"):
                content = re.sub(r"^```(json)?\n?", "", content)
                content = re.sub(r"\n?```$", "", content).strip()
            data = json.loads(content)

            # Check if LLM detected unintelligible input
            if "error" in data and data["error"] == "unintelligible_input":
                return {
                    "success": False,
                    "error": data.get("message", "The provided text is unintelligible or not a valid conversation transcript."),
                    "is_unintelligible": True
                }

            data["source"] = f"cerebras-{model}"
            return {"success": True, "data": data, "fallback": False}
        else:
            status = resp.status_code
            print(f"Cerebras API returned status {status}. Triggering built-in fallback NLP analyzer.")
            fallback_res = compute_fallback_analysis(transcript_text)
            if fallback_res.get("success") is False:
                return fallback_res

            return {"success": True, "data": fallback_res, "fallback": True}

    except Exception as e:
        print(f"Exception during Cerebras call: {e}. Using fallback analyzer.")
        fallback_res = compute_fallback_analysis(transcript_text)
        if fallback_res.get("success") is False:
            return fallback_res
        return {"success": True, "data": fallback_res, "fallback": True}
