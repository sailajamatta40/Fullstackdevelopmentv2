
import React, { useEffect, useRef, useState } from "react";
import "./Login.css";

const API_URL = "http://127.0.0.1:8000";
const GOOGLE_CLIENT_ID =
  "639424601114-c1sche4kmt5or2mbd9apcdf3218ugj9r.apps.googleusercontent.com";

export default function Login({ onLogin, onRegisterClick,  onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const googleButtonRef = useRef(null);

  // Email and password login
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Login failed. Please check your details.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("dokiUser", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("dokiUser", JSON.stringify(data.user));
      }

      onLogin(data.user);
    } catch (error) {
      console.error("Login error:", error);
      alert("Unable to connect to the DOKI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google login: send the credential to FastAPI for verification
  const googleCallback = async (response) => {
    if (!response?.credential) {
      alert("Google sign-in did not return a credential. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const result = await fetch(`${API_URL}/users/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        alert(data.detail || "Google login failed. Please try again.");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("dokiUser", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("dokiUser", JSON.stringify(data.user));
      }

      onLogin(data.user);
    } catch (error) {
      console.error("Google login error:", error);
      alert("Unable to connect to the DOKI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initialize the Google sign-in button
  useEffect(() => {
    let cancelled = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: googleCallback,
      });

      if (googleButtonRef.current) {
        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 320,
          }
        );
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initializeGoogle);
        // The script may already have loaded.
        initializeGoogle();
      }
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>DOKI</h1>
          <p>Your tasks, organized.</p>
        </div>

        <div className="login-card">
          <h2>Welcome Back!</h2>
          <p className="login-subtitle">Sign in to continue to DOKI</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>

              <div className="password-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  
{showPassword ? (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 5.2A11.5 11.5 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.4 3.3" />
    <path d="M6.2 6.2C3.9 7.6 2.6 9.9 2.5 12c1 2.5 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.8" />
  </svg>
) : (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M5 8.5l-.7-.7M18.5 8.5l.7-.7" />
  </svg>
)}

                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Remember Me
              </label>              
              <button
                type="button"
                className="text-button"
                onClick={() => onForgotPassword?.()}
              >
              Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <div className="google-login-wrapper">
            <div ref={googleButtonRef}></div>
          </div>

          <p className="register-prompt">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-button"
              onClick={onRegisterClick}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
