import { useState } from "react";

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) return;
    setChecking(true);
    setError(false);

    // Test the password against the proxy
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Site-Password": password,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 10,
          messages: [{ role: "user", content: "hi" }],
        }),
      });

      if (response.status === 401) {
        setError(true);
      } else {
        // Password correct — store in session and unlock
        sessionStorage.setItem("bankeos_pw", password);
        onUnlock(password);
      }
    } catch (err) {
      setError(true);
    } finally {
      setChecking(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F0E8",
      fontFamily: "'Georgia', serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <p style={{
          fontFamily: "monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "#999",
          textTransform: "uppercase",
          margin: "0 0 12px 0"
        }}>BankeOS</p>
        <h1 style={{
          fontSize: 40,
          fontWeight: 900,
          color: "#1a1a1a",
          margin: "0 0 8px 0",
          letterSpacing: "-0.03em",
          lineHeight: 1
        }}>Content<br />Agents.</h1>
        <p style={{
          fontSize: 13,
          color: "#999",
          margin: "0 0 40px 0",
          fontFamily: "monospace"
        }}>Private access only.</p>

        <div style={{ marginBottom: 12 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Enter password"
            autoFocus
            style={{
              width: "100%",
              border: error ? "1px solid #cc0000" : "1px solid #e0d8cc",
              background: "#fff",
              padding: "14px 16px",
              fontSize: 15,
              fontFamily: "'Georgia', serif",
              color: "#1a1a1a",
              outline: "none",
              boxSizing: "border-box",
              letterSpacing: "0.1em"
            }}
          />
          {error && (
            <p style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#cc0000",
              margin: "8px 0 0 0",
              letterSpacing: "0.05em"
            }}>Incorrect password.</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={checking || !password.trim()}
          style={{
            width: "100%",
            background: checking || !password.trim() ? "#ccc" : "#1a1a1a",
            color: "#fff",
            border: "none",
            padding: "14px 24px",
            fontSize: 13,
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: checking || !password.trim() ? "not-allowed" : "pointer",
          }}
        >
          {checking ? "Checking..." : "Enter"}
        </button>
      </div>
    </div>
  );
}
