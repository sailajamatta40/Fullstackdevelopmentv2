
import { useState, useEffect, useRef } from "react";

const API_URL = "http://127.0.0.1:8000";

// Use the same Web Client ID configured for your Login page.
const GOOGLE_CLIENT_ID =
  "639424601114-c1sche4kmt5or2mbd9apcdf3218ugj9r.apps.googleusercontent.com";

function Register({ onRegister, onLoginClick }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleButtonRef = useRef(null);
  const googleCallbackRef = useRef(null);

  // Handle regular registration
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername) {
      alert("Please enter your username.");
      return;
    }

    if (!cleanEmail) {
      alert("Please enter your email address.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (response.status === 409) {
        alert(
          "This username or email is already registered. Please login."
        );
        onLoginClick();
        return;
      }

      if (!response.ok) {
        alert(data.detail || "Registration failed. Please try again.");
        return;
      }

      alert("Account created successfully! Please log in.");
      onLoginClick();
    } catch (error) {
      console.error("Registration error:", error);
      alert(
        "Unable to connect to the server. Please make sure the DOKI backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Verify Google sign-in through the backend
  const handleGoogleResponse = async (response) => {
    if (!response?.credential || isLoading) {
      return;
    }

    setIsLoading(true);

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
        alert(data.detail || "Google sign-in failed. Please try again.");
        return;
      }

      // Save the returned account for the current browser session.
      sessionStorage.setItem("dokiUser", JSON.stringify(data.user));

      // Use the application's existing authentication callback if available.
      if (typeof onRegister === "function") {
        onRegister(data.user);
      } else {
        // If this callback is not provided by App.jsx, switch to Login.
        alert("Google account verified. Please log in to continue.");
        onLoginClick();
      }
    } catch (error) {
      console.error("Google registration error:", error);
      alert(
        "Unable to connect to the DOKI server. Please check that the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the callback current without reinitializing Google on every render.
  googleCallbackRef.current = handleGoogleResponse;

  // Initialize Google Identity Services once.
  useEffect(() => {
    let cancelled = false;
    let script = null;
    let createdScript = false;

    const initializeGoogle = () => {
      if (cancelled || !window.google?.accounts?.id) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => googleCallbackRef.current?.(response),
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
            width: 280,
          }
        );
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      script = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]'
      );

      if (script) {
        script.addEventListener("load", initializeGoogle);
        initializeGoogle();
      } else {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.head.appendChild(script);
        createdScript = true;
      }
    }

    return () => {
      cancelled = true;

      if (script) {
        script.removeEventListener("load", initializeGoogle);

        if (createdScript && script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    };
  }, []);

  return (
    <div className="register-page">
      <div className="doki-name">DOKI</div>

      <div className="register-box">
        <div className="register-card">
          <h1>Register</h1>

          <p className="account-text">
            Already have an account?{" "}
            <span onClick={onLoginClick}>Login</span>
          </p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>

            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />

            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter 6 characters or more"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading ? "PLEASE WAIT..." : "REGISTER"}
            </button>
          </form>

          <div className="divider">
            <span>or register with</span>
          </div>

          <div className="social-buttons">
            <div
              ref={googleButtonRef}
              className="google-register-button"
            />

            <button type="button" disabled>
              f Facebook
            </button>
          </div>
        </div>

        <div className="illustration-section">
          <img
            src="/right-illustration.png"
            alt="Person working at computer"
          />
        </div>
      </div>
    </div>
  );
}

export default Register;
