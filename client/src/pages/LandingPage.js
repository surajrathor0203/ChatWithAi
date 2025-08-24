import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Transition from '../components/Transition';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  
  // Add smooth navigation to auth page
  const navigateToAuth = (tab = 'login') => {
    navigate(`/auth${tab === 'signup' ? '?tab=signup' : ''}`);
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Scroll to demo video section
  const scrollToDemoVideo = () => {
    const el = document.getElementById('demo-video');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // For typing animation
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const phrases = [
    "Intelligent conversations.",
    "Personalized responses.",
    "Advanced AI solutions.",
    "Neural network powered.",
    "Language understanding."
  ];

  // For stats counters
  const [counts, setCounts] = useState({ users: 0, messages: 0, companies: 0 });
  const finalCounts = { users: 1000000, messages: 50000000, companies: 5000 };

  // Fade state
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Typing animation
    const typingInterval = setInterval(() => {
      const currentPhrase = phrases[currentIndex];
      if (displayText.length < currentPhrase.length) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
      } else {
        setTimeout(() => {
          setDisplayText('');
          setCurrentIndex((currentIndex + 1) % phrases.length);
        }, 1000);
      }
    }, 100);

    // Animate counters when in view
    const interval = setInterval(() => {
      setCounts(prev => ({
        users: Math.min(prev.users + 50000, finalCounts.users),
        messages: Math.min(prev.messages + 2000000, finalCounts.messages),
        companies: Math.min(prev.companies + 250, finalCounts.companies)
      }));
    }, 50);

    // Particles animation
    const canvas = document.getElementById('particles');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 2 + 1,
          speedX: Math.random() * 1 - 0.5,
          speedY: Math.random() * 1 - 0.5,
          color: `rgba(255, 255, 255, ${Math.random() * 0.5})`
        });
      }

      function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          
          p.x += p.speedX;
          p.y += p.speedY;
          
          if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
          if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });
      }
      
      animate();
    }

    return () => {
      clearInterval(typingInterval);
      clearInterval(interval);
    };
  }, [currentIndex, displayText]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
    return num;
  };

  const documentationSteps = [
    {
      title: "Environment Setup",
      items: [
        "Create Accounts:",
        "Nhost for authentication and database (Hasura).",
        "Netlify to host the frontend.",
        "n8n for automation and webhook workflows.",
        "OpenRouter for chatbot API access."
      ]
    },
    {
      title: "Nhost Project: Authentication + Hasura",
      items: [
        "a) Setup Project",
        "Create a new Nhost project.",
        "Enable Hasura (GraphQL Engine) and Authentication.",
        "b) Auth Configuration",
        "Enable Email/Password authentication in Nhost dashboard.",
        "c) Frontend Integration",
        "Use Bolt or Nhost Auth SDK in your frontend (React/Next/other).",
        "Implement Sign Up and Sign In forms.",
        "After successful login, restrict all routes/components to authenticated users using Nhost's user session."
      ]
    },
    {
      title: "Database Design & Permissions",
      items: [
        "a) Tables",
        "chats: id (uuid, PK), user_id (uuid, FK → auth.users), title (string, optional), created_at (timestamp)",
        "messages: id (uuid, PK), chat_id (uuid, FK → chats.id), sender (enum: 'user' | 'bot'), content (string), created_at (timestamp)",
        "b) Row-Level Security (RLS)",
        "Enable RLS for both tables in Hasura.",
        "Permission rule: Only allow rows where user_id = X-Hasura-User-Id.",
        "Apply insert/select/update/delete permissions for the user role ONLY."
      ]
    },
    {
      title: "GraphQL Only Policy",
      items: [
        "All backend communication uses GraphQL.",
        "No REST API calls—block unauthorized routes.",
        "Use Hasura's GraphQL endpoint for queries, mutations, subscriptions in the frontend."
      ]
    },
    {
      title: "Hasura Action: sendMessage",
      items: [
        "a) Define Custom Action",
        "Action Name: sendMessage",
        "Input: chat_id, message_content",
        "Output: chatbot reply (string).",
        "b) Action Security",
        "Restrict access using user role & require authentication.",
        "Only allow if user owns chat_id.",
        "c) Connect Action to n8n Webhook",
        "Set the webhook URL to n8n's endpoint."
      ]
    },
    {
      title: "n8n Workflow: Chatbot Logic",
      items: [
        "a) Create Workflow",
        "Set up HTTP Webhook trigger to receive incoming requests from Hasura Action.",
        "b) Validate Ownership",
        "Use incoming user_id + chat_id to query Hasura: Verify the sender owns the chat. Block/return error if unauthorized.",
        "c) Call OpenRouter AI",
        "Make an authenticated HTTP request from n8n to the OpenRouter API (e.g., GPT or free model).",
        "Send message content, receive chatbot reply.",
        "d) Save Bot Reply",
        "Use n8n’s GraphQL node or HTTP node: Insert the bot’s reply as a new row in messages. Set sender = \"bot\".",
        "e) Return reply",
        "Respond to Hasura Action with bot’s answer."
      ]
    },
    {
      title: "Frontend Implementation",
      items: [
        "a) Chat List & Message View",
        "Fetch user’s chats via Hasura GraphQL (with authenticated headers).",
        "Use subscriptions for real-time updates of messages in chat.",
        "b) Create New Chat & Send Messages",
        "New chat: mutation to create entry in chats.",
        "Sending user message: Mutation: insert message to messages. Mutation: trigger Hasura Action sendMessage.",
        "Display bot’s reply when received.",
        "c) Real-Time Updates",
        "Subscribe to messages table for changes on current chat."
      ]
    },
    {
      title: "Permissions & Security",
      items: [
        "Double check Hasura permissions:",
        "Only authenticated users with role user can access both tables & Action.",
        "All mutations, queries, and subscriptions blocked for unauthenticated or other roles.",
        "n8n must validate ownership for every request."
      ]
    },
    {
      title: "Deployment",
      items: [
        "Frontend: Deploy to Netlify. Set env variables for Hasura endpoint, Nhost project, etc.",
        "n8n: Host on cloud (n8n cloud, personal VPS, Render, etc.)",
        "Nhost: Project runs in the cloud automatically (Hasura + Auth).",
        "Confirm that everything works end-to-end only for authenticated users."
      ]
    }
  ];

  // Add some icons for steps (can use emoji for simplicity)
  const stepIcons = [
    "🛠️", "🔐", "🗄️", "🔗", "⚡", "🤖", "💻", "🔒", "🚀"
  ];

  return (
    <Transition visible={fade}>
      <div className="landing-page">
        {/* Particles Background */}
        <canvas id="particles" className="particles-canvas"></canvas>
        
        {/* Navbar */}
        <nav className="navbar">
          <div className="logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
            <span className="gradient-text">NeuralChat</span>
            <span className="ai-badge">AI</span>
          </div>
          <div className="nav-links">
            <a  onClick={scrollToTop}>Home</a>
            {/* <a href="#features">Features</a> */}
            <a href="#documentation">Project Documentation</a>
            <a href="#demo-video" onClick={e => {e.preventDefault(); scrollToDemoVideo();}}>Demo Video</a>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-outline" onClick={() => navigate('/signup')}>Signup</button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              The Next Generation <span className="gradient-text">AI Assistant</span>
            </h1>
            <div className="typing-container">
              <h2 className="hero-subtitle">
                <span className="static-text">Experience </span>
                <span className="typing-text">{displayText}</span>
                <span className="cursor">|</span>
              </h2>
            </div>
            <p className="hero-description">
              NeuralChat AI combines advanced neural networks with natural language processing 
              to deliver intelligent, human-like conversations.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={() => navigate('/signup')}>Start for Free</button>
              <button className="btn btn-outline btn-large" onClick={scrollToDemoVideo}>Watch Demo</button>
            </div>

            <div className="stats-container" style={{ display: 'flex', flexDirection: 'row' }}>
              <div className="stat-item">
                <h3>{formatNumber(counts.users)}</h3>
                <p>Active Users</p>
              </div>
              <div className="stat-item">
                <h3>{formatNumber(counts.messages)}</h3>
                <p>Messages Processed</p>
              </div>
              <div className="stat-item">
                <h3>{formatNumber(counts.companies)}</h3>
                <p>Enterprise Clients</p>
              </div>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="chat-bubble bubble-left">
              <p>How can you assist my business?</p>
            </div>
            <div className="neural-graphic">
              <div className="brain-graphic"></div>
            </div>
            <div className="chat-bubble bubble-right">
              <p>I can analyze customer data, automate responses, and provide real-time insights!</p>
            </div>
          </div>
        </section>

        {/* Documentation Section */}
        <section id="documentation" className="features" >
          <h2 className="section-title" style={{ fontSize: '2.6rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>
            <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Project Documentation</span>
          </h2>
          <p className="section-subtitle" style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#b3b3ff' }}>
            <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', color: 'transparent', fontWeight: 600 }}>Your complete guide to building the AI chat platform</span>
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            margin: '0 auto',
            maxWidth: '1200px'
          }}>
            {documentationSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '18px',
                  boxShadow: '0 4px 24px rgba(92,51,255,0.10)',
                  padding: '2rem 1.5rem',
                  border: '1px solid rgba(92,51,255,0.10)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                }}
                className="doc-step-card"
              >
                <div style={{
                  position: 'absolute',
                  top: '-24px',
                  right: '-24px',
                  fontSize: '5rem',
                  opacity: 0.07,
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}>
                  {stepIcons[idx] || "📄"}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#fff',
                    fontWeight: 700,
                    boxShadow: '0 2px 12px rgba(92,51,255,0.15)',
                    marginRight: '1rem'
                  }}>
                    {stepIcons[idx] || "📄"}
                  </div>
                  <h3 style={{
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                    letterSpacing: '0.5px'
                  }}>
                    <span style={{
                      background: 'var(--gradient)',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}>
                      {`${idx + 1}. ${step.title}`}
                    </span>
                  </h3>
                </div>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.7rem' }}>
                  {step.items.map((item, i) => (
                    <li key={i} style={{
                      color: '#e0e0ff',
                      marginBottom: '0.7rem',
                      fontSize: '1.08rem',
                      lineHeight: 1.7,
                      position: 'relative',
                      paddingLeft: '0.5rem'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: '0.7em',
                        marginRight: '0.5em',
                        color: '#33d2ff'
                      }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta" id="demo-video">
          <div className="cta-content">
            <h2>Demo Video</h2>
            {/* Demo Image with Play Icon */}
            <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <a
                href="https://drive.google.com/file/d/1hGVf6DVsHyId0hiINIACOO655Xwnnhac/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-block', position: 'relative' }}
              >
                <img
                  src="/demo-img.png"
                  alt="Demo Video"
                  style={{
                    width: '100%',
                    maxWidth: '480px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 24px rgba(92,51,255,0.12)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    display: 'block'
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
                {/* Play Icon Overlay */}
                <span
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.55)',
                    borderRadius: '50%',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                  }}
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="18" fill="rgba(0,0,0,0.0)" />
                    <polygon points="14,11 26,18 14,25" fill="#fff"/>
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-wave">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
              <path fill="rgba(92, 51, 255, 0.1)" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
          
          <div className="footer-grid-container">
            <div className="footer-brand">
              <div className="logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
                <span className="gradient-text">NeuralChat</span>
                <span className="ai-badge">AI</span>
              </div>
              <p>The next generation of AI-powered conversation platform that transforms how businesses interact with customers.</p>
              <div className="social-icons">
                <a href="#" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="#" className="social-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 6.5H17.51M7 2H17C19.7614 2 22 4.23858 22 7V17C22 19.7614 19.7614 22 17 22H7C4.23858 22 2 19.7614 2 17V7C2 4.23858 4.23858 2 7 2ZM16 11.37C16.1234 12.2022 15.9813 13.0522 15.5938 13.799C15.2063 14.5458 14.5931 15.1514 13.8416 15.5297C13.0901 15.9079 12.2384 16.0396 11.4078 15.9059C10.5771 15.7723 9.80976 15.3801 9.21484 14.7852C8.61992 14.1902 8.22773 13.4229 8.09407 12.5922C7.9604 11.7615 8.09206 10.9099 8.47033 10.1584C8.84861 9.40685 9.45425 8.79374 10.201 8.40624C10.9478 8.01874 11.7978 7.87659 12.63 8C13.4789 8.12588 14.2649 8.52146 14.8717 9.12831C15.4785 9.73515 15.8741 10.5211 16 11.37Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="footer-links-container">
              <div className="footer-column">
                <h3>Product</h3>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#documentation">Documentation</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3>Resources</h3>
                <ul>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">API Reference</a></li>
                  <li><a href="#">Guides</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Community</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3>Company</h3>
                <ul>
                  <li><a href="#">About Us</a></li>
                  <li><a href="#">Careers</a></li>
                  <li><a href="#">Contact</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                </ul>
              </div>

              <div className="footer-column">
                <h3>Stay Updated</h3>
                <p>Subscribe to our newsletter for the latest updates</p>
                <div className="newsletter-form">
                  <input type="email" placeholder="Your email address" />
                  <button className="btn btn-primary">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; {new Date().getFullYear()} NeuralChat AI. All rights reserved.</p>
              <div className="footer-bottom-links">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Cookies</a>
                <a href="#">FAQ</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Transition>
  );
};

export default LandingPage;
