import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import emailjs from "@emailjs/browser";
import CaregiverView from "./CaregiverView.jsx";

const EJS_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || "";
const EJS_REMINDER = import.meta.env.VITE_EMAILJS_REMINDER_TEMPLATE || "";
const EJS_MISSED   = import.meta.env.VITE_EMAILJS_MISSED_TEMPLATE   || "";
const EJS_PUBLIC   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY        || "";

const C = {
  navy:"#0a1628", navyLight:"#112240", teal:"#00d4aa", amber:"#f59e0b",
  rose:"#f43f5e", purple:"#8b5cf6", blue:"#3b82f6", green:"#10b981",
  card:"#0d1f3c", border:"#1e3a5f", text:"#e2e8f0", muted:"#7a9bb5",
};

const EMPTY = {
  profile:{ name:"", age:"", blood:"", allergies:"", phone:"", caregiverEmail:"" },
  meds:[], family:[], healthLogs:[],
  settings:{ emailReminders:true, missedAlerts:true, caregiverAlerts:true, pushNotifications:true },
};

const NAV = [
  {id:"home",    icon:"🏠", label:"Home"},
  {id:"meds",    icon:"💊", label:"Meds"},
  {id:"schedule",icon:"📅", label:"Schedule"},
  {id:"family",  icon:"👨‍👩‍👧", label:"Family"},
  {id:"profile", icon:"👤", label:"Profile"},
];

const MED_COLORS = ["#00d4aa","#3b82f6","#8b5cf6","#f59e0b","#f43f5e","#10b981","#ec4899","#14b8a6"];

// ─── PUSH NOTIFICATIONS ───────────────────────────────────────────────────────
async function requestPushPermission() {
  if (!('Notification' in window)) return false;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
}

function showPushNotification(title, body, tag = 'medicare') {
  if (Notification.permission !== 'granted') return;
  navigator.serviceWorker.ready.then(sw => {
    sw.showNotification(title, {
      body, icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag, requireInteraction: true,
    });
  });
}

// ─── EMAIL ────────────────────────────────────────────────────────────────────
function sendEmail(templateId, to, params) {
  if (!EJS_SERVICE || !templateId || !EJS_PUBLIC) return;
  emailjs.send(EJS_SERVICE, templateId, { to_email: to, ...params }, EJS_PUBLIC).catch(console.error);
}

// ─── REMINDER SCHEDULER ──────────────────────────────────────────────────────
function useReminders(meds, userData, userEmail, onMarkMissed) {
  const timers = useRef([]);
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!meds.length) return;
    const now = new Date();
    const name = userData?.profile?.name || userEmail;
    const cgEmail = userData?.profile?.caregiverEmail || "";
    const s = userData?.settings || {};

    meds.forEach(med => {
      (med.times || []).forEach((t, idx) => {
        const [h, m] = t.split(":").map(Number);
        const doseTime = new Date(); doseTime.setHours(h, m, 0, 0);
        const reminderTime = new Date(doseTime - 5 * 60000);
        const missedTime   = new Date(doseTime + 5 * 60000);

        if (reminderTime > now) {
          timers.current.push(setTimeout(() => {
            if (s.pushNotifications) showPushNotification(`💊 Time for ${med.name}!`, `Take ${med.dose} in 5 minutes (${t})`, med.id);
            if (s.emailReminders) sendEmail(EJS_REMINDER, userEmail, { to_name: name, med_name: med.name, dose: med.dose, time: t, message: `Reminder: take ${med.name} (${med.dose}) at ${t}` });
          }, reminderTime - now));
        }

        if (missedTime > now) {
          timers.current.push(setTimeout(() => {
            onMarkMissed(med.id, idx, () => {
              if (s.pushNotifications) showPushNotification(`⚠️ Missed dose!`, `You missed ${med.name} (${med.dose}) at ${t}`, `missed-${med.id}`);
              if (s.missedAlerts) sendEmail(EJS_MISSED, userEmail, { to_name: name, med_name: med.name, dose: med.dose, time: t, message: `You missed ${med.name} (${med.dose}) at ${t}. Please take it ASAP.` });
              if (s.caregiverAlerts && cgEmail) sendEmail(EJS_MISSED, cgEmail, { to_name: "Caregiver", med_name: med.name, dose: med.dose, time: t, message: `${name} missed ${med.name} (${med.dose}) at ${t}.` });
            });
          }, missedTime - now));
        }
      });
    });
    return () => timers.current.forEach(clearTimeout);
  }, [meds, userData?.settings, userEmail]);
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function Screen({ children, padBottom = true }) {
  return (
    <div style={{ flex:1, overflowY:"auto", padding:padBottom ? "16px 16px 80px" : "16px", WebkitOverflowScrolling:"touch" }}>
      {children}
    </div>
  );
}

function Card({ children, style={}, color }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${color ? color+"44" : C.border}`, borderRadius:18, padding:16, marginBottom:12, boxShadow:color?`0 4px 20px ${color}15`:"0 4px 16px #00000030", ...style }}>
      {children}
    </div>
  );
}

function Pill({ label, color }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{label}</span>;
}

function MobileInput({ label, value, onChange, placeholder, type="text", hint }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</label>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width:"100%", background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 14px", color:C.text, fontSize:15, boxSizing:"border-box", outline:"none" }}/>
      {hint && <p style={{ color:C.muted, fontSize:11, margin:"4px 0 0" }}>{hint}</p>}
    </div>
  );
}

function BottomSheet({ title, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"#000c", zIndex:1000, display:"flex", alignItems:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"24px 24px 0 0", width:"100%", maxHeight:"90vh", overflowY:"auto", padding:"0 20px 40px" }}>
        <div style={{ width:40, height:4, background:C.border, borderRadius:2, margin:"12px auto 16px" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ color:C.text, fontSize:17, fontWeight:800, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:C.navyLight, border:"none", color:C.muted, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, onAdd, addLabel }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 20px" }}>
      <div style={{ fontSize:56, marginBottom:14 }}>{icon}</div>
      <h3 style={{ color:C.text, fontSize:18, fontWeight:800, margin:"0 0 8px" }}>{title}</h3>
      <p style={{ color:C.muted, fontSize:14, margin:"0 0 24px", lineHeight:1.6 }}>{desc}</p>
      {onAdd && (
        <button onClick={onAdd} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:14, padding:"14px 28px", cursor:"pointer", fontWeight:800, fontSize:15 }}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={onChange} style={{ width:52, height:28, borderRadius:14, border:"none", background:value?C.teal:C.border, cursor:"pointer", position:"relative", flexShrink:0, transition:"background 0.3s" }}>
      <div style={{ position:"absolute", top:4, left:value?26:4, width:20, height:20, borderRadius:"50%", background:"white", transition:"left 0.3s", boxShadow:"0 2px 4px #0004" }}/>
    </button>
  );
}

// ─── PUSH NOTIFICATION BANNER ────────────────────────────────────────────────
function PushNotificationBanner({ onAllow, onDismiss }) {
  return (
    <div style={{ position:"fixed", top:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, zIndex:999, padding:"0 12px", boxSizing:"border-box" }}>
      <div style={{ background:"linear-gradient(135deg, #112240, #0d1f3c)", border:`1px solid ${C.teal}55`, borderRadius:"0 0 20px 20px", padding:"16px 18px", boxShadow:"0 8px 32px #000a" }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ width:44, height:44, borderRadius:12, background:C.teal+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🔔</div>
          <div style={{ flex:1 }}>
            <p style={{ color:C.text, fontWeight:800, fontSize:14, margin:"0 0 2px" }}>Enable Notifications</p>
            <p style={{ color:C.muted, fontSize:12, margin:0, lineHeight:1.4 }}>Get medicine reminders on your phone!</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:12 }}>
          <button onClick={onAllow} style={{ flex:1, background:C.teal, border:"none", color:C.navy, borderRadius:10, padding:"11px", cursor:"pointer", fontWeight:800, fontSize:14 }}>✅ Allow</button>
          <button onClick={onDismiss} style={{ flex:1, background:C.navyLight, border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:"11px", cursor:"pointer", fontWeight:600, fontSize:14 }}>Not now</button>
        </div>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({ userData, meds, onTake, onNavigate, onPushAllow }) {
  const name = userData?.profile?.name || "";
  const total = meds.reduce((a,m)=>a+(m.times?.length||0),0);
  const taken = meds.reduce((a,m)=>a+(m.taken||[]).filter(Boolean).length,0);
  const missed = meds.filter(m=>(m.missed||[]).some(Boolean));
  const adh = total > 0 ? Math.round((taken/total)*100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const [showPushBanner, setShowPushBanner] = useState(false);

  useEffect(() => {
    // Show push banner after 1.5s if not yet granted and not dismissed
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      const dismissed = localStorage.getItem('push_dismissed');
      if (!dismissed) {
        const t = setTimeout(() => setShowPushBanner(true), 1500);
        return () => clearTimeout(t);
      }
    }
  }, []);

  const handleAllow = async () => {
    setShowPushBanner(false);
    await onPushAllow();
  };

  const handleDismiss = () => {
    setShowPushBanner(false);
    localStorage.setItem('push_dismissed', '1');
  };

  return (
    <Screen>
      {showPushBanner && <PushNotificationBanner onAllow={handleAllow} onDismiss={handleDismiss}/>}
      {/* Header */}
      <div style={{ marginBottom:20, marginTop: showPushBanner ? 100 : 0, transition:"margin-top 0.3s" }}>
        <p style={{ color:C.teal, fontSize:13, fontWeight:700, letterSpacing:1, textTransform:"uppercase", margin:"0 0 4px" }}>{greeting} 👋</p>
        <h1 style={{ color:C.text, fontSize:26, fontWeight:900, margin:0 }}>{name ? name : "Welcome!"}</h1>
        <p style={{ color:C.muted, fontSize:13, margin:"4px 0 0" }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
      </div>

      {/* Adherence card */}
      <Card color={adh > 80 ? C.teal : C.amber} style={{ background:`linear-gradient(135deg, ${C.card}, #0a2540)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ color:C.muted, fontSize:12, margin:"0 0 4px", textTransform:"uppercase", letterSpacing:1 }}>Today's Progress</p>
            <p style={{ color:C.text, fontSize:32, fontWeight:900, margin:"0 0 8px" }}>{taken}<span style={{ color:C.muted, fontSize:18 }}>/{total}</span></p>
            <p style={{ color:C.muted, fontSize:13, margin:0 }}>doses taken</p>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:`conic-gradient(${adh>80?C.teal:C.amber} ${adh*3.6}deg, ${C.border} 0)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ width:56, height:56, borderRadius:"50%", background:C.card, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:adh>80?C.teal:C.amber, fontSize:16, fontWeight:800 }}>{adh}%</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          {[{v:taken,l:"Taken",c:C.teal},{v:missed.length,l:"Missed",c:C.rose},{v:meds.length,l:"Total Meds",c:C.blue}].map((s,i)=>(
            <div key={i} style={{ flex:1, background:s.c+"15", borderRadius:10, padding:"8px", textAlign:"center" }}>
              <p style={{ color:s.c, fontSize:18, fontWeight:800, margin:0 }}>{s.v}</p>
              <p style={{ color:C.muted, fontSize:10, margin:0 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Missed alert */}
      {missed.length > 0 && (
        <div style={{ background:C.rose+"15", border:`1px solid ${C.rose}44`, borderRadius:14, padding:"12px 16px", marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:22 }}>⚠️</span>
          <div style={{ flex:1 }}>
            <p style={{ color:C.rose, fontWeight:700, fontSize:14, margin:0 }}>Missed dose!</p>
            <p style={{ color:C.muted, fontSize:12, margin:0 }}>{missed.map(m=>m.name).join(", ")}</p>
          </div>
          <button onClick={()=>onNavigate("meds")} style={{ background:C.rose, border:"none", color:"white", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>View</button>
        </div>
      )}

      {/* Low stock warning */}
      {meds.filter(m => m.stock <= m.refillAt && m.stock > 0).map(m => (
        <div key={m.id} style={{ background:C.amber+"15", border:`1px solid ${C.amber}44`, borderRadius:14, padding:"12px 16px", marginBottom:8, display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ fontSize:22 }}>📦</span>
          <div style={{ flex:1 }}>
            <p style={{ color:C.amber, fontWeight:700, fontSize:14, margin:0 }}>Low stock — {m.name}</p>
            <p style={{ color:C.muted, fontSize:12, margin:0 }}>Only {m.stock} pills left — time to refill!</p>
          </div>
        </div>
      ))}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <h2 style={{ color:C.text, fontSize:16, fontWeight:800, margin:0 }}>Today's Medications</h2>
        <button onClick={()=>onNavigate("meds")} style={{ background:"transparent", border:"none", color:C.teal, fontSize:13, fontWeight:600, cursor:"pointer" }}>See all →</button>
      </div>

      {meds.length === 0 ? (
        <Card>
          <EmptyState icon="💊" title="No medications" desc="Add your first medication to get started" onAdd={()=>onNavigate("meds")} addLabel="+ Add Medication"/>
        </Card>
      ) : meds.map(med => (
        <Card key={med.id} color={med.color}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div style={{ width:44, height:44, borderRadius:12, background:(med.color||C.teal)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💊</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:C.text, fontWeight:700, fontSize:15, margin:"0 0 2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{med.name} <span style={{ color:med.color||C.teal, fontWeight:400, fontSize:13 }}>{med.dose}</span></p>
              <p style={{ color:C.muted, fontSize:12, margin:0 }}>{(med.times||[]).join(" · ")}</p>
            </div>
            <div style={{ display:"flex", gap:5, flexShrink:0 }}>
              {(med.times||[]).map((_,i)=>{
                const isMissed = med.missed?.[i];
                const isTaken = med.taken?.[i];
                return (
                  <button key={i} onClick={()=>!isMissed && onTake(med.id,i)}
                    style={{ width:36, height:36, borderRadius:10, border:`2px solid ${isMissed?C.rose:isTaken?med.color||C.teal:C.border}`, background:isMissed?C.rose+"22":isTaken?(med.color||C.teal)+"33":"transparent", color:isMissed?C.rose:isTaken?med.color||C.teal:C.muted, cursor:isMissed?"default":"pointer", fontSize:16, fontWeight:700 }}>
                    {isMissed?"✗":isTaken?"✓":"○"}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      ))}

      {/* Quick actions */}
      <h2 style={{ color:C.text, fontSize:16, fontWeight:800, margin:"8px 0 10px" }}>Quick Actions</h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:8 }}>
        {[{icon:"💊",label:"Add Medicine",c:C.teal,page:"meds"},{icon:"👨‍👩‍👧",label:"Family Hub",c:C.blue,page:"family"},{icon:"❤️",label:"Log Vitals",c:C.rose,page:"profile"},{icon:"📊",label:"Analytics",c:C.purple,page:"profile"}].map((a,i)=>(
          <button key={i} onClick={()=>onNavigate(a.page)} style={{ background:a.c+"15", border:`1px solid ${a.c}33`, borderRadius:16, padding:"16px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:28 }}>{a.icon}</span>
            <span style={{ color:a.c, fontSize:13, fontWeight:700 }}>{a.label}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

// ─── MEDS SCREEN ─────────────────────────────────────────────────────────────
function MedsScreen({ meds, onTake, onAdd, onDelete }) {
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
    <Screen>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h1 style={{ color:C.text, fontSize:22, fontWeight:900, margin:0 }}>💊 My Meds</h1>
        <button onClick={()=>setShowAdd(true)} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"10px 16px", cursor:"pointer", fontWeight:800, fontSize:14 }}>+ Add</button>
      </div>

      {meds.length === 0 ? (
        <Card><EmptyState icon="💊" title="No medications yet" desc="Add your medications to track doses and get reminders" onAdd={()=>setShowAdd(true)} addLabel="+ Add First Medication"/></Card>
      ) : meds.map(med => (
        <Card key={med.id} color={med.color} style={{ borderLeft:`4px solid ${med.color}` }}>
          <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
            <div style={{ width:46, height:46, borderRadius:12, background:(med.color||C.teal)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>💊</div>
            <div style={{ flex:1 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:16, margin:"0 0 2px" }}>{med.name}</p>
              <p style={{ color:med.color||C.teal, fontSize:13, fontWeight:600, margin:"0 0 4px" }}>{med.dose} · {med.condition||"General"}</p>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{(med.times||[]).map((t,i)=><Pill key={i} label={t} color={med.color||C.teal}/>)}</div>
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <span style={{ color:med.stock<=med.refillAt?C.rose:C.green, fontSize:13, fontWeight:600 }}>📦 {med.stock} pills left</span>
            <div style={{ display:"flex", gap:6 }}>
              {(med.times||[]).map((_,i)=>{
                const isMissed = med.missed?.[i];
                const isTaken = med.taken?.[i];
                return (
                  <button key={i} onClick={()=>!isMissed && onTake(med.id,i)}
                    style={{ width:40, height:40, borderRadius:10, border:`2px solid ${isMissed?C.rose:isTaken?med.color||C.teal:C.border}`, background:isMissed?C.rose+"22":isTaken?(med.color||C.teal)+"33":"transparent", color:isMissed?C.rose:isTaken?med.color||C.teal:C.muted, cursor:isMissed?"default":"pointer", fontSize:18 }}>
                    {isMissed?"✗":isTaken?"✓":"○"}
                  </button>
                );
              })}
            </div>
          </div>

          {(med.missed||[]).some(Boolean) && <div style={{ background:C.rose+"15", borderRadius:8, padding:"8px 12px", marginBottom:8 }}><p style={{ color:C.rose, fontSize:12, fontWeight:600, margin:0 }}>❌ Missed dose — caregiver notified</p></div>}
          {(med.interactions||[]).length>0 && <div style={{ background:C.amber+"15", borderRadius:8, padding:"8px 12px", marginBottom:8 }}><p style={{ color:C.amber, fontSize:12, margin:0 }}>⚠️ Interactions: {med.interactions.join(", ")}</p></div>}

          <button onClick={()=>onDelete(med.id)} style={{ width:"100%", background:"transparent", border:`1px solid ${C.border}`, color:C.rose, borderRadius:10, padding:"10px", cursor:"pointer", fontSize:13, fontWeight:600 }}>🗑️ Remove Medication</button>
        </Card>
      ))}

      {showAdd && (
        <BottomSheet title="➕ Add Medication" onClose={()=>setShowAdd(false)}>
          <MobileInput label="Medicine Name *" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. Metformin"/>
          <MobileInput label="Dose" value={form.dose} onChange={e=>f("dose",e.target.value)} placeholder="e.g. 500mg"/>
          <MobileInput label="Condition" value={form.condition} onChange={e=>f("condition",e.target.value)} placeholder="e.g. Diabetes"/>
          <MobileInput label="Food Instructions" value={form.food} onChange={e=>f("food",e.target.value)} placeholder="e.g. After meals"/>
          <div style={{ marginBottom:14 }}>
            <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:8, textTransform:"uppercase" }}>Dose Times</label>
            {form.times.map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                <input type="time" value={t} onChange={e=>{ const ts=[...form.times]; ts[i]=e.target.value; f("times",ts); }}
                  style={{ flex:1, background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 14px", color:C.text, fontSize:15 }}/>
                {form.times.length>1 && <button onClick={()=>f("times",form.times.filter((_,j)=>j!==i))} style={{ background:C.rose+"22", border:`1px solid ${C.rose}44`, color:C.rose, borderRadius:10, padding:"0 14px", cursor:"pointer" }}>✕</button>}
              </div>
            ))}
            <button onClick={()=>f("times",[...form.times,"12:00"])} style={{ background:C.teal+"15", border:`1px solid ${C.teal}44`, color:C.teal, borderRadius:10, padding:"10px 16px", cursor:"pointer", fontSize:14, width:"100%", marginTop:4 }}>+ Add Another Time</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <MobileInput label="Stock (pills)" value={form.stock} onChange={e=>f("stock",e.target.value)} placeholder="30" type="number"/>
            <MobileInput label="Refill Alert At" value={form.refillAt} onChange={e=>f("refillAt",e.target.value)} placeholder="7" type="number"/>
          </div>
          <button onClick={submit} style={{ width:"100%", background:C.teal, border:"none", color:C.navy, borderRadius:14, padding:"16px", cursor:"pointer", fontWeight:800, fontSize:16, marginTop:8 }}>💊 Add Medication</button>
        </BottomSheet>
      )}
    </Screen>
  );
}

// ─── SCHEDULE SCREEN ─────────────────────────────────────────────────────────
function ScheduleScreen({ meds }) {
  const hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  const now = new Date().getHours();

  return (
    <Screen>
      <h1 style={{ color:C.text, fontSize:22, fontWeight:900, margin:"0 0 16px" }}>📅 Schedule</h1>
      {meds.length === 0 ? (
        <Card><EmptyState icon="📅" title="No schedule yet" desc="Add medications to see your daily dose schedule"/></Card>
      ) : (
        <Card>
          {hours.map(h => {
            const dosesAtHour = meds.filter(m=>(m.times||[]).some(t=>parseInt(t)===h));
            const isPast = h < now;
            const isCurrent = h === now;
            return (
              <div key={h} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:6, opacity:isPast?0.5:1 }}>
                <div style={{ width:44, textAlign:"right", paddingTop:2, flexShrink:0 }}>
                  <span style={{ color:isCurrent?C.teal:C.muted, fontSize:12, fontWeight:isCurrent?700:400 }}>{h}:00</span>
                </div>
                <div style={{ flex:1, borderTop:`1px solid ${isCurrent?C.teal:C.border}30`, paddingTop:4, minHeight:28 }}>
                  {isCurrent && <div style={{ width:8, height:8, borderRadius:"50%", background:C.teal, display:"inline-block", marginRight:6 }}/>}
                  {dosesAtHour.map(m=>(
                    <span key={m.id} style={{ display:"inline-block", marginRight:6, marginBottom:4, background:(m.color||C.teal)+"22", border:`1px solid ${m.color||C.teal}44`, borderRadius:8, padding:"4px 10px", fontSize:13, color:m.color||C.teal, fontWeight:600 }}>
                      {m.name} {m.dose}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}

// ─── FAMILY SCREEN ────────────────────────────────────────────────────────────
function FamilyScreen({ userData, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", relation:"", age:"", avatar:"👤", blood:"", allergies:"", phone:"", email:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));
  const family = userData?.family || [];
  const avatars = ["👤","👩","👨","👦","👧","👴","👵","👶"];
  const colors = [C.teal,C.blue,C.amber,C.green,C.purple,C.rose];

  const submit = () => {
    if (!form.name.trim()) return;
    onUpdate({ family:[...family, { ...form, id:Date.now().toString(), age:Number(form.age), color:colors[family.length%colors.length] }] });
    setForm({ name:"", relation:"", age:"", avatar:"👤", blood:"", allergies:"", phone:"", email:"" });
    setShowAdd(false);
  };

  return (
    <Screen>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h1 style={{ color:C.text, fontSize:22, fontWeight:900, margin:0 }}>👨‍👩‍👧 Family</h1>
        <button onClick={()=>setShowAdd(true)} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"10px 16px", cursor:"pointer", fontWeight:800, fontSize:14 }}>+ Add</button>
      </div>

      {family.length === 0 ? (
        <Card><EmptyState icon="👨‍👩‍👧" title="No family members" desc="Add family members to monitor their health from one place" onAdd={()=>setShowAdd(true)} addLabel="+ Add Member"/></Card>
      ) : family.map(m => (
        <Card key={m.id} color={m.color}>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:(m.color||C.teal)+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, flexShrink:0 }}>{m.avatar||"👤"}</div>
            <div style={{ flex:1 }}>
              <p style={{ color:C.text, fontWeight:800, fontSize:17, margin:"0 0 2px" }}>{m.name}</p>
              <p style={{ color:m.color||C.teal, fontSize:13, fontWeight:600, margin:0 }}>{m.relation} · {m.age} years</p>
            </div>
            <button onClick={()=>onUpdate({ family:family.filter(x=>x.id!==m.id) })} style={{ background:C.rose+"22", border:`1px solid ${C.rose}33`, color:C.rose, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:13 }}>🗑️</button>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {m.blood && <Pill label={`🩸 ${m.blood}`} color={C.rose}/>}
            {m.allergies && <Pill label={`⚠️ ${m.allergies}`} color={C.amber}/>}
            {m.phone && <Pill label={`📞 ${m.phone}`} color={C.blue}/>}
          </div>
        </Card>
      ))}

      {showAdd && (
        <BottomSheet title="👥 Add Family Member" onClose={()=>setShowAdd(false)}>
          <div style={{ marginBottom:14 }}>
            <label style={{ color:C.muted, fontSize:12, fontWeight:700, display:"block", marginBottom:8, textTransform:"uppercase" }}>Avatar</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {avatars.map(a=>(
                <button key={a} onClick={()=>f("avatar",a)} style={{ width:48, height:48, borderRadius:12, border:`2px solid ${form.avatar===a?C.teal:C.border}`, background:form.avatar===a?C.teal+"22":"transparent", fontSize:24, cursor:"pointer" }}>{a}</button>
              ))}
            </div>
          </div>
          <MobileInput label="Full Name *" value={form.name} onChange={e=>f("name",e.target.value)} placeholder="e.g. Sunita Sharma"/>
          <MobileInput label="Relation" value={form.relation} onChange={e=>f("relation",e.target.value)} placeholder="e.g. Mother, Father"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <MobileInput label="Age" value={form.age} onChange={e=>f("age",e.target.value)} placeholder="62" type="number"/>
            <MobileInput label="Blood Group" value={form.blood} onChange={e=>f("blood",e.target.value)} placeholder="O+"/>
          </div>
          <MobileInput label="Allergies" value={form.allergies} onChange={e=>f("allergies",e.target.value)} placeholder="e.g. Penicillin"/>
          <MobileInput label="Phone" value={form.phone} onChange={e=>f("phone",e.target.value)} placeholder="+91-XXXXX-XXXXX"/>
          <MobileInput label="Email" value={form.email} onChange={e=>f("email",e.target.value)} placeholder="family@email.com" type="email"/>
          <button onClick={submit} style={{ width:"100%", background:C.teal, border:"none", color:C.navy, borderRadius:14, padding:"16px", cursor:"pointer", fontWeight:800, fontSize:16 }}>👥 Add Member</button>
        </BottomSheet>
      )}
    </Screen>
  );
}

// ─── PROFILE SCREEN ───────────────────────────────────────────────────────────
function ProfileScreen({ userData, onUpdate, userEmail, onLogout, onOpenCaregiverView }) {
  const p = userData?.profile || {};
  const s = userData?.settings || {};
  const logs = userData?.healthLogs || [];
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ name:p.name||"", age:p.age||"", blood:p.blood||"", allergies:p.allergies||"", phone:p.phone||"", caregiverEmail:p.caregiverEmail||"" });
  const [log, setLog] = useState({ bp:"", glucose:"", weight:"", notes:"" });
  const [saved, setSaved] = useState(false);
  const [pushGranted, setPushGranted] = useState(
    typeof Notification !== 'undefined' && Notification.permission === 'granted'
  );

  const saveProfile = () => {
    onUpdate({ profile });
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  const requestPush = async () => {
    const granted = await requestPushPermission();
    setPushGranted(granted);
    if (granted) onUpdate({ settings:{ ...s, pushNotifications:true } });
  };

  const saveLog = () => {
    if (!log.bp && !log.glucose && !log.weight) return;
    onUpdate({ healthLogs:[{ id:Date.now().toString(), date:new Date().toLocaleString(), ...log }, ...logs] });
    setLog({ bp:"", glucose:"", weight:"", notes:"" });
  };

  return (
    <Screen>
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["profile","health","settings"].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{ flex:1, padding:"10px", borderRadius:12, border:"none", background:tab===t?C.teal:C.navyLight, color:tab===t?C.navy:C.muted, cursor:"pointer", fontWeight:tab===t?800:500, fontSize:13, textTransform:"capitalize" }}>
            {t==="profile"?"👤 Profile":t==="health"?"❤️ Health":"⚙️ Settings"}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <>
          <div style={{ textAlign:"center", marginBottom:20 }}>
            <div style={{ width:72, height:72, borderRadius:20, background:C.teal+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 10px" }}>👤</div>
            <p style={{ color:C.text, fontWeight:800, fontSize:18, margin:"0 0 4px" }}>{profile.name || "Your Name"}</p>
            <p style={{ color:C.muted, fontSize:13 }}>{userEmail}</p>
          </div>
          <Card>
            <MobileInput label="Full Name" value={profile.name} onChange={e=>setProfile(x=>({...x,name:e.target.value}))} placeholder="e.g. Rajesh Kumar"/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <MobileInput label="Age" value={profile.age} onChange={e=>setProfile(x=>({...x,age:e.target.value}))} placeholder="34" type="number"/>
              <MobileInput label="Blood Group" value={profile.blood} onChange={e=>setProfile(x=>({...x,blood:e.target.value}))} placeholder="O+"/>
            </div>
            <MobileInput label="Allergies" value={profile.allergies} onChange={e=>setProfile(x=>({...x,allergies:e.target.value}))} placeholder="e.g. Penicillin"/>
            <MobileInput label="Phone" value={profile.phone} onChange={e=>setProfile(x=>({...x,phone:e.target.value}))} placeholder="+91-XXXXX-XXXXX"/>
            <MobileInput label="Caregiver Email" value={profile.caregiverEmail} onChange={e=>setProfile(x=>({...x,caregiverEmail:e.target.value}))} placeholder="caregiver@email.com" type="email" hint="Gets notified when you miss a dose"/>
            <button onClick={saveProfile} style={{ width:"100%", background:saved?C.green:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"14px", cursor:"pointer", fontWeight:800, fontSize:15 }}>
              {saved?"✅ Saved!":"Save Profile"}
            </button>
          </Card>
          <button onClick={onLogout} style={{ width:"100%", background:C.rose+"15", border:`1px solid ${C.rose}33`, color:C.rose, borderRadius:14, padding:"14px", cursor:"pointer", fontSize:15, fontWeight:700 }}>
            🚪 Log Out
          </button>
        </>
      )}

      {tab === "health" && (
        <>
          <Card>
            <h3 style={{ color:C.text, fontSize:16, fontWeight:700, margin:"0 0 14px" }}>📊 Log Vitals</h3>
            {[{l:"Blood Pressure",k:"bp",p:"120/80",u:"mmHg",c:C.rose},{l:"Glucose",k:"glucose",p:"95",u:"mg/dL",c:C.amber},{l:"Weight",k:"weight",p:"70",u:"kg",c:C.blue}].map(v=>(
              <div key={v.k} style={{ background:v.c+"11", border:`1px solid ${v.c}22`, borderRadius:12, padding:12, marginBottom:10 }}>
                <label style={{ color:v.c, fontSize:12, fontWeight:700, display:"block", marginBottom:6 }}>{v.l} ({v.u})</label>
                <input placeholder={v.p} value={log[v.k]} onChange={e=>setLog(x=>({...x,[v.k]:e.target.value}))}
                  style={{ width:"100%", background:C.navyLight, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 12px", color:C.text, fontSize:15, boxSizing:"border-box" }}/>
              </div>
            ))}
            <MobileInput label="Notes" value={log.notes} onChange={e=>setLog(x=>({...x,notes:e.target.value}))} placeholder="Any symptoms..."/>
            <button onClick={saveLog} style={{ width:"100%", background:C.teal, border:"none", color:C.navy, borderRadius:12, padding:"14px", cursor:"pointer", fontWeight:800, fontSize:15 }}>Save Reading</button>
          </Card>
          {logs.length>0 && (
            <Card>
              <h3 style={{ color:C.text, fontSize:15, fontWeight:700, margin:"0 0 12px" }}>Recent Readings</h3>
              {logs.slice(0,5).map((l,i)=>(
                <div key={l.id||i} style={{ padding:"10px 12px", background:C.navyLight, borderRadius:10, marginBottom:8 }}>
                  <p style={{ color:C.muted, fontSize:11, margin:"0 0 6px" }}>{l.date}</p>
                  <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                    {l.bp && <span style={{ color:C.rose, fontWeight:700, fontSize:14 }}>🫀 {l.bp}</span>}
                    {l.glucose && <span style={{ color:C.amber, fontWeight:700, fontSize:14 }}>🩸 {l.glucose}</span>}
                    {l.weight && <span style={{ color:C.blue, fontWeight:700, fontSize:14 }}>⚖️ {l.weight}kg</span>}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </>
      )}

      {tab === "settings" && (
        <>
          {!pushGranted && (
            <div style={{ background:C.amber+"15", border:`1px solid ${C.amber}44`, borderRadius:14, padding:16, marginBottom:12 }}>
              <p style={{ color:C.amber, fontWeight:700, fontSize:14, margin:"0 0 8px" }}>🔔 Enable Push Notifications</p>
              <p style={{ color:C.muted, fontSize:13, margin:"0 0 12px" }}>Get alerts on your phone when it's time to take medicine!</p>
              <button onClick={requestPush} style={{ background:C.amber, border:"none", color:C.navy, borderRadius:10, padding:"10px 20px", cursor:"pointer", fontWeight:700, fontSize:14 }}>Enable Now</button>
            </div>
          )}

          {/* Share Patient ID */}
          <Card color={C.teal}>
            <p style={{ color:C.text, fontWeight:800, fontSize:15, margin:"0 0 6px" }}>🔗 Share My Patient ID</p>
            <p style={{ color:C.muted, fontSize:12, margin:"0 0 12px", lineHeight:1.5 }}>Give this ID to your caregiver so they can monitor your medicines live in real time</p>
            <div style={{ background:C.navyLight, border:`1px solid ${C.teal}44`, borderRadius:10, padding:"12px 14px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ color:C.teal, fontWeight:700, fontSize:13, margin:0, letterSpacing:1, fontFamily:"monospace" }}>{userEmail?.split("@")[0]?.toUpperCase()}-{window.btoa(userEmail||"").slice(0,6).toUpperCase()}</p>
              <button onClick={()=>{ navigator.clipboard?.writeText(window.btoa(userEmail||"")); }} style={{ background:C.teal, border:"none", color:C.navy, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontWeight:700, fontSize:12 }}>Copy Full ID</button>
            </div>
            <p style={{ color:C.muted, fontSize:11, margin:0 }}>💡 Your caregiver enters this in their MediCare+ app under Caregiver View</p>
          </Card>

          {/* Open Caregiver View */}
          <Card color={C.blue}>
            <p style={{ color:C.text, fontWeight:800, fontSize:15, margin:"0 0 6px" }}>🩺 I'm a Caregiver</p>
            <p style={{ color:C.muted, fontSize:12, margin:"0 0 12px" }}>Monitor your patients' medications live — see every dose in real time</p>
            <button onClick={()=>onOpenCaregiverView()} style={{ width:"100%", background:C.blue, border:"none", color:"white", borderRadius:12, padding:"12px", cursor:"pointer", fontWeight:800, fontSize:14 }}>
              Open Caregiver Dashboard →
            </button>
          </Card>
          <Card>
            <h3 style={{ color:C.text, fontSize:15, fontWeight:700, margin:"0 0 16px" }}>🔔 Notifications</h3>
            {[
              {k:"pushNotifications", l:"📱 Push Notifications", d:"Phone alerts for dose reminders"},
              {k:"emailReminders",    l:"📧 Email Reminders",    d:"Email 5 min before each dose"},
              {k:"missedAlerts",      l:"⏰ Missed Dose Alerts", d:"Alert if dose missed by 5 min"},
              {k:"caregiverAlerts",   l:"👥 Caregiver Alerts",   d:"Notify caregiver on missed doses"},
            ].map(item=>(
              <div key={item.k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, paddingBottom:16, borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1, marginRight:12 }}>
                  <p style={{ color:C.text, fontSize:14, fontWeight:600, margin:"0 0 2px" }}>{item.l}</p>
                  <p style={{ color:C.muted, fontSize:12, margin:0 }}>{item.d}</p>
                </div>
                <Toggle value={!!s[item.k]} onChange={()=>onUpdate({ settings:{ ...s, [item.k]:!s[item.k] } })}/>
              </div>
            ))}
          </Card>
          <button onClick={onLogout} style={{ width:"100%", background:C.rose+"15", border:`1px solid ${C.rose}33`, color:C.rose, borderRadius:14, padding:"14px", cursor:"pointer", fontSize:15, fontWeight:700 }}>
            🚪 Log Out
          </button>
        </>
      )}
    </Screen>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [caregiverMode, setCaregiverMode] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setUserData(snap.data());
      else { await setDoc(ref, EMPTY); setUserData(EMPTY); }
      setLoading(false);
    };
    load();
  }, [user.uid]);

  const saveData = async (updates) => {
    const newData = { ...userData, ...updates };
    setUserData(newData);
    await updateDoc(doc(db, "users", user.uid), updates);
  };

  const handleTake = async (medId, idx) => {
    const meds = userData.meds.map(m => {
      if (m.id !== medId) return m;
      const taken = [...(m.taken||[])];
      const missed = [...(m.missed||[])];
      const wasTaken = taken[idx];
      taken[idx] = !taken[idx];
      if (taken[idx]) missed[idx] = false;
      // Auto-decrease stock when marking as taken, restore when unmarking
      const stockDelta = taken[idx] ? -1 : 1;
      const newStock = Math.max(0, (m.stock || 0) + stockDelta);
      return { ...m, taken, missed, stock: newStock };
    });
    await saveData({ meds });
  };

  const handleMarkMissed = (medId, idx, callback) => {
    setUserData(prev => {
      if (!prev) return prev;
      const med = prev.meds.find(m => m.id === medId);
      if (!med || med.taken?.[idx]) return prev;
      const meds = prev.meds.map(m => {
        if (m.id !== medId) return m;
        const missed = [...(m.missed || m.times.map(()=>false))];
        missed[idx] = true;
        return { ...m, missed };
      });
      updateDoc(doc(db, "users", user.uid), { meds });
      callback();
      return { ...prev, meds };
    });
  };

  const handleAddMed = async (med) => {
    const meds = [...(userData?.meds||[]), { ...med, id:Date.now().toString() }];
    await saveData({ meds });
  };

  const handleDeleteMed = async (id) => {
    await saveData({ meds:(userData?.meds||[]).filter(m=>m.id!==id) });
  };

  useReminders(userData?.meds||[], userData, user.email, handleMarkMissed);

  if (loading) return (
    <div style={{ background:C.navy, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:56 }}>💊</div>
        <p style={{ color:C.teal, fontWeight:700, marginTop:12 }}>Loading...</p>
      </div>
    </div>
  );

  const meds = userData?.meds || [];

  if (caregiverMode) return <CaregiverView user={user} onBack={()=>setCaregiverMode(false)}/>;

  return (
    <div style={{ background:C.navy, minHeight:"100vh", maxWidth:480, margin:"0 auto", display:"flex", flexDirection:"column", position:"relative" }}>
      {/* Status bar spacer for mobile */}
      <div style={{ height:"env(safe-area-inset-top,0px)", background:C.navyLight }}/>

      {/* Top header */}
      <div style={{ background:C.navyLight, borderBottom:`1px solid ${C.border}`, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:C.teal, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>💊</div>
          <div>
            <p style={{ color:C.text, fontWeight:800, fontSize:15, margin:0 }}>MediCare+</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <div style={{ background:userData?.settings?.pushNotifications?C.green+"22":C.border, border:`1px solid ${userData?.settings?.pushNotifications?C.green:C.border}44`, borderRadius:8, padding:"4px 10px" }}>
            <span style={{ color:userData?.settings?.pushNotifications?C.green:C.muted, fontSize:11, fontWeight:600 }}>
              {userData?.settings?.pushNotifications?"🔔":"🔕"}
            </span>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {tab==="home"     && <HomeScreen     userData={userData} meds={meds} onTake={handleTake} onNavigate={setTab} onPushAllow={async()=>{ const granted=await requestPushPermission(); if(granted) saveData({settings:{...(userData?.settings||{}),pushNotifications:true}}); }}/>}
        {tab==="meds"     && <MedsScreen     meds={meds} onTake={handleTake} onAdd={handleAddMed} onDelete={handleDeleteMed}/>}
        {tab==="schedule" && <ScheduleScreen meds={meds}/>}
        {tab==="family"   && <FamilyScreen   userData={userData} onUpdate={saveData}/>}
        {tab==="profile"  && <ProfileScreen  userData={userData} onUpdate={saveData} userEmail={user.email} onLogout={onLogout} onOpenCaregiverView={()=>setCaregiverMode(true)}/>}
      </div>

      {/* Bottom navigation */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.navyLight, borderTop:`1px solid ${C.border}`, display:"flex", zIndex:100, paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
        {NAV.map(n => {
          const missed = n.id==="meds" && meds.some(m=>(m.missed||[]).some(Boolean));
          return (
            <button key={n.id} onClick={()=>setTab(n.id)} style={{ flex:1, padding:"10px 4px 8px", background:"transparent", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}>
              {missed && <div style={{ position:"absolute", top:6, right:"25%", width:8, height:8, borderRadius:"50%", background:C.rose }}/>}
              <span style={{ fontSize:20 }}>{n.icon}</span>
              <span style={{ color:tab===n.id?C.teal:C.muted, fontSize:10, fontWeight:tab===n.id?700:400 }}>{n.label}</span>
              {tab===n.id && <div style={{ width:16, height:3, borderRadius:2, background:C.teal, marginTop:2 }}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
