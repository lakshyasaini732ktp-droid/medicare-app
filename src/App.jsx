import { useState } from "react";

const C = {
  navy: "#0a1628", navyLight: "#112240", teal: "#00d4aa", amber: "#f59e0b",
  rose: "#f43f5e", purple: "#8b5cf6", blue: "#3b82f6", green: "#10b981",
  card: "#0d1f3c", border: "#1e3a5f", text: "#e2e8f0", muted: "#7a9bb5",
};

const FAMILY_DATA = {
  1: {
    id: 1, name: "Rajesh Kumar", relation: "Self", age: 34, avatar: "👤", color: C.teal,
    blood: "O+", allergies: "Penicillin", adherence: 87, missed: 1,
    meds: [
      { id: 1, name: "Metformin", dose: "500mg", times: ["08:00", "20:00"], color: "#00d4aa", taken: [true, false], stock: 28, refillAt: 10, condition: "Diabetes", food: "With food", interactions: [] },
      { id: 2, name: "Lisinopril", dose: "10mg", times: ["09:00"], color: "#3b82f6", taken: [false], stock: 15, refillAt: 7, condition: "Blood Pressure", food: "Any time", interactions: ["Potassium supplements"] },
      { id: 3, name: "Atorvastatin", dose: "20mg", times: ["21:00"], color: "#8b5cf6", taken: [false], stock: 30, refillAt: 10, condition: "Cholesterol", food: "At night", interactions: [] },
      { id: 4, name: "Vitamin D3", dose: "1000IU", times: ["08:00"], color: "#f59e0b", taken: [true], stock: 60, refillAt: 15, condition: "Supplement", food: "With fat", interactions: [] },
      { id: 5, name: "Aspirin", dose: "75mg", times: ["08:00"], color: "#f43f5e", taken: [true], stock: 8, refillAt: 10, condition: "Heart", food: "With food", interactions: ["NSAIDs"] },
    ],
    vitals: [{ type: "BP", value: "118/76", unit: "mmHg", status: "normal", date: "Today" }, { type: "Glucose", value: "95", unit: "mg/dL", status: "normal", date: "Today" }],
    weekAdherence: [100, 83, 100, 67, 100, 83, 87],
    doctor: "Dr. Priya Sharma",
  },
  2: {
    id: 2, name: "Sunita Kumar", relation: "Mother", age: 62, avatar: "👩", color: C.blue,
    blood: "A+", allergies: "Sulfa drugs", adherence: 94, missed: 0,
    meds: [
      { id: 10, name: "Amlodipine", dose: "5mg", times: ["08:00"], color: "#3b82f6", taken: [true], stock: 25, refillAt: 7, condition: "Hypertension", food: "Any time", interactions: [] },
      { id: 11, name: "Levothyroxine", dose: "50mcg", times: ["07:00"], color: "#00d4aa", taken: [true], stock: 20, refillAt: 5, condition: "Thyroid", food: "Empty stomach", interactions: ["Calcium", "Iron"] },
      { id: 12, name: "Calcium + D3", dose: "500mg", times: ["13:00", "20:00"], color: "#f59e0b", taken: [true, false], stock: 40, refillAt: 10, condition: "Bone Health", food: "With meals", interactions: [] },
      { id: 13, name: "Metformin", dose: "500mg", times: ["08:00", "20:00"], color: "#10b981", taken: [true, true], stock: 18, refillAt: 7, condition: "Diabetes", food: "With food", interactions: [] },
    ],
    vitals: [{ type: "BP", value: "130/84", unit: "mmHg", status: "warning", date: "Today" }, { type: "TSH", value: "2.8", unit: "mIU/L", status: "normal", date: "Yesterday" }],
    weekAdherence: [100, 100, 83, 100, 100, 100, 83],
    doctor: "Dr. Anil Mehta",
  },
  3: {
    id: 3, name: "Ramesh Kumar", relation: "Father", age: 65, avatar: "👨", color: C.amber,
    blood: "B+", allergies: "Aspirin", adherence: 72, missed: 3, alert: true,
    meds: [
      { id: 20, name: "Glimepiride", dose: "2mg", times: ["07:30"], color: "#f59e0b", taken: [false], stock: 12, refillAt: 5, condition: "Diabetes", food: "Before breakfast", interactions: ["Alcohol"] },
      { id: 21, name: "Telmisartan", dose: "40mg", times: ["09:00"], color: "#3b82f6", taken: [false], stock: 9, refillAt: 5, condition: "Blood Pressure", food: "Any time", interactions: [] },
      { id: 22, name: "Atorvastatin", dose: "40mg", times: ["21:00"], color: "#8b5cf6", taken: [false], stock: 22, refillAt: 7, condition: "Cholesterol", food: "At night", interactions: [] },
      { id: 23, name: "Pantoprazole", dose: "40mg", times: ["08:00"], color: "#00d4aa", taken: [true], stock: 30, refillAt: 10, condition: "Acidity", food: "Before food", interactions: [] },
      { id: 24, name: "Ecosprin", dose: "75mg", times: ["21:00"], color: "#f43f5e", taken: [false], stock: 7, refillAt: 7, condition: "Heart", food: "With food", interactions: ["NSAIDs"] },
      { id: 25, name: "Metoprolol", dose: "25mg", times: ["08:00", "20:00"], color: "#10b981", taken: [true, false], stock: 14, refillAt: 7, condition: "Heart Rate", food: "With food", interactions: [] },
    ],
    vitals: [{ type: "BP", value: "148/92", unit: "mmHg", status: "critical", date: "Today" }, { type: "Glucose", value: "182", unit: "mg/dL", status: "critical", date: "Today" }],
    weekAdherence: [83, 50, 67, 50, 83, 67, 72],
    doctor: "Dr. Vikram Rao",
  },
  4: {
    id: 4, name: "Arjun Kumar", relation: "Son", age: 8, avatar: "👦", color: C.green,
    blood: "O+", allergies: "None", adherence: 100, missed: 0,
    meds: [
      { id: 30, name: "Vitamin C", dose: "250mg", times: ["09:00"], color: "#10b981", taken: [true], stock: 45, refillAt: 10, condition: "Immunity", food: "With food", interactions: [] },
    ],
    vitals: [{ type: "Weight", value: "26", unit: "kg", status: "normal", date: "This week" }, { type: "Height", value: "128", unit: "cm", status: "normal", date: "This week" }],
    weekAdherence: [100, 100, 100, 100, 100, 100, 100],
    doctor: "Dr. Meena Gupta",
  },
};

const DOCTORS = [
  { id: 1, name: "Dr. Priya Sharma", spec: "General Physician", exp: "12 yrs", rating: 4.9, available: true, phone: "+91-98765-43210", hospital: "Apollo Hospital, Jaipur", slots: ["10:00 AM", "11:30 AM", "3:00 PM"], avatar: "👩‍⚕️", patients: ["Rajesh Kumar"] },
  { id: 2, name: "Dr. Anil Mehta", spec: "Endocrinologist", exp: "18 yrs", rating: 4.8, available: true, phone: "+91-87654-32109", hospital: "Fortis Escorts, Jaipur", slots: ["9:00 AM", "2:00 PM"], avatar: "👨‍⚕️", patients: ["Sunita Kumar"] },
  { id: 3, name: "Dr. Vikram Rao", spec: "Cardiologist", exp: "22 yrs", rating: 4.9, available: false, phone: "+91-76543-21098", hospital: "SMS Medical College, Jaipur", slots: ["Tomorrow 10 AM", "Tomorrow 3 PM"], avatar: "👨‍⚕️", patients: ["Ramesh Kumar"] },
  { id: 4, name: "Dr. Meena Gupta", spec: "Pediatrician", exp: "15 yrs", rating: 5.0, available: true, phone: "+91-65432-10987", hospital: "Narayana Hospital, Jaipur", slots: ["11:00 AM", "4:00 PM"], avatar: "👩‍⚕️", patients: ["Arjun Kumar"] },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "medications", label: "My Meds", icon: "💊" },
  { id: "schedule", label: "Schedule", icon: "📅" },
  { id: "family", label: "Family Hub", icon: "👨‍👩‍👧" },
  { id: "analytics", label: "Analytics", icon: "📊" },
  { id: "health", label: "Health Log", icon: "❤️" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function Card({ children, style = {}, glow }) {
  return <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, boxShadow: glow ? `0 0 30px ${glow}22` : "0 4px 20px #00000040", ...style }}>{children}</div>;
}
function Badge({ label, color }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{label}</span>;
}
function CircleProgress({ pct, size = 80, stroke = 7, color = C.teal, children }) {
  const r = (size - stroke * 2) / 2, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}
function MiniBar({ pct, color }) {
  return <div style={{ background: C.border, borderRadius: 4, height: 6, overflow: "hidden", flex: 1 }}><div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} /></div>;
}

// ──────────────────────────────────────────────────────────────────────────────
// SOS MODAL
// ──────────────────────────────────────────────────────────────────────────────
function SOSModal({ onClose }) {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Sunita Kumar", relation: "Wife", phone: "+91-98765-11111", primary: true },
    { id: 2, name: "Ramesh Kumar", relation: "Father", phone: "+91-87654-22222", primary: false },
  ]);
  const [form, setForm] = useState({ name: "", relation: "", phone: "" });
  const [adding, setAdding] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const triggerSOS = () => {
    setTriggered(true);
    let c = 5;
    setCountdown(c);
    const t = setInterval(() => { c--; setCountdown(c); if (c <= 0) { clearInterval(t); setTriggered(false); setCountdown(null); } }, 1000);
  };

  const addContact = () => {
    if (!form.name || !form.phone) return;
    setContacts(prev => [...prev, { id: Date.now(), ...form, primary: false }]);
    setForm({ name: "", relation: "", phone: "" }); setAdding(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.rose}55`, borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", padding: 28, boxShadow: `0 0 60px ${C.rose}33` }}>
        {triggered ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 64 }}>🚨</div>
            <h2 style={{ color: C.rose, fontSize: 24, fontWeight: 900, margin: "12px 0 6px" }}>SOS ALERT SENT!</h2>
            <p style={{ color: C.muted, margin: "0 0 16px" }}>Notifying all emergency contacts with your location...</p>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.rose + "22", border: `3px solid ${C.rose}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, fontWeight: 900, color: C.rose }}>{countdown}</div>
            {contacts.map(ct => (
              <div key={ct.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.navyLight, borderRadius: 10, marginBottom: 8, textAlign: "left" }}>
                <span style={{ fontSize: 20 }}>📱</span>
                <div style={{ flex: 1 }}><p style={{ color: C.text, fontWeight: 700, margin: 0, fontSize: 14 }}>{ct.name}</p><p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{ct.phone}</p></div>
                <Badge label="Alerting..." color={C.amber} />
              </div>
            ))}
            <button onClick={() => { setTriggered(false); setCountdown(null); }} style={{ marginTop: 12, background: C.rose, border: "none", color: "white", borderRadius: 10, padding: "10px 28px", cursor: "pointer", fontWeight: 700 }}>Cancel SOS</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div><h2 style={{ color: C.text, margin: 0, fontSize: 18, fontWeight: 800 }}>🚨 Emergency SOS</h2><p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>Manage emergency contacts & trigger SOS</p></div>
              <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>✕</button>
            </div>

            <button onClick={triggerSOS} style={{ width: "100%", background: `linear-gradient(135deg, #c0392b, ${C.rose})`, border: "none", borderRadius: 14, padding: 18, cursor: "pointer", marginBottom: 22, boxShadow: `0 4px 30px ${C.rose}44` }}>
              <p style={{ color: "white", fontSize: 20, fontWeight: 900, margin: 0 }}>🚨 SEND SOS ALERT NOW</p>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "4px 0 0" }}>Sends your live location + emergency message to all contacts</p>
            </button>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h3 style={{ color: C.text, margin: 0, fontSize: 14, fontWeight: 700 }}>Emergency Contacts</h3>
                <button onClick={() => setAdding(true)} style={{ background: C.teal + "22", border: `1px solid ${C.teal}44`, color: C.teal, borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+ Add</button>
              </div>
              {contacts.map(ct => (
                <div key={ct.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: C.navyLight, borderRadius: 12, border: `1px solid ${ct.primary ? C.rose + "55" : C.border}`, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: (ct.primary ? C.rose : C.blue) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{ct.primary ? "🚨" : "👤"}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.text, fontWeight: 700, fontSize: 14, margin: 0 }}>{ct.name}</p>
                    <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{ct.relation} · {ct.phone}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                    {ct.primary && <Badge label="PRIMARY" color={C.rose} />}
                    <div style={{ display: "flex", gap: 5 }}>
                      {!ct.primary && <button onClick={() => setContacts(p => p.map(c => ({ ...c, primary: c.id === ct.id })))} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>Set Primary</button>}
                      <a href={`tel:${ct.phone}`} style={{ background: C.green + "22", border: `1px solid ${C.green}44`, color: C.green, borderRadius: 6, padding: "3px 8px", fontSize: 11, textDecoration: "none", fontWeight: 600 }}>📞 Call</a>
                      <button onClick={() => setContacts(p => p.filter(c => c.id !== ct.id))} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.rose, borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
                    </div>
                  </div>
                </div>
              ))}
              {adding && (
                <div style={{ background: C.navyLight, borderRadius: 12, padding: 16, border: `1px solid ${C.border}`, marginTop: 4 }}>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: 13, margin: "0 0 12px" }}>New Emergency Contact</p>
                  {[{ k: "name", p: "Full Name" }, { k: "relation", p: "Relation (e.g. Son, Doctor)" }, { k: "phone", p: "Phone Number (+91-XXXXX-XXXXX)" }].map(f => (
                    <input key={f.k} placeholder={f.p} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                      style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px", color: C.text, fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
                  ))}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={addContact} style={{ flex: 1, background: C.teal, border: "none", color: C.navy, borderRadius: 8, padding: "9px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Save</button>
                    <button onClick={() => setAdding(false)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "9px 16px", cursor: "pointer" }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 14px", background: "#ff000010", border: "1px solid #ff000030", borderRadius: 12 }}>
              <p style={{ color: C.rose, fontWeight: 700, fontSize: 13, margin: "0 0 8px" }}>🏥 National Emergency Lines (India)</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[{ label: "Ambulance", num: "108" }, { label: "Police", num: "100" }, { label: "Fire", num: "101" }, { label: "Women Helpline", num: "1091" }].map(e => (
                  <a key={e.num} href={`tel:${e.num}`} style={{ background: C.rose + "20", border: `1px solid ${C.rose}33`, color: C.rose, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>{e.label} ({e.num})</a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// DOCTOR CONSULT MODAL
// ──────────────────────────────────────────────────────────────────────────────
function DoctorModal({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [slot, setSlot] = useState(null);
  const [booked, setBooked] = useState(false);
  const [filter, setFilter] = useState("all");

  const visible = filter === "family" ? DOCTORS.filter(d => d.patients.length > 0) : DOCTORS;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.blue}55`, borderRadius: 20, width: "100%", maxWidth: 540, maxHeight: "92vh", overflowY: "auto", padding: 28, boxShadow: `0 0 60px ${C.blue}22` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div><h2 style={{ color: C.text, margin: 0, fontSize: 18, fontWeight: 800 }}>🩺 Consult Doctor</h2><p style={{ color: C.muted, margin: "4px 0 0", fontSize: 13 }}>Book appointments with your family doctors</p></div>
          <button onClick={() => { onClose(); setSelected(null); setBooked(false); setSlot(null); }} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>✕</button>
        </div>

        {booked ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56 }}>✅</div>
            <h3 style={{ color: C.green, fontSize: 20, fontWeight: 800, margin: "12px 0 6px" }}>Appointment Confirmed!</h3>
            <p style={{ color: C.text, fontSize: 15, margin: "0 0 4px" }}>{selected?.name}</p>
            <p style={{ color: C.teal, fontWeight: 700, fontSize: 15, margin: "0 0 4px" }}>{slot}</p>
            <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>{selected?.hospital}</p>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Confirmation sent to your registered mobile.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              <a href={`tel:${selected?.phone}`} style={{ background: C.green + "22", border: `1px solid ${C.green}44`, color: C.green, borderRadius: 10, padding: "10px 20px", textDecoration: "none", fontWeight: 700, fontSize: 13 }}>📞 Call Doctor</a>
              <button onClick={() => { setBooked(false); setSelected(null); setSlot(null); }} style={{ background: C.blue + "22", border: `1px solid ${C.blue}44`, color: C.blue, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Book Another</button>
            </div>
          </div>
        ) : selected ? (
          <div>
            <button onClick={() => { setSelected(null); setSlot(null); }} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer", marginBottom: 16, fontSize: 13 }}>← Back</button>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 18, padding: "16px", background: C.navyLight, borderRadius: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 14, background: C.blue + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>{selected.avatar}</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: C.text, margin: 0, fontSize: 18, fontWeight: 800 }}>{selected.name}</h3>
                <p style={{ color: C.blue, fontWeight: 700, fontSize: 14, margin: "3px 0 2px" }}>{selected.spec}</p>
                <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>🏥 {selected.hospital}</p>
                <p style={{ color: C.muted, fontSize: 13, margin: "3px 0 8px" }}>📞 {selected.phone}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Badge label={`⭐ ${selected.rating}`} color={C.amber} />
                  <Badge label={`${selected.exp} exp`} color={C.purple} />
                  <Badge label={selected.available ? "● Available Today" : "Next: Tomorrow"} color={selected.available ? C.green : C.amber} />
                </div>
                {selected.patients.length > 0 && <p style={{ color: C.muted, fontSize: 12, margin: "8px 0 0" }}>Family Patients: <span style={{ color: C.teal, fontWeight: 700 }}>{selected.patients.join(", ")}</span></p>}
              </div>
            </div>
            <h4 style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>📅 Available Slots</h4>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {selected.slots.map(s => (
                <button key={s} onClick={() => setSlot(s)} style={{ background: slot === s ? C.blue : C.blue + "15", border: `1px solid ${slot === s ? C.blue : C.blue + "44"}`, color: slot === s ? "white" : C.blue, borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>{s}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button disabled={!slot} onClick={() => setBooked(true)} style={{ flex: 1, background: slot ? C.teal : C.border, border: "none", color: slot ? C.navy : C.muted, borderRadius: 10, padding: 13, cursor: slot ? "pointer" : "default", fontWeight: 800, fontSize: 14 }}>✅ Confirm Appointment</button>
              <a href={`tel:${selected.phone}`} style={{ background: C.green + "22", border: `1px solid ${C.green}44`, color: C.green, borderRadius: 10, padding: "13px 18px", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>📞 Call</a>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[{ v: "all", l: "All Doctors" }, { v: "family", l: "My Family's Doctors" }].map(f => (
                <button key={f.v} onClick={() => setFilter(f.v)} style={{ flex: 1, background: filter === f.v ? C.teal + "22" : "transparent", border: `1px solid ${filter === f.v ? C.teal : C.border}`, color: filter === f.v ? C.teal : C.muted, borderRadius: 8, padding: "8px", cursor: "pointer", fontWeight: filter === f.v ? 700 : 400, fontSize: 13 }}>{f.l}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {visible.map(doc => (
                <div key={doc.id} onClick={() => setSelected(doc)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.navyLight, borderRadius: 14, cursor: "pointer", border: `1px solid ${C.border}`, transition: "border-color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = C.blue + "66"}
                  onMouseOut={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: C.blue + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{doc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: 0 }}>{doc.name}</p>
                    <p style={{ color: C.blue, fontSize: 13, fontWeight: 600, margin: "2px 0" }}>{doc.spec}</p>
                    <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{doc.hospital}</p>
                    {doc.patients.length > 0 && <p style={{ color: C.teal, fontSize: 11, margin: "3px 0 0", fontWeight: 600 }}>👨‍👩‍👧 {doc.patients.join(", ")}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                    <Badge label={`⭐ ${doc.rating}`} color={C.amber} />
                    <Badge label={doc.available ? "Available" : "Tomorrow"} color={doc.available ? C.green : C.amber} />
                    <span style={{ color: C.muted, fontSize: 11 }}>{doc.exp}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// FAMILY MEMBER DETAIL MODAL
// ──────────────────────────────────────────────────────────────────────────────
function FamilyDetailModal({ member, onClose }) {
  const [activeTab, setActiveTab] = useState("meds");
  const statusColor = s => s === "normal" ? C.green : s === "warning" ? C.amber : C.rose;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${member.color}44`, borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto", padding: 28, boxShadow: `0 0 60px ${member.color}22` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 58, height: 58, borderRadius: 15, background: member.color + "22", border: `2px solid ${member.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{member.avatar}</div>
            <div>
              <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>{member.name}</h2>
              <p style={{ color: member.color, fontSize: 13, fontWeight: 700, margin: "3px 0 6px" }}>{member.relation} · Age {member.age}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge label={`🩸 ${member.blood}`} color={C.rose} />
                <Badge label={`⚠️ ${member.allergies}`} color={C.amber} />
                <Badge label={`🩺 ${member.doctor}`} color={C.blue} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { l: "Adherence", v: member.adherence + "%", c: member.adherence > 85 ? C.green : member.adherence > 70 ? C.amber : C.rose },
            { l: "Medications", v: member.meds.length, c: C.blue },
            { l: "Missed Today", v: member.missed, c: member.missed > 0 ? C.rose : C.green },
          ].map((s, i) => (
            <div key={i} style={{ background: s.c + "11", border: `1px solid ${s.c}22`, borderRadius: 10, padding: 12, textAlign: "center" }}>
              <p style={{ color: s.c, fontSize: 22, fontWeight: 800, margin: 0 }}>{s.v}</p>
              <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{s.l}</p>
            </div>
          ))}
        </div>

        {member.alert && (
          <div style={{ background: C.rose + "15", border: `1px solid ${C.rose}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
            <span>🚨</span>
            <p style={{ color: C.rose, margin: 0, fontSize: 13, fontWeight: 700 }}>{member.missed} doses missed today · Critical vitals detected — contact {member.doctor}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {[{ id: "meds", l: "💊 Medications" }, { id: "vitals", l: "❤️ Vitals" }, { id: "analytics", l: "📊 Analytics" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: activeTab === t.id ? member.color + "22" : "transparent", border: `1px solid ${activeTab === t.id ? member.color : C.border}`, color: activeTab === t.id ? member.color : C.muted, borderRadius: 10, padding: "8px 6px", cursor: "pointer", fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400 }}>{t.l}</button>
          ))}
        </div>

        {activeTab === "meds" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {member.meds.map(med => {
              const allTaken = med.taken.every(Boolean), someTaken = med.taken.some(Boolean);
              return (
                <div key={med.id} style={{ padding: "12px 14px", background: C.navyLight, borderRadius: 12, borderLeft: `4px solid ${med.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ color: C.text, fontWeight: 800, fontSize: 14, margin: 0 }}>{med.name} <span style={{ color: med.color }}>{med.dose}</span></p>
                      <p style={{ color: C.muted, fontSize: 12, margin: "3px 0 0" }}>{med.condition} · {med.food} · {med.times.join(", ")}</p>
                      {med.interactions.length > 0 && <p style={{ color: C.amber, fontSize: 11, margin: "4px 0 0" }}>⚠️ Interactions: {med.interactions.join(", ")}</p>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      <Badge label={allTaken ? "✓ TAKEN" : someTaken ? "PARTIAL" : "MISSED"} color={allTaken ? C.green : someTaken ? C.amber : C.rose} />
                      {med.stock <= med.refillAt && <Badge label="LOW STOCK" color={C.rose} />}
                      <span style={{ color: C.muted, fontSize: 11 }}>{med.stock} pills left</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {med.times.map((t, i) => (
                      <div key={i} style={{ background: med.taken[i] ? med.color + "22" : C.border + "44", border: `1px solid ${med.taken[i] ? med.color : C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: med.taken[i] ? med.color : C.muted }}>
                        {t} {med.taken[i] ? "✓" : "✗"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "vitals" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {member.vitals.map((v, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.navyLight, borderRadius: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: statusColor(v.status) + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {v.type === "BP" ? "🫀" : v.type === "Glucose" ? "🩸" : v.type === "Weight" ? "⚖️" : v.type === "TSH" ? "🦋" : "📏"}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.text, fontWeight: 700, fontSize: 15, margin: 0 }}>{v.type}</p>
                  <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{v.date}</p>
                </div>
                <p style={{ color: statusColor(v.status), fontWeight: 800, fontSize: 20, margin: 0 }}>{v.value} <span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>{v.unit}</span></p>
                <Badge label={v.status.toUpperCase()} color={statusColor(v.status)} />
              </div>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 10px" }}>7-Day Adherence</p>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 100, marginBottom: 18 }}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const pct = member.weekAdherence[i];
                const col = pct === 100 ? C.green : pct >= 80 ? member.color : pct >= 60 ? C.amber : C.rose;
                return (
                  <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ color: col, fontSize: 10, fontWeight: 700 }}>{pct}%</span>
                    <div style={{ width: "100%", height: pct, background: col, borderRadius: "4px 4px 2px 2px", opacity: 0.8 }} />
                    <span style={{ color: C.muted, fontSize: 10 }}>{d}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ color: C.text, fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>Per Medication</p>
            {member.meds.map(med => {
              const pct = Math.round((med.taken.filter(Boolean).length / med.times.length) * 100);
              return (
                <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ color: C.text, fontSize: 12, width: 90, flexShrink: 0 }}>{med.name}</span>
                  <MiniBar pct={pct} color={med.color} />
                  <span style={{ color: med.color, fontSize: 12, fontWeight: 700, width: 34 }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PAGES
// ──────────────────────────────────────────────────────────────────────────────
function Dashboard({ meds, onTake }) {
  const total = meds.reduce((a, m) => a + m.times.length, 0);
  const taken = meds.reduce((a, m) => a + m.taken.filter(Boolean).length, 0);
  const adh = Math.round((taken / total) * 100);
  const lowStock = meds.filter(m => m.stock <= m.refillAt);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navyLight}, #0a2540)`, borderRadius: 20, padding: 28, border: `1px solid ${C.border}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: C.teal + "0f" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ color: C.teal, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Good Morning</p>
            <h2 style={{ color: C.text, fontSize: 26, fontWeight: 800, margin: "6px 0 4px" }}>Rajesh Kumar 👋</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Friday, March 6, 2026</p>
            <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
              {[{ v: `${taken}/${total}`, l: "Doses Today", c: C.teal }, { v: "🔥 12", l: "Day Streak", c: C.amber }, { v: `${adh}%`, l: "Adherence", c: C.purple }].map((s, i) => (
                <div key={i} style={{ background: s.c + "22", border: `1px solid ${s.c}44`, borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
                  <p style={{ color: s.c, fontSize: 20, fontWeight: 800, margin: 0 }}>{s.v}</p>
                  <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <CircleProgress pct={adh} size={110} stroke={9} color={adh > 80 ? C.teal : C.amber}>
            <div style={{ textAlign: "center" }}><p style={{ color: C.text, fontSize: 22, fontWeight: 800, margin: 0 }}>{adh}%</p><p style={{ color: C.muted, fontSize: 10, margin: 0 }}>Today</p></div>
          </CircleProgress>
        </div>
      </div>
      {lowStock.length > 0 && (
        <div style={{ background: C.amber + "11", border: `1px solid ${C.amber}44`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}><span style={{ color: C.amber, fontWeight: 700 }}>Low Stock: </span>{lowStock.map(m => m.name).join(", ")}</p>
          <button style={{ marginLeft: "auto", background: C.amber, color: C.navy, border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Refill</button>
        </div>
      )}
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>💊 Today's Medications</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {meds.map(med => (
            <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.navyLight, borderRadius: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: med.color }} />
              <div style={{ flex: 1 }}>
                <p style={{ color: C.text, margin: 0, fontSize: 14, fontWeight: 600 }}>{med.name} <span style={{ color: C.muted, fontWeight: 400 }}>{med.dose}</span></p>
                <p style={{ color: C.muted, margin: 0, fontSize: 12 }}>{med.times.join(" · ")} · {med.food}</p>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                {med.times.map((_, i) => (
                  <button key={i} onClick={() => onTake(med.id, i)} style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${med.taken[i] ? med.color : C.border}`, background: med.taken[i] ? med.color + "33" : "transparent", color: med.taken[i] ? med.color : C.muted, cursor: "pointer", fontSize: 14 }}>{med.taken[i] ? "✓" : "○"}</button>
                ))}
              </div>
              {med.stock <= med.refillAt && <Badge label="LOW" color={C.rose} />}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>⚡ Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
          {[{ icon: "📷", label: "Scan Pill", c: C.teal }, { icon: "📋", label: "Export Report", c: C.purple }, { icon: "🔔", label: "Set Reminder", c: C.amber }, { icon: "🏥", label: "Book Lab", c: C.rose }, { icon: "💊", label: "Refill All", c: C.blue }, { icon: "📊", label: "Analytics", c: C.green }].map((a, i) => (
            <button key={i} style={{ background: a.c + "15", border: `1px solid ${a.c}30`, borderRadius: 12, padding: "12px 8px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span><span style={{ color: a.c, fontSize: 12, fontWeight: 600 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Medications({ meds, onTake }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>My Medications</h2>
        <button style={{ background: C.teal, border: "none", color: C.navy, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+ Add Med</button>
      </div>
      {meds.map(med => (
        <Card key={med.id} glow={med.color} style={{ borderLeft: `4px solid ${med.color}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: med.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>💊</div>
              <div>
                <p style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>{med.name} <span style={{ color: med.color }}>{med.dose}</span></p>
                <p style={{ color: C.muted, fontSize: 13, margin: "2px 0" }}>{med.condition} · {med.food}</p>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{med.times.map((t, i) => <Badge key={i} label={t} color={med.color} />)}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: med.stock <= med.refillAt ? C.rose : C.green, fontWeight: 700, margin: 0 }}>{med.stock} pills</p>
              <div style={{ display: "flex", gap: 5, marginTop: 6 }}>
                {med.times.map((_, i) => (
                  <button key={i} onClick={() => onTake(med.id, i)} style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${med.taken[i] ? med.color : C.border}`, background: med.taken[i] ? med.color + "33" : "transparent", color: med.taken[i] ? med.color : C.muted, cursor: "pointer" }}>{med.taken[i] ? "✓" : "○"}</button>
                ))}
              </div>
            </div>
          </div>
          {med.interactions.length > 0 && <div style={{ marginTop: 10, padding: "8px 12px", background: C.amber + "15", borderRadius: 8 }}><span style={{ color: C.amber, fontSize: 13 }}>⚠️ Interactions: {med.interactions.join(", ")}</span></div>}
        </Card>
      ))}
    </div>
  );
}

function Schedule() {
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const meds = FAMILY_DATA[1].meds;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>Schedule</h2>
      <Card>
        {hours.map(h => (
          <div key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 4 }}>
            <span style={{ color: C.muted, fontSize: 12, width: 36, paddingTop: 6, flexShrink: 0 }}>{h}:00</span>
            <div style={{ flex: 1, borderTop: `1px solid ${C.border}30`, minHeight: 32 }}>
              {meds.filter(m => m.times.some(t => parseInt(t) === h)).map((m, i) => (
                <div key={m.id} style={{ display: "inline-block", margin: "4px 6px 0 0", background: m.color + "22", border: `1px solid ${m.color}55`, borderRadius: 6, padding: "3px 10px", fontSize: 12, color: m.color, fontWeight: 600 }}>
                  {m.name} {m.dose}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function FamilyHub({ onViewMember }) {
  const members = Object.values(FAMILY_DATA);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>Family Hub</h2>
        <button style={{ background: C.teal, border: "none", color: C.navy, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>+ Add Member</button>
      </div>
      {members.filter(m => m.alert).map(m => (
        <div key={m.id} style={{ background: C.rose + "11", border: `1px solid ${C.rose}44`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <p style={{ color: C.rose, fontWeight: 700, margin: 0, fontSize: 14 }}>{m.name} needs attention!</p>
            <p style={{ color: C.muted, margin: 0, fontSize: 13 }}>{m.missed} doses missed · Critical BP & glucose detected</p>
          </div>
          <button onClick={() => onViewMember(m)} style={{ background: C.rose, border: "none", color: "white", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>View Now</button>
        </div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14 }}>
        {members.map(m => (
          <Card key={m.id} glow={m.alert ? C.rose : undefined} style={{ cursor: "pointer", borderColor: m.alert ? C.rose + "55" : C.border, position: "relative" }} onClick={() => onViewMember(m)}>
            {m.alert && <div style={{ position: "absolute", top: 12, right: 12, width: 10, height: 10, borderRadius: "50%", background: C.rose, boxShadow: `0 0 8px ${C.rose}` }} />}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: m.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{m.avatar}</div>
              <div><p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: 0 }}>{m.name}</p><p style={{ color: m.color, fontSize: 12, fontWeight: 600, margin: 0 }}>{m.relation} · {m.age}y</p></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <CircleProgress pct={m.adherence} size={56} stroke={5} color={m.adherence > 85 ? C.green : m.adherence > 70 ? C.amber : C.rose}>
                <span style={{ fontSize: 10, fontWeight: 800, color: m.adherence > 85 ? C.green : m.adherence > 70 ? C.amber : C.rose }}>{m.adherence}%</span>
              </CircleProgress>
              <div style={{ textAlign: "center" }}><p style={{ color: C.text, fontWeight: 700, fontSize: 18, margin: 0 }}>{m.meds.length}</p><p style={{ color: C.muted, fontSize: 11, margin: 0 }}>Meds</p></div>
              <div style={{ textAlign: "center" }}><p style={{ color: m.missed > 0 ? C.rose : C.green, fontWeight: 700, fontSize: 18, margin: 0 }}>{m.missed}</p><p style={{ color: C.muted, fontSize: 11, margin: 0 }}>Missed</p></div>
            </div>
            {m.alert ? <Badge label="NEEDS ATTENTION" color={C.rose} /> : m.missed === 0 ? <Badge label="All Good ✓" color={C.green} /> : <Badge label={`${m.missed} missed`} color={C.amber} />}
            <button style={{ marginTop: 12, width: "100%", background: m.color + "15", border: `1px solid ${m.color}33`, color: m.color, borderRadius: 10, padding: "8px", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>View Full Profile →</button>
          </Card>
        ))}
      </div>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📊 Family Adherence Overview</h3>
        {members.map(m => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <span style={{ fontSize: 18, width: 24 }}>{m.avatar}</span>
            <span style={{ color: C.text, fontSize: 13, width: 100, flexShrink: 0 }}>{m.name}</span>
            <MiniBar pct={m.adherence} color={m.adherence > 85 ? C.green : m.adherence > 70 ? C.amber : C.rose} />
            <span style={{ color: m.adherence > 85 ? C.green : m.adherence > 70 ? C.amber : C.rose, fontWeight: 700, fontSize: 13, width: 36 }}>{m.adherence}%</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Analytics() {
  const data = [100, 83, 100, 67, 100, 83, 87];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const meds = FAMILY_DATA[1].meds;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>Analytics</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ l: "This Week", v: "87%", c: C.teal }, { l: "This Month", v: "91%", c: C.green }, { l: "Streak", v: "12 days 🔥", c: C.amber }, { l: "Doses Taken", v: "148/162", c: C.blue }].map((s, i) => (
          <Card key={i} glow={s.c}><p style={{ color: C.muted, fontSize: 12, margin: "0 0 4px", textTransform: "uppercase" }}>{s.l}</p><p style={{ color: s.c, fontSize: 22, fontWeight: 800, margin: 0 }}>{s.v}</p></Card>
        ))}
      </div>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Weekly Adherence</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
          {days.map((d, i) => {
            const col = data[i] === 100 ? C.green : data[i] < 80 ? C.rose : C.amber;
            return (
              <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ color: col, fontSize: 10, fontWeight: 700 }}>{data[i]}%</span>
                <div style={{ width: "100%", height: data[i], background: col, borderRadius: "4px 4px 2px 2px", opacity: 0.85 }} />
                <span style={{ color: C.muted, fontSize: 10 }}>{d}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Per Medication</h3>
        {meds.map(med => {
          const pct = Math.round((med.taken.filter(Boolean).length / med.times.length) * 100);
          return (
            <div key={med.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ color: C.text, fontSize: 12, width: 100, flexShrink: 0 }}>{med.name}</span>
              <MiniBar pct={pct} color={med.color} />
              <span style={{ color: med.color, fontSize: 12, fontWeight: 700, width: 34 }}>{pct}%</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

function HealthLog() {
  const [vitals, setVitals] = useState({ bp: "", glucose: "", weight: "" });
  const logs = [{ type: "BP", value: "118/76", unit: "mmHg", status: "normal", date: "Today 8am" }, { type: "Glucose", value: "95", unit: "mg/dL", status: "normal", date: "Today" }, { type: "Weight", value: "72.3", unit: "kg", status: "normal", date: "Yesterday" }, { type: "BP", value: "125/82", unit: "mmHg", status: "warning", date: "Yesterday" }];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>Health Log</h2>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>➕ Log New Reading</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[{ l: "Blood Pressure", k: "bp", p: "120/80", u: "mmHg", c: C.rose }, { l: "Glucose", k: "glucose", p: "95", u: "mg/dL", c: C.amber }, { l: "Weight", k: "weight", p: "72", u: "kg", c: C.blue }].map(v => (
            <div key={v.k} style={{ background: v.c + "11", border: `1px solid ${v.c}22`, borderRadius: 10, padding: 14 }}>
              <label style={{ color: v.c, fontSize: 12, fontWeight: 700, display: "block", marginBottom: 8 }}>{v.l}</label>
              <input placeholder={v.p} value={vitals[v.k]} onChange={e => setVitals({ ...vitals, [v.k]: e.target.value })} style={{ width: "100%", background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px", color: C.text, fontSize: 14, boxSizing: "border-box" }} />
              <p style={{ color: C.muted, fontSize: 11, margin: "5px 0 0" }}>{v.u}</p>
            </div>
          ))}
        </div>
        <button style={{ marginTop: 14, background: C.teal, border: "none", color: C.navy, borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 700 }}>Log Readings</button>
      </Card>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Recent Readings</h3>
        {logs.map((v, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: C.navyLight, borderRadius: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{v.type === "BP" ? "🫀" : v.type === "Glucose" ? "🩸" : "⚖️"}</span>
            <div style={{ flex: 1 }}><p style={{ color: C.text, fontWeight: 700, margin: 0, fontSize: 14 }}>{v.type}</p><p style={{ color: C.muted, fontSize: 12, margin: 0 }}>{v.date}</p></div>
            <p style={{ color: v.status === "normal" ? C.green : C.amber, fontWeight: 800, fontSize: 18, margin: 0 }}>{v.value} <span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}>{v.unit}</span></p>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Settings() {
  const [toggles, setToggles] = useState({ push: true, sms: true, whatsapp: false, caregiver: true, biometric: false, largeText: false });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ color: C.text, margin: 0, fontSize: 20, fontWeight: 800 }}>Settings</h2>
      <Card>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: C.teal + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
          <div><p style={{ color: C.text, fontWeight: 800, fontSize: 16, margin: 0 }}>Rajesh Kumar</p><p style={{ color: C.muted, fontSize: 13, margin: "2px 0" }}>rajesh.kumar@email.com</p><Badge label="Pro Plan ✓" color={C.teal} /></div>
        </div>
      </Card>
      <Card>
        <h3 style={{ color: C.text, margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Preferences</h3>
        {[{ k: "push", l: "Push Notifications" }, { k: "sms", l: "SMS Alerts" }, { k: "whatsapp", l: "WhatsApp Reminders" }, { k: "caregiver", l: "Alert Caregiver if Missed" }, { k: "biometric", l: "Biometric Confirmation" }, { k: "largeText", l: "Large Text Mode" }].map(item => (
          <div key={item.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: C.text, fontSize: 14 }}>{item.l}</span>
            <button onClick={() => setToggles(p => ({ ...p, [item.k]: !p[item.k] }))} style={{ width: 48, height: 26, borderRadius: 13, border: "none", background: toggles[item.k] ? C.teal : C.border, cursor: "pointer", position: "relative" }}>
              <div style={{ position: "absolute", top: 3, left: toggles[item.k] ? 24 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.3s" }} />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ROOT
// ──────────────────────────────────────────────────────────────────────────────
export default function App({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [meds, setMeds] = useState(FAMILY_DATA[1].meds);
  const [sosOpen, setSosOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState(null);

  const onTake = (medId, idx) => setMeds(prev => prev.map(m => {
    if (m.id !== medId) return m;
    const t = [...m.taken]; t[idx] = !t[idx]; return { ...m, taken: t };
  }));

  const renderPage = () => {
    switch (tab) {
      case "dashboard": return <Dashboard meds={meds} onTake={onTake} />;
      case "medications": return <Medications meds={meds} onTake={onTake} />;
      case "schedule": return <Schedule />;
      case "family": return <FamilyHub onViewMember={setViewingMember} />;
      case "analytics": return <Analytics />;
      case "health": return <HealthLog />;
      case "settings": return <Settings />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.navy, minHeight: "100vh", display: "flex" }}>
      {sosOpen && <SOSModal onClose={() => setSosOpen(false)} />}
      {doctorOpen && <DoctorModal onClose={() => setDoctorOpen(false)} />}
      {viewingMember && <FamilyDetailModal member={viewingMember} onClose={() => setViewingMember(null)} />}

      {/* Sidebar */}
      <div style={{ width: 215, background: C.navyLight, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💊</div>
            <div><p style={{ color: C.text, fontWeight: 800, fontSize: 15, margin: 0 }}>MediCare+</p><p style={{ color: C.teal, fontSize: 10, margin: 0, letterSpacing: 1 }}>SMART HEALTH HUB</p></div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "10px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, border: "none", background: tab === item.id ? C.teal + "22" : "transparent", color: tab === item.id ? C.teal : C.muted, cursor: "pointer", fontSize: 13, fontWeight: tab === item.id ? 700 : 500, marginBottom: 2, textAlign: "left" }}>
              <span style={{ fontSize: 15, width: 18 }}>{item.icon}</span>{item.label}
              {item.id === "family" && Object.values(FAMILY_DATA).some(m => m.alert) && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.rose, marginLeft: "auto", boxShadow: `0 0 6px ${C.rose}` }} />}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "9px 12px", background: C.navy, borderRadius: 10, marginBottom: 8 }}>
            <span>👤</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: C.text, fontSize: 12, fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email?.split("@")[0] || "User"}</p>
              <p style={{ color: C.green, fontSize: 11, margin: 0 }}>● Verified ✓</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: "100%", background: C.rose + "15", border: `1px solid ${C.rose}33`, color: C.rose, borderRadius: 10, padding: "8px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ background: C.navyLight, borderBottom: `1px solid ${C.border}`, padding: "13px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <h1 style={{ color: C.text, margin: 0, fontSize: 17, fontWeight: 800 }}>{navItems.find(n => n.id === tab)?.label}</h1>
            <p style={{ color: C.muted, margin: 0, fontSize: 12 }}>Friday, March 6, 2026</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSosOpen(true)} style={{ background: C.rose + "22", border: `1px solid ${C.rose}55`, color: C.rose, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 800, boxShadow: `0 0 12px ${C.rose}22` }}>
              🚨 SOS
            </button>
            <button style={{ background: C.teal + "22", border: `1px solid ${C.teal}44`, color: C.teal, borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>🔔</button>
            <button onClick={() => setDoctorOpen(true)} style={{ background: C.blue + "22", border: `1px solid ${C.blue}44`, color: C.blue, borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
              🩺 Consult Doctor
            </button>
          </div>
        </header>
        <main style={{ flex: 1, padding: 24, overflowY: "auto", maxWidth: 880, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
