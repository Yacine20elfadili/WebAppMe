import { useState } from "react";
import { register, login } from "./api";

type Tab = "register" | "login";

function App() {
  const [tab, setTab] = useState<Tab>("register");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regMsg, setRegMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [logMsg, setLogMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegMsg(null);
    try {
      const res = await register(username, password);
      if (res.error) {
        setRegMsg({ text: res.error, type: "error" });
      } else {
        setRegMsg({ text: res.message, type: "success" });
        setUsername("");
        setPassword("");
      }
    } catch {
      setRegMsg({ text: "Service unavailable.", type: "error" });
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLogMsg(null);
    try {
      const res = await login(username, password);
      if (res.error) {
        setLogMsg({ text: res.error, type: "error" });
      } else {
        setLoggedIn(true);
        setWelcomeUser(res.user?.username || username);
      }
    } catch {
      setLogMsg({ text: "Service unavailable.", type: "error" });
    }
  }

  function logout() {
    setLoggedIn(false);
    setWelcomeUser("");
    setUsername("");
    setPassword("");
    setLogMsg(null);
    setTab("register");
  }

  if (loggedIn) {
    return (
      <div id="welcome-modal">
        <h2>Welcome, {welcomeUser}</h2>
        <p>The session is now active.</p>
        <button className="logout-btn" onClick={logout}>Terminate Session</button>
      </div>
    );
  }

  return (
    <>
      <header>
        <h1>Web<span>App</span>Me</h1>
        <p>Secure Authentication Portal</p>
      </header>

      <div id="auth-container">
        <div className="panel">
          <div className="tabs">
            <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => setTab("register")}>Register</button>
            <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Login</button>
          </div>

          {tab === "register" ? (
            <form id="register-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <input id="reg-username" type="text" value={username} onChange={e => setUsername(e.target.value)} spellCheck={false} autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit">Create Account</button>
              {regMsg && <div className={`msg ${regMsg.type}`}>{regMsg.text}</div>}
            </form>
          ) : (
            <form id="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="log-username">Username</label>
                <input id="log-username" type="text" value={username} onChange={e => setUsername(e.target.value)} spellCheck={false} autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="log-password">Password</label>
                <input id="log-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit">Access System</button>
              {logMsg && <div className={`msg ${logMsg.type}`}>{logMsg.text}</div>}
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default App;