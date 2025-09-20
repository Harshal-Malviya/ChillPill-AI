import os
import random
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
import requests
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import google.generativeai as genai

# ----------------- env & app -----------------
load_dotenv()
app = Flask(__name__)
CORS(app)

# Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

GIPHY_API_KEY = "oNgumhsXWcz1GbvTWdBXsfiT2NqZHODI"  # Your Giphy API key
analyzer = SentimentIntensityAnalyzer()

# ----------------- action map -----------------
ACTION_MAP = {
    "breathe": "play_breathing_game",
    "breath": "play_breathing_game",
    "music": "listen_to_music",
    "song": "listen_to_music",
    "journal": "write_in_journal",
    "write": "write_in_journal",
    "talk": "continue_chat",
    "chat": "continue_chat",
    "meme": "get_meme",
    "laugh": "get_meme",
    "game": "play_game",
    "puzzle": "play_game",
}
CRISIS_KEYWORDS = {
    # English
    "kill myself", "suicide", "end my life", "want to die", 
    "take my own life", "painless death", "no reason to live",
    # Hinglish / Common Terms
    "khatam kar", "jeena nahi", "marne ka mann", "sucide", 
    "end it all", "can't go on"
}

def is_crisis_message(text):
    """Checks if the message contains high-risk keywords."""
    message_lower = text.lower()
    for keyword in CRISIS_KEYWORDS:
        if keyword in message_lower:
            return True
    return False
# ----------------- Game Map -----------------
EMOTION_TO_GAME = {
    "sad": {"suggestion": "Why not try a calming coloring game? 🎨", "gameName": "coloring_game"},
    "low": {"suggestion": "Why not try a calming coloring game? 🎨", "gameName": "coloring_game"},
    "angry": {"suggestion": "Maybe a round of Bubble Shooter will help let off some steam! 💥", "gameName": "bubble_shooter"},
    "anxious": {"suggestion": "A relaxing Zen Sand Puzzle might help clear your mind. ✨", "gameName": "zen_sand"},
    "bored": {"suggestion": "Let's play Google Dino Runner! 🦖", "gameName": "dino_runner"},
    "stressed": {"suggestion": "A classic puzzle like 2048 is a great distraction. 🔢", "gameName": "2048"},
    "neutral": {"suggestion": "How about a fun Memory Match game? 🤔", "gameName": "memory_match"},
    "okay": {"suggestion": "How about a fun Memory Match game? 🤔", "gameName": "memory_match"},
    "happy": {"suggestion": "Awesome! How about some Scribble? 😊", "gameName": "scribblio"},
}

def get_action_from_text(text):
    t = text.lower()
    for k, v in ACTION_MAP.items():
        if k in t:
            return v
    return "default_action"

# ----------------- tiny NLP: emotion detect -----------------
def detect_emotion(user_text):
    """Return one of: sad, angry, anxious, embarrassed, happy, neutral."""
    txt = (user_text or "").lower()

    # Vader sentiment analysis
    s = analyzer.polarity_scores(txt)["compound"]

    # Expanded keyword cues (Hinglish and English)
    angry_keywords = [
        "gussa", "angry", "furious", "rage", "naraz", "krodh", "tuff", "mad",
        "irritated", "annoyed", "frustrated", "upset", "cheezed", "boiling", "livid"
    ]
    embarrassed_keywords = [
        "embarrass", "sharminda", "awkward", "shame", "sharam", "lajja", "uncomfortable",
        "bashful", "humbled", "sheepish", "mortified", "red-faced", "self-conscious"
    ]
    anxious_keywords = [
        "anxious", "panic", "panic attack", "ghabrahat", "dar", "fear", "tension",
        "worried", "nervous", "jittery", "restless", "uneasy", "stressed", "apprehensive"
    ]
    happy_keywords = [
        "happy", "khush", "excited", "mazaa", "maza", "awesome", "joy", "cheerful",
        "delighted", "glad", "pleased", "thrilled", "jubilant", "ecstatic", "content"
    ]
    HINDI_NEG_WORDS = {
        "dukhi", "udaas", "gussa", "naraz", "tensed", "tension", "thak", "thaka", "thak gaya",
        "low", "down", "sad", "angry", "embarrass", "sharminda", "shame", "anxious", "dar", "fear",
        "panic", "ro diya", "rona", "ro rha", "stress", "stressed", "pressure", "frustrated",
        "hurt", "parshan", "pareshaan", "pareshan", "nirash", "bura", "bura feel", "dukh",
        "chinta", "bekar", "hopeless", "asahay", "bikhara"
    }

    # Enhanced emotion detection logic
    if any(w in txt for w in angry_keywords):
        return "angry"
    if any(w in txt for w in embarrassed_keywords):
        return "embarrassed"
    if any(w in txt for w in anxious_keywords):
        return "anxious"
    if any(w in txt for w in happy_keywords) or s >= 0.35:
        return "happy"
    if s <= -0.35 or any(w in txt for w in HINDI_NEG_WORDS):
        return "sad"

    return "neutral"

# ----------------- Giphy GIF fetch -----------------
EMOTION_TO_GIPHY_TAGS = {
    "sad": ["sad indian meme", "bollywood wholesome", "cute animal", "healing"],
    "angry": ["angry indian meme", "bollywood calm", "breathe"],
    "anxious": ["relax indian meme", "bollywood okay", "wholesome"],
    "embarrassed": ["awkward indian meme", "bollywood happens", "its ok"],
    "happy": ["happy indian meme", "bollywood funny", "celebration", "dance"],
    "neutral": ["funny indian meme", "bollywood humor", "random indian meme"],
}

def fetch_meme_gif(emotion: str, is_random=False):
    if not GIPHY_API_KEY:
        return None
    tags = EMOTION_TO_GIPHY_TAGS.get(emotion, EMOTION_TO_GIPHY_TAGS["neutral"])
    if is_random:
        tags = EMOTION_TO_GIPHY_TAGS["neutral"]
    q = random.choice(tags)

    url = (
        f"https://api.giphy.com/v1/gifs/search?api_key={GIPHY_API_KEY}&q={requests.utils.quote(q)}"
        "&limit=50&rating=pg-13&random_id={random.randint(1, 1000)}"
    )
    try:
        r = requests.get(url, timeout=6)
        if r.status_code == 200:
            data = r.json().get("data", [])
            if not data:
                return None
            item = random.choice(data)
            return item.get("images", {}).get("original", {}).get("url")
    except Exception:
        return None
    return None

# ----------------- helpers -----------------
def build_supportive_reply(user_text):
    prompt = f"""
You are a caring, supportive, and conversational AI friend. Your goal is to provide a brief, thoughtful reply that makes the user feel heard and offers helpful suggestions.

User said: \"\"\"{user_text}\"\"\"

Instructions:
- Reply in the same language style and tone as the user's text (English / Hindi / Hinglish as appropriate).
- Start with a warm, empathetic opening sentence that acknowledges their mood or message (max 12 words). Always include an emoji here.
- On a new line, write a short, one-sentence supportive message that validates their feelings.
- On the next line, offer 2-3 helpful, actionable suggestions as a bulleted list. Each bullet point should be concise.
- Keep the entire response friendly and easy to read.
- End with a single, open-ended question to continue the conversation.

Example:
Hey, I'm here for you, always. 💙
It's completely okay to feel that way. Just take a moment for yourself.
* Try a guided breathing exercise.
* Listen to some calming music.
* Or, write your thoughts in a journal.
What do you feel like doing right now? 😊
"""
    resp = model.generate_content(prompt)
    reply = getattr(resp, "text", "I'm here for you! 💙\nIt sounds like you're going through a tough time. Just take a moment to breathe.\n* Try a guided breathing exercise.🧘\n* Listen to some calming music.🎶\n* Or, write your thoughts in a journal.📓\nWhat do you feel like doing right now? 😊")
    return reply

def parse_reply_to_intro_and_suggestions(ai_text):
    intro = ""
    suggestions = []
    # Keywords to emoji mapping
    emoji_map = {
        "breathe": "🧘",
        "music": "🎶",
        "journal": "📓",
        "game": "🎮",
        "meme": "😂",
        "chat": "💬"
    }

    lines = ai_text.splitlines()
    if not lines:
        return "I'm here for you! 💙", []

    # Get the intro and add an emoji
    intro = lines[0]
    if not any(emoji in intro for emoji in ["💙", "💜", "😊", "🤗", "🫂"]):
        intro += " 💙"

    for line in lines[1:]:
        sug = line.strip().lstrip("*- ").strip()
        if not sug:
            continue
            
        action = get_action_from_text(sug)
        
        # Add emoji to suggestion based on keywords
        emoji_to_add = ""
        for keyword, emoji in emoji_map.items():
            if keyword in sug.lower():
                emoji_to_add = emoji
                break
        
        final_sug = f"{sug} {emoji_to_add}" if emoji_to_add else sug
        suggestions.append({"text": final_sug, "action": action})

    # Add default suggestions if none were found
    if not suggestions:
        suggestions = [
            {"text": "🧘 Do a 2-min breathing exercise", "action": "play_breathing_game"},
            {"text": "🎵 Listen to relaxing music", "action": "listen_to_music"},
            {"text": "📓 Write a few thoughts in journal", "action": "write_in_journal"},
        ]

    return intro, suggestions
def build_journal_insight(journal_text):
    prompt = f"""
You are an empathetic and insightful AI friend. Your goal is to read a user's journal entry and provide a gentle, supportive summary.

**User's Journal Entry:**
\"\"\"
{journal_text}
\"\"\"

**Your Task:**
Read the entry and provide a brief, thoughtful reflection. Follow these instructions carefully:
1.  Start with a warm, validating sentence. For example, "Thank you for sharing this, it sounds like a lot is on your mind."
2.  Briefly summarize the main situation or feeling in 1-2 sentences.
3.  Gently point out the core emotions you notice in the writing (e.g., "It seems like there's a mix of frustration and hope here.").
4.  If there's a recurring theme, mention it constructively.
5.  Keep the entire response to a maximum of 4 sentences.

**Tone:** Be supportive and encouraging, not clinical or a therapist. Use phrases like "It sounds like..." or "I'm sensing that...". Do not give direct advice unless the entry explicitly asks for it.
"""
    try:
        resp = model.generate_content(prompt)
        return getattr(resp, "text", "I've read your entry. Taking the time to write things down is a great step.")
    except Exception:
        return "Sorry, I couldn't process this insight right now."
def detect_emotion(user_text):
    """Return one of: sad, angry, anxious, happy, neutral."""
    txt = (user_text or "").lower()
    s = analyzer.polarity_scores(txt)["compound"]
    angry_keywords = ["gussa", "angry", "furious", "rage", "irritated", "annoyed", "frustrated"]
    anxious_keywords = ["anxious", "panic", "ghabrahat", "dar", "fear", "tension", "worried", "nervous", "stressed"]
    happy_keywords = ["happy", "khush", "excited", "mazaa", "awesome", "joy", "cheerful"]
    sad_keywords = ["dukhi", "udaas", "low", "down", "sad", "rona", "hurt", "parshan", "pareshaan", "niraash", "bura feel"]

    if any(w in txt for w in angry_keywords): return "angry"
    if any(w in txt for w in anxious_keywords): return "anxious"
    if any(w in txt for w in happy_keywords) or s >= 0.35: return "happy"
    if any(w in txt for w in sad_keywords) or s <= -0.35: return "sad"

    return "neutral"

# ----------------- routes -----------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Youth Mental Wellness Chatbot API is running 🚀"})
@app.route("/summarize-journal", methods=["POST"])
def summarize_journal():
    try:
        data = request.get_json()
        journal_text = data.get("text", "").strip()
        if not journal_text:
            return jsonify({"error": "Journal text is required"}), 400

        insight = build_journal_insight(journal_text)
        
        return jsonify({"summary": insight})
    except Exception as e:
        print(f"Error in /summarize-journal: {e}")
        return jsonify({"summary": "Sorry, an error occurred while generating insights."}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = (data or {}).get("message", "").strip()
        if not user_message:
            return jsonify({"error": "Message is required"}), 400

        # **CRISIS DETECTION LOGIC**
        if is_crisis_message(user_message):
            return jsonify({
                "type": "crisis_intervention",
                "content": "It sounds like you are going through a difficult time. Please reach out for immediate help. You are not alone.",
                "helplines": [
                    {"name": "AASRA", "number": "919820466726"},
                    {"name": "Vandrevala Foundation", "number": "919999666555"},
                    {"name": "Kiran (Govt. of India)", "number": "18005990019"}
                ]
            })

        # Logic for activity-related messages
        activity_keywords = ["activity", "activities", "do", "bored"]
        if any(k in user_message.lower() for k in activity_keywords):
            return checkin(user_message)

        # --- THIS IS THE MISSING PART ---
        # This block handles all other normal chat messages.
        emo = detect_emotion(user_message)
        ai_text = build_supportive_reply(user_message)
        
        # This part handles meme requests within a normal chat
        meme_url = None
        action = get_action_from_text(user_message)
        if action == "get_meme":
            is_random_meme = "random" in user_message.lower()
            meme_url = fetch_meme_gif(emo if not is_random_meme else "neutral", is_random=is_random_meme)

        response_type = "meme" if meme_url else "text"
        return jsonify({
            "type": response_type,
            "content": ai_text,
            "meme_gif": meme_url,
            "emotion": emo
        })
        # --- END OF THE MISSING PART ---

    except Exception as e:
        print(f"Error in /chat endpoint: {e}") # Added a print statement for better debugging
        return jsonify({"type": "text", "content": "Sorry, I couldn’t process that. 😔 Can I help with something else? 😊"})
@app.route("/checkin", methods=["POST"])
def checkin_api():
    data = request.get_json()
    user_message = (data or {}).get("mood", "").strip()
    return checkin(user_message)

def checkin(user_message):
    try:
        emo = detect_emotion(user_message)
        
        # If the user's message is 'game', send the full list of game options.
        if user_message.lower() == 'game':
            game_options = [
                {"name": "Calm Coloring Game", "type": "coloring_game", "description": "Perfect for a calm, creative escape. 🎨"},
                {"name": "Bubble Shooter", "type": "bubble_shooter", "description": "A fun way to relieve stress and frustration. 💥"},
                {"name": "Zen Sand Puzzle", "type": "zen_sand", "description": "Relax and clear your mind with flowing sand. ✨"},
                {"name": "Google Dino Runner", "type": "dino_runner", "description": "A classic distraction for when you're bored. 🦖"},
                {"name": "Flappy Bird", "type": "flappy_bird", "description": "Fly through obstacles and test your reflexes! 🐦"},
                {"name": "Memory Match", "type": "memory_match", "description": "A simple and fun game to focus your mind. 🤔"},
                {"name": "Scribbl.io", "type": "scribblio", "description": "A creative, multiplayer game for a good laugh! 😊"},
            ]
            
            return jsonify({
                "type": "game_options",
                "content": "I've got a bunch of games we can play! 🎮",
                "games": game_options
            })

        # Otherwise, proceed with the mood-based supportive reply logic.
        ai_text = build_supportive_reply(user_message)
        intro, suggestions = parse_reply_to_intro_and_suggestions(ai_text)
        
        return jsonify({
            "type": "text",
            "content": ai_text,
            "emotion": emo
        })
    except Exception as e:
        return jsonify({"type": "text", "content": f"Sorry, I couldn’t find a game for you 😔 ({e})\nCan I help with this or something else? 😊"})

if __name__ == "__main__":
    app.run(debug=True)