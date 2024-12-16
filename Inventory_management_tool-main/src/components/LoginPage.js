import React, { useState } from "react";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "labadmin2024") {
      onLogin(true);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div
      className="login-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        className="login-box"
        style={{
          width: "380px",
          padding: "40px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "15px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#333",
            fontSize: "28px",
            fontWeight: "600",
          }}
        >
          Electronics Lab
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "30px",
            color: "#666",
            fontSize: "16px",
          }}
        >
          Welcome back! Please login to continue.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e1e1e1",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e1e1e1"}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#555",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #e1e1e1",
                borderRadius: "8px",
                fontSize: "16px",
                transition: "border-color 0.3s ease",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e1e1e1"}
              required
            />
          </div>
          {error && (
            <p
              style={{
                color: "#dc3545",
                textAlign: "center",
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: "#ffe6e6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "500",
              transition: "background-color 0.3s ease",
              marginTop: "10px",
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#5a6fd6"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#667eea"}
          >
            Sign In
          </button>
        </form>
        <p style={{
          textAlign: "center",
          marginTop: "30px",
          color: "#666",
          fontSize: "14px",
        }}>
          Made by{" "}
          <a 
            href="https://github.com/aryan-py"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "500",
            }}
            onMouseOver={(e) => e.target.style.textDecoration = "underline"}
            onMouseOut={(e) => e.target.style.textDecoration = "none"}
          >
            Aryan Tomar
          </a>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
