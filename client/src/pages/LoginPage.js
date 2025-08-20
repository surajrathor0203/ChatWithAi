import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignInEmailPassword } from '@nhost/react';
import Transition from '../components/Transition';
import '../App.css';
import '../styles/LoginPage.css';

const features = [
	{
		icon: <span className="feature-icon" style={{ background: 'var(--gradient)' }}></span>,
		title: 'Natural Language Processing',
		desc: 'Advanced algorithms that understand context and nuance in conversation',
	},
	{
		icon: <span className="feature-icon" style={{ background: 'var(--gradient)' }}></span>,
		title: 'Customizable Experience',
		desc: 'Tailor the AI to your specific industry needs and communication style',
	},
	{
		icon: <span className="feature-icon" style={{ background: 'var(--gradient)' }}></span>,
		title: 'Global Support',
		desc: 'Multilingual capabilities supporting over 50 languages worldwide',
	},
];

const stats = [
	{ value: '1M+', label: 'Active Users' },
	{ value: '50M+', label: 'Messages Processed' },
	{ value: '5K+', label: 'Enterprise Clients' },
];

const LoginPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { signInEmailPassword, isLoading, isSuccess, error } = useSignInEmailPassword();
	const navigate = useNavigate();
	const [tab, setTab] = useState('login');
	const [fade, setFade] = useState(true);

	const handleTabSwitch = (targetTab) => {
		setFade(false);
		setTimeout(() => {
			setFade(true);
			setTab(targetTab);
			if (targetTab === 'signup') navigate('/signup');
		}, 350); // match CSS transition duration
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await signInEmailPassword(email, password);
	};

	useEffect(() => {
		if (isSuccess) {
			navigate('/chatbot');
		}
	}, [isSuccess, navigate]);

	// Particles animation
	useEffect(() => {
		const canvas = document.getElementsByClassName('particles-canvas')[0];
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
					color: `rgba(255, 255, 255, ${Math.random() * 0.5})`,
				});
			}
			function animate() {
				requestAnimationFrame(animate);
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				particles.forEach((p) => {
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
	}, []);

	return (
		<Transition visible={fade}>
			<div className="login-split-bg landing-auth-bg">
				<canvas className="particles-canvas"></canvas>
				<div className="login-split-container">
					{/* Left Side: Marketing */}
					<div className="login-split-left">
						<div className="logo" style={{ cursor: 'pointer', marginBottom: '2rem' }}>
							<span className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>
								NeuralChat
							</span>
							<span className="ai-badge">AI</span>
						</div>
						<h1 className="login-split-title gradient-text">
							Experience the Future of AI Conversation
						</h1>
						<p className="login-split-desc">
							Join thousands of users leveraging our advanced neural network technology to transform
							customer interactions and streamline business communication.
						</p>
						<div className="login-split-features">
							{features.map((f, i) => (
								<div className="login-split-feature" key={i}>
									<span className="login-split-feature-icon">{f.icon}</span>
									<div>
										<div className="login-split-feature-title">{f.title}</div>
										<div className="login-split-feature-desc">{f.desc}</div>
									</div>
								</div>
							))}
						</div>
						<div className="login-split-stats">
							{stats.map((s, i) => (
								<div className="login-split-stat" key={i}>
									<div className="login-split-stat-value">{s.value}</div>
									<div className="login-split-stat-label">{s.label}</div>
								</div>
							))}
						</div>
					</div>
					{/* Right Side: Login Form */}
					<div className="login-split-right">
						<div className="auth-card landing-auth-card">
							<h2 className="auth-title gradient-text" style={{ fontSize: '2rem' }}>
								Welcome to NeuralChat AI
							</h2>
							<div className="login-split-subtitle">
								The future of conversation starts here
							</div>
							<div className="login-split-tabs">
								<button
									className={`login-split-tab ${tab === 'login' ? 'active' : ''}`}
									onClick={() => handleTabSwitch('login')}
								>
									Sign In
								</button>
								<button
									className={`login-split-tab ${tab === 'signup' ? 'active' : ''}`}
									onClick={() => handleTabSwitch('signup')}
								>
									Sign Up
								</button>
							</div>
							<form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
								<div className="form-group">
									<label htmlFor="email">Email</label>
									<input
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										type="email"
										id="email"
										name="email"
										className="auth-input landing-auth-input"
										placeholder="your@email.com"
										required
									/>
								</div>
								<div className="form-group">
									<label htmlFor="password">Password</label>
									<input
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										type="password"
										id="password"
										name="password"
										className="auth-input landing-auth-input"
										placeholder="••••••••"
										required
									/>
								</div>
								<div className="login-split-row">
									<label className="login-split-remember">
										<input type="checkbox" style={{ marginRight: '0.5rem' }} /> Remember me
									</label>
									{/* <Link to="#" className="login-split-forgot">
										Forgot password?
									</Link> */}
								</div>
								<button
									type="submit"
									className="auth-button btn btn-primary btn-large"
									disabled={isLoading}
									style={{ marginTop: '1rem' }}
								>
									{isLoading ? (
										<span className="loading-spinner">
											<span className="spinner"></span> Logging in...
										</span>
									) : (
										'Sign In'
									)}
								</button>
							</form>
							{/* <div className="login-split-or">Or continue with</div>
							<div className="login-split-socials">
								<button className="login-split-social-btn">Google</button>
								<button className="login-split-social-btn">GitHub</button>
							</div>
							{error && <p className="auth-error">{error.message}</p>}
							<div className="login-split-policy">
								By using our service, you agree to our{' '}
								<Link to="#" style={{ color: 'var(--secondary-color)' }}>
									Terms of Service
								</Link>{' '}
								and{' '}
								<Link to="#" style={{ color: 'var(--secondary-color)' }}>
									Privacy Policy
								</Link>
							</div> */}
							<p className="auth-link">
								<Link to="/">Back to Home</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	);
};

export default LoginPage;
