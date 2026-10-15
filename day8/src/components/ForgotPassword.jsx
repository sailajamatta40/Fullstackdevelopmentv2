
import React, { useState } from "react";
import "./ForgotPassword.css";

const API_URL = "http://127.0.0.1:8000";

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to process your request."
        );
      }

      setMessage(
        result.message ||
          "If an account exists for that email, a reset link will be sent."
      );
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Unable to connect to DOKI. Please try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <h1 className="forgot-logo">DOKI</h1>

        <h2>Forgot Password?</h2>

        <p className="forgot-description">
          Don't worry! Enter your registered email address
          and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email">
            Email Address
          </label>

          <input
            id="forgot-email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />

          <button
            type="submit"
            className="forgot-submit-button"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p className="forgot-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="forgot-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="forgot-back-button"
          onClick={onBackToLogin}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
