import { useState, useEffect } from "react";
import { doc, onSnapshot, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./firebase";

const C = {
  navy:"#0a1628", navyLight:"#112240", teal:"#00d4aa", amber:"#f59e0b",
  rose:"#f43f5e", purple:"#8b5cf6", blue:"#3b82f6", green:"#10b981",
  card:"#0d1f3c", border:"#1e3a5f", text:"#e2e8f0", muted:"#7a9bb5",
};

// ─── LIVE PATIENT CARD ────────────────────────────────────────────────────────
// Uses onSnapshot — updates in real time when patient takes/misses dose!
function LivePatientCard({ patientId, onRemove }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // 🔴 LIVE LISTENER — fires every time patient's data changes in Firestore
    const unsub = onSnapshot(doc(db, "users", patientId), (snap) => {
      if (snap.exists()) {
        setData(snap.data());
        setLastUpdate(new Date());
        // Flash green pulse on update
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Live sync error:", err);
      setLoading(false);
    });

    return () => unsub(); // cleanup on unmount
  }, [patientId]);

  if (loading) return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:16, marginBottom:12, textAlign:"center" }}>
      <p style={{ color:C.muted, fontSize:13 }}>🔄 Connecting to patient...</p>
    </div>
  );

  if (!data) return (
    <div style={{ background:C.card, border:`1px solid ${C.rose}44`, borderRadius:16, padding:16, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ color:C.rose, fontSize:13, margin:0 }}>❌ Patient not found or access denied</p>
        <button onClick={()=>onRemove(patientId)} style={{ background:C.rose+"22", border:"none", color:C.rose, borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:12 }}>Remove</button>
      </div>
      <p style={{ color:C.muted, fontSize:11, margin:"4px 0 0" }}>ID: {patientId.slice(0,8)}...</p>
    </div>
  );

  const meds = data.meds || [];
  const profile = data.profile || {};
  const total = meds.reduce((a,m) => a + (m.times?.length||0), 0);
  const taken = meds.reduce((a,m) => a + (m.taken||[]).filter(Boolean).length, 0);
  const missed = meds.filter(m => (m.missed||[]).some(Boolean));
  const adh = total > 0 ? Math.round((taken/total)*100) : 0;
  const lowStock = meds.filter(m => m.stock <= m.refillAt);

  const adhColor = adh >= 80 ? C.green : adh >= 50 ? C.amber : C.rose;

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${pulse ? C.teal : missed.length > 0 ? C.rose+"44" : C.border}`,
      borderRadius: 18,
      marginBottom: 14,
      overflow: "hidden",
      boxShadow: pulse ? `0 0 20px ${C.teal}44` : missed.length > 0 ? `0 4px 20px ${C.rose}15` : "none",
      transition: "border 0.3s, box-shadow 0.3s",
    }}>
      {/* Patient header */}
      <div style={{ background: missed.length > 0 ? C.rose+"18" : C.teal+"12", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.teal+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
            {profile.avatar || "👤"}
          </div>
          <div>
            <p style={{ color:C.text, fontWeight:800, fontSize:16, margin:0 }}>{profile.name || "Unknown Patient"}</p>
            <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:C.green, boxShadow:`0 0 6px ${C.green}` }}/>
              <p style={{ color:C.green, fontSize:11, margin:0, fontWeight:600 }}>LIVE</p>
              {lastUpdate && <p style={{ color:C.muted, fontSize:10, margin:0 }}>· Updated {lastUpdate.toLocaleTimeString()}</p>}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {/* Adherence ring */}
          <div style={{ textAlign:"center" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:`conic-gradient(${adhColor} ${adh*3.6}deg, ${C.border} 0)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:C.card, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:adhColor, fontSize:11, fontWeight:800 }}>{adh}%</span>
              </div>
            </div>
          </div>
          <button onClick={()=>onRemove(patientId)} style={{ background:"transparent", border:"none", color:C.muted, cursor:"pointer", fontSize:18, padding:"4px" }}>✕</button>
        </div>
      </div>

      {/* Missed dose alert */}
      {missed.length > 0 && (
        <div style={{ background:C.rose+"15", borderBottom:`1px solid ${C.rose}22`, padding:"10px 16px", display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:18 }}>🚨</span>
          <div>
            <p style={{ color:C.rose, fontWeight:700, fontSize:13, margin:0 }}>MISSED DOSE ALERT</p>
            <p style={{ color:C.muted, fontSize:12, margin:0 }}>{missed.map(m=>m.name).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display:"flex", padding:"12px 16px", gap:8 }}>
        {[
          { v:taken,        l:"Taken",   c:C.teal },
          { v:missed.length,l:"Missed",  c:C.rose },
          { v:meds.length,  l:"Meds",    c:C.blue },
          { v:lowStock.length,l:"Low Stock",c:C.amber },
        ].map((s,i) => (
          <div key={i} style={{ flex:1, background:s.c+"15", border:`1px solid ${s.c}22`, borderRadius:10, padding:"8px 4px", textAlign:"center" }}>
            <p style={{ color:s.c, fontSize:18, fontWeight:800, margin:0 }}>{s.v}</p>
            <p style={{ color:C.muted, fontSize:9, margin:0 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Medication list */}
      <div style={{ padding:"0 16px 14px" }}>
        {meds.length === 0 ? (
          <p style={{ color:C.muted, fontSize:12, textAlign:"center", padding:"8px 0" }}>No medications added</p>
        ) : meds.map(med => (
          <div key={med.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}33` }}>
            <div>
              <p style={{ color:C.text, fontSize:13, fontWeight:600, margin:0 }}>{med.name} <span style={{ color:med.color||C.teal, fontWeight:400 }}>{med.dose}</span></p>
              <p style={{ color:C.muted, fontSize:11, margin:0 }}>{(med.times||[]).join(" · ")} · 📦 {med.stock} left</p>
            </div>
            <div style={{ display:"flex", gap:4 }}>
              {(med.times||[]).map((_,i) => {
                const isMissed = med.missed?.[i];
                const isTaken = med.taken?.[i];
                return (
                  <div key={i} style={{ width:28, height:28, borderRadius:8, border:`2px solid ${isMissed?C.rose:isTaken?med.color||C.teal:C.border}`, background:isMissed?C.rose+"22":isTaken?(med.color||C.teal)+"33":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>
                    {isMissed?"✗":isTaken?"✓":"○"}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Health info */}
      {(profile.blood || profile.allergies) && (
        <div style={{ background:C.navyLight, padding:"10px 16px", display:"flex", gap:8, flexWrap:"wrap" }}>
          {profile.blood && <span style={{ background:C.rose+"22", border:`1px solid ${C.rose}44`, borderRadius:8, padding:"3px 10px", fontSize:11, color:C.rose, fontWeight:600 }}>🩸 {profile.blood}</span>}
          {profile.allergies && <span style={{ background:C.amber+"22", border:`1px solid ${C.amber}44`, borderRadius:8, padding:"3px 10px", fontSize:11, color:C.amber, fontWeight:600 }}>⚠️ {profile.allergies}</span>}
          {profile.phone && <span style={{ background:C.blue+"22", border:`1px solid ${C.blue}44`, borderRadius:8, padding:"3px 10px", fontSize:11, color:C.blue, fontWeight:600 }}>📞 {profile.phone}</span>}
        </div>
      )}
    </div>
  );
}

// ─── CAREGIVER DASHBOARD ──────────────────────────────────────────────────────
export default function CaregiverView({ user, onBack }) {
  const [patientIds, setPatientIds] = useState([]);
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Load caregiver's saved patient list from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "caregivers", user.uid), (snap) => {
      if (snap.exists()) {
        setPatientIds(snap.data().patients || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [user.uid]);

  const addPatient = async () => {
    const id = inputId.trim();
    if (!id) return;
    if (patientIds.includes(id)) { setError("Already added!"); return; }
    if (id === user.uid) { setError("You can't add yourself!"); return; }

    setAdding(true);
    setError("");

    // Check if patient exists
    try {
      const snap = await getDoc(doc(db, "users", id));
      if (!snap.exists()) { setError("Patient not found. Check the ID."); setAdding(false); return; }

      // Save to caregiver's list
      const cgRef = doc(db, "caregivers", user.uid);
      const cgSnap = await getDoc(cgRef);
      if (cgSnap.exists()) {
        await updateDoc(cgRef, { patients: arrayUnion(id) });
      } else {
        await setDoc(cgRef, { patients: [id], caregiverEmail: user.email });
      }

      // Also write to patient's caregiver list so they know
      await updateDoc(doc(db, "users", id), {
        "profile.linkedCaregivers": arrayUnion(user.uid)
      }).catch(() => {}); // silent fail if field doesn't exist yet

      setInputId("");
      setShowAdd(false);
    } catch (e) {
      setError("Error adding patient. Try again.");
    }
    setAdding(false);
  };

  const removePatient = async (id) => {
    await updateDoc(doc(db, "caregivers", user.uid), { patients: arrayRemove(id) });
  };

  return (
    <div style={{ background:C.navy, minHeight:"100vh", maxWidth:480, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ background:C.navyLight, borderBottom:`1px solid ${C.border}`, padding:"14px 16px", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={onBack} style={{ background:C.card, border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"8px 12px", cursor:"pointer", fontSize:14 }}>← Back</button>
            <div>
              <p style={{ color:C.text, fontWeight:800, fontSize:15, margin:0 }}>🩺 Caregiver View</p>
              <p style={{ color:C.muted, fontSize:11, margin:0 }}>{patientIds.length} patient{patientIds.length !== 1 ? "s" : ""} linked</p>
            </div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"10px 14px", cursor:"pointer", fontWeight:800, fontSize:13 }}>+ Add Patient</button>
        </div>
      </div>

      <div style={{ padding:"16px 16px 80px" }}>

        {/* Live indicator banner */}
        <div style={{ background:C.green+"15", border:`1px solid ${C.green}33`, borderRadius:14, padding:"10px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:C.green, boxShadow:`0 0 8px ${C.green}`, flexShrink:0 }}/>
          <div>
            <p style={{ color:C.green, fontWeight:700, fontSize:13, margin:0 }}>Live Sync Active</p>
            <p style={{ color:C.muted, fontSize:11, margin:0 }}>Updates appear instantly when patients take or miss doses</p>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <p style={{ color:C.muted }}>Loading...</p>
          </div>
        ) : patientIds.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 20px" }}>
            <div style={{ fontSize:56, marginBottom:14 }}>🩺</div>
            <h3 style={{ color:C.text, fontSize:18, fontWeight:800, margin:"0 0 8px" }}>No patients linked yet</h3>
            <p style={{ color:C.muted, fontSize:14, margin:"0 0 24px", lineHeight:1.6 }}>Ask your patient to share their Patient ID with you, then tap + Add Patient</p>
            <button onClick={()=>setShowAdd(true)} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:14, padding:"14px 28px", cursor:"pointer", fontWeight:800, fontSize:15 }}>+ Add First Patient</button>
          </div>
        ) : (
          patientIds.map(id => (
            <LivePatientCard key={id} patientId={id} onRemove={removePatient}/>
          ))
        )}
      </div>

      {/* Add Patient Sheet */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"#000c", zIndex:1000, display:"flex", alignItems:"flex-end" }} onClick={()=>{ setShowAdd(false); setError(""); }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, margin:"0 auto", padding:"0 20px 40px" }}>
            <div style={{ width:40, height:4, background:C.border, borderRadius:2, margin:"12px auto 20px" }}/>
            <h3 style={{ color:C.text, fontSize:17, fontWeight:800, margin:"0 0 6px" }}>🔗 Link a Patient</h3>
            <p style={{ color:C.muted, fontSize:13, margin:"0 0 20px", lineHeight:1.5 }}>Ask the patient to go to <b style={{color:C.teal}}>Profile → Share My ID</b> and send you their Patient ID. Paste it below:</p>

            <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase" }}>Patient ID</label>
            <input
              value={inputId}
              onChange={e=>{ setInputId(e.target.value); setError(""); }}
              placeholder="Paste patient ID here..."
              style={{ width:"100%", background:C.navyLight, border:`1px solid ${error?C.rose:C.border}`, borderRadius:12, padding:"13px 14px", color:C.text, fontSize:14, boxSizing:"border-box", marginBottom:8 }}
            />
            {error && <p style={{ color:C.rose, fontSize:12, margin:"0 0 12px" }}>⚠️ {error}</p>}

            <div style={{ background:C.amber+"15", border:`1px solid ${C.amber}33`, borderRadius:12, padding:"10px 14px", marginBottom:16 }}>
              <p style={{ color:C.amber, fontSize:12, margin:0, lineHeight:1.5 }}>
                💡 <b>How to get Patient ID:</b> Patient opens MediCare+ → Profile → tap "Share My ID" → copy and send to you
              </p>
            </div>

            <button
              onClick={addPatient}
              disabled={adding || !inputId.trim()}
              style={{ width:"100%", background:adding||!inputId.trim()?C.border:C.teal, border:"none", color:adding||!inputId.trim()?C.muted:C.navy, borderRadius:14, padding:"16px", cursor:adding?"wait":"pointer", fontWeight:800, fontSize:15 }}>
              {adding ? "🔄 Verifying..." : "🔗 Link Patient"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
