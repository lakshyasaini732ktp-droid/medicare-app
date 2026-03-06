import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import App from "./App.jsx";
import AuthPage from "./Auth.jsx";

function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && u.emailVerified) {
        setUser(u);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ background: "#0a1628", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>💊</div>
        <p style={{ color: "#00d4aa", fontWeight: 700, fontSize: 18, margin: 0 }}>Loading MediCare+...</p>
      </div>
    </div>
  );

  if (!user) return <AuthPage onLogin={setUser} />;

  return <App user={user} onLogout={() => signOut(auth).then(() => setUser(null))} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode><Root /></React.StrictMode>
);
