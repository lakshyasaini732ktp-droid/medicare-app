import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

const C = {
  navy: "#0a1628", navyLight: "#112240", teal: "#00d4aa", amber: "#f59e0b",
  rose: "#f43f5e", blue: "#3b82f6", green: "#10b981",
  card: "#0d1f3c", border: "#1e3a5f", text: "#e2e8f0", muted: "#7a9bb5",
};

function Input({ label, type = "text", value, onChange, placeholder, icon }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ color: C.muted, fontSize: 12, fontWeight: 700, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ width: "100%", background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 44px 12px 42px", color: C.text, fontSize: 14, boxSizing: "border-box", outline: "none" }}
        />
        {type === "password" && (
          <button onClick={() => setShow(!show)} type="button"
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", fontSize: 16, color: C.muted }}>
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
    </div>
  );
}

function Alert({ msg, type }) {
  if (!msg) return null;
  const color = type === "error" ? C.rose : type === "success" ? C.green : C.amber;
  return (
    <div style={{ background: color + "15", border: `1px solid ${color}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
      <span>{type === "error" ? "❌" : "✅"}</span>
      <p style={{ color, fontSize: 13, margin: 0, fontWeight: 600 }}>{msg}</p>
    </div>
  );
}

function VerifyEmail({ user, onRefresh }) {
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });

  const resend = async () => {
    setSending(true);
    try {
      await sendEmailVerification(user);
      setMsg({ text: "Verification email sent! Check your inbox and spam folder.", type: "success" });
    } catch (e) {
      setMsg({ text: "Too many requests. Please wait a few minutes.", type: "error" });
    }
    setSending(false);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.teal}44`, borderRadius: 24, padding: 40, width: "100%", maxWidth: 440, textAlign: "center", boxShadow: `0 0 60px ${C.teal}22` }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📧</div>
        <h2 style={{ color: C.text, fontSize: 24, fontWeight: 900, margin: "0 0 10px" }}>Verify Your Email</h2>
        <p style={{ color: C.muted, fontSize: 15, margin: "0 0 8px", lineHeight: 1.6 }}>We sent a verification link to:</p>
        <p style={{ color: C.teal, fontWeight: 800, fontSize: 16, margin: "0 0 24px" }}>{user.email}</p>

        <div style={{ background: C.navyLight, borderRadius: 14, padding: 20, marginBottom: 24, textAlign: "left" }}>
          <p style={{ color: C.text, fontWeight: 700, fontSize: 14, margin: "0 0 12px" }}>📋 Steps to verify:</p>
          {["Open your email inbox", "Find email from MediCare+", "Click the verification link in the email", "Come back here and click the button below"].map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.teal + "22", border: `1px solid ${C.teal}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.teal, flexShrink: 0 }}>{i + 1}</div>
              <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{s}</p>
            </div>
          ))}
        </div>

        <Alert msg={msg.text} type={msg.type} />

        <button onClick={onRefresh}
          style={{ width: "100%", background: C.teal, border: "none", color: C.navy, borderRadius: 12, padding: "14px", cursor: "pointer", fontWeight: 800, fontSize: 15, marginBottom: 12, boxShadow: `0 4px 20px ${C.teal}44` }}>
          ✅ I Verified My Email — Continue
        </button>
        <button onClick={resend} disabled={sending}
          style={{ width: "100%", background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 12, padding: "12px", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>
          {sending ? "Sending..." : "📨 Resend Verification Email"}
        </button>
        <button onClick={() => signOut(auth)}
          style={{ background: "transparent", border: "none", color: C.rose, cursor: "pointer", fontSize: 13 }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verifyUser, setVerifyUser] = useState(null);

  const clear = () => { setError(""); setSuccess(""); };

  const friendlyError = (code) => ({
    "auth/email-already-in-use": "This email is already registered. Try logging in.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Try again.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes.",
    "auth/invalid-credential": "Incorrect email or password. Try again.",
  }[code] || "Something went wrong. Please try again.");

  const handleSignup = async () => {
    clear();
    if (!name.trim()) return setError("Please enter your full name.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      setVerifyUser(result.user);
    } catch (e) { setError(friendlyError(e.code)); }
    setLoading(false);
  };

  const handleLogin = async () => {
    clear();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result.user.emailVerified) {
        setVerifyUser(result.user);
      } else {
        onLogin(result.user);
      }
    } catch (e) { setError(friendlyError(e.code)); }
    setLoading(false);
  };

  const handleForgot = async () => {
    clear();
    if (!email) return setError("Please enter your email address first.");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (e) { setError(friendlyError(e.code)); }
    setLoading(false);
  };

  const handleRefresh = async () => {
    await verifyUser.reload();
    if (verifyUser.emailVerified) {
      onLogin(verifyUser);
    } else {
      setError("Email not verified yet. Please check your inbox and click the link first.");
    }
  };

  if (verifyUser) return <VerifyEmail user={verifyUser} onRefresh={handleRefresh} />;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.navy, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: C.teal + "08" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: C.blue + "08" }} />

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 24, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 0 60px #00000060", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px" }}>💊</div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>MediCare+</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Smart Health Hub</p>
        </div>

        {mode !== "forgot" && (
          <div style={{ display: "flex", background: C.navyLight, borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); clear(); }}
                style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: mode === m ? C.teal : "transparent", color: mode === m ? C.navy : C.muted, cursor: "pointer", fontWeight: mode === m ? 800 : 500, fontSize: 14, transition: "all 0.2s" }}>
                {m === "login" ? "🔑 Log In" : "✨ Sign Up"}
              </button>
            ))}
          </div>
        )}

        {mode === "forgot" && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => { setMode("login"); clear(); }}
              style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, marginBottom: 16 }}>← Back to Login</button>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Reset Password</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>We'll send a reset link to your email.</p>
          </div>
        )}

        <Alert msg={error} type="error" />
        <Alert msg={success} type="success" />

        {mode === "signup" && (
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rajesh Kumar" icon="👤" />
        )}

        <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" icon="📧" />

        {mode !== "forgot" && (
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" icon="🔒" />
        )}

        {mode === "signup" && (
          <Input label="Confirm Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat your password" icon="🔒" />
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginTop: -8, marginBottom: 20 }}>
            <button onClick={() => { setMode("forgot"); clear(); }}
              style={{ background: "transparent", border: "none", color: C.teal, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              Forgot password?
            </button>
          </div>
        )}

        <button
          onClick={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgot}
          disabled={loading}
          style={{ width: "100%", background: loading ? C.border : C.teal, border: "none", color: loading ? C.muted : C.navy, borderRadius: 12, padding: "14px", cursor: loading ? "default" : "pointer", fontWeight: 800, fontSize: 15, marginTop: 8, boxShadow: loading ? "none" : `0 4px 20px ${C.teal}44` }}>
          {loading ? "Please wait..." : mode === "login" ? "🚀 Log In" : mode === "signup" ? "✨ Create Account" : "📨 Send Reset Link"}
        </button>

        {mode === "signup" && (
          <p style={{ color: C.muted, fontSize: 12, textAlign: "center", margin: "16px 0 0", lineHeight: 1.6 }}>
            A verification email will be sent to confirm your account.
          </p>
        )}

        {mode !== "forgot" && (
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center", margin: "20px 0 0" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); clear(); }}
              style={{ background: "transparent", border: "none", color: C.teal, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
