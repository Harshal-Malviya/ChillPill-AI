import React from 'react';
import './CrisisAlert.css';

const CrisisAlert = ({ content, helplines }) => {
  return (
    <div className="crisis-alert-container">
      <div className="crisis-header">Immediate Support is Available</div>
      <p className="crisis-content">{content}</p>
      <div className="helplines-list">
        {helplines.map((line) => (
          <div key={line.number} className="helpline-item">
            <span className="helpline-name">{line.name}</span>
            <a href={`tel:${line.number}`} className="call-now-button">
              Call Now
            </a>
          </div>
        ))}
      </div>
      <p className="crisis-footer">
        Remember, this is an AI. For your safety, please connect with a human who can help.
      </p>
    </div>
  );
};

export default CrisisAlert;