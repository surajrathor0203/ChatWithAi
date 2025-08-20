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
            <a href="/" onClick={e => {e.preventDefault(); navigate('/');}}>Home</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-outline" onClick={() => navigate('/signup')}>Signup</button>
            {/* <button className="btn btn-primary" onClick={() => navigate('/chatbot')}>Chatbot</button> */}
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
              <button className="btn btn-outline btn-large">Watch Demo</button>
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

        {/* Features Section */}
        <section id="features" className="features">
          <h2 className="section-title">Powerful <span className="gradient-text">Features</span></h2>
          <p className="section-subtitle">Discover what makes NeuralChat AI stand out from the rest</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon language-icon"></div>
              <h3>Natural Language Understanding</h3>
              <p>Advanced comprehension of context, sentiment, and nuance in human conversation.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon personalization-icon"></div>
              <h3>Personalized Responses</h3>
              <p>Adapts to individual user preferences and communication styles over time.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon integration-icon"></div>
              <h3>Seamless Integration</h3>
              <p>Easily connects with your existing platforms and software solutions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon analytics-icon"></div>
              <h3>Advanced Analytics</h3>
              <p>Comprehensive insights into conversation patterns and user engagement.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon security-icon"></div>
              <h3>Enterprise-Grade Security</h3>
              <p>End-to-end encryption and compliance with global data protection standards.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon multilingual-icon"></div>
              <h3>Multilingual Support</h3>
              <p>Communicate fluently in over 50 languages with accurate translations.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="pricing">
          <h2 className="section-title">Simple <span className="gradient-text">Pricing</span></h2>
          <p className="section-subtitle">Choose the perfect plan for your needs</p>
          
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Starter</h3>
                <div className="price">
                  <span className="amount">$0</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>1,000 messages per month</li>
                <li>Basic AI capabilities</li>
                <li>Email support</li>
                <li>Single user</li>
                <li>Standard response time</li>
              </ul>
              <button className="btn btn-outline btn-full">Get Started</button>
            </div>
            
            <div className="pricing-card popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Professional</h3>
                <div className="price">
                  <span className="amount">$29</span>
                  <span className="period">/month</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>50,000 messages per month</li>
                <li>Advanced AI capabilities</li>
                <li>Priority support</li>
                <li>Up to 5 team members</li>
                <li>Custom training options</li>
                <li>Analytics dashboard</li>
              </ul>
              <button className="btn btn-primary btn-full">Get Started</button>
            </div>
            
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Enterprise</h3>
                <div className="price">
                  <span className="amount">Custom</span>
                  <span className="period"></span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Unlimited messages</li>
                <li>Full AI capabilities suite</li>
                <li>24/7 dedicated support</li>
                <li>Unlimited team members</li>
                <li>Custom integration</li>
                <li>Advanced security features</li>
                <li>Dedicated account manager</li>
              </ul>
              <button className="btn btn-outline btn-full">Contact Sales</button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="testimonials">
          <h2 className="section-title">Client <span className="gradient-text">Testimonials</span></h2>
          <p className="section-subtitle">What our customers are saying about NeuralChat AI</p>
          
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "NeuralChat AI has transformed our customer service. Response times are down 80% and customer satisfaction is through the roof!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-details">
                  <h4>Sarah Johnson</h4>
                  <p>CTO, TechGlobal</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "The personalization capabilities are mind-blowing. It's like the AI knows what our customers need before they even ask."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-details">
                  <h4>Michael Chen</h4>
                  <p>Product Manager, InnovateCorp</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Implementation was seamless and the ROI was immediate. NeuralChat AI has become an essential part of our business operations."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-details">
                  <h4>Jessica Rivera</h4>
                  <p>CEO, Startup Ventures</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta">
          <div className="cta-content">
            <h2>Ready to revolutionize your <span className="gradient-text">conversations</span>?</h2>
            <p>Join thousands of businesses already using NeuralChat AI to transform their customer interactions.</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-large" onClick={() => navigateToAuth('signup')}>Get Started Now</button>
              <button className="btn btn-outline btn-large">Schedule a Demo</button>
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
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#">Integrations</a></li>
                  <li><a href="#">Enterprise</a></li>
                  <li><a href="#">Security</a></li>
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

