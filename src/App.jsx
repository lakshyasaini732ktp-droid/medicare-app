import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "@emailjs/browser";

// ─── EmailJS config — fill these from emailjs.com ───────────────────────────
// See EMAILJS_SETUP.md for instructions
const EJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "";
const EJS_REMINDER = import.meta.env.VITE_EMAILJS_REMINDER_TEMPLATE || "";
const EJS_MISSED   = import.meta.env.VITE_EMAILJS_MISSED_TEMPLATE   || "";
const EJS_PUBLIC   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY        || "";

const C = {
  navy:"#0a1628",navyLight:"#112240",teal:"#00d4aa",amber:"#f59e0b",
  rose:"#f43f5e",purple:"#8b5cf6",blue:"#3b82f6",green:"#10b981",
  card:"#0d1f3c",border:"#1e3a5f",text:"#e2e8f0",muted:"#7a9bb5",
};

const NAV = [
  {id:"dashboard",label:"Dashboard",icon:"⚡"},
  {id:"medications",label:"My Meds",icon:"💊"},
  {id:"schedule",label:"Schedule",icon:"📅"},
  {id:"family",label:"Family Hub",icon:"👨‍👩‍👧"},
  {id:"analytics",label:"Analytics",icon:"📊"},
  {id:"health",label:"Health Log",icon:"❤️"},
  {id:"settings",label:"Settings",icon:"⚙️"},
];

const EMPTY_USER_DATA = {
  profile: { name: "", age: "", blood: "", allergies: "", phone: "", caregiverEmail: "" },
  meds: [],
  family: [],
  healthLogs: [],
  settings: { emailReminders: true, missedAlerts: true, caregiverAlerts: true, smsAlerts: false },
};

const MED_COLORS = ["#00d4aa","#3b82f6","#8b5cf6","#f59e0b","#f43f5e","#10b981","#ec4899","#14b8a6"];

// ─── UI HELPERS ──────────────────────────────────────────────────────────────
function Card({ children, style={}, glow }) {
  return <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:20, boxShadow:glow?`0 0 30px ${glow}22`:"0 4px 20px #00000040", ...style }}>{children}</div>;
}
function Badge({ label, color }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{label}</span>;
}
function CircleProgress({ pct, size=80, stroke=7, color=C.teal, children }) {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r, dash=(pct/100)*circ;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>{children}</div>
    </div>
  );
}
function MiniBar({ pct, color }) {
  return <div style={{ background:C.border, borderRadius:4, height:6, overflow:"hidden", flex:1 }}><div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:4 }}/></div>;
}
function Input({ label, value, onChange, placeholder, type="text", hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:"100%", background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", color:C.text, fontSize:14, boxSizing:"border-box", outline:"none" }}/>
      {hint && <p style={{ color:C.muted, fontSize:11, margin:"4px 0 0" }}>{hint}</p>}
    </div>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000b", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:20, width:"100%", maxWidth:500, maxHeight:"90vh", overflowY:"auto", padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h2 style={{ color:C.text, margin:0, fontSize:17, fontWeight:800 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function EmptyState({ icon, title, desc, onAdd, addLabel }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 20px" }}>
      <div style={{ fontSize:52, marginBottom:14 }}>{icon}</div>
      <h3 style={{ color:C.text, fontSize:18, fontWeight:800, margin:"0 0 8px" }}>{title}</h3>
      <p style={{ color:C.muted, fontSize:14, margin:"0 0 20px", lineHeight:1.6 }}>{desc}</p>
      {onAdd && <button onClick={onAdd} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"12px 28px", cursor:"pointer", fontWeight:800, fontSize:14 }}>{addLabel}</button>}
    </div>
  );
}

// ─── EMAIL NOTIFICATIONS ─────────────────────────────────────────────────────
function sendReminderEmail(to, medName, dose, time, userName) {
  if (!EJS_SERVICE || !EJS_REMINDER || !EJS_PUBLIC) return;
  emailjs.send(EJS_SERVICE, EJS_REMINDER, {
    to_email: to, to_name: userName, med_name: medName,
    dose: dose, time: time,
    message: `Time to take your ${medName} (${dose}) scheduled at ${time}.`
  }, EJS_PUBLIC).catch(console.error);
}
function sendMissedEmail(to, medName, dose, time, userName, isCaregiverAlert=false) {
  if (!EJS_SERVICE || !EJS_MISSED || !EJS_PUBLIC) return;
  emailjs.send(EJS_SERVICE, EJS_MISSED, {
    to_email: to, to_name: isCaregiverAlert ? "Caregiver" : userName,
    med_name: medName, dose: dose, time: time,
    message: isCaregiverAlert
      ? `${userName} missed their ${medName} (${dose}) dose scheduled at ${time}.`
      : `You missed your ${medName} (${dose}) dose scheduled at ${time}. Please take it as soon as possible.`
  }, EJS_PUBLIC).catch(console.error);
}

// ─── REMINDER SCHEDULER ──────────────────────────────────────────────────────
function useReminderScheduler(meds, userData, userEmail, onMarkMissed) {
  const timersRef = useRef([]);

  useEffect(() => {
    // Clear old timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!userData?.settings?.emailReminders) return;
    if (!meds.length) return;

    const now = new Date();
    const userName = userData?.profile?.name || userEmail;
    const caregiverEmail = userData?.profile?.caregiverEmail || "";

    meds.forEach(med => {
      med.times?.forEach((timeStr, idx) => {
        const [h, m] = timeStr.split(":").map(Number);
        const doseTime = new Date();
        doseTime.setHours(h, m, 0, 0);

        // Reminder: 5 min before
        const reminderTime = new Date(doseTime.getTime() - 5 * 60 * 1000);
        const msToReminder = reminderTime - now;
        if (msToReminder > 0) {
          const t = setTimeout(() => {
            sendReminderEmail(userEmail, med.name, med.dose, timeStr, userName);
          }, msToReminder);
          timersRef.current.push(t);
        }

        // Missed alert: 5 min after — only if not taken
        const missedTime = new Date(doseTime.getTime() + 5 * 60 * 1000);
        const msToMissed = missedTime - now;
        if (msToMissed > 0) {
          const t = setTimeout(() => {
            // Check if still not taken (med.taken[idx] could be stale; we check via callback)
            onMarkMissed(med.id, idx, () => {
              if (userData?.settings?.missedAlerts) {
                sendMissedEmail(userEmail, med.name, med.dose, timeStr, userName, false);
              }
              if (userData?.settings?.caregiverAlerts && caregiverEmail) {
                sendMissedEmail(caregiverEmail, med.name, med.dose, timeStr, userName, true);
              }
            });
          }, msToMissed);
          timersRef.current.push(t);
        }
      });
    });

    return () => timersRef.current.forEach(clearTimeout);
  }, [meds, userData?.settings, userEmail]);
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

// DASHBOARD
function Dashboard({ userData, meds, onTake, onNavigate }) {
  const name = userData?.profile?.name || "there";
  const total = meds.reduce((a,m) => a + (m.times?.length||0), 0);
  const taken = meds.reduce((a,m) => a + (m.taken||[]).filter(Boolean).length, 0);
  const adh = total > 0 ? Math.round((taken/total)*100) : 0;
  const lowStock = meds.filter(m => m.stock <= m.refillAt);
  const missed = meds.filter(m => (m.missed||[]).some(Boolean));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div style={{ background:`linear-gradient(135deg, ${C.navyLight}, #0a2540)`, borderRadius:20, padding:28, border:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:C.teal+"0f" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:16 }}>
          <div>
            <p style={{ color:C.teal, fontSize:12, fontWeight:700, letterSpacing:2, textTransform:"uppercase", margin:0 }}>Good day</p>
            <h2 style={{ color:C.text, fontSize:26, fontWeight:800, margin:"6px 0 4px" }}>Hi, {name} 👋</h2>
            <p style={{ color:C.muted, fontSize:14, margin:0 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
            <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
              {[{v:`${taken}/${total}`,l:"Doses Today",c:C.teal},{v:`${missed.length}`,l:"Missed",c:C.rose},{v:`${adh}%`,l:"Adherence",c:C.purple}].map((s,i)=>(
                <div key={i} style={{ background:s.c+"22", border:`1px solid ${s.c}44`, borderRadius:10, padding:"8px 16px", textAlign:"center" }}>
                  <p style={{ color:s.c, fontSize:20, fontWeight:800, margin:0 }}>{s.v}</p>
                  <p style={{ color:C.muted, fontSize:11, margin:0 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <CircleProgress pct={adh} size={110} stroke={9} color={adh>80?C.teal:C.amber}>
            <div style={{ textAlign:"center" }}><p style={{ color:C.text, fontSize:22, fontWeight:800, margin:0 }}>{adh}%</p><p style={{ color:C.muted, fontSize:10, margin:0 }}>Today</p></div>
          </CircleProgress>
        </div>
      </div>

      {missed.length > 0 && (
        <div style={{ background:C.rose+"11", border:`1px solid ${C.rose}44`, borderRadius:12, padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:20 }}>⚠️</span>
          <p style={{ color:C.rose, fontSize:13, fontWeight:700, margin:0 }}>You have {missed.length} missed dose{missed.length>1?"s":""} today! Check your medications.</p>
          <button onClick={()=>onNavigate("medications")} style={{ marginLeft:"auto", background:C.rose, color:"white", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:700, cursor:"pointer" }}>View</button>
        </div>
      )}

      {lowStock.length > 0 && (
        <div style={{ background:C.amber+"11", border:`1px solid ${C.amber}44`, borderRadius:12, padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:20 }}>📦</span>
          <p style={{ color:C.muted, fontSize:13, margin:0 }}><span style={{ color:C.amber, fontWeight:700 }}>Low Stock: </span>{lowStock.map(m=>m.name).join(", ")}</p>
        </div>
      )}

      {meds.length === 0 ? (
        <Card>
          <EmptyState icon="💊" title="No medications yet" desc="Add your first medication to start tracking doses and get reminders." onAdd={()=>onNavigate("medications")} addLabel="+ Add Medication"/>
        </Card>
      ) : (
        <Card>
          <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:15, fontWeight:700 }}>💊 Today's Medications</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {meds.map(med=>(
              <div key={med.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:C.navyLight, borderRadius:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:med.color||C.teal }}/>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.text, margin:0, fontSize:14, fontWeight:600 }}>{med.name} <span style={{ color:C.muted, fontWeight:400 }}>{med.dose}</span></p>
                  <p style={{ color:C.muted, margin:0, fontSize:12 }}>{(med.times||[]).join(" · ")} · {med.food||"Any time"}</p>
                </div>
                <div style={{ display:"flex", gap:5 }}>
                  {(med.times||[]).map((_,i)=>{
                    const isMissed = med.missed?.[i];
                    const isTaken = med.taken?.[i];
                    return (
                      <button key={i} onClick={()=>!isMissed && onTake(med.id,i)}
                        style={{ width:32, height:32, borderRadius:8, border:`2px solid ${isMissed?C.rose:isTaken?med.color||C.teal:C.border}`, background:isMissed?C.rose+"22":isTaken?(med.color||C.teal)+"33":"transparent", color:isMissed?C.rose:isTaken?med.color||C.teal:C.muted, cursor:isMissed?"default":"pointer", fontSize:14 }}>
                        {isMissed?"✗":isTaken?"✓":"○"}
                      </button>
                    );
                  })}
                </div>
                {med.stock <= med.refillAt && <Badge label="LOW" color={C.rose}/>}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:15, fontWeight:700 }}>⚡ Quick Actions</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:10 }}>
          {[{icon:"💊",label:"Add Med",c:C.teal,page:"medications"},{icon:"👨‍👩‍👧",label:"Family Hub",c:C.blue,page:"family"},{icon:"❤️",label:"Log Vitals",c:C.rose,page:"health"},{icon:"📊",label:"Analytics",c:C.purple,page:"analytics"},{icon:"📅",label:"Schedule",c:C.amber,page:"schedule"},{icon:"⚙️",label:"Settings",c:C.green,page:"settings"}].map((a,i)=>(
            <button key={i} onClick={()=>onNavigate(a.page)} style={{ background:a.c+"15", border:`1px solid ${a.c}30`, borderRadius:12, padding:"12px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:22 }}>{a.icon}</span><span style={{ color:a.c, fontSize:12, fontWeight:600 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// MEDICATIONS PAGE
function Medications({ meds, onTake, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", dose:"", times:["08:00"], condition:"", food:"", stock:30, refillAt:7, interactions:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = () => {
    if (!form.name.trim()) return;
    onAdd({ ...form, times:form.times.filter(t=>t), interactions:form.interactions?form.interactions.split(",").map(s=>s.trim()):[], color:MED_COLORS[meds.length%MED_COLORS.length], taken:form.times.map(()=>false), missed:form.times.map(()=>false), stock:Number(form.stock), refillAt:Number(form.refillAt) });
    setForm({ name:"", dose:"", times:["08:00"], condition:"", food:"", stock:30, refillAt:7, interactions:"" });
    setShowAdd(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ color:C.text, margin:0, fontSize:20, fontWeight:800 }}>My Medications</h2>
        <button onClick={()=>setShowAdd(true)} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Add Medication</button>
      </div>

      {meds.length === 0 ? (
        <Card><EmptyState icon="💊" title="No medications added yet" desc="Add your medications to track doses, get reminders, and monitor your health." onAdd={()=>setShowAdd(true)} addLabel="+ Add First Medication"/></Card>
      ) : meds.map(med=>(
        <Card key={med.id} glow={med.color} style={{ borderLeft:`4px solid ${med.color}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", gap:12 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:(med.color||C.teal)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>💊</div>
              <div>
                <p style={{ color:C.text, fontWeight:800, fontSize:16, margin:0 }}>{med.name} <span style={{ color:med.color||C.teal }}>{med.dose}</span></p>
                <p style={{ color:C.muted, fontSize:13, margin:"2px 0" }}>{med.condition} · {med.food}</p>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>{(med.times||[]).map((t,i)=><Badge key={i} label={t} color={med.color||C.teal}/>)}</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ color:med.stock<=med.refillAt?C.rose:C.green, fontWeight:700, margin:0 }}>{med.stock} pills left</p>
              <div style={{ display:"flex", gap:5, marginTop:6 }}>
                {(med.times||[]).map((_,i)=>{
                  const isMissed = med.missed?.[i];
                  const isTaken = med.taken?.[i];
                  return (
                    <button key={i} onClick={()=>!isMissed && onTake(med.id,i)}
                      style={{ width:32, height:32, borderRadius:8, border:`2px solid ${isMissed?C.rose:isTaken?med.color||C.teal:C.border}`, background:isMissed?C.rose+"22":isTaken?(med.color||C.teal)+"33":"transparent", color:isMissed?C.rose:isTaken?med.color||C.teal:C.muted, cursor:isMissed?"default":"pointer" }}>
                      {isMissed?"✗":isTaken?"✓":"○"}
                    </button>
                  );
                })}
              </div>
              <button onClick={()=>onDelete(med.id)} style={{ marginTop:8, background:"transparent", border:`1px solid ${C.border}`, color:C.rose, borderRadius:6, padding:"3px 10px", cursor:"pointer", fontSize:12 }}>🗑️ Remove</button>
            </div>
          </div>
          {(med.interactions||[]).length>0 && <div style={{ marginTop:10, padding:"8px 12px", background:C.amber+"15", borderRadius:8 }}><span style={{ color:C.amber, fontSize:13 }}>⚠️ Interactions: {med.interactions.join(", ")}</span></div>}
          {(med.missed||[]).some(Boolean) && <div style={{ marginTop:8, padding:"8px 12px", background:C.rose+"15", borderRadius:8 }}><span style={{ color:C.rose, fontSize:13 }}>❌ Missed dose today — caregiver has been notified</span></div>}
        </Card>
      ))}

      {showAdd && (
        <Modal title="➕ Add New Medication" onClose={()=>setShowAdd(false)}>
          <Input label="Medicine Name *" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. Metformin"/>
          <Input label="Dose" value={form.dose} onChange={e=>f("dose",e.target.value)} placeholder="e.g. 500mg"/>
          <Input label="Condition / Reason" value={form.condition} onChange={e=>f("condition",e.target.value)} placeholder="e.g. Diabetes"/>
          <Input label="Food Instructions" value={form.food} onChange={e=>f("food",e.target.value)} placeholder="e.g. With food, After meals"/>
          <div style={{ marginBottom:14 }}>
            <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:5, textTransform:"uppercase" }}>Dose Times</label>
            {form.times.map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:6 }}>
                <input type="time" value={t} onChange={e=>{ const ts=[...form.times]; ts[i]=e.target.value; f("times",ts); }}
                  style={{ flex:1, background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 12px", color:C.text, fontSize:14 }}/>
                {form.times.length>1 && <button onClick={()=>f("times",form.times.filter((_,j)=>j!==i))} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.rose, borderRadius:8, padding:"0 10px", cursor:"pointer" }}>✕</button>}
              </div>
            ))}
            <button onClick={()=>f("times",[...form.times,"12:00"])} style={{ background:C.teal+"15", border:`1px solid ${C.teal}44`, color:C.teal, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13, marginTop:4 }}>+ Add Time</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Stock (pills)" value={form.stock} onChange={e=>f("stock",e.target.value)} placeholder="30" type="number"/>
            <Input label="Refill Alert At" value={form.refillAt} onChange={e=>f("refillAt",e.target.value)} placeholder="7" type="number"/>
          </div>
          <Input label="Drug Interactions (comma separated)" value={form.interactions} onChange={e=>f("interactions",e.target.value)} placeholder="e.g. Aspirin, Ibuprofen"/>
          <button onClick={submit} style={{ width:"100%", background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"13px", cursor:"pointer", fontWeight:800, fontSize:15, marginTop:4 }}>💊 Add Medication</button>
        </Modal>
      )}
    </div>
  );
}

// FAMILY HUB
function FamilyHub({ userData, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", relation:"", age:"", avatar:"👤", blood:"", allergies:"", phone:"", email:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const family = userData?.family || [];
  const avatars = ["👤","👩","👨","👦","👧","👴","👵","👶"];
  const colors = [C.teal,C.blue,C.amber,C.green,C.purple,C.rose];

  const submit = () => {
    if (!form.name.trim()) return;
    const updated = [...family, { ...form, id:Date.now().toString(), age:Number(form.age), adherence:100, meds:[], color:colors[family.length%colors.length] }];
    onUpdate({ family:updated });
    setForm({ name:"", relation:"", age:"", avatar:"👤", blood:"", allergies:"", phone:"", email:"" });
    setShowAdd(false);
  };

  const remove = (id) => onUpdate({ family:family.filter(m=>m.id!==id) });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ color:C.text, margin:0, fontSize:20, fontWeight:800 }}>Family Hub</h2>
        <button onClick={()=>setShowAdd(true)} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Add Member</button>
      </div>

      {family.length === 0 ? (
        <Card><EmptyState icon="👨‍👩‍👧" title="No family members added" desc="Add family members to monitor their medications and health from one place." onAdd={()=>setShowAdd(true)} addLabel="+ Add Family Member"/></Card>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
          {family.map((m,i)=>(
            <Card key={m.id} style={{ cursor:"default" }}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
                <div style={{ width:46, height:46, borderRadius:12, background:(m.color||C.teal)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>{m.avatar||"👤"}</div>
                <div>
                  <p style={{ color:C.text, fontWeight:800, fontSize:15, margin:0 }}>{m.name}</p>
                  <p style={{ color:m.color||C.teal, fontSize:12, fontWeight:600, margin:0 }}>{m.relation} · {m.age}y</p>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
                {m.blood && <p style={{ color:C.muted, fontSize:12, margin:0 }}>🩸 Blood: <span style={{ color:C.text }}>{m.blood}</span></p>}
                {m.allergies && <p style={{ color:C.muted, fontSize:12, margin:0 }}>⚠️ Allergy: <span style={{ color:C.amber }}>{m.allergies}</span></p>}
                {m.phone && <p style={{ color:C.muted, fontSize:12, margin:0 }}>📞 {m.phone}</p>}
                {m.email && <p style={{ color:C.muted, fontSize:12, margin:0 }}>📧 {m.email}</p>}
              </div>
              <button onClick={()=>remove(m.id)} style={{ width:"100%", background:"transparent", border:`1px solid ${C.border}`, color:C.rose, borderRadius:8, padding:"7px", cursor:"pointer", fontSize:12 }}>🗑️ Remove</button>
            </Card>
          ))}
        </div>
      )}

      {family.length > 0 && (
        <Card>
          <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:15, fontWeight:700 }}>👥 Family Members Overview</h3>
          {family.map(m=>(
            <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
              <span style={{ fontSize:18, width:24 }}>{m.avatar||"👤"}</span>
              <span style={{ color:C.text, fontSize:13, width:100, flexShrink:0 }}>{m.name}</span>
              <span style={{ color:C.muted, fontSize:12, flex:1 }}>{m.relation}, {m.age}y</span>
              <Badge label={m.blood||"–"} color={C.rose}/>
            </div>
          ))}
        </Card>
      )}

      {showAdd && (
        <Modal title="👥 Add Family Member" onClose={()=>setShowAdd(false)}>
          <div style={{ marginBottom:14 }}>
            <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:8, textTransform:"uppercase" }}>Select Avatar</label>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {avatars.map(a=>(
                <button key={a} onClick={()=>f("avatar",a)} style={{ width:44, height:44, borderRadius:10, border:`2px solid ${form.avatar===a?C.teal:C.border}`, background:form.avatar===a?C.teal+"22":"transparent", fontSize:22, cursor:"pointer" }}>{a}</button>
              ))}
            </div>
          </div>
          <Input label="Full Name *" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. Sunita Sharma"/>
          <Input label="Relation" value={form.relation} onChange={e=>f("relation",e.target.value)} placeholder="e.g. Mother, Father, Son"/>
          <Input label="Age" value={form.age} onChange={e=>f("age",e.target.value)} placeholder="e.g. 62" type="number"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Blood Group" value={form.blood} onChange={e=>f("blood",e.target.value)} placeholder="e.g. O+"/>
            <Input label="Allergies" value={form.allergies} onChange={e=>f("allergies",e.target.value)} placeholder="e.g. Penicillin"/>
          </div>
          <Input label="Phone" value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="+91-XXXXX-XXXXX"/>
          <Input label="Email (for reminders)" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="family@email.com" type="email"/>
          <button onClick={submit} style={{ width:"100%", background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"13px", cursor:"pointer", fontWeight:800, fontSize:15 }}>👥 Add Member</button>
        </Modal>
      )}
    </div>
  );
}

// SCHEDULE
function Schedule({ meds }) {
  const hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <h2 style={{ color:C.text, margin:0, fontSize:20, fontWeight:800 }}>Schedule</h2>
      {meds.length===0 ? (
        <Card><EmptyState icon="📅" title="No schedule yet" desc="Add medications to see your daily dose schedule here."/></Card>
      ) : (
        <Card>
          <h3 style={{ color:C.text, margin:"0 0 16px", fontSize:15, fontWeight:700 }}>Today's Timeline</h3>
          {hours.map(h=>{
            const dosesAtHour = meds.filter(m=>(m.times||[]).some(t=>parseInt(t)===h));
            return (
              <div key={h} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:4 }}>
                <span style={{ color:C.muted, fontSize:12, width:36, paddingTop:6, flexShrink:0 }}>{h}:00</span>
                <div style={{ flex:1, borderTop:`1px solid ${C.border}30`, minHeight:32, paddingTop:4 }}>
                  {dosesAtHour.map(m=>(
                    <div key={m.id} style={{ display:"inline-block", marginRight:6, marginBottom:4, background:(m.color||C.teal)+"22", border:`1px solid ${(m.color||C.teal)}55`, borderRadius:6, padding:"3px 10px", fontSize:12, color:m.color||C.teal, fontWeight:600 }}>
                      {m.name} {m.dose}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}

// ANALYTICS
function Analytics({ meds }) {
  const total = meds.reduce((a,m)=>a+(m.times||[]).length,0);
  const taken = meds.reduce((a,m)=>a+(m.taken||[]).filter(Boolean).length,0);
  const missed = meds.reduce((a,m)=>a+(m.missed||[]).filter(Boolean).length,0);
  const adh = total>0?Math.round((taken/total)*100):0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <h2 style={{ color:C.text, margin:0, fontSize:20, fontWeight:800 }}>Analytics</h2>
      {meds.length===0 ? (
        <Card><EmptyState icon="📊" title="No data yet" desc="Add medications and start tracking to see your analytics here."/></Card>
      ) : (
        <>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[{l:"Today's Adherence",v:`${adh}%`,c:C.teal},{l:"Doses Taken",v:`${taken}/${total}`,c:C.green},{l:"Missed Today",v:missed,c:C.rose},{l:"Medications",v:meds.length,c:C.blue}].map((s,i)=>(
              <Card key={i} glow={s.c}><p style={{ color:C.muted, fontSize:12, margin:"0 0 4px", textTransform:"uppercase" }}>{s.l}</p><p style={{ color:s.c, fontSize:22, fontWeight:800, margin:0 }}>{s.v}</p></Card>
            ))}
          </div>
          <Card>
            <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:15, fontWeight:700 }}>Per Medication Today</h3>
            {meds.map(med=>{
              const t = med.times?.length||1;
              const tk = (med.taken||[]).filter(Boolean).length;
              const pct = Math.round((tk/t)*100);
              return (
                <div key={med.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ color:C.text, fontSize:12, width:110, flexShrink:0 }}>{med.name}</span>
                  <MiniBar pct={pct} color={med.color||C.teal}/>
                  <span style={{ color:med.color||C.teal, fontSize:12, fontWeight:700, width:36 }}>{pct}%</span>
                  {(med.missed||[]).some(Boolean) && <Badge label="MISSED" color={C.rose}/>}
                </div>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}

// HEALTH LOG
function HealthLog({ userData, onUpdate }) {
  const logs = userData?.healthLogs || [];
  const [form, setForm] = useState({ bp:"", glucose:"", weight:"", notes:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = () => {
    if (!form.bp && !form.glucose && !form.weight) return;
    const entry = { id:Date.now().toString(), date:new Date().toLocaleString(), ...form };
    onUpdate({ healthLogs:[entry, ...logs] });
    setForm({ bp:"", glucose:"", weight:"", notes:"" });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <h2 style={{ color:C.text, margin:0, fontSize:20, fontWeight:800 }}>Health Log</h2>
      <Card>
        <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:15, fontWeight:700 }}>➕ Log New Reading</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[{l:"Blood Pressure",k:"bp",p:"120/80",u:"mmHg",c:C.rose},{l:"Glucose",k:"glucose",p:"95",u:"mg/dL",c:C.amber},{l:"Weight",k:"weight",p:"70",u:"kg",c:C.blue}].map(v=>(
            <div key={v.k} style={{ background:v.c+"11", border:`1px solid ${v.c}22`, borderRadius:10, padding:14 }}>
              <label style={{ color:v.c, fontSize:12, fontWeight:700, display:"block", marginBottom:8 }}>{v.l}</label>
              <input placeholder={v.p} value={form[v.k]} onChange={e=>f(v.k,e.target.value)}
                style={{ width:"100%", background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 10px", color:C.text, fontSize:14, boxSizing:"border-box" }}/>
              <p style={{ color:C.muted, fontSize:11, margin:"5px 0 0" }}>{v.u}</p>
            </div>
          ))}
        </div>
        <Input label="Notes (optional)" value={form.notes} onChange={e=>f("notes",e.target.value)} placeholder="Any symptoms or observations..."/>
        <button onClick={submit} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:700, marginTop:4 }}>Save Reading</button>
      </Card>
      {logs.length===0 ? (
        <Card><EmptyState icon="❤️" title="No health logs yet" desc="Log your blood pressure, glucose, and weight to track your health over time."/></Card>
      ) : (
        <Card>
          <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:15, fontWeight:700 }}>Recent Readings</h3>
          {logs.slice(0,10).map((log,i)=>(
            <div key={log.id||i} style={{ padding:"10px 14px", background:C.navyLight, borderRadius:10, marginBottom:8 }}>
              <p style={{ color:C.muted, fontSize:11, margin:"0 0 6px" }}>{log.date}</p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                {log.bp && <span style={{ color:C.rose, fontWeight:700, fontSize:14 }}>🫀 {log.bp} mmHg</span>}
                {log.glucose && <span style={{ color:C.amber, fontWeight:700, fontSize:14 }}>🩸 {log.glucose} mg/dL</span>}
                {log.weight && <span style={{ color:C.blue, fontWeight:700, fontSize:14 }}>⚖️ {log.weight} kg</span>}
              </div>
              {log.notes && <p style={{ color:C.muted, fontSize:12, margin:"6px 0 0" }}>{log.notes}</p>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

// SETTINGS
function Settings({ userData, onUpdate, userEmail }) {
  const profile = userData?.profile || {};
  const settings = userData?.settings || {};
  const [p, setP] = useState({ name:profile.name||"", age:profile.age||"", blood:profile.blood||"", allergies:profile.allergies||"", phone:profile.phone||"", caregiverEmail:profile.caregiverEmail||"" });
  const [saved, setSaved] = useState(false);

  const saveProfile = () => {
    onUpdate({ profile:p });
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };
  const toggleSetting = (k) => onUpdate({ settings:{ ...settings, [k]:!settings[k] } });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <h2 style={{ color:C.text, margin:0, fontSize:20, fontWeight:800 }}>Settings</h2>
      <Card>
        <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:16 }}>
          <div style={{ width:52, height:52, borderRadius:14, background:C.teal+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>👤</div>
          <div><p style={{ color:C.text, fontWeight:800, fontSize:16, margin:0 }}>{p.name||"Your Name"}</p><p style={{ color:C.muted, fontSize:13, margin:"2px 0" }}>{userEmail}</p></div>
        </div>
        <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:14, fontWeight:700 }}>Your Profile</h3>
        <Input label="Full Name" value={p.name} onChange={e=>setP(x=>({...x,name:e.target.value}))} placeholder="e.g. Rajesh Kumar"/>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Input label="Age" value={p.age} onChange={e=>setP(x=>({...x,age:e.target.value}))} placeholder="34" type="number"/>
          <Input label="Blood Group" value={p.blood} onChange={e=>setP(x=>({...x,blood:e.target.value}))} placeholder="O+"/>
        </div>
        <Input label="Allergies" value={p.allergies} onChange={e=>setP(x=>({...x,allergies:e.target.value}))} placeholder="e.g. Penicillin, Sulfa"/>
        <Input label="Phone Number" value={p.phone} onChange={e=>setP(x=>({...x,phone:e.target.value}))} placeholder="+91-XXXXX-XXXXX"/>
        <Input label="Caregiver Email (gets missed dose alerts)" value={p.caregiverEmail} onChange={e=>setP(x=>({...x,caregiverEmail:e.target.value}))} placeholder="caregiver@email.com" type="email" hint="This person will be emailed when you miss a dose"/>
        <button onClick={saveProfile} style={{ background:saved?C.green:C.teal, border:"none", color:C.navy, borderRadius:10, padding:"10px 24px", cursor:"pointer", fontWeight:700 }}>
          {saved?"✅ Saved!":"Save Profile"}
        </button>
      </Card>

      <Card>
        <h3 style={{ color:C.text, margin:"0 0 14px", fontSize:14, fontWeight:700 }}>🔔 Notification Settings</h3>
        <p style={{ color:C.muted, fontSize:13, margin:"0 0 14px", lineHeight:1.6 }}>
          Notifications are sent via email. Make sure you've set up EmailJS in your Vercel environment variables.
        </p>
        {[
          {k:"emailReminders", l:"📧 Email Reminder (5 min before dose)", d:"Get an email reminder 5 minutes before each dose"},
          {k:"missedAlerts", l:"⏰ Missed Dose Alert (5 min after)", d:"Get an email if you miss a dose by 5 minutes"},
          {k:"caregiverAlerts", l:"👥 Caregiver Alert on Missed Dose", d:"Your caregiver email also gets notified on missed doses"},
        ].map(item=>(
          <div key={item.k} style={{ marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:C.text, fontSize:14, fontWeight:600 }}>{item.l}</span>
              <button onClick={()=>toggleSetting(item.k)} style={{ width:48, height:26, borderRadius:13, border:"none", background:settings[item.k]?C.teal:C.border, cursor:"pointer", position:"relative", flexShrink:0 }}>
                <div style={{ position:"absolute", top:3, left:settings[item.k]?24:3, width:20, height:20, borderRadius:"50%", background:"white", transition:"left 0.3s" }}/>
              </button>
            </div>
            <p style={{ color:C.muted, fontSize:12, margin:0 }}>{item.d}</p>
          </div>
        ))}
      </Card>

      <Card>
        <h3 style={{ color:C.text, margin:"0 0 10px", fontSize:14, fontWeight:700 }}>📧 EmailJS Setup Status</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            {l:"Service ID", v:EJS_SERVICE},
            {l:"Reminder Template", v:EJS_REMINDER},
            {l:"Missed Template", v:EJS_MISSED},
            {l:"Public Key", v:EJS_PUBLIC},
          ].map((e,i)=>(
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 12px", background:C.navyLight, borderRadius:8 }}>
              <span style={{ color:C.muted, fontSize:13 }}>{e.l}</span>
              <Badge label={e.v?"✓ Set":"✗ Missing"} color={e.v?C.green:C.rose}/>
            </div>
          ))}
        </div>
        {(!EJS_SERVICE||!EJS_PUBLIC) && <p style={{ color:C.amber, fontSize:13, margin:"10px 0 0", lineHeight:1.6 }}>⚠️ EmailJS not configured. See EMAILJS_SETUP.md to enable email notifications.</p>}
      </Card>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from Firestore
  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        await setDoc(ref, EMPTY_USER_DATA);
        setUserData(EMPTY_USER_DATA);
      }
      setLoading(false);
    };
    load();
  }, [user.uid]);

  // Save to Firestore
  const saveData = async (updates) => {
    const newData = { ...userData, ...updates };
    setUserData(newData);
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, updates);
  };

  // Handle take/untake
  const handleTake = async (medId, idx) => {
    const meds = userData.meds.map(m => {
      if (m.id !== medId) return m;
      const taken = [...(m.taken||[])];
      const missed = [...(m.missed||[])];
      taken[idx] = !taken[idx];
      if (taken[idx]) missed[idx] = false; // unmark missed if manually taken
      return { ...m, taken, missed };
    });
    await saveData({ meds });
  };

  // Called by reminder scheduler to mark missed
  const handleMarkMissed = (medId, idx, callback) => {
    setUserData(prev => {
      if (!prev) return prev;
      const med = prev.meds.find(m => m.id === medId);
      if (!med) return prev;
      if (med.taken?.[idx]) return prev; // already taken, skip
      const meds = prev.meds.map(m => {
        if (m.id !== medId) return m;
        const missed = [...(m.missed||m.times.map(()=>false))];
        missed[idx] = true;
        return { ...m, missed };
      });
      // Save to Firestore
      updateDoc(doc(db, "users", user.uid), { meds });
      callback(); // send emails
      return { ...prev, meds };
    });
  };

  const handleAddMed = async (med) => {
    const meds = [...(userData?.meds||[]), { ...med, id: Date.now().toString() }];
    await saveData({ meds });
  };

  const handleDeleteMed = async (id) => {
    const meds = (userData?.meds||[]).filter(m => m.id !== id);
    await saveData({ meds });
  };

  // Reminder scheduler
  useReminderScheduler(
    userData?.meds || [],
    userData,
    user.email,
    handleMarkMissed
  );

  if (loading) return (
    <div style={{ background:C.navy, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:48 }}>💊</div>
        <p style={{ color:C.teal, fontWeight:700, marginTop:12 }}>Loading your data...</p>
      </div>
    </div>
  );

  const meds = userData?.meds || [];

  const renderPage = () => {
    switch(tab) {
      case "dashboard":   return <Dashboard userData={userData} meds={meds} onTake={handleTake} onNavigate={setTab}/>;
      case "medications": return <Medications meds={meds} onTake={handleTake} onAdd={handleAddMed} onDelete={handleDeleteMed}/>;
      case "schedule":    return <Schedule meds={meds}/>;
      case "family":      return <FamilyHub userData={userData} onUpdate={saveData}/>;
      case "analytics":   return <Analytics meds={meds}/>;
      case "health":      return <HealthLog userData={userData} onUpdate={saveData}/>;
      case "settings":    return <Settings userData={userData} onUpdate={saveData} userEmail={user.email}/>;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:C.navy, minHeight:"100vh", display:"flex" }}>
      {/* Sidebar */}
      <div style={{ width:215, background:C.navyLight, borderRight:`1px solid ${C.border}`, display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", flexShrink:0 }}>
        <div style={{ padding:"22px 18px 14px", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:C.teal, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💊</div>
            <div><p style={{ color:C.text, fontWeight:800, fontSize:15, margin:0 }}>MediCare+</p><p style={{ color:C.teal, fontSize:10, margin:0, letterSpacing:1 }}>SMART HEALTH HUB</p></div>
          </div>
        </div>
        <nav style={{ flex:1, padding:"10px" }}>
          {NAV.map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)}
              style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:"none", background:tab===item.id?C.teal+"22":"transparent", color:tab===item.id?C.teal:C.muted, cursor:"pointer", fontSize:13, fontWeight:tab===item.id?700:500, marginBottom:2, textAlign:"left" }}>
              <span style={{ fontSize:15, width:18 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding:"12px", borderTop:`1px solid ${C.border}` }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", padding:"9px 12px", background:C.navy, borderRadius:10, marginBottom:8 }}>
            <span>👤</span>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:C.text, fontSize:12, fontWeight:700, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{userData?.profile?.name||user.email.split("@")[0]}</p>
              <p style={{ color:C.green, fontSize:11, margin:0 }}>● Verified ✓</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ width:"100%", background:C.rose+"15", border:`1px solid ${C.rose}33`, color:C.rose, borderRadius:10, padding:"8px", cursor:"pointer", fontSize:12, fontWeight:700 }}>
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <header style={{ background:C.navyLight, borderBottom:`1px solid ${C.border}`, padding:"13px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <div>
            <h1 style={{ color:C.text, margin:0, fontSize:17, fontWeight:800 }}>{NAV.find(n=>n.id===tab)?.label}</h1>
            <p style={{ color:C.muted, margin:0, fontSize:12 }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ background:userData?.settings?.emailReminders?C.green+"22":C.border, border:`1px solid ${userData?.settings?.emailReminders?C.green:C.border}44`, borderRadius:10, padding:"6px 12px" }}>
              <span style={{ color:userData?.settings?.emailReminders?C.green:C.muted, fontSize:12, fontWeight:600 }}>
                {userData?.settings?.emailReminders?"🔔 Reminders ON":"🔕 Reminders OFF"}
              </span>
            </div>
          </div>
        </header>
        <main style={{ flex:1, padding:24, overflowY:"auto", maxWidth:880, width:"100%", margin:"0 auto", boxSizing:"border-box" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
