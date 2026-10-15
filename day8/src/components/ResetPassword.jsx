
import React, { useState } from "react";
import "./ResetPassword.css";

const API_URL = "http://127.0.0.1:8000";

export default function ResetPassword({
  token,
  onBackToLogin,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Reset token is missing. Please request a new reset link."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/users/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail ||
            "The reset link is invalid or expired."
        );
      }

      setMessage(
        "Password reset successful! You can now log in with your new password."
      );
      setPassword("");
      setConfirmPassword("");
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
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h1 className="reset-logo">DOKI</h1>

        <h2>Reset Password</h2>

        <p className="reset-description">
          Create a new password for your DOKI account.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">
            New Password
          </label>

          <div className="reset-password-input-wrap">
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter new password"
              minLength={6}
              maxLength={72}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="reset-eye-button"
              onClick={() =>
                setShowPassword((previous) => !previous)
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {showPassword ? (
                  <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A11 11 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3" />
                    <path d="M6.2 6.2C3.8 7.7 2.8 10 2.5 12c.5 1.3 3.5 7 9.5 7 1.2 0 2.3-.2 3.3-.7" />
                  </>
                ) : (
                  <>
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <label htmlFor="confirm-new-password">
            Confirm New Password
          </label>

          <div className="reset-password-input-wrap">
            <input
              id="confirm-new-password"
              type={
                showConfirmPassword ? "text" : "password"
              }
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Re-enter new password"
              minLength={6}
              maxLength={72}
              autoComplete="new-password"
              required
            />

            <button
              type="button"
              className="reset-eye-button"
              onClick={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {showConfirmPassword ? (
                  <>
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                    <path d="M9.9 5.2A11 11 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.3" />
                    <path d="M6.2 6.2C3.8 7.7 2.8 10 2.5 12c.5 1.3 3.5 7 9.5 7 1.2 0 2.3-.2 3.3-.7" />
                  </>
                ) : (
                  <>
                    <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <button
            type="submit"
            className="reset-submit-button"
            disabled={loading || !!message}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {message && (
          <p className="reset-success" role="status">
            {message}
          </p>
        )}

        {error && (
          <p className="reset-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="reset-back-button"
          onClick={onBackToLogin}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
