import React, { useState } from 'react';
import './NamePrompt.css';

const NamePrompt = ({ onNameSubmit }) => {
  const [name, setName] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const handleSubmit = () => {
    // Default to 'Anonymous' if the input is empty, respecting the prompt text
    const finalName = name.trim() || 'Anonymous';
    
    setIsExiting(true);
    // Wait for the fade-out animation to complete before calling the parent function
    setTimeout(() => {
      onNameSubmit(finalName);
    }, 500); // This duration must match the CSS animation duration
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

return (
  <div className={`name-prompt-container ${isExiting ? 'fade-out' : ''}`}>
    {/* Background expressive shapes */}
   <div className="material-shapes">
  <img src={require("./assets/image-removebg-preview.png")} alt="shape1" className="shape shape1" />
  <img src={require("./assets/image-removebg-preview (1).png")} alt="shape2" className="shape shape2" />
  <img src={require("./assets/image-removebg-preview (2).png")} alt="shape3" className="shape shape3" />
</div>


    <div className="name-prompt-box swoop-in">
      <h1>Welcome to ChillPill AI</h1>
      <p>What should we call you?</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a nickname or leave blank"
        autoFocus
      />
      <button onClick={handleSubmit}>Let's Go →</button>
    </div>
  </div>
);

};

export default NamePrompt;