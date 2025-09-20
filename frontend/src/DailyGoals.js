import React from 'react';
import './DailyGoals.css'; // We'll create this next

// This is a fixed list of goals for our app
const PREDEFINED_GOALS = [
  { id: 'breathe', text: 'Do a 2-min breathing exercise' },
  { id: 'journal', text: 'Write one journal entry' },
  { id: 'music', text: 'Listen to a calming song' },
];

const DailyGoals = ({ goals, onToggleGoal }) => {
  return (
    <div className="daily-goals-container fade-in">
      <h3 className="goals-title">Today's Wellness Goals ✨</h3>
      <div className="goals-list">
        {PREDEFINED_GOALS.map((goal) => (
          <label 
            key={goal.id} 
            className={`goal-item ${goals[goal.id] ? 'completed' : ''}`}
          >
            <input
              type="checkbox"
              checked={!!goals[goal.id]}
              onChange={() => onToggleGoal(goal.id)}
            />
            <span className="goal-text">{goal.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DailyGoals;