# main.py
import json
import urllib.request
import urllib.error
import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

# Import configuration and static mock data
from config import Config
from data import (
    STUDENT_PROFILE,
    ATTENDANCE,
    TIMETABLE,
    EXAMS,
    ASSIGNMENTS,
    PLACEMENTS,
    FACULTY,
    CAMPUS_NAVIGATION
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ZeroAI-Backend")

# Validate config
Config.validate()

app = FastAPI(
    title="Zero AI Backend",
    description="Python FastAPI backend serving Zero AI college assistant metrics and Gemini integration",
    version="1.0.0"
)

# Add CORS Middleware so the frontend can easily connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request-Response Models
class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant' / 'model'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    suggestions: List[str]

# Health check route
@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "app": "Zero AI Backend",
        "timestamp": datetime.now().isoformat()
    }

# Academic and campus endpoints
@app.get("/api/profile")
def get_profile():
    return STUDENT_PROFILE

@app.get("/api/attendance")
def get_attendance():
    return ATTENDANCE

@app.get("/api/timetable")
def get_timetable():
    return TIMETABLE

@app.get("/api/exams")
def get_exams():
    return EXAMS

@app.get("/api/assignments")
def get_assignments():
    return ASSIGNMENTS

@app.get("/api/placements")
def get_placements():
    return PLACEMENTS

@app.get("/api/faculty")
def get_faculty():
    return FACULTY

@app.get("/api/navigation")
def get_navigation():
    return CAMPUS_NAVIGATION

@app.get("/api/dashboard")
def get_dashboard():
    # Helper endpoint returning all key statistics for the dashboard in a single load
    critical_attendance = [s for s in ATTENDANCE["subjects"] if s["percentage"] < 75.0]
    pending_assignments = [a for a in ASSIGNMENTS if a["status"] == "Pending"]
    
    # Calculate days to next exam (IA-2 on July 20, 2026)
    # Target date: 2026-07-20
    target_dt = datetime(2026, 7, 20)
    current_dt = datetime(2026, 7, 13) # Assumed current date context
    days_to_exam = (target_dt - current_dt).days
    
    # Find next event in timetable (assume today is Monday for demonstration)
    next_class = "Mathematics-I at 09:00 AM (Room A-302)"
    
    return {
        "student": STUDENT_PROFILE,
        "overall_attendance": ATTENDANCE["overall"],
        "critical_attendance_count": len(critical_attendance),
        "pending_assignments_count": len(pending_assignments),
        "days_to_exams": max(0, days_to_exam),
        "next_class": next_class,
        "latest_placement": PLACEMENTS["drives"][0] if PLACEMENTS["drives"] else None
    }

# Rule-based fallback responder for local mock execution (if Gemini API key is missing)
def get_mock_ai_response(user_message: str) -> Dict:
    msg = user_message.lower()
    
    response_text = ""
    suggestions = []
    
    if "attendance" in msg or "percent" in msg or "present" in msg:
        critical_list = [f"**{s['name']}** ({s['percentage']}%)" for s in ATTENDANCE["subjects"] if s["percentage"] < 75.0]
        critical_str = ", ".join(critical_list) if critical_list else "None! You are above 75% in all subjects."
        
        response_text = (
            f"Hello Alex! Your overall attendance is **{ATTENDANCE['overall']}%**.\n\n"
            f"Here is your subject-wise status:\n"
            + "\n".join([f"- {s['name']}: {s['percentage']}% ({s['status']})" for s in ATTENDANCE["subjects"]]) +
            f"\n\n⚠️ **Subjects with critical attendance (< 75%):** {critical_str}.\n\n"
            f"**Note:** {ATTENDANCE['explanation']}"
        )
        suggestions = ["Show today's timetable", "When is the next exam?", "Who is my physics teacher?"]
        
    elif "timetable" in msg or "schedule" in msg or "class" in msg or "today" in msg:
        # Today timetable (assume Monday for default query)
        day = "Monday"
        classes = TIMETABLE["weekly"][day]
        class_lines = []
        for c in classes:
            class_lines.append(f"- **{c['time']}**: {c['subject']} ({c['code']}) in *{c['room']}, {c['block']}*")
            
        response_text = (
            f"Here is your timetable for **{day}**:\n\n"
            + "\n".join(class_lines) +
            f"\n\nIs there any other day's schedule you'd like to check?"
        )
        suggestions = ["Show weekly timetable", "Check my attendance", "Where is my Python class?"]
        
    elif "exam" in msg or "hall ticket" in msg or "date sheet" in msg:
        schedules_str = ""
        for s in EXAMS["schedules"]:
            schedules_str += f"### {s['type']} (Starts: {s['start_date']})\n"
            for sub in s["subjects"][:3]: # limit to 3 for brevity
                schedules_str += f"- {sub['date']} ({sub['time']}): {sub['subject']} in *{sub['room']}*\n"
            schedules_str += "... and more.\n\n"
            
        response_text = (
            f"Here is the upcoming exam schedule:\n\n{schedules_str}"
            f"🎟️ **Hall Ticket Status:** {EXAMS['hall_ticket']['status']}.\n"
            f"*Instructions:* {EXAMS['hall_ticket']['instructions']}\n\n"
            f"**Exam Rules:**\n" + "\n".join([f"- {g}" for g in EXAMS["guidelines"][:2]])
        )
        suggestions = ["Show exam guidelines", "How many days left for exams?", "View assignments"]
        
    elif "assignment" in msg or "homework" in msg or "due" in msg:
        pending = [a for a in ASSIGNMENTS if a["status"] == "Pending"]
        pending_str = "\n".join([f"- **{a['subject']}**: {a['title']} (Due: **{a['due_date']}**) - *{a['instructions']}*" for a in pending])
        
        response_text = (
            f"Alex, you have **{len(pending)} pending assignments**:\n\n{pending_str}\n\n"
            f"Make sure to submit them before their deadlines to secure your internal weightages!"
        )
        suggestions = ["Show exam schedule", "Check my attendance", "Who teaches Electronics?"]
        
    elif "placement" in msg or "job" in msg or "intern" in msg or "resume" in msg or "eligibility" in msg:
        drives_str = "\n".join([f"- **{d['company']}** ({d['role']}) - CTC: {d['ctc']}. *Eligibility:* {d['eligibility']}" for d in PLACEMENTS["drives"]])
        
        response_text = (
            f"Here are the active placement drives on campus:\n\n{drives_str}\n\n"
            f"💡 **Preparation Tip:** {PLACEMENTS['preparation_tips'][0]}\n\n"
            f"📚 **Aptitude Practice:** Practice logical and quantitative reasoning on *IndiaBIX*."
        )
        suggestions = ["Show internship drives", "Get resume guidance", "List CSE faculty"]
        
    elif "faculty" in msg or "teacher" in msg or "prof" in msg:
        fac_str = "\n".join([f"- **{f['name']}** ({f['designation']}, {f['department']}). Cabin: *{f['cabin']}*. Email: {f['email']}. Subjects: {', '.join(f['subjects'])}" for f in FACULTY])
        
        response_text = (
            f"Here is your First-Year Faculty Directory:\n\n{fac_str}\n\n"
            f"You can visit them during their listed office hours for doubts and approvals."
        )
        suggestions = ["Where is the CSE Block?", "Check my timetable", "Show critical attendance"]
        
    elif "navigation" in msg or "where is" in msg or "location" in msg or "map" in msg or "canteen" in msg or "library" in msg:
        # Search for specific location
        found = None
        for loc in CAMPUS_NAVIGATION:
            if loc["name"].lower() in msg or msg in loc["name"].lower():
                found = loc
                break
        
        if found:
            response_text = (
                f"🗺️ **{found['name']}**\n"
                f"- **Location:** {found['location']}\n"
                f"- **Hours:** {found['hours']}\n"
                f"- **Directions:** {found['directions']}\n\n"
                f"*{found['description']}*"
            )
        else:
            response_text = (
                f"Here are some major hotspots on campus:\n\n"
                + "\n".join([f"- **{l['name']}** in *{l['location']}*" for l in CAMPUS_NAVIGATION[:5]]) +
                f"\n\nAsk me 'Where is [Location Name]' for detailed directions."
            )
        suggestions = ["Where is Central Library?", "Where is Main Canteen?", "Show sports complex info"]
        
    else:
        response_text = (
            f"Hi Alex! I am Zero AI, your personalized academic assistant.\n\n"
            f"You can ask me questions about your **attendance**, **timetable**, **upcoming exams**, "
            f"**assignments**, **placements**, **faculty cabins**, or **campus navigation**.\n\n"
            f"What can I help you check today?"
        )
        suggestions = ["Check my attendance", "Show today's timetable", "Where is the library?"]
        
    return {"response": response_text, "suggestions": suggestions}

# AI Chat endpoint integrating Gemini API
@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    logger.info(f"Received chat request: '{request.message}'")
    
    # If API key is not present, use rule-based fallback responder
    if not Config.GEMINI_API_KEY or Config.GEMINI_API_KEY.strip() == "":
        logger.warning("GEMINI_API_KEY is not configured. Falling back to local rules-based chatbot response.")
        mock_res = get_mock_ai_response(request.message)
        return ChatResponse(
            response=mock_res["response"],
            suggestions=mock_res["suggestions"]
        )
    
    # Otherwise, invoke Gemini API
    try:
        # Define System instructions with full college assistant context
        system_instruction = f"""You are "Zero AI", a friendly, highly intelligent, and helpful AI College Student Assistant for first-year college students.
Your primary student is {STUDENT_PROFILE['name']} from the {STUDENT_PROFILE['department']} department, Roll Number {STUDENT_PROFILE['roll_number']}.
You are polite, student-friendly, and concise.

You have access to the official college database for the student. Answer questions accurately using this data:

### STUDENT PROFILE:
{json.dumps(STUDENT_PROFILE, indent=2)}

### ATTENDANCE DATA:
{json.dumps(ATTENDANCE, indent=2)}
(CRITICAL: If attendance is below 75% in a subject, warn the student. For example, Applied Physics is 67.5% and Basic Electronics is 72.5%.)

### TIMETABLE:
{json.dumps(TIMETABLE, indent=2)}

### EXAMS AND HALL TICKETS:
{json.dumps(EXAMS, indent=2)}
(Note: Today is Monday, July 13, 2026. Internal Assessment 2 starts on July 20, 2026. Semester End exams start on August 24, 2026. Calculate countdowns based on this).

### ASSIGNMENTS:
{json.dumps(ASSIGNMENTS, indent=2)}
(Note: Today is Monday, July 13, 2026. Display due dates relative to this and point out pending assignments).

### PLACEMENTS & INTERNSHIPS:
{json.dumps(PLACEMENTS, indent=2)}

### FACULTY DIRECTORY:
{json.dumps(FACULTY, indent=2)}

### CAMPUS NAVIGATION DIRECTIONS:
{json.dumps(CAMPUS_NAVIGATION, indent=2)}

### INSTRUCTIONS:
1. Support the student, be encouraging and positive.
2. If they ask general questions (e.g. coding help, writing advice, general knowledge), answer them but keep it concise and helpful.
3. If they ask about attendance, exams, assignments, or campus maps, pull data from the tables above and explain clearly.
4. Format output using Markdown, including bolding, lists, and tables when presenting complex metrics.
5. In addition to answering the student's query, always suggest exactly 3 short, relevant questions they might ask next. Append them at the very end of your response inside a structured block like:
[Suggestions: "suggested query 1", "suggested query 2", "suggested query 3"]
Do not put suggestions inside code blocks or HTML. Put it on a new line at the very end.
"""

        # Map history to Gemini payload
        contents = []
        for h in request.history:
            role = "user" if h.role == "user" else "model"
            contents.append({
                "role": role,
                "parts": [{"text": h.content}]
            })
            
        # Add current user message
        contents.append({
            "role": "user",
            "parts": [{"text": request.message}]
        })
        
        # Prepare request body
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1200
            }
        }
        
        # Call Gemini API using urllib
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={Config.GEMINI_API_KEY}"
        req_data = json.dumps(payload).encode("utf-8")
        
        req = urllib.request.Request(
            api_url,
            data=req_data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=15) as response:
            res_body = response.read().decode("utf-8")
            res_json = json.loads(res_body)
            
            # Extract content from response
            try:
                ai_text = res_json["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError) as e:
                logger.error(f"Error parsing Gemini API response content: {e}. Full response: {res_json}")
                raise HTTPException(status_code=500, detail="Error parsing response from Gemini API.")
                
            # Extract suggestions from text
            suggestions = []
            import re
            match = re.search(r'\[Suggestions:\s*(.*?)\]', ai_text, re.DOTALL)
            if match:
                sugg_str = match.group(1)
                # Split suggestions by commas or quotes
                sugg_items = re.findall(r'"([^"]*)"', sugg_str)
                if sugg_items:
                    suggestions = sugg_items[:3]
                else:
                    sugg_items = [s.strip().strip("'") for s in sugg_str.split(",")]
                    suggestions = sugg_items[:3]
                # Clean up response text by removing the suggestions block
                ai_text = ai_text.replace(match.group(0), "").strip()
            
            # If no suggestions found, add default ones
            if not suggestions:
                suggestions = ["Show today's timetable", "Check my attendance", "Where is the library?"]
                
            return ChatResponse(response=ai_text, suggestions=suggestions)
            
    except urllib.error.HTTPError as e:
        logger.error(f"Gemini API HTTPError: {e.code} - {e.read().decode('utf-8')}")
        # Return fallback mock response if API call fails
        mock_res = get_mock_ai_response(request.message)
        mock_res["response"] = "*(System Note: Gemini API returned an error. Using local database.)*\n\n" + mock_res["response"]
        return ChatResponse(response=mock_res["response"], suggestions=mock_res["suggestions"])
    except Exception as e:
        logger.error(f"Gemini API general error: {e}")
        mock_res = get_mock_ai_response(request.message)
        mock_res["response"] = "*(System Note: Could not contact Gemini API. Using offline database.)*\n\n" + mock_res["response"]
        return ChatResponse(response=mock_res["response"], suggestions=mock_res["suggestions"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=Config.HOST, port=Config.PORT, reload=Config.DEBUG)
