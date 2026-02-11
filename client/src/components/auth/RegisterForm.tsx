import React, { useState } from "react";
import { IAuthAPI } from "../../api/auth/IAuthAPI";
import { RegistrationUserDTO } from "../../models/auth/RegistrationUserDTO";
import { useAuth } from "../../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";

type RegisterFormProps = {
  authAPI: IAuthAPI;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ authAPI }) => {
  const [formData, setFormData] = useState<RegistrationUserDTO>({
    email: "",
    password: "",
    name: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    state: "",
    street: "",
    number: "",
    accountBalance: 0.00,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authAPI.register(formData);

      if (response.success) {
        setSuccess(response.message || "Registration successful!");
        
        // Auto-login if token is provided
        if (response.token) {
          login(response.token);
          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        }
      } else {
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto" }}>
      <div>
        <label htmlFor="name" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your first name"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="lastName" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Enter your last name"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="dateOfBirth" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="email" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="password" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password (min 6 characters)"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          placeholder="Re-enter your password"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="gender" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Gender
        </label>
        <input
          type="text"
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          placeholder="Enter your gender"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="state" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          State
        </label>
        <input
          type="text"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="Enter your state"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="street" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Street
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          placeholder="Enter your street"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="number" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Phone number
        </label>
        <input
          type="text"
          id="number"
          name="number"
          value={formData.number}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      <div>
        <label htmlFor="accountBalance" style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>
          Account Balance
        </label>
        <input
          type="text"
          id="accountBalance"
          name="accountBalance"
          value={formData.accountBalance}
          onChange={handleChange}
          placeholder="Enter your account balance"
          required
          disabled={isLoading}
          style={{marginBottom: "20px"}}
        />
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(196, 43, 28, 0.15)",
            borderColor: "var(--win11-close-hover)",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--win11-close-hover)">
              <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 1a5 5 0 110 10A5 5 0 018 3zm0 2a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3A.5.5 0 018 5zm0 6a.75.75 0 110 1.5.75.75 0 010-1.5z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div
          className="card"
          style={{
            padding: "12px 16px",
            backgroundColor: "rgba(16, 124, 16, 0.15)",
            borderColor: "#107c10",
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#107c10">
              <path d="M8 2a6 6 0 110 12A6 6 0 018 2zm2.354 4.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7 8.793l2.646-2.647a.5.5 0 01.708 0z"/>
            </svg>
            <span style={{ fontSize: "13px", color: "var(--win11-text-primary)" }}>{success}</span>
          </div>
        </div>
      )}
      </div>

      <button
        type="submit"
        className="btn btn-accent"
        disabled={isLoading}
        style={{ marginTop: "8px" }}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
            <span>Creating account...</span>
          </div>
        ) : (
          "Register"
        )}
      </button>
    </form>
  );
};