import { useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem'
  } as React.CSSProperties,

  formCard: {
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    padding: '3rem',
    width: '100%',
    maxWidth: '450px',
    backdropFilter: 'blur(10px)'
  } as React.CSSProperties,

  title: {
    margin: '0 0 0.5rem 0',
    color: '#1e3a8a',
    fontSize: '2.5rem',
    fontWeight: 700,
    textAlign: 'center',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  } as React.CSSProperties,

  subtitle: {
    margin: '0 0 2.5rem 0',
    color: '#64748b',
    fontSize: '0.95rem',
    textAlign: 'center'
  } as React.CSSProperties,

  inputGroup: {
    marginBottom: '1.5rem',
    position: 'relative'
  } as React.CSSProperties,

  inputLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#475569',
    fontSize: '0.875rem',
    fontWeight: 600,
    letterSpacing: '0.025em'
  } as React.CSSProperties,

  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  } as React.CSSProperties,

  inputFocus: {
    border: '2px solid #3b82f6',
    backgroundColor: 'white',
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)'
  } as React.CSSProperties,

  button: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '0.5rem',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
    fontFamily: 'inherit',
    letterSpacing: '0.025em'
  } as React.CSSProperties,

  buttonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)'
  } as React.CSSProperties,

  buttonActive: {
    transform: 'translateY(0)',
    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)'
  } as React.CSSProperties,

  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0'
  } as React.CSSProperties,

  footerText: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem'
  } as React.CSSProperties,

  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.3s ease'
  } as React.CSSProperties,

  linkHover: {
    color: '#8b5cf6',
    textDecoration: 'underline'
  } as React.CSSProperties,

  icon: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none'
  } as React.CSSProperties
};

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Dobrodošli nazad! ✈️</h2>
        <p style={styles.subtitle}>Prijavite se na svoj nalog</p>
        
        <form onSubmit={submit}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Email adresa</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="vas@email.com"
              style={{
                ...styles.input,
                ...(emailFocused ? styles.inputFocus : {})
              }}
              required
            />
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              style={{
                ...styles.input,
                ...(passwordFocused ? styles.inputFocus : {})
              }}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.button,
              ...(buttonHovered ? styles.buttonHover : {}),
              ...(buttonActive ? styles.buttonActive : {})
            }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => {
              setButtonHovered(false);
              setButtonActive(false);
            }}
            onMouseDown={() => setButtonActive(true)}
            onMouseUp={() => setButtonActive(false)}
          >
            Prijavi se
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Nemate nalog?{' '}
            <span
              style={{
                ...styles.link,
                ...(linkHovered ? styles.linkHover : {})
              }}
              onClick={() => navigate('/register')}
              onMouseEnter={() => setLinkHovered(true)}
              onMouseLeave={() => setLinkHovered(false)}
            >
              Registrujte se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};