import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignUpEmailPassword } from '@nhost/react';
import Transition from '../components/Transition';
import '../App.css';
import '../styles/SignupPage.css';

const features = [
	{
		icon: (
			<span
				className="feature-icon"
				style={{ background: 'var(--gradient)' }}
			></span>
		),
		title: 'Natural Language Processing',
		desc: 'Advanced algorithms that understand context and nuance in conversation',
	},
	{
		icon: (
			<span
				className="feature-icon"
				style={{ background: 'var(--gradient)' }}
			></span>
		),
		title: 'Customizable Experience',
		desc: 'Tailor the AI to your specific industry needs and communication style',
	},
	{
		icon: (
			<span
				className="feature-icon"
				style={{ background: 'var(--gradient)' }}
			></span>
		),
		title: 'Global Support',
		desc: 'Multilingual capabilities supporting over 50 languages worldwide',
	},
];

const stats = [
	{ value: '1M+', label: 'Active Users' },
	{ value: '50M+', label: 'Messages Processed' },
	{ value: '5K+', label: 'Enterprise Clients' },
];

const SignupPage = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { signUpEmailPassword, isLoading, isSuccess, error } = useSignUpEmailPassword();
	const [errorMsg, setErrorMsg] = useState('');
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);
	const navigate = useNavigate();
	const [tab, setTab] = useState('signup');
	const [fade, setFade] = useState(true);

	const handleTabSwitch = (targetTab) => {
		setFade(false);
		setTimeout(() => {
			setFade(true);
			setTab(targetTab);
			if (targetTab === 'login') navigate('/login');
		}, 350); // match CSS transition duration
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await signUpEmailPassword(email, password);
			setErrorMsg('');
			setShowSuccessPopup(true);
			setEmail('');
			setPassword('');
		} catch (err) {
			setShowSuccessPopup(false); // Hide success popup on error
			if (err?.status === 429 || err?.message?.includes('Too Many Requests')) {
				setErrorMsg('Too many signup attempts. Please wait a moment and try again.');
			} else {
				setErrorMsg('Signup failed. Please try again.');
			}
		}
	};

	useEffect(() => {
		if (isSuccess) {
			setShowSuccessPopup(true);
		}
	}, [isSuccess]);

	const handleLoginRedirect = () => {
		setShowSuccessPopup(false);
		navigate('/login');
	};

	// Add particles animation
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
						<div
							className="logo"
							style={{ cursor: 'pointer', marginBottom: '2rem' }}
						>
							<span
								className="gradient-text"
								style={{ fontSize: '2rem', fontWeight: 700 }}
							>
								NeuralChat
							</span>
							<span className="ai-badge">AI</span>
						</div>
						<h1 className="login-split-title gradient-text">
							Experience the Future of AI Conversation
						</h1>
						<p className="login-split-desc">
							Join thousands of users leveraging our advanced neural network
							technology to transform customer interactions and streamline business
							communication.
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
					{/* Right Side: Signup Form */}
					<div className="login-split-right">
						<div className="auth-card landing-auth-card" style={{ position: 'relative' }}>
							<h2
								className="auth-title gradient-text"
								style={{ fontSize: '2rem' }}
							>
								Create your NeuralChat AI Account
							</h2>
							<div className="login-split-subtitle">
								Unlock the power of advanced AI for your business
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
										disabled={isLoading}
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
										disabled={isLoading}
									/>
								</div>
								<button
									type="submit"
									className="auth-button btn btn-primary btn-large"
									disabled={isLoading}
									style={{ marginTop: '1rem' }}
								>
									{isLoading ? 'Loading...' : 'Sign Up'}
								</button>
								{/* Error popup logic */}
								{error && (
									<div className="auth-error">
										{error?.message?.includes('already registered') && 'Email is already registered. Please use another email.'}
										{error?.message?.includes('invalid email') && 'Invalid email address. Please check your email.'}
										{error?.message?.includes('password') && 'Password is too weak. Please use a stronger password.'}
										{error?.message?.includes('Too Many Requests') && 'Too many signup attempts. Please wait a moment and try again.'}
										{!error?.message?.includes('already registered') &&
											!error?.message?.includes('invalid email') &&
											!error?.message?.includes('password') &&
											!error?.message?.includes('Too Many Requests') &&
											'Signup failed. Please try again.'}
									</div>
								)}
								{errorMsg && <div className="auth-error">{errorMsg}</div>}
							</form>
							{/* Success popup */}
							{showSuccessPopup && !error && (
								<div className="auth-error" style={{
									position: 'absolute',
									top: '10px',
									left: 0,
									right: 0,
									margin: 'auto',
									width: 'fit-content',
									background: '#e6fff3',
									color: '#388e3c',
									border: '1px solid #388e3c',
									borderRadius: '6px',
									padding: '1rem 2rem',
									zIndex: 10,
									boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center'
								}}>
									<div style={{ marginBottom: '0.75rem', fontWeight: 500 }}>
										You are successfully signed up.<br />
										Now verify your email, then login.
									</div>
									<button
										type="button"
										className="btn btn-primary"
										style={{
											marginTop: '0.5rem',
											fontWeight: 500,
											padding: '0.5rem 1.5rem',
											cursor: 'pointer'
										}}
										onClick={handleLoginRedirect}
									>
										Go to Login
									</button>
								</div>
							)}
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
								<button
									type="button"
									className="btn btn-outline"
									style={{
										background: 'none',
										border: 'none',
										color: 'var(--secondary-color)',
										fontWeight: 500,
										cursor: 'pointer',
										textDecoration: 'underline',
										fontSize: '1rem',
										padding: 0
									}}
									onClick={() => window.location.href = '/'}
								>
									Back to Home
								</button>
							</p>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	);
};

export default SignupPage;
