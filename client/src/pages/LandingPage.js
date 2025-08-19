import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand-highlight">NeuralChatAi</span>
          </h1>
          <p className="hero-subtitle">Your intelligent AI companion for meaningful conversations</p>
          <div className="cta-buttons">
            <Link to="/login" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/signup" className="cta-button secondary">
              Create Account
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="ai-graphic"></div>
        </div>
      </div>
      
      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon chat-icon"></div>
          <h3>Smart Conversations</h3>
          <p>Experience natural, context-aware dialogues with our advanced AI</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon secure-icon"></div>
          <h3>Secure & Private</h3>
          <p>Your conversations remain confidential and protected</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon custom-icon"></div>
          <h3>Personalized Experience</h3>
          <p>The more you chat, the better it understands your needs</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
