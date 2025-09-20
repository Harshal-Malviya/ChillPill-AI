import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./App.css";
import arrowDownIcon from "./assets/arrow_downward.png";
import breathingIcon from "./assets/breathing.png";
import musicIcon from "./assets/music.png";
import journalIcon from "./assets/journal.png";
import chatIcon from "./assets/chat.png";
import memeIcon from "./assets/meme.png";
import gameIcon from "./assets/game.png";
import { getRandomTrack } from "./audius";
import { getMemeGif } from "./giphy";
import NamePrompt from "./NamePrompt.js";
import Journal from './Journal.js';
import sendIcon from './assets/send_icon.png';
import CrisisAlert from './CrisisAlert.js';
import newChatIcon from "./assets/new_chat_icon.png";
import MoodIndicator from './MoodIndicator.js';
import capybaraStaticImage from './assets/capybara.png';
const API_URL = "https://genai-hackathon-irwm.onrender.com";
const ToastNotification = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="toast-notification">
      {message}
    </div>
  );
};

// Add this new function near the top of App.js
const detectEmotionFrontend = (text) => {
  const txt = text.toLowerCase();
  const happy_keywords = ["happy", "khush", "excited", "awesome", "joy", "cheerful"];
  const sad_keywords = ["sad", "dukhi", "udaas", "low", "down", "cry", "rona", "hurt", "niraash", "bura feel"];
  const angry_keywords = ["angry", "gussa", "furious", "rage", "irritated", "annoyed", "frustrated"];
  const anxious_keywords = ["anxious", "panic", "dar", "fear", "tension", "worried", "nervous", "stressed"];

  if (happy_keywords.some(word => txt.includes(word))) return "happy";
  if (sad_keywords.some(word => txt.includes(word))) return "sad";
  if (angry_keywords.some(word => txt.includes(word))) return "angry";
  if (anxious_keywords.some(word => txt.includes(word))) return "anxious";
  
  return "neutral";
};
const formatMessage = (text) => {
  if (typeof text !== "string") {
    return <p>...</p>;
  }

  const lines = text
    .split(/\n|(?=\d+\.\s)/)
    .map((line) => line.trim())
    .filter((line) => line);

  let intro = "";
  const listItems = [];

  lines.forEach((line) => {
    if (line.startsWith("*") || /^\d+\./.test(line)) {
      const cleanLine = line.replace(/^\*?\s?|\d+\.\s?/, "");
      const boldedItem = cleanLine.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      );
      listItems.push(boldedItem);
    } else if (!intro) {
      intro = line;
    }
  });

  if (listItems.length > 0) {
    return (
      <>
        {intro && (
          <p
            dangerouslySetInnerHTML={{
              __html: intro.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
            }}
          ></p>
        )}
        <ul>
          {listItems.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>
          ))}
        </ul>
      </>
    );
  }

  const boldedText = text.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );
  return <p dangerouslySetInnerHTML={{ __html: boldedText }} />;
};

const BreathingExercise = ({ duration = 60 }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isInhale, setIsInhale] = useState(true);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const inhaleExhale = setInterval(() => {
      setIsInhale((prev) => !prev);
    }, 4000);

    const countdown = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => {
      clearInterval(inhaleExhale);
      clearInterval(countdown);
    };
  }, [timeLeft]);

  return (
    <div className="breathing-ui">
      <div className="animation-wrapper">
        <div className="breathing-circle"></div>
        <div className="overlay-text">
          {isInhale ? "Breathe In" : "Breathe Out"}
        </div>
      </div>
      <div className="timer">{timeLeft}s</div>
    </div>
  );
};

const GameUI = ({ gameType }) => {
  const games = {
    flappy_bird: "https://flappybird.io/",
    bubble_shooter: "https://www.coolmathgames.com/0-bubble-shooter",
    zen_sand: "https://sandspiel.club/",
    dino_runner: "https://trex-runner.com/",
    coloring_game: "https://color.method.ac/",
    memory_match: "https://www.memozor.com/memory-games/for-adults/online",
    scribblio: "https://skribbl.io/",
    snake_game: "https://www.google.com/fbx?fbx=snake_arcade",
  };

  const gameUrl = games[gameType] || null;

  if (!gameUrl) {
    return <p>Sorry, that game is not available right now. 😔</p>;
  }

  return (
    <div className="game-container">
      <iframe src={gameUrl} title={gameType} className="game-iframe"></iframe>
    </div>
  );
};

const GameSelection = ({ games, onSelectGame }) => {
  return (
    <div className="game-selection-options">
      <p>I've got a bunch of games we can play! Which one looks good? ✨</p>
      <div className="game-cards-container">
        {games.map((game) => (
          <div
            key={game.type}
            className="game-card"
            onClick={() =>
              onSelectGame(`play_selected_game ${game.type}`, game.name)
            }
          >
            <div className="game-card-content">
              <div className="game-card-title">{game.name}</div>
              <div className="game-card-description">{game.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Message = forwardRef(({ message, onActionClick }, ref) => {
  const renderContent = () => {
    switch (message.type) {
      case "crisis_intervention":
        return <CrisisAlert content={message.content} helplines={message.helplines} />;
      case "text":
        return formatMessage(message.content);
      case "game":
        if (message.gameName === "breathing_exercise") {
          return (
            <div className="breathing-wrapper">
              <p className="breathing-intro">{message.content}</p>
              <BreathingExercise duration={60} />
            </div>
          );
        } else if (message.gameName) {
          return (
            <div className="game-wrapper">
              <p>{message.content}</p>
              <GameUI gameType={message.gameName} />
            </div>
          );
        }
        return <p>{message.content}</p>;
      case "game_options":
        return (
          <div className="game-options-wrapper">
            <p>{message.content}</p>
            <GameSelection
              games={message.games}
              onSelectGame={onActionClick}
            />
          </div>
        );
      case "music":
        return (
          <div className="music-card">
            <p>{message.content}</p>
            <audio controls autoPlay src={message.streamUrl}>
              Your browser does not support audio.
            </audio>
          </div>
        );
      case "meme":
        return (
          <div className="meme-card">
            {message.meme_gif &&
              (message.meme_gif.endsWith(".mp4") ? (
                <video
                  className="meme-img"
                  src={message.meme_gif}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  className="meme-img"
                  src={message.meme_gif}
                  alt="meme"
                  loading="lazy"
                />
              ))}
            <p>{message.content}</p>
          </div>
        );
      default:
        return <p>{message.content}</p>;
    }
  };

  return (
    <div className={`message ${message.sender} fade-in-message`} ref={ref}>
      {renderContent()}
      {message.sender === "bot" && (
        <UniversalOptions onActionClick={onActionClick} />
      )}
    </div>
  );
});

const SkeletonMessage = () => (
  <div className="skeleton">
    <div className="bar"></div>
    <div className="bar short"></div>
  </div>
);

const UniversalOptions = ({ onActionClick }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="universal-wrapper">
      <button
        className={`toggle-button ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label="Toggle universal options"
      >
        <img src={arrowDownIcon} alt="Toggle" className="toggle-icon" />
      </button>
      <div className={`universal-options ${open ? "open" : ""}`}>
        <button
          className="pill"
          onClick={() =>
            onActionClick("play_breathing_game", "Breathing Exercise")
          }
        >
          <img src={breathingIcon} alt="Breathing" className="pill-icon" />
          Breathing Exercise
        </button>
        <button
          className="pill"
          onClick={() => onActionClick("listen_to_music", "Listen to Music")}
        >
          <img src={musicIcon} alt="Music" className="pill-icon" />
          Listen to Music
        </button>
        <button
          className="pill"
          onClick={() =>
            onActionClick("write_in_journal", "Write in Journal")
          }
        >
          <img src={journalIcon} alt="Journal" className="pill-icon" />
          Write in Journal
        </button>
        <button
          className="pill"
          onClick={() => onActionClick("continue_chat", "Continue Chat")}
        >
          <img src={chatIcon} alt="Chat" className="pill-icon" />
          Continue Chat
        </button>
        <button
          className="pill"
          onClick={() => onActionClick("get_meme", "Get a Meme")}
        >
          <img src={memeIcon} alt="Meme" className="pill-icon" />
          Get a Meme
        </button>
        <button
          className="pill"
          onClick={() => onActionClick("play_game", "Play a Game")}
        >
          <img src={gameIcon} alt="Game" className="pill-icon" />
          Play a Game
        </button>
      </div>
    </div>
  );
};

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isGamingMode, setIsGamingMode] = useState(false);
  const [userName, setUserName] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showJournal, setShowJournal] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [inputValue, setInputValue] = useState(''); 
  const lastMessageRef = useRef(null);
const [moodScore, setMoodScore] = useState(null);
 const [notification, setNotification] = useState(null);
  const prevMoodRef = useRef(moodScore);
 useEffect(() => {
    // Check if the mood score has been initialized and has increased
    if (moodScore !== null && prevMoodRef.current !== null && moodScore > prevMoodRef.current) {
      const randomPeople = Math.floor(Math.random() * 500) + 50;
      const messages = [
        "Your mood is improving! Keep it up ✨",
        "It's great to see you feeling better! 😊",
        `Wow, you're feeling happier than ${randomPeople} others right now!`,
        "Positive progress! You're doing great. 👍"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      setNotification(randomMessage);

      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
    prevMoodRef.current = moodScore;
  }, [moodScore]);


  useEffect(() => {
    const storedName = sessionStorage.getItem("anonymousName");
    if (storedName) {
      setUserName(storedName);
    }
    const storedHistory = sessionStorage.getItem("chatHistory");
    if (storedHistory) {
      setChatHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userName) {
        setShowWelcome(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [userName]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        const firstUserMessage = messages.find((m) => m.sender === "user");
        const chatTitle = firstUserMessage
          ? firstUserMessage.content.substring(0, 35) + "..."
          : "Unfinished Chat";

        const currentChatEntry = {
          id: Date.now(),
          title: chatTitle,
          messages: messages,
        };

        const storedHistory = JSON.parse(
          sessionStorage.getItem("chatHistory") || "[]"
        );

        const isDuplicate =
          storedHistory.length > 0 &&
          JSON.stringify(storedHistory[storedHistory.length - 1].messages) ===
            JSON.stringify(messages);

        if (!isDuplicate) {
          const updatedHistory = [...storedHistory, currentChatEntry];
          sessionStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [messages]);

  const handleNameSubmit = (name) => {
    setUserName(name);
    sessionStorage.setItem("anonymousName", name);
  };

  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    const firstUserMessage = messages.find((m) => m.sender === "user");
    const chatTitle = firstUserMessage
      ? firstUserMessage.content.substring(0, 35) + "..."
      : "Chat Session";

    const newHistoryEntry = {
      id: Date.now(),
      title: chatTitle,
      messages: messages,
    };

    setChatHistory((prevHistory) => [...prevHistory, newHistoryEntry]);
  };

  const loadChat = (chatToLoad) => {
    setMessages(chatToLoad.messages);
    setShowWelcome(false);
    setIsGamingMode(false);
    setDarkMode(false);
  };

  const deleteChat = (id) => {
    const updated = chatHistory.filter((c) => c.id !== id);
    setChatHistory(updated);
    sessionStorage.setItem("chatHistory", JSON.stringify(updated));
  };

  const shareChat = async (chat) => {
    const textContent = chat.messages
      .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "ChillPill AI Chat",
          text: textContent,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(textContent);
      alert("Chat copied to clipboard ✅");
    }
  };

  const handleAction = async (action, text) => {
    setMessages((prev) => [
      ...prev,
      { content: text, type: "text", sender: "user" },
    ]);

    if (action === "play_breathing_game") {
      setDarkMode(false);
      setIsGamingMode(true);
       setMoodScore(prev => Math.min((prev ?? 50) + 10, 100));  // 👈 add this
      const breathingMessage = {
        type: "game",
        gameName: "breathing_exercise",
        content: "Let's try a guided breathing exercise. Just follow the circle.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, breathingMessage]);
    } else if (action === "continue_chat") {
      setDarkMode(false);
      setIsGamingMode(false);
        setMoodScore(prev => Math.min((prev ?? 50) + 5, 100));  
      sendMessage("I'm here for you. What would you like to talk about?", "bot");
    } else if (action === "get_meme") {
      setDarkMode(false);
        setMoodScore(prev => Math.min((prev ?? 50) + 8, 100));  // 👈 add this
      setIsGamingMode(false);
      const query = "indian funny meme";
      const gif = await getMemeGif(query);
      if (gif) {
        setMessages((prev) => [
          ...prev,
          {
            type: "meme",
            content: "Here's a meme to brighten your day!",
            meme_gif: gif,
            sender: "bot",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            content: "Couldn't find a meme right now 😅",
            sender: "bot",
          },
        ]);
      }
    } else if (action === "play_game") {
      setDarkMode(true);
      setIsGamingMode(false);
      try {
        const response = await fetch(`${API_URL}/checkin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mood: "game" }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setMessages((prev) => [
          ...prev,
          {
            type: data.type,
            content: data.content,
            games: data.games,
            sender: "bot",
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            content: "Sorry, I couldn't find a game for you right now. 😔",
            sender: "bot",
          },
        ]);
      }
    } else if (action === "listen_to_music") {
      setDarkMode(false);
      setIsGamingMode(false);
      setMoodScore(prev => Math.min((prev ?? 50) + 15, 100)); // 👈 add this
      const track = await getRandomTrack("relaxing lofi");
      if (track) {
        setMessages((prev) => [
          ...prev,
          {
            type: "music",
            content: `🎵 Playing: ${track.title} — ${track.artist}`,
            streamUrl: track.streamUrl,
            sender: "bot",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "text",
            content: "Couldn't fetch music right now 🎶",
            sender: "bot",
          },
        ]);
      }
    } else if (typeof action === "string" && action.startsWith("play_selected_game")) {
      const gameType = action.split(" ")[1];
      setDarkMode(true);
      setIsGamingMode(true);
        setMoodScore(prev => Math.min((prev ?? 50) + 10, 100));
      setMessages((prev) => [
        ...prev,
        {
          type: "game",
          gameName: gameType,
          content: `Okay, let's play ${text}!`,
          sender: "bot",
        },
      ]);
    }
  };

  const sendMessage = async (text, sender = "user") => {
    if (!text.trim()) return;
 if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    if (showWelcome) {
      setShowWelcome(false);
    }
    setDarkMode(false);
    setIsGamingMode(false);

    if (sender === "user") {
      setMessages((prev) => [...prev, { content: text, type: "text", sender }]);
      setIsLoading(true);
      const immediateEmotion = detectEmotionFrontend(text);
       if (immediateEmotion !== 'neutral') {
        setMoodScore(prevScore => {
          const baseScore = prevScore === null ? 50 : prevScore;
          if (immediateEmotion === 'happy') return Math.min(100, baseScore + 20);
          if (['sad', 'angry', 'anxious'].includes(immediateEmotion)) return Math.max(0, baseScore - 20);
          return baseScore;
        });
      }
    } else {
      setMessages((prev) => [...prev, { content: text, type: "text", sender }]);
      return;
    }

    try {
      let endpoint = "/chat";
      let body = { message: text };

      if (text.match(/how's your mood|how are you feeling|feeling/i)) {
        endpoint = "/checkin";
        const moodMatch = text.match(
          /(happy|sad|anxious|tired|good|okay|great|stressed)/i
        );
        const mood = moodMatch ? moodMatch[0] : text;
        body = { mood };
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
       if (data.emotion) {
        setMoodScore(prevScore => {
          // If this is the first mood detected, start from 50 (neutral)
          const baseScore = prevScore === null ? 50 : prevScore;

          if (data.emotion === 'happy') {
            return Math.min(100, baseScore + 20); // Increase score, max 100
          } else if (['sad', 'angry', 'anxious'].includes(data.emotion)) {
            return Math.max(0, baseScore - 20); // Decrease score, min 0
          }
          return baseScore; // Return base score for neutral or other emotions
        });
      }
      const botReply = {
        type: data.type || "text",
        content: data.content || "Sorry, something went wrong.",
        meme_gif: data.meme_gif || "",
        helplines: data.helplines || [],
        sender: "bot",
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          type: "text",
          content:
            "Sorry, I couldn't connect to the server. Please try again later. 😔",
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`app ${darkMode ? "dark-mode" : ""} ${
        isGamingMode ? "gaming-mode" : ""
      }`}
    >
      <ToastNotification message={notification} />
      {!userName ? (
        <NamePrompt onNameSubmit={handleNameSubmit} />
      ) : (
        <>
        
        <div className="emoji-background">
             <span>🌱</span> 
<span>🌞</span>  
<span>🌈</span> 
<span>💪</span>  
<span>🌟</span> 
<span>🕊️</span> 
<span>📚</span>  
<span>🧘</span>  
<span>🤝</span>  
<span>🚀</span>  
            </div>
          <div className="sidebar">
            <div className="logo">
              🧠 <span className="sidebar-text">ChillPill AI</span>
            </div>
     <button
              className="new-chat"
              onClick={() => {
                saveCurrentChat();
                setMessages([]);
                setShowWelcome(true);
                setDarkMode(false);
                setIsGamingMode(false);
              }}
            >
              <img src={newChatIcon} alt="New Chat" className="new-chat-icon" /> <span className="sidebar-text">New Chat</span>
            </button>
            <button 
              className="journal-button" 
              onClick={() => setShowJournal(true)}
            >
              <img className="capybara-icon-png" src={capybaraStaticImage} alt="Capybara Writing" /><span className="sidebar-text"> My Journal</span>
            </button>
            
            <div className="chat-history">
              <div className="history-title">
                 <span className="sidebar-text">Recent Chats</span>
              </div>
              {chatHistory.map((chat) => (
                <div key={chat.id} className="history-row">
                  <div className="history-item" onClick={() => loadChat(chat)}>
                    <span className="chat-title sidebar-text">{chat.title}</span>

                    <div className="menu-wrapper">
                      <button
                        className={`three-dots-btn ${menuOpenId === chat.id ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                        }}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </button>

                      {menuOpenId === chat.id && (
                        <div className="menu-dropdown">
                          <button onClick={() => shareChat(chat)}>📤 Share</button>
                          <button onClick={() => deleteChat(chat.id)}>🗑️ Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-area fade-in">
                 <MoodIndicator moodScore={moodScore} />
            <div className="messages">
              {showWelcome ? (
                <div className="welcome-message">
                  👋 Hey {userName}, how's your mood today?
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <Message
                      key={i}
                      message={msg}
                      onActionClick={(action, text) => {
                        if (action.startsWith("play_selected_game")) {
                          handleAction(action, text);
                        } else {
                          handleAction(action, text);
                        }
                      }}
                      ref={i === messages.length - 1 ? lastMessageRef : null}
                    />
                  ))}
                  {isLoading && <SkeletonMessage />}
                </>
              )}
            </div>

            <div className="input-bar">
              <input
                type="text"
                placeholder="Type your message..."
                  value={inputValue} 
                   onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                   if (e.key === "Enter" && inputValue.trim()) { // Check if input is not empty
                    sendMessage(e.target.value);
                    setInputValue(""); // Clear the input
                  }
                }}
              />
              <button
                className={`send-button ${inputValue.trim() ? 'active' : ''}`} // <-- ADD CONDITIONAL CLASS
                onClick={() => {
                  if (inputValue.trim()) { // Check if input is not empty
                    sendMessage(inputValue);
                    setInputValue(""); // Clear the input
                  }
                }}
              >
                <img src={sendIcon} alt="Send" />
              </button>
            </div>
          </div>
        </>
      )}

      {showJournal && <Journal onClose={() => setShowJournal(false)} />}
    </div>
  );
}

export default App;
