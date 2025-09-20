import React, { useState, useEffect } from 'react';
import './Journal.css';
import capybaraVideo from './assets/capybara.mp4';
import capybaraStaticImage from './assets/capybara.png';

const API_URL = "http://127.0.0.1:5000";

const Journal = ({ onClose }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [insight, setInsight] = useState('');
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error("Failed to parse journal entries from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) return;

    if (editingId !== null) {
      setEntries(
        entries.map((entry) =>
          entry.id === editingId ? { ...entry, text: currentEntry, insight: '' } : entry
        )
      );
    } else {
      const newEntry = {
        id: Date.now(),
        text: currentEntry,
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        }),
        insight: '',
      };
      setEntries([newEntry, ...entries]);
    }

    setCurrentEntry('');
    setEditingId(null);
    setInsight('');
  };

  const handleEditEntry = (entry) => {
    setEditingId(entry.id);
    setCurrentEntry(entry.text);
    setInsight(entry.insight || '');
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
    if (editingId === id) {
        setCurrentEntry('');
        setEditingId(null);
        setInsight('');
    }
  };
  
  const handleNewEntryClick = () => {
    setCurrentEntry('');
    setEditingId(null);
    setInsight('');
  }

  const handleGetInsight = async () => {
    if (!currentEntry.trim() || isInsightLoading) return;

    setIsInsightLoading(true);
    setInsight('');
    try {
      const response = await fetch(`${API_URL}/summarize-journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentEntry }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      setInsight(data.summary);
      
      setEntries(prevEntries => 
        prevEntries.map(entry => 
            entry.id === editingId 
                ? { ...entry, insight: data.summary } 
                : entry
        )
      );

    } catch (error) {
      console.error("Failed to fetch journal insight:", error);
      setInsight("Sorry, couldn't get an insight right now. Please try again.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  return (
    <div className="journal-modal-overlay">
      <div className="journal-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <div className="journal-modal-header">
          <h2>My Journal</h2>
          {isInsightLoading ? (
            <video className="capybara-icon-video" src={capybaraVideo} autoPlay loop muted playsInline />
          ) : (
            <img className="capybara-icon-video" src={capybaraStaticImage} alt="Capybara Writing" />
          )}
        </div>
        <div className="journal-content">
          <div className="entry-list-container">
            <button className="new-entry-btn" onClick={handleNewEntryClick}>+ New Entry</button>
            <div className="entry-list">
              {entries.length > 0 ? entries.map((entry) => (
                <div key={entry.id} className={`entry-item ${editingId === entry.id ? 'selected' : ''}`} onClick={() => handleEditEntry(entry)}>
                  <div className="entry-item-date">{entry.date}</div>
                  <p className="entry-item-preview">
                    {entry.text.substring(0, 40)}{entry.text.length > 40 ? '...' : ''}
                  </p>
                  <button className="delete-entry-btn" onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}>
                    Delete
                  </button>
                </div>
              )) : (
                <p className="no-entries-message">No entries yet. Write your first one!</p>
              )}
            </div>
          </div>
          <div className="entry-editor">
            <textarea
              placeholder="What's on your mind?"
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
            />
            <div className="editor-actions">
                <button className="save-entry-btn" onClick={handleSaveEntry}>
                    {editingId !== null ? 'Update Entry' : 'Save Entry'}
                </button>
                <button 
                    className="get-insight-btn" 
                    onClick={handleGetInsight}
                    disabled={!currentEntry.trim() || isInsightLoading || editingId === null}
                >
                    Get Insight ✨
                </button>
            </div>
            {insight && (
                <div className="insight-container">
                    <p>{insight}</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;