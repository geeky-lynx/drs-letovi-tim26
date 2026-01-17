import { useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import { Gender } from "../../enums/Gender";

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
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto',
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

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  } as React.CSSProperties,

  inputGroup: {
    marginBottom: '1.5rem'
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

  select: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backgroundColor: '#f8fafc',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    cursor: 'pointer'
  } as React.CSSProperties,

  selectFocus: {
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
  } as React.CSSProperties
};

export const RegisterForm = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    gender: Gender.MALE,
    country: "",
    street: "",
    number: "",
    accountBalance: 0
  });

  const [focusedFields, setFocusedFields] = useState<{ [key: string]: boolean }>({});
  const [buttonHovered, setButtonHovered] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  const handleFocus = (field: string) => {
    setFocusedFields(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: string) => {
    setFocusedFields(prev => ({ ...prev, [field]: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'accountBalance' ? parseFloat(value) || 0 : value
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.title}>Kreirajte nalog ✈️</h2>
        <p style={styles.subtitle}>Popunite podatke za registraciju</p>
        
        <form onSubmit={submit}>
          {/* Ime i Prezime */}
          <div style={styles.formRow}>
            <div>
              <label style={styles.inputLabel}>Ime</label>
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onFocus={() => handleFocus('firstName')}
                onBlur={() => handleBlur('firstName')}
                placeholder="Vaše ime"
                style={{
                  ...styles.input,
                  ...(focusedFields['firstName'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>

            <div>
              <label style={styles.inputLabel}>Prezime</label>
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onFocus={() => handleFocus('lastName')}
                onBlur={() => handleBlur('lastName')}
                placeholder="Vaše prezime"
                style={{
                  ...styles.input,
                  ...(focusedFields['lastName'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Email adresa</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={() => handleBlur('email')}
              placeholder="vas@email.com"
              style={{
                ...styles.input,
                ...(focusedFields['email'] ? styles.inputFocus : {})
              }}
              required
            />
          </div>

          {}
          <div style={styles.formRow}>
            <div>
              <label style={styles.inputLabel}>Lozinka</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus('password')}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                style={{
                  ...styles.input,
                  ...(focusedFields['password'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>

            <div>
              <label style={styles.inputLabel}>Potvrda lozinke</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={() => handleFocus('confirmPassword')}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="••••••••"
                style={{
                  ...styles.input,
                  ...(focusedFields['confirmPassword'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>
          </div>

          {}
          <div style={styles.formRow}>
            <div>
              <label style={styles.inputLabel}>Datum rođenja</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onFocus={() => handleFocus('dateOfBirth')}
                onBlur={() => handleBlur('dateOfBirth')}
                style={{
                  ...styles.input,
                  ...(focusedFields['dateOfBirth'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>

            <div>
              <label style={styles.inputLabel}>Pol</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                onFocus={() => handleFocus('gender')}
                onBlur={() => handleBlur('gender')}
                style={{
                  ...styles.select,
                  ...(focusedFields['gender'] ? styles.selectFocus : {})
                }}
                required
              >
                <option value={Gender.MALE}>Muško</option>
                <option value={Gender.FEMALE}>Žensko</option>
              </select>
            </div>
          </div>

          {}
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Država</label>
            <input
              name="country"
              value={formData.country}
              onChange={handleChange}
              onFocus={() => handleFocus('country')}
              onBlur={() => handleBlur('country')}
              placeholder="Npr. Srbija"
              style={{
                ...styles.input,
                ...(focusedFields['country'] ? styles.inputFocus : {})
              }}
              required
            />
          </div>

          {}
          <div style={styles.formRow}>
            <div>
              <label style={styles.inputLabel}>Ulica</label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                onFocus={() => handleFocus('street')}
                onBlur={() => handleBlur('street')}
                placeholder="Naziv ulice"
                style={{
                  ...styles.input,
                  ...(focusedFields['street'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>

            <div>
              <label style={styles.inputLabel}>Broj</label>
              <input
                name="number"
                value={formData.number}
                onChange={handleChange}
                onFocus={() => handleFocus('number')}
                onBlur={() => handleBlur('number')}
                placeholder="Kućni broj"
                style={{
                  ...styles.input,
                  ...(focusedFields['number'] ? styles.inputFocus : {})
                }}
                required
              />
            </div>
          </div>

          {}
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>Početno stanje računa (opciono)</label>
            <input
              type="number"
              name="accountBalance"
              value={formData.accountBalance}
              onChange={handleChange}
              onFocus={() => handleFocus('accountBalance')}
              onBlur={() => handleBlur('accountBalance')}
              placeholder="0.00"
              style={{
                ...styles.input,
                ...(focusedFields['accountBalance'] ? styles.inputFocus : {})
              }}
              min="0"
              step="0.01"
            />
          </div>

          {}
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
            Registruj se
          </button>
        </form>

        {}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Već imate nalog?{' '}
            <span
              style={{
                ...styles.link,
                ...(linkHovered ? styles.linkHover : {})
              }}
              onClick={() => navigate('/login')}
              onMouseEnter={() => setLinkHovered(true)}
              onMouseLeave={() => setLinkHovered(false)}
            >
              Prijavite se
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};