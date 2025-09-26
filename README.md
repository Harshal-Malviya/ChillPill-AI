# ChillPill AI

A mental wellness companion built for Indian youth — anonymous, empathetic, and culturally attuned.

ChillPill AI doesn’t feel like a tool; it feels like a friend who listens, lifts your mood, and supports you through the ups and downs.

---

## 🚀 Features (Unique & Key)

-   **Mood-Based AI Chat**: Empathetic replies and coping tips based on how you feel.
-   **Memes & Music**: Mood-tailored memes and songs to lift your spirits.
-   **Tasks + Memes Combo**: Fun micro-tasks paired with memes (e.g. “Feeling nervous? Deep breaths + Jackie Shroff meme”).
-   **Anonymous Group Discussions**: Connect safely with peers, share and feel heard(Future).
-   **Crisis Support & Awareness**: Early warning detection + helplines + stigma-free resources.

---

## 🛠️ Tech Stack

| Component               | Tech / Tools                                                 |
| :---------------------- | :----------------------------------------------------------- |
| **Backend** | Flask (Python), Generative AI (Google Gemini or similar)     |
| **NLP & Mood Detection**| Sentiment analysis, custom mood-tagging logic                |
| **Data Storage** | Firebase / Firestore or any real-time DB                     |
| **Frontend** | React.js / React Native                                      |
| **External APIs** | YouTube API, Music API (Spotify or YouTube Music), Meme content source |
| **Authentication & Privacy** | Anonymous/guest mode, secure data handling              |

---

## 📂 Project Structure

```
chillpill-ai/
├── backend/
│   ├── app.py
│   ├── mood_detector.py
│   ├── crisis_handler.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   ├── public/
│   └── package.json
└── README.md
```
---

## 🧩 Getting Started (For Developers)

1.  **Clone the repo**

    ```bash
    git clone [https://github.com/Harshal-Malviya/GenAI-Hackathon-.git](https://github.com/Harshal-Malviya/GenAI-Hackathon-.git)
    cd GenAI-Hackathon-
    ```

2.  **Backend Setup**

    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    export API_KEY=<your_generative_ai_api_key>
    python app.py
    ```

3.  **Frontend Setup**

    ```bash
    cd frontend
    npm install
    npm start
    ```

4.  **Using the App**
    -   Access the frontend at `http://localhost:3000` (or your configured port).
    -   Ensure it connects to the backend server running on `http://localhost:5000`.

### 📌 Usage Examples

-   **Mood Interaction**: Type or select your mood (e.g., Sad, Nervous, Happy) to get a reply, a meme, and a song suggestion.
-   **Daily Check-in**: View your mood trends over time.
-   **Peer Support**: Join an anonymous group discussion to share feelings and get support.
-   **Crisis Detection**: If crisis-related words (“suicide”, “end my life”) are detected, the app will immediately show helpline information and emergency tips.

---

## 🤝 Contribution

We welcome contributions! Whether it’s improving the UI, adding features, or helping with content moderation, you’re invited.

**Steps:**

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/your-awesome-feature`).
3.  Commit your changes and push to the branch.
4.  Open a Pull Request.

Please follow the coding style and add comments or tests where needed.

---

## 🗺️ Future Enhancements

-   Voice Chat support (multi-language).
-   Offline availability for core features.
-   More cultural content (regional memes, language support).
-   Gamification: streaks, badges, and challenges.

---

## ⚠️ Privacy & Safety

-   **100% Anonymous**: No name or email is required if the user prefers.
-   All data is stored securely.
-   Built-in crisis detection and helpline connections to support users in distress.

---
