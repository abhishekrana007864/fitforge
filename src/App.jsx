import { useState, useEffect, useRef, useCallback } from "react";

/* ─── FONTS ─────────────────────────────────────────────────────────────────── */
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
);

/* ─── CONSTANTS ─────────────────────────────────────────────────────────────── */
const TABS = [
  { id: "calories", icon: "🔥", label: "BURN" },
  { id: "running", icon: "🏃", label: "RUN" },
  { id: "aiplan", icon: "🤖", label: "AI PLAN" },
  { id: "bodyscan", icon: "🔬", label: "SCAN" },
  { id: "analytics", icon: "📊", label: "STATS" },
  { id: "tools", icon: "⏱️", label: "TOOLS" },
  { id: "goals", icon: "🎯", label: "GOALS" },
  { id: "coach", icon: "🧠", label: "COACH" },
  { id: "lifestyle", icon: "💧", label: "LIFE" },
  { id: "calendar", icon: "🗓️", label: "PLAN" },
  { id: "calorimeter", icon: "🥗", label: "DIET" },
  { id: "exercises", icon: "🤸", label: "MOVE" },
];

const MET = {
  running_slow: 8.3, running_moderate: 9.8, running_fast: 11.0,
  cycling_easy: 5.8, cycling_moderate: 8.0, cycling_hard: 10.0,
  hiit: 10.3, strength: 5.0, digsoil: 4.5, walking: 3.5, swimming: 7.0,
};

function callClaude(messages, systemPrompt = "") {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  }).then((r) => r.json()).then((d) => d.content?.map((c) => c.text || "").join("") || "");
}

/* ─── STORAGE HELPERS ────────────────────────────────────────────────────────── */
function getLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; } catch { return fallback; }
}
function setLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ─── STYLES ─────────────────────────────────────────────────────────────────── */
const S = {
  label: { color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 3, display: "block", marginBottom: 8 },
  inp: { padding: "12px 16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15, outline: "none", width: "100%", boxSizing: "border-box" },
  btn: (color = "#FF6B35") => ({ padding: "14px", borderRadius: 12, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, width: "100%" }),
  card: (accent = "#FF6B35") => ({ background: `linear-gradient(135deg, ${accent}15, ${accent}08)`, borderRadius: 16, padding: 20, border: `1px solid ${accent}30` }),
  sectionTitle: { color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 3, marginBottom: 10 },
  row: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" },
};

/* ─── CALORIE CALCULATOR ────────────────────────────────────────────────────── */
function CalorieBurn() {
  const [weight, setWeight] = useState(70);
  const [activity, setActivity] = useState("running_moderate");
  const [duration, setDuration] = useState(30);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => getLS("cal_history", []));

  const activities = [
    { id: "running_slow", label: "Running (Slow)", icon: "🏃", pace: "6+ min/km" },
    { id: "running_moderate", label: "Running (Moderate)", icon: "🏃", pace: "5-6 min/km" },
    { id: "running_fast", label: "Running (Fast)", icon: "🏃", pace: "< 5 min/km" },
    { id: "cycling_easy", label: "Cycling (Easy)", icon: "🚴", pace: "15-20 km/h" },
    { id: "cycling_moderate", label: "Cycling (Moderate)", icon: "🚴", pace: "20-25 km/h" },
    { id: "cycling_hard", label: "Cycling (Hard)", icon: "🚴", pace: "25+ km/h" },
    { id: "hiit", label: "HIIT", icon: "⚡", pace: "High intensity" },
    { id: "strength", label: "Strength Training", icon: "🏋️", pace: "Moderate effort" },
    { id: "digsoil", label: "Dig Soil", icon: "⛏️", pace: "Manual labour" },
    { id: "walking", label: "Walking", icon: "🚶", pace: "Normal pace" },
    { id: "swimming", label: "Swimming", icon: "🏊", pace: "Moderate" },
  ];

  const calculate = () => {
    const met = MET[activity];
    const calories = Math.round(met * weight * (duration / 60));
    const entry = { activity: activities.find(a => a.id === activity)?.label, duration, calories, date: new Date().toISOString() };
    setResult({ calories, met, entry });
    const newHistory = [entry, ...history].slice(0, 20);
    setHistory(newHistory);
    setLS("cal_history", newHistory);
  };

  const totalToday = history.filter(h => new Date(h.date).toDateString() === new Date().toDateString()).reduce((s, h) => s + h.calories, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...S.card("#FF6B35"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={S.label}>TODAY'S BURN</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 52, color: "#FF6B35", fontWeight: 700, lineHeight: 1 }}>{totalToday}</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>kcal burned today</div>
        </div>
        <div style={{ fontSize: 48 }}>🔥</div>
      </div>

      <div>
        <label style={S.label}>BODY WEIGHT (KG)</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input type="range" min={30} max={150} value={weight} onChange={e => setWeight(+e.target.value)} style={{ flex: 1, accentColor: "#FF6B35" }} />
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, color: "#FF6B35", minWidth: 60, textAlign: "right" }}>{weight}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>kg</span></div>
        </div>
      </div>

      <div>
        <label style={S.label}>ACTIVITY</label>
        <select value={activity} onChange={e => setActivity(e.target.value)} style={{ ...S.inp, cursor: "pointer" }}>
          {activities.map(a => <option key={a.id} value={a.id}>{a.icon} {a.label} — {a.pace}</option>)}
        </select>
      </div>

      <div>
        <label style={S.label}>DURATION: {duration} MINUTES</label>
        <input type="range" min={5} max={180} step={5} value={duration} onChange={e => setDuration(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
        <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}>
          <span>5 min</span><span>3 hrs</span>
        </div>
      </div>

      <button onClick={calculate} style={S.btn()}>CALCULATE BURN 🔥</button>

      {result && (
        <div style={{ ...S.card("#FF6B35"), textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 64, fontWeight: 700, color: "#FF6B35", lineHeight: 1 }}>{result.calories}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 12 }}>kcal burned in {duration} minutes</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FF6B35", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700 }}>{Math.round(result.calories / 7700 * 1000) / 1000}g</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>fat burned</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#FF6B35", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700 }}>{Math.round(result.calories / 9 * 10) / 10}g</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>glucose equiv.</div>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <div style={S.sectionTitle}>RECENT BURNS</div>
          {history.slice(0, 5).map((h, i) => (
            <div key={i} style={S.row}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", fontSize: 13 }}>{h.activity} · {h.duration}min</span>
              <span style={{ color: "#FF6B35", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{h.calories} kcal</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── RUNNING TRACKER ───────────────────────────────────────────────────────── */
function RunningTracker() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [manualKm, setManualKm] = useState("");
  const [splits, setSplits] = useState([]);
  const [weight, setWeight] = useState(70);
  const [runHistory, setRunHistory] = useState(() => getLS("run_history", []));
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const splitRef = useRef(0);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now() - elapsed * 1000;
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const pace = distance > 0 && elapsed > 0 ? elapsed / 60 / distance : 0;
  const paceStr = pace > 0 ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, "0")}` : "--:--";
  const speed = distance > 0 && elapsed > 0 ? (distance / (elapsed / 3600)).toFixed(1) : "0.0";
  const calories = Math.round(9.8 * weight * (elapsed / 3600));
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // VO2 max estimate (Cooper formula approximation)
  const vo2max = distance > 0 && elapsed > 0 ? Math.max(0, (distance * 1000 / (elapsed / 60) - 133) * 0.172 + 33.3).toFixed(1) : null;

  const getPaceSuggestion = () => {
    if (pace === 0) return null;
    if (pace < 4) return { msg: "⚠️ Slow down! Sprinting pace — unsustainable. Fat burn zone: 5:30–7:00 /km.", color: "#ff4444" };
    if (pace < 5) return { msg: "🔥 Fast pace! Great fitness gains. Sustain for 20+ mins for full benefit.", color: "#FF6B35" };
    if (pace <= 6.5) return { msg: "✅ Perfect fat-burning zone! Maximum weight loss at this effort.", color: "#4ECDC4" };
    if (pace <= 8) return { msg: "👍 Good easy pace. Push to 6:00–6:30 to increase calorie burn.", color: "#A8E6CF" };
    return { msg: "🐌 Too slow for fat burn. Aim for at least 7:00 min/km.", color: "#FFE66D" };
  };

  const addSplit = () => {
    const splitTime = elapsed - splitRef.current;
    setSplits(s => [...s, { km: s.length + 1, time: splitTime, pace: splitTime / 60 }]);
    splitRef.current = elapsed;
  };

  const endRun = () => {
    setRunning(false);
    if (distance > 0 && elapsed > 0) {
      const entry = { distance: +distance, elapsed, pace, calories, splits, vo2max, date: new Date().toISOString() };
      const newH = [entry, ...runHistory].slice(0, 20);
      setRunHistory(newH);
      setLS("run_history", newH);
      // Check PRs
      const prevBestPace = runHistory.length > 0 ? Math.min(...runHistory.map(r => r.pace)) : Infinity;
      if (pace > 0 && pace < prevBestPace) alert("🏆 NEW PERSONAL RECORD! Best pace ever!");
    }
  };

  const reset = () => { setElapsed(0); setDistance(0); setManualKm(""); setSplits([]); splitRef.current = 0; };
  const paceHint = getPaceSuggestion();
  const bestPace = runHistory.length > 0 ? Math.min(...runHistory.map(r => r.pace)) : null;
  const totalKm = runHistory.reduce((s, r) => s + r.distance, 0).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "TOTAL KM", val: totalKm, unit: "km" },
          { label: "BEST PACE", val: bestPace ? `${Math.floor(bestPace)}:${String(Math.round((bestPace%1)*60)).padStart(2,"0")}` : "--", unit: "/km" },
        ].map(s => (
          <div key={s.label} style={{ ...S.card("#4ECDC4"), textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 30, fontWeight: 700, color: "#4ECDC4", lineHeight: 1 }}>{s.val}<span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>{s.unit}</span></div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2, fontFamily: "'Rajdhani', sans-serif", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 18, padding: "28px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 72, fontWeight: 700, color: "#fff", letterSpacing: 2, lineHeight: 1, textShadow: running ? "0 0 30px rgba(78,205,196,0.3)" : "none" }}>{fmt(elapsed)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
          {[
            { label: "PACE", val: paceStr, unit: "min/km", color: "#4ECDC4" },
            { label: "SPEED", val: speed, unit: "km/h", color: "#FFE66D" },
            { label: "KCAL", val: calories, unit: "cal", color: "#FF6B35" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {vo2max && (
        <div style={{ ...S.card("#A78BFA"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={S.label}>EST. VO2 MAX</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 36, fontWeight: 700, color: "#A78BFA" }}>{vo2max} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>ml/kg/min</span></div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{+vo2max > 50 ? "Superior" : +vo2max > 42 ? "Excellent" : +vo2max > 35 ? "Good" : "Average"} fitness</div>
          </div>
          <div style={{ fontSize: 36 }}>🫁</div>
        </div>
      )}

      {paceHint && (
        <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${paceHint.color}40`, background: `${paceHint.color}10` }}>
          <div style={{ color: paceHint.color, fontFamily: "'Outfit', sans-serif", fontSize: 13, lineHeight: 1.5 }}>{paceHint.msg}</div>
        </div>
      )}

      <div>
        <label style={S.label}>DISTANCE (KM)</label>
        <input type="number" value={manualKm} onChange={e => { setManualKm(e.target.value); setDistance(+e.target.value); }} placeholder="Enter distance e.g. 5.2" style={S.inp} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setRunning(r => !r)}
          style={{ flex: 2, padding: "16px 0", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: 3, background: running ? "rgba(255,68,68,0.8)" : "linear-gradient(135deg, #4ECDC4, #2ecc71)", color: "#0a0a0a" }}>
          {running ? "⏸ PAUSE" : elapsed > 0 ? "▶ RESUME" : "▶ START"}
        </button>
        {running && <button onClick={addSplit} style={{ flex: 1, padding: "16px 0", borderRadius: 12, border: "1px solid rgba(78,205,196,0.3)", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, background: "transparent", color: "#4ECDC4" }}>SPLIT</button>}
        {!running && elapsed > 0 && <button onClick={endRun} style={{ flex: 1, padding: "16px 0", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, background: "#FF6B35", color: "#0a0a0a" }}>SAVE</button>}
        {!running && elapsed > 0 && <button onClick={reset} style={{ flex: 1, padding: "16px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: 16, background: "transparent", color: "rgba(255,255,255,0.4)" }}>RESET</button>}
      </div>

      {splits.length > 0 && (
        <div>
          <div style={S.sectionTitle}>SPLITS</div>
          {splits.map((s, i) => (
            <div key={i} style={S.row}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2 }}>KM {s.km}</span>
              <span style={{ color: "#4ECDC4", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{fmt(s.time)} · {Math.floor(s.pace)}:{String(Math.round((s.pace%1)*60)).padStart(2,"0")}/km</span>
            </div>
          ))}
        </div>
      )}

      {runHistory.length > 0 && (
        <div>
          <div style={S.sectionTitle}>RECENT RUNS</div>
          {runHistory.slice(0, 5).map((r, i) => (
            <div key={i} style={S.row}>
              <div>
                <span style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>{r.distance} km</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginLeft: 8 }}>{fmt(r.elapsed)}</span>
                {i === 0 && r.pace === Math.min(...runHistory.map(x => x.pace)) && <span style={{ color: "#FFE66D", fontSize: 11, marginLeft: 6 }}>🏆 PR</span>}
              </div>
              <span style={{ color: "#4ECDC4", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{Math.floor(r.pace)}:{String(Math.round((r.pace%1)*60)).padStart(2,"0")}/km</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ─── AI WORKOUT PLAN ───────────────────────────────────────────────────────── */
function AIPlan() {
  const [weight, setWeight] = useState(75);
  const [targetWeight, setTargetWeight] = useState(68);
  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [goal, setGoal] = useState("weight_loss");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    const diff = weight - targetWeight;
    const prompt = `Create a ${daysPerWeek}-day/week workout plan for a ${fitnessLevel} with goal: ${goal}. Current: ${weight}kg, target: ${targetWeight}kg (${diff > 0 ? `${diff}kg to lose` : "maintain/gain"}). Format as JSON with structure: { "weekPlan": [{ "day": "Monday", "type": "...", "duration": 45, "exercises": [{"name":"...","sets":3,"reps":"10-12","rest":"60s"}], "notes":"..." }], "tips": ["..."] }. Return ONLY valid JSON.`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], "You are a professional fitness coach. Always return valid JSON only, no markdown.");
      const clean = raw.replace(/```json|```/g, "").trim();
      setPlan(JSON.parse(clean));
    } catch (e) {
      setPlan({ error: "Failed to generate plan. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={S.card("#A78BFA")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#A78BFA", marginBottom: 4 }}>🤖 AI COACH</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Personalized plan built around your actual data</div>
      </div>

      {[
        { label: "CURRENT WEIGHT (KG)", val: weight, set: setWeight, min: 40, max: 180 },
        { label: "TARGET WEIGHT (KG)", val: targetWeight, set: setTargetWeight, min: 40, max: 180 },
        { label: "DAYS PER WEEK", val: daysPerWeek, set: setDaysPerWeek, min: 1, max: 7 },
      ].map(f => (
        <div key={f.label}>
          <label style={S.label}>{f.label}: {f.val}</label>
          <input type="range" min={f.min} max={f.max} value={f.val} onChange={e => f.set(+e.target.value)} style={{ width: "100%", accentColor: "#A78BFA" }} />
        </div>
      ))}

      <div>
        <label style={S.label}>FITNESS LEVEL</label>
        <select value={fitnessLevel} onChange={e => setFitnessLevel(e.target.value)} style={{ ...S.inp, cursor: "pointer" }}>
          {["beginner", "intermediate", "advanced"].map(v => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
        </select>
      </div>

      <div>
        <label style={S.label}>PRIMARY GOAL</label>
        <select value={goal} onChange={e => setGoal(e.target.value)} style={{ ...S.inp, cursor: "pointer" }}>
          <option value="weight_loss">🔥 Weight Loss</option>
          <option value="muscle_gain">💪 Muscle Gain</option>
          <option value="endurance">🏃 Endurance</option>
          <option value="general_fitness">⚡ General Fitness</option>
        </select>
      </div>

      <button onClick={generatePlan} disabled={loading} style={{ ...S.btn("#A78BFA"), opacity: loading ? 0.7 : 1 }}>
        {loading ? "GENERATING..." : "GENERATE MY PLAN 🤖"}
      </button>

      {plan?.error && <div style={{ ...S.card("#ff4444"), color: "#ff9999" }}>{plan.error}</div>}

      {plan?.weekPlan && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {plan.weekPlan.map((d, i) => (
            <div key={i} style={S.card("#A78BFA")}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#A78BFA" }}>{d.day}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{d.duration} min · {d.type}</div>
              </div>
              {d.exercises?.map((ex, j) => (
                <div key={j} style={{ padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>{ex.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{ex.sets} sets × {ex.reps} · rest {ex.rest}</div>
                </div>
              ))}
              {d.notes && <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 10, fontStyle: "italic" }}>💡 {d.notes}</div>}
            </div>
          ))}
          {plan.tips && (
            <div style={S.card("#FFE66D")}>
              <div style={{ ...S.sectionTitle, color: "#FFE66D" }}>COACH TIPS</div>
              {plan.tips.map((t, i) => (
                <div key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>• {t}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── BODY SCAN ─────────────────────────────────────────────────────────────── */
function BodyScan() {
  const [measurements, setMeasurements] = useState({ waist: "", chest: "", arms: "", hips: "", weight: "" });
  const [history, setHistory] = useState(() => getLS("body_history", []));
  const [bmi, setBmi] = useState(null);
  const [height, setHeight] = useState(175);

  const save = () => {
    const entry = { ...measurements, height, date: new Date().toISOString() };
    const bmiVal = measurements.weight && height ? (measurements.weight / ((height / 100) ** 2)).toFixed(1) : null;
    setBmi(bmiVal);
    const newH = [entry, ...history].slice(0, 60);
    setHistory(newH);
    setLS("body_history", newH);
    setMeasurements({ waist: "", chest: "", arms: "", hips: "", weight: "" });
  };

  const bmiCategory = (b) => b < 18.5 ? { label: "Underweight", color: "#FFE66D" } : b < 25 ? { label: "Normal", color: "#4ECDC4" } : b < 30 ? { label: "Overweight", color: "#FF6B35" } : { label: "Obese", color: "#ff4444" };
  const latestWeight = history.find(h => h.weight)?.weight;
  const prevWeight = history.filter(h => h.weight).length > 1 ? history.filter(h => h.weight)[1]?.weight : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...S.card("#4ECDC4"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={S.label}>CURRENT WEIGHT</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 48, fontWeight: 700, color: "#4ECDC4", lineHeight: 1 }}>{latestWeight || "--"}<span style={{ fontSize: 18, color: "rgba(255,255,255,0.3)" }}>kg</span></div>
          {prevWeight && latestWeight && <div style={{ fontSize: 13, color: latestWeight < prevWeight ? "#4ECDC4" : "#FF6B35", marginTop: 4 }}>{latestWeight < prevWeight ? "▼" : "▲"} {Math.abs(latestWeight - prevWeight).toFixed(1)}kg from last</div>}
        </div>
        <div style={{ fontSize: 40 }}>📏</div>
      </div>

      <div>
        <label style={S.label}>HEIGHT (CM): {height}</label>
        <input type="range" min={140} max={220} value={height} onChange={e => setHeight(+e.target.value)} style={{ width: "100%", accentColor: "#4ECDC4" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { key: "weight", label: "Weight (kg)", icon: "⚖️" },
          { key: "waist", label: "Waist (cm)", icon: "📐" },
          { key: "chest", label: "Chest (cm)", icon: "📐" },
          { key: "arms", label: "Arms (cm)", icon: "💪" },
          { key: "hips", label: "Hips (cm)", icon: "📐" },
        ].map(f => (
          <div key={f.key}>
            <label style={{ ...S.label, fontSize: 10 }}>{f.icon} {f.label.toUpperCase()}</label>
            <input type="number" value={measurements[f.key]} onChange={e => setMeasurements(m => ({ ...m, [f.key]: e.target.value }))} placeholder="0" style={{ ...S.inp, padding: "10px 12px" }} />
          </div>
        ))}
      </div>

      <button onClick={save} style={S.btn("#4ECDC4")}>SAVE MEASUREMENTS 📏</button>

      {bmi && (
        <div style={{ ...S.card(bmiCategory(+bmi).color), textAlign: "center" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 48, fontWeight: 700, color: bmiCategory(+bmi).color }}>{bmi}</div>
          <div style={{ color: bmiCategory(+bmi).color, fontSize: 14, fontWeight: 600 }}>BMI · {bmiCategory(+bmi).label}</div>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <div style={S.sectionTitle}>MEASUREMENT HISTORY</div>
          {history.slice(0, 5).map((h, i) => (
            <div key={i} style={{ ...S.row, flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#4ECDC4", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{h.weight ? `${h.weight}kg` : "--"}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{new Date(h.date).toLocaleDateString()}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                {h.waist ? `Waist: ${h.waist}cm` : ""} {h.chest ? `· Chest: ${h.chest}cm` : ""} {h.arms ? `· Arms: ${h.arms}cm` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ─── ANALYTICS ─────────────────────────────────────────────────────────────── */
function Analytics() {
  const calHistory = getLS("cal_history", []);
  const runHistory = getLS("run_history", []);
  const bodyHistory = getLS("body_history", []);
  const [weekReport, setWeekReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Weight trend last 7 entries
  const weightData = bodyHistory.filter(h => h.weight).slice(0, 10).reverse();
  const maxW = weightData.length > 0 ? Math.max(...weightData.map(h => +h.weight)) : 80;
  const minW = weightData.length > 0 ? Math.min(...weightData.map(h => +h.weight)) : 60;

  // Calorie balance (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { date: d.toDateString(), label: d.toLocaleDateString("en", { weekday: "short" }) };
  });
  const dailyBurn = last7Days.map(day => ({
    ...day,
    burned: calHistory.filter(h => new Date(h.date).toDateString() === day.date).reduce((s, h) => s + h.calories, 0),
  }));
  const maxBurn = Math.max(...dailyBurn.map(d => d.burned), 1);

  // Workout streak
  const workoutDays = new Set([...calHistory, ...runHistory].map(h => new Date(h.date).toDateString()));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (workoutDays.has(d.toDateString())) streak++;
    else break;
  }

  const getWeeklyReport = async () => {
    setLoadingReport(true);
    const summary = {
      totalBurned: calHistory.filter(h => {
        const d = new Date(h.date); const now = new Date();
        return (now - d) / 86400000 <= 7;
      }).reduce((s, h) => s + h.calories, 0),
      totalRuns: runHistory.filter(h => (new Date() - new Date(h.date)) / 86400000 <= 7).length,
      totalDistance: runHistory.filter(h => (new Date() - new Date(h.date)) / 86400000 <= 7).reduce((s, h) => s + h.distance, 0).toFixed(1),
      streak,
      latestWeight: bodyHistory.find(h => h.weight)?.weight,
    };
    const report = await callClaude(
      [{ role: "user", content: `Generate a motivating weekly fitness report. Data: ${JSON.stringify(summary)}. Keep it under 200 words. Start with an emoji headline, then 3-4 bullet insights, then an encouraging closing line.` }],
      "You are an enthusiastic personal trainer giving a weekly recap."
    );
    setWeekReport(report);
    setLoadingReport(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Streak */}
      <div style={{ ...S.card("#FF6B35"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={S.label}>WORKOUT STREAK</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 56, fontWeight: 700, color: "#FF6B35", lineHeight: 1 }}>{streak}</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>consecutive days 🔥</div>
        </div>
        <div style={{ fontSize: 52 }}>{streak >= 7 ? "🏆" : streak >= 3 ? "🔥" : "💪"}</div>
      </div>

      {/* Weight trend */}
      <div style={S.card("#4ECDC4")}>
        <div style={S.sectionTitle}>WEIGHT TREND</div>
        {weightData.length < 2 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>Log weight in Body Scan to see your trend</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, marginTop: 8 }}>
            {weightData.map((d, i) => {
              const range = maxW - minW || 1;
              const h = ((+d.weight - minW) / range) * 60 + 20;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 10, color: "#4ECDC4", fontFamily: "'Rajdhani', sans-serif" }}>{d.weight}</div>
                  <div style={{ width: "100%", height: h, background: i === weightData.length - 1 ? "#4ECDC4" : "rgba(78,205,196,0.3)", borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{new Date(d.date).getDate()}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily calorie burn */}
      <div style={S.card("#FF6B35")}>
        <div style={S.sectionTitle}>CALORIES BURNED — LAST 7 DAYS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {dailyBurn.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              {d.burned > 0 && <div style={{ fontSize: 9, color: "#FF6B35", fontFamily: "'Rajdhani', sans-serif" }}>{d.burned}</div>}
              <div style={{ width: "100%", height: Math.max((d.burned / maxBurn) * 60, 4), background: d.burned > 0 ? "#FF6B35" : "rgba(255,255,255,0.07)", borderRadius: "4px 4px 0 0" }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'Rajdhani', sans-serif" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Weekly Report */}
      <button onClick={getWeeklyReport} disabled={loadingReport} style={{ ...S.btn("#A78BFA"), opacity: loadingReport ? 0.7 : 1 }}>
        {loadingReport ? "ANALYZING..." : "🤖 GENERATE WEEKLY REPORT"}
      </button>

      {weekReport && (
        <div style={S.card("#A78BFA")}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Outfit', sans-serif", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{weekReport}</div>
        </div>
      )}

      {/* PR Summary */}
      {runHistory.length > 0 && (
        <div style={S.card("#FFE66D")}>
          <div style={{ ...S.sectionTitle, color: "#FFE66D" }}>🏆 PERSONAL RECORDS</div>
          <div style={S.row}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Best Pace</span>
            <span style={{ color: "#FFE66D", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
              {(() => { const p = Math.min(...runHistory.map(r => r.pace)); return `${Math.floor(p)}:${String(Math.round((p%1)*60)).padStart(2,"0")}/km`; })()}
            </span>
          </div>
          <div style={S.row}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Longest Run</span>
            <span style={{ color: "#FFE66D", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{Math.max(...runHistory.map(r => r.distance)).toFixed(1)} km</span>
          </div>
          <div style={{ ...S.row, borderBottom: "none" }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Total Runs</span>
            <span style={{ color: "#FFE66D", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{runHistory.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SMART TOOLS ────────────────────────────────────────────────────────────── */
function SmartTools() {
  // HIIT Timer
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle, work, rest, done
  const [timeLeft, setTimeLeft] = useState(0);
  const hiitRef = useRef(null);

  // Rest timer between sets
  const [setRestSecs, setSetRestSecs] = useState(60);
  const [setRestLeft, setSetRestLeft] = useState(null);
  const setRestRef = useRef(null);

  const beep = (freq = 880, dur = 200) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; gain.gain.value = 0.3;
      osc.start(); osc.stop(ctx.currentTime + dur / 1000);
    } catch {}
  };

  const startHIIT = () => {
    setCurrentRound(1);
    setPhase("work");
    setTimeLeft(workTime);
  };

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    hiitRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (phase === "work") {
            beep(440, 300);
            if (currentRound >= rounds) { setPhase("done"); clearInterval(hiitRef.current); return 0; }
            setPhase("rest");
            return restTime;
          } else {
            beep(880, 150);
            setCurrentRound(r => r + 1);
            setPhase("work");
            return workTime;
          }
        }
        if (t === 4) beep(660, 100);
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(hiitRef.current);
  }, [phase, currentRound]);

  const stopHIIT = () => { clearInterval(hiitRef.current); setPhase("idle"); setCurrentRound(0); setTimeLeft(0); };

  const startSetRest = () => {
    setSetRestLeft(setRestSecs);
    setRestRef.current = setInterval(() => {
      setSetRestLeft(t => {
        if (t <= 1) { clearInterval(setRestRef.current); beep(880, 500); return null; }
        if (t <= 4) beep(660, 100);
        return t - 1;
      });
    }, 1000);
  };

  const phaseColor = phase === "work" ? "#FF6B35" : phase === "rest" ? "#4ECDC4" : phase === "done" ? "#4ECDC4" : "#A78BFA";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* HIIT Timer */}
      <div style={S.card("#FF6B35")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#FF6B35", marginBottom: 16 }}>⚡ HIIT INTERVAL TIMER</div>

        {phase === "idle" || phase === "done" ? (
          <>
            {[
              { label: "WORK TIME (SEC)", val: workTime, set: setWorkTime, min: 10, max: 60, color: "#FF6B35" },
              { label: "REST TIME (SEC)", val: restTime, set: setRestTime, min: 5, max: 60, color: "#4ECDC4" },
              { label: "ROUNDS", val: rounds, set: setRounds, min: 2, max: 20, color: "#FFE66D" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 12 }}>
                <label style={{ ...S.label }}>{f.label}: {f.val}</label>
                <input type="range" min={f.min} max={f.max} value={f.val} onChange={e => f.set(+e.target.value)} style={{ width: "100%", accentColor: f.color }} />
              </div>
            ))}
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 12 }}>Total: ~{Math.round((workTime * rounds + restTime * (rounds - 1)) / 60)} min</div>
            {phase === "done" && <div style={{ color: "#4ECDC4", fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 12 }}>🎉 WORKOUT COMPLETE!</div>}
            <button onClick={startHIIT} style={S.btn("#FF6B35")}>START HIIT ⚡</button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", letterSpacing: 3, marginBottom: 8 }}>
              ROUND {currentRound} / {rounds}
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: phaseColor, marginBottom: 4, letterSpacing: 2 }}>
              {phase.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 96, fontWeight: 700, color: phaseColor, lineHeight: 1, textShadow: `0 0 40px ${phaseColor}60` }}>
              {timeLeft}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <div style={{ width: `${(currentRound / rounds) * 100}%`, height: "100%", background: phaseColor, transition: "width 0.3s" }} />
              </div>
            </div>
            <button onClick={stopHIIT} style={{ ...S.btn("#ff4444"), marginTop: 16 }}>STOP</button>
          </div>
        )}
      </div>

      {/* Set Rest Timer */}
      <div style={S.card("#4ECDC4")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#4ECDC4", marginBottom: 12 }}>⏱️ SET REST TIMER</div>
        <label style={S.label}>REST DURATION: {setRestSecs}s</label>
        <input type="range" min={15} max={180} step={5} value={setRestSecs} onChange={e => { setSetRestSecs(+e.target.value); if (setRestLeft !== null) { clearInterval(setRestRef.current); setSetRestLeft(null); } }} style={{ width: "100%", accentColor: "#4ECDC4", marginBottom: 16 }} />
        {setRestLeft !== null ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 72, fontWeight: 700, color: "#4ECDC4", lineHeight: 1 }}>{setRestLeft}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 12 }}>seconds until next set</div>
            <button onClick={() => { clearInterval(setRestRef.current); setSetRestLeft(null); }} style={{ ...S.btn("#ff4444"), padding: "10px" }}>CANCEL</button>
          </div>
        ) : (
          <button onClick={startSetRest} style={S.btn("#4ECDC4")}>LOG SET & START REST ⏱️</button>
        )}
      </div>
    </div>
  );
}

/* ─── GOALS & BADGES ─────────────────────────────────────────────────────────── */
function Goals() {
  const runHistory = getLS("run_history", []);
  const calHistory = getLS("cal_history", []);
  const bodyHistory = getLS("body_history", []);

  const totalKm = runHistory.reduce((s, r) => s + r.distance, 0);
  const totalSessions = calHistory.length + runHistory.length;
  const startWeight = bodyHistory.length > 0 ? +bodyHistory[bodyHistory.length - 1]?.weight : 0;
  const currentWeight = bodyHistory.length > 0 ? +bodyHistory[0]?.weight : 0;
  const weightLost = startWeight && currentWeight ? Math.max(0, startWeight - currentWeight) : 0;

  const badges = [
    { id: "first_5k", icon: "🏃", title: "First 5K", desc: "Run 5 kilometers", unlocked: totalKm >= 5, progress: Math.min(totalKm / 5 * 100, 100) },
    { id: "first_run", icon: "👟", title: "Just Started", desc: "Complete your first run", unlocked: runHistory.length >= 1, progress: runHistory.length >= 1 ? 100 : 0 },
    { id: "marathon_50", icon: "🌍", title: "50K Club", desc: "Run 50 km total", unlocked: totalKm >= 50, progress: Math.min(totalKm / 50 * 100, 100) },
    { id: "sessions_10", icon: "💪", title: "10 Sessions", desc: "Complete 10 workouts", unlocked: totalSessions >= 10, progress: Math.min(totalSessions / 10 * 100, 100) },
    { id: "sessions_50", icon: "🏋️", title: "50 Sessions", desc: "Complete 50 workouts", unlocked: totalSessions >= 50, progress: Math.min(totalSessions / 50 * 100, 100) },
    { id: "weight_2kg", icon: "⚖️", title: "2kg Lost", desc: "Lose 2 kilograms", unlocked: weightLost >= 2, progress: Math.min(weightLost / 2 * 100, 100) },
    { id: "weight_5kg", icon: "🔥", title: "5kg Lost", desc: "Lose 5 kilograms", unlocked: weightLost >= 5, progress: Math.min(weightLost / 5 * 100, 100) },
    { id: "streak_7", icon: "🗓️", title: "Week Warrior", desc: "7-day workout streak", unlocked: (() => {
      const days = new Set([...calHistory, ...runHistory].map(h => new Date(h.date).toDateString()));
      let s = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (days.has(d.toDateString())) s++; else break; }
      return s >= 7;
    })(), progress: (() => {
      const days = new Set([...calHistory, ...runHistory].map(h => new Date(h.date).toDateString()));
      let s = 0; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (days.has(d.toDateString())) s++; else break; }
      return Math.min(s / 7 * 100, 100);
    })() },
  ];

  const unlocked = badges.filter(b => b.unlocked).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ ...S.card("#FFE66D"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={S.label}>BADGES EARNED</div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 52, fontWeight: 700, color: "#FFE66D", lineHeight: 1 }}>{unlocked}<span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)" }}>/{badges.length}</span></div>
        </div>
        <div style={{ fontSize: 48 }}>🏆</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {badges.map(b => (
          <div key={b.id} style={{ ...S.card(b.unlocked ? "#FFE66D" : "#444"), opacity: b.unlocked ? 1 : 0.6, position: "relative" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{b.icon}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: b.unlocked ? "#FFE66D" : "rgba(255,255,255,0.4)" }}>{b.title}</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 8 }}>{b.desc}</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${b.progress}%`, height: "100%", background: b.unlocked ? "#FFE66D" : "#888", borderRadius: 2, transition: "width 0.5s" }} />
            </div>
            {b.unlocked && <div style={{ position: "absolute", top: 8, right: 8, fontSize: 14 }}>✅</div>}
          </div>
        ))}
      </div>

      {/* Daily motivation */}
      <DailyMotivation />
    </div>
  );
}

function DailyMotivation() {
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(false);
  const tips = [
    "💧 Drink water before every workout — even mild dehydration drops performance by 10%.",
    "😴 Sleep 7-9 hours. Growth hormone peaks during deep sleep — it's when you actually build muscle.",
    "🍳 Eat protein within 30 minutes after training to maximize muscle repair.",
    "🧠 Consistency beats intensity. A moderate workout every day beats one brutal session per week.",
    "⏰ Morning workouts boost metabolism for up to 14 hours afterward.",
    "🧘 Rest days are part of training — overtraining leads to injury and stalled progress.",
    "📈 Track everything. People who log their workouts lose 30% more weight than those who don't.",
  ];

  const getDailyTip = () => tips[new Date().getDate() % tips.length];
  const [aiTip, setAiTip] = useState(null);

  const getAITip = async () => {
    setLoading(true);
    const t = await callClaude([{ role: "user", content: "Give me ONE powerful, specific fitness tip for today. Max 2 sentences. Start with an emoji." }]);
    setAiTip(t);
    setLoading(false);
  };

  return (
    <div style={S.card("#A78BFA")}>
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#A78BFA", marginBottom: 12 }}>💡 TODAY'S TIP</div>
      <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{aiTip || getDailyTip()}</div>
      <button onClick={getAITip} disabled={loading} style={{ ...S.btn("#A78BFA"), fontSize: 14, padding: "10px" }}>
        {loading ? "THINKING..." : "🤖 NEW AI TIP"}
      </button>
    </div>
  );
}

/* ─── AI COACH ───────────────────────────────────────────────────────────────── */
function AICoach() {
  const [coachTab, setCoachTab] = useState("chat"); // chat | weekly | monthly | plan
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [planGoal, setPlanGoal] = useState("fat_loss");
  const [planLevel, setPlanLevel] = useState("beginner");
  const [planDays, setPlanDays] = useState(4);
  const [anyLoading, setAnyLoading] = useState(false);
  const bottomRef = useRef(null);

  const calHistory = getLS("cal_history", []);
  const runHistory = getLS("run_history", []);
  const bodyHistory = getLS("body_history", []);
  const foodLog = getLS("food_log", []);
  const sleepLog = getLS("sleep_log", []);

  // ── helpers ──────────────────────────────────────────────────────────────
  const daysAgo = (n) => (new Date() - new Date(n)) / 86400000;

  const buildStats = (dayLimit) => {
    const cal = calHistory.filter(h => daysAgo(h.date) <= dayLimit);
    const run = runHistory.filter(h => daysAgo(h.date) <= dayLimit);
    const body = bodyHistory.filter(h => h.weight && daysAgo(h.date) <= dayLimit);
    const food = foodLog.filter(h => daysAgo(h.date) <= dayLimit);
    const sleep = sleepLog.filter(h => daysAgo(h.date) <= dayLimit);

    const workoutDays = new Set([...cal, ...run].map(h => new Date(h.date).toDateString())).size;
    const totalCalBurned = cal.reduce((s, h) => s + h.calories, 0);
    const totalDistance = run.reduce((s, h) => s + h.distance, 0).toFixed(1);
    const avgPace = run.length > 0 ? (run.reduce((s, h) => s + h.pace, 0) / run.length).toFixed(2) : null;
    const bestPace = run.length > 0 ? Math.min(...run.map(r => r.pace)).toFixed(2) : null;
    const startWeight = body.length > 0 ? +body[body.length - 1].weight : null;
    const endWeight = body.length > 0 ? +body[0].weight : null;
    const weightDelta = startWeight && endWeight ? (endWeight - startWeight).toFixed(1) : null;
    const avgSleep = sleep.length > 0 ? (sleep.reduce((s, h) => s + h.hours, 0) / sleep.length).toFixed(1) : null;
    const totalCalIn = food.reduce((s, f) => s + (f.calories || 0), 0);
    const activityTypes = [...new Set(cal.map(h => h.activity))];

    // Missed days (gaps in workout log)
    const missedDays = dayLimit - workoutDays;
    // Consistency % 
    const consistency = Math.round((workoutDays / dayLimit) * 100);

    return {
      workoutDays, totalCalBurned, totalDistance, avgPace, bestPace,
      startWeight, endWeight, weightDelta, avgSleep, totalCalIn,
      activityTypes, missedDays, consistency, runs: run.length,
      sessions: cal.length, dayLimit,
    };
  };

  const buildSystemPrompt = (stats) => `You are an elite personal fitness coach with access to real user workout data. Analyse their performance data and give direct, honest, data-driven coaching — call out weaknesses explicitly, celebrate genuine strengths. Never be vague. Use specific numbers from their data.

USER PERFORMANCE DATA:
- Period: Last ${stats.dayLimit} days
- Workout days: ${stats.workoutDays} / ${stats.dayLimit} (${stats.consistency}% consistency)
- Missed days: ${stats.missedDays}
- Total calories burned: ${stats.totalCalBurned} kcal
- Running sessions: ${stats.runs}, Total distance: ${stats.totalDistance} km
- Average pace: ${stats.avgPace ? `${Math.floor(stats.avgPace)}:${String(Math.round((stats.avgPace%1)*60)).padStart(2,"0")} /km` : "no runs"}
- Best pace: ${stats.bestPace ? `${Math.floor(stats.bestPace)}:${String(Math.round((stats.bestPace%1)*60)).padStart(2,"0")} /km` : "no runs"}
- Activity types done: ${stats.activityTypes.join(", ") || "none logged"}
- Weight change: ${stats.weightDelta !== null ? `${stats.weightDelta}kg` : "not tracked"}
- Avg sleep: ${stats.avgSleep ? `${stats.avgSleep}h` : "not tracked"}
- Calories consumed (logged): ${stats.totalCalIn} kcal total`;

  // ── weekly analysis ───────────────────────────────────────────────────────
  const getWeeklyAnalysis = async () => {
    setAnyLoading(true);
    const stats = buildStats(7);
    const prompt = `Analyse this user's last 7 days of fitness data and give a detailed coaching report.

Structure your response EXACTLY like this (use these exact emoji headers):

🏆 STRENGTHS THIS WEEK
[2-3 bullet points of genuine things they did well, with specific numbers]

⚠️ GAPS & WEAKNESSES
[2-3 bullet points of what's lacking, what they skipped, what needs improvement — be direct]

📊 KEY NUMBERS
[3-4 bullet points of the most important metrics and what they mean]

🎯 NEXT WEEK FOCUS
[2-3 specific, actionable things to improve next week]

Be direct. Call out missed days, poor consistency, or lack of variety if present. Keep each bullet under 2 lines.`;
    const reply = await callClaude([{ role: "user", content: prompt }], buildSystemPrompt(stats));
    setWeeklyReport(reply);
    setAnyLoading(false);
  };

  // ── monthly analysis ──────────────────────────────────────────────────────
  const getMonthlyAnalysis = async () => {
    setAnyLoading(true);
    const stats = buildStats(30);
    const weekStats = buildStats(7);
    const prompt = `Analyse this user's last 30 days AND compare with last 7 days to show trajectory.

Structure your response EXACTLY like this:

🌟 MONTHLY HIGHLIGHTS
[3 bullet points — best achievements of the month with numbers]

📉 AREAS FALLING BEHIND
[3 bullet points — honest assessment of what's consistently weak or missing. Don't sugar-coat.]

📈 PROGRESS TRAJECTORY
[Is the user improving, stagnating, or declining? Compare week vs month data. Be specific.]

💪 CONSISTENCY SCORE: ${stats.consistency}%
[One paragraph: what this score means, what's realistic, and what it would take to reach 80%+]

🗺️ NEXT MONTH TARGETS
[3 specific measurable goals for next month with exact numbers]

Last 7 days comparison: ${weekStats.workoutDays}/7 days active vs ${stats.workoutDays}/30 this month.`;
    const reply = await callClaude([{ role: "user", content: prompt }], buildSystemPrompt(stats));
    setMonthlyReport(reply);
    setAnyLoading(false);
  };

  // ── generate weekly exercise plan ────────────────────────────────────────
  const generateWeeklyPlan = async () => {
    setAnyLoading(true);
    setGeneratedPlan(null);
    const stats = buildStats(30);
    const prompt = `Create a personalised 7-day exercise plan for this user based on their actual performance data.

User context:
- Goal: ${planGoal.replace("_", " ")}
- Fitness level: ${planLevel}
- Desired active days: ${planDays} per week
- Recent consistency: ${stats.consistency}% (${stats.workoutDays} workouts in 30 days)
- Distance running background: ${stats.totalDistance}km in 30 days
- Activity variety: ${stats.activityTypes.join(", ") || "minimal"}
- Weight trend: ${stats.weightDelta !== null ? `${stats.weightDelta}kg in 30 days` : "not tracked"}

Design the plan to address their weaknesses (low consistency = include rest days strategically, limited variety = mix cardio + strength, etc).

Return ONLY valid JSON:
{
  "planName": "...",
  "weeklyGoal": "...",
  "coachNote": "one paragraph explaining WHY you designed it this way based on their data",
  "days": [
    {
      "day": "Monday",
      "type": "workout",
      "focus": "...",
      "intensity": "Low|Medium|High",
      "duration": 30,
      "exercises": [
        { "name": "...", "sets": 3, "reps": "10-12", "rest": "60s", "note": "..." }
      ],
      "targetCalories": 300,
      "tip": "..."
    }
  ],
  "weeklyTargets": {
    "totalCalories": 0,
    "totalDistance": 0,
    "workoutDays": ${planDays}
  }
}
For rest days set type to "rest" and exercises to [].`;

    try {
      const raw = await callClaude([{ role: "user", content: prompt }], "You are a certified personal trainer creating data-driven plans. Return valid JSON only. No markdown.");
      const clean = raw.replace(/```json|```/g, "").trim();
      setGeneratedPlan(JSON.parse(clean));
    } catch { setGeneratedPlan({ error: true }); }
    setAnyLoading(false);
  };

  // ── chat ──────────────────────────────────────────────────────────────────
  const stats7 = buildStats(7);
  const chatSystemPrompt = buildSystemPrompt(stats7) + "\n\nAnswer the user's question using their data. Be direct, specific, under 150 words.";

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    const reply = await callClaude(newMsgs, chatSystemPrompt);
    setMessages([...newMsgs, { role: "assistant", content: reply }]);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const starters = [
    "Why am I not losing weight?",
    "Am I overtraining?",
    "How do I break a plateau?",
    "Should I run more or train harder?",
    "What's my biggest weakness right now?",
  ];

  const intensityColor = { Low: "#4ECDC4", Medium: "#FFE66D", High: "#FF6B35" };

  const coachTabs = [
    { id: "chat", icon: "💬", label: "CHAT" },
    { id: "weekly", icon: "📅", label: "WEEK" },
    { id: "monthly", icon: "📆", label: "MONTH" },
    { id: "plan", icon: "✏️", label: "PLAN" },
  ];
 
  const renderReport = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      const isHeader = line.match(/^[🏆⚠️📊🎯🌟📉📈💪🗺️]/u);
      const isBullet = line.trim().startsWith("-") || line.trim().startsWith("•");
      return (
        <div key={i} style={{
          color: isHeader ? "#A78BFA" : isBullet ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.55)",
          fontFamily: isHeader ? "'Rajdhani', sans-serif" : "'Outfit', sans-serif",
          fontSize: isHeader ? 14 : 13,
          fontWeight: isHeader ? 700 : 400,
          letterSpacing: isHeader ? 1 : 0,
          lineHeight: 1.65,
          marginTop: isHeader ? 14 : 0,
          paddingLeft: isBullet ? 8 : 0,
        }}>{line || "\u00A0"}</div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(167,139,250,0.06))", borderRadius: 16, padding: "16px 18px", border: "1px solid rgba(167,139,250,0.25)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#A78BFA", letterSpacing: 2 }}>🧠 SMART COACH</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 2 }}>
            {stats7.workoutDays}/7 days active · {stats7.consistency}% consistency this week
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 28, fontWeight: 700, color: stats7.consistency >= 70 ? "#4ECDC4" : stats7.consistency >= 40 ? "#FFE66D" : "#FF6B35" }}>{stats7.consistency}%</div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 2 }}>CONSISTENCY</div>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
        {coachTabs.map(t => (
          <button key={t.id} onClick={() => setCoachTab(t.id)}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: coachTab === t.id ? "rgba(167,139,250,0.2)" : "transparent", fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: coachTab === t.id ? "#A78BFA" : "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 14 }}>{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CHAT ── */}
      {coachTab === "chat" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={S.sectionTitle}>ASK YOUR COACH</div>
              {starters.map(q => (
                <button key={q} onClick={() => setInput(q)}
                  style={{ padding: "12px 14px", background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.18)", borderRadius: 10, color: "rgba(255,255,255,0.65)", fontFamily: "'Outfit', sans-serif", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                  {q}
                </button>
              ))}
            </div>
          )}
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: 420 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "87%", padding: "11px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${m.role === "user" ? "rgba(167,139,250,0.28)" : "rgba(255,255,255,0.07)"}` }}>
                  <div style={{ color: m.role === "user" ? "#c4b5fd" : "rgba(255,255,255,0.8)", fontFamily: "'Outfit', sans-serif", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ padding: "12px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", color: "#A78BFA", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 3, display: "inline-block" }}>THINKING...</div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything about your training..." style={{ ...S.inp, flex: 1 }} />
            <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: input.trim() ? "#A78BFA" : "rgba(255,255,255,0.07)", color: input.trim() ? "#fff" : "rgba(255,255,255,0.25)", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>SEND</button>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontFamily: "'Rajdhani', sans-serif", fontSize: 11, cursor: "pointer", letterSpacing: 2 }}>CLEAR CHAT</button>
          )}
        </div>
      )}

      {/* ── WEEKLY ANALYSIS ── */}
      {coachTab === "weekly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quick stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "ACTIVE DAYS", val: `${stats7.workoutDays}/7`, color: stats7.workoutDays >= 4 ? "#4ECDC4" : stats7.workoutDays >= 2 ? "#FFE66D" : "#FF6B35" },
              { label: "CAL BURNED", val: stats7.totalCalBurned, color: "#FF6B35" },
              { label: "KM RAN", val: stats7.totalDistance, color: "#A78BFA" },
            ].map(s => (
              <div key={s.label} style={{ background: `${s.color}12`, border: `1px solid ${s.color}28`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Missed days callout */}
          {stats7.missedDays > 3 && (
            <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.22)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ color: "#ff6b6b", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14 }}>⚠️ {stats7.missedDays} MISSED DAYS THIS WEEK</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 4 }}>Your coach will flag this in the analysis below.</div>
            </div>
          )}

          <button onClick={getWeeklyAnalysis} disabled={anyLoading} style={{ ...S.btn("#A78BFA"), opacity: anyLoading ? 0.65 : 1 }}>
            {anyLoading ? "ANALYSING YOUR WEEK..." : "🔍 ANALYSE MY WEEK"}
          </button>

          {weeklyReport && (
            <div style={{ background: "rgba(167,139,250,0.06)", borderRadius: 16, padding: 18, border: "1px solid rgba(167,139,250,0.18)", animation: "fadeIn 0.35s ease" }}>
              {renderReport(weeklyReport)}
            </div>
          )}
        </div>
      )}

 {/* ── MONTHLY ANALYSIS ── */}
      {coachTab === "monthly" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Month stats */}
          {(() => {
            const s = buildStats(30);
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "WORKOUT DAYS", val: `${s.workoutDays}/30`, color: "#A78BFA" },
                  { label: "CONSISTENCY", val: `${s.consistency}%`, color: s.consistency >= 70 ? "#4ECDC4" : s.consistency >= 40 ? "#FFE66D" : "#FF6B35" },
                  { label: "TOTAL BURN", val: `${s.totalCalBurned} kcal`, color: "#FF6B35" },
                  { label: "WEIGHT CHANGE", val: s.weightDelta !== null ? `${s.weightDelta > 0 ? "+" : ""}${s.weightDelta}kg` : "—", color: s.weightDelta < 0 ? "#4ECDC4" : "#FFE66D" },
                  { label: "KM RAN", val: `${s.totalDistance}km`, color: "#A78BFA" },
                  { label: "AVG SLEEP", val: s.avgSleep ? `${s.avgSleep}h` : "—", color: s.avgSleep >= 7 ? "#4ECDC4" : "#FFE66D" },
                ].map(s2 => (
                  <div key={s2.label} style={{ background: `${s2.color}10`, border: `1px solid ${s2.color}22`, borderRadius: 12, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif" }}>{s2.label}</div>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: s2.color }}>{s2.val}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          <button onClick={getMonthlyAnalysis} disabled={anyLoading} style={{ ...S.btn("#4ECDC4"), opacity: anyLoading ? 0.65 : 1 }}>
            {anyLoading ? "ANALYSING YOUR MONTH..." : "📆 ANALYSE MY MONTH"}
          </button>

          {monthlyReport && (
            <div style={{ background: "rgba(78,205,196,0.05)", borderRadius: 16, padding: 18, border: "1px solid rgba(78,205,196,0.18)", animation: "fadeIn 0.35s ease" }}>
              {renderReport(monthlyReport)}
            </div>
          )}
        </div>
      )}

      {/* ── GENERATE PLAN ── */}
      {coachTab === "plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(255,107,53,0.07)", borderRadius: 14, padding: 14, border: "1px solid rgba(255,107,53,0.2)" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 15, fontWeight: 700, color: "#FF6B35", marginBottom: 4 }}>✏️ AI WEEKLY PLAN</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Built around your actual training history — not a generic template.</div>
          </div>

          <div>
            <label style={S.label}>YOUR GOAL</label>
            <select value={planGoal} onChange={e => setPlanGoal(e.target.value)} style={S.inp}>
              <option value="fat_loss">🔥 Fat Loss</option>
              <option value="muscle_tone">💪 Muscle Tone</option>
              <option value="cardio_endurance">🏃 Cardio Endurance</option>
              <option value="general_fitness">⚡ General Fitness</option>
            </select>
          </div>

          <div>
            <label style={S.label}>FITNESS LEVEL</label>
            <select value={planLevel} onChange={e => setPlanLevel(e.target.value)} style={S.inp}>
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced</option>
            </select>
          </div>

          <div>
            <label style={S.label}>WORKOUT DAYS PER WEEK: {planDays}</label>
            <input type="range" min={2} max={6} value={planDays} onChange={e => setPlanDays(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}><span>2 days</span><span>6 days</span></div>
          </div>

          {/* Show what data the AI has */}
          {(() => {
            const s = buildStats(30);
            return (
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2, marginBottom: 8 }}>YOUR DATA THE AI WILL USE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {[
                    `📅 ${s.workoutDays} workouts in last 30 days (${s.consistency}% consistency)`,
                    `🏃 ${s.totalDistance}km ran · ${s.runs} running sessions`,
                    `🔥 ${s.totalCalBurned} kcal burned total`,
                    s.weightDelta !== null ? `⚖️ Weight ${s.weightDelta > 0 ? "+" : ""}${s.weightDelta}kg this month` : `⚖️ Weight not tracked yet`,
                    s.activityTypes.length > 0 ? `💪 Activities: ${s.activityTypes.slice(0, 3).join(", ")}` : `💪 No activity variety logged`,
                  ].map((item, i) => (
                    <div key={i} style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{item}</div>
                  ))}
                </div>
              </div>
            );
          })()}

          <button onClick={generateWeeklyPlan} disabled={anyLoading} style={{ ...S.btn("#FF6B35"), opacity: anyLoading ? 0.65 : 1 }}>
            {anyLoading ? "BUILDING YOUR PLAN..." : "🤖 GENERATE MY WEEK PLAN"}
          </button>

          {generatedPlan?.error && (
            <div style={{ ...S.card("#ff4444"), color: "#ff9999" }}>Failed to generate. Try again.</div>
          )}

          {generatedPlan && !generatedPlan.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.35s ease" }}>
              {/* Plan header */}
              <div style={{ background: "linear-gradient(135deg, rgba(255,107,53,0.15), rgba(255,107,53,0.05))", borderRadius: 16, padding: 16, border: "1px solid rgba(255,107,53,0.25)" }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#FF6B35", marginBottom: 4 }}>{generatedPlan.planName}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 10 }}>{generatedPlan.weeklyGoal}</div>
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    { label: "ACTIVE DAYS", val: generatedPlan.weeklyTargets?.workoutDays },
                    { label: "TARGET BURN", val: `${generatedPlan.weeklyTargets?.totalCalories} kcal` },
                    { label: "TARGET KM", val: `${generatedPlan.weeklyTargets?.totalDistance} km` },
                  ].map(t => (
                    <div key={t.label} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#FF6B35" }}>{t.val}</div>
                      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, letterSpacing: 1 }}>{t.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              
              {/* Coach note */}
              {generatedPlan.coachNote && (
                <div style={{ background: "rgba(167,139,250,0.07)", borderRadius: 12, padding: 14, border: "1px solid rgba(167,139,250,0.18)" }}>
                  <div style={{ color: "#A78BFA", fontSize: 12, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2, marginBottom: 6 }}>🧠 WHY THIS PLAN</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6 }}>{generatedPlan.coachNote}</div>
                </div>
              )}

              {/* Day-by-day */}
              {generatedPlan.days?.map((day, i) => (
                <div key={i} style={{
                  background: day.type === "rest" ? "rgba(78,205,196,0.04)" : "rgba(255,255,255,0.03)",
                  borderRadius: 14, padding: 14,
                  border: `1px solid ${day.type === "rest" ? "rgba(78,205,196,0.15)" : "rgba(255,255,255,0.07)"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: day.exercises?.length > 0 ? 10 : 0 }}>
                    <div>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: day.type === "rest" ? "#4ECDC4" : "#fff" }}>{day.day}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{day.focus}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      {day.type !== "rest" && day.intensity && (
                        <span style={{ padding: "3px 10px", background: `${intensityColor[day.intensity]}20`, borderRadius: 12, color: intensityColor[day.intensity], fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{day.intensity}</span>
                      )}
                      {day.duration && day.type !== "rest" && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{day.duration} min</span>}
                      {day.targetCalories && <span style={{ color: "#FF6B35", fontSize: 11, fontFamily: "'Rajdhani', sans-serif" }}>~{day.targetCalories} kcal</span>}
                    </div>
                  </div>

                  {day.type === "rest" ? (
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>💤 Recovery day — light walk or stretching OK</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {day.exercises?.map((ex, j) => (
                        <div key={j} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}>{ex.name}</div>
                            <div style={{ color: "#FF6B35", fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700 }}>{ex.sets}×{ex.reps}</div>
                          </div>
                          <div style={{ display: "flex", gap: 12, marginTop: 3 }}>
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>Rest: {ex.rest}</span>
                            {ex.note && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontStyle: "italic" }}>· {ex.note}</span>}
                          </div>
                        </div>
                      ))}
                      {day.tip && (
                        <div style={{ color: "#FFE66D", fontSize: 12, padding: "6px 0", fontStyle: "italic" }}>💡 {day.tip}</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── LIFESTYLE ──────────────────────────────────────────────────────────────── */
function Lifestyle() {
  const today = new Date().toDateString();
  const [water, setWater] = useState(() => { const d = getLS("water_log", {}); return d[today] || 0; });
  const [sleep, setSleep] = useState(() => getLS("sleep_log", []).slice(0, 1)[0]?.hours || "");
  const [sleepHistory, setSleepHistory] = useState(() => getLS("sleep_log", []));
  const [calorieIn, setCalorieIn] = useState(() => { const d = getLS("calorie_in", {}); return d[today] || ""; });
  const calBurned = getLS("cal_history", []).filter(h => new Date(h.date).toDateString() === today).reduce((s, h) => s + h.calories, 0);

  const addWater = (glasses) => {
    const newVal = Math.max(0, water + glasses);
    setWater(newVal);
    const log = getLS("water_log", {}); log[today] = newVal; setLS("water_log", log);
  };

  const saveSleep = () => {
    if (!sleep) return;
    const newH = [{ hours: +sleep, date: new Date().toISOString() }, ...sleepHistory].slice(0, 30);
    setSleepHistory(newH);
    setLS("sleep_log", newH);
  };

  const saveCaloriesIn = () => {
    const log = getLS("calorie_in", {}); log[today] = +calorieIn; setLS("calorie_in", log);
  };

  const balance = calorieIn ? +calorieIn - calBurned : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Water */}
      <div style={S.card("#3B82F6")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#3B82F6", marginBottom: 12 }}>💧 WATER INTAKE</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 32, borderRadius: 6, background: i < water ? "#3B82F6" : "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", transition: "all 0.2s" }} />
          ))}
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 12 }}>{water} / 8 glasses ({(water * 250 / 1000).toFixed(1)}L)</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => addWater(1)} style={{ ...S.btn("#3B82F6"), flex: 1, padding: "12px" }}>+ Glass</button>
          <button onClick={() => addWater(-1)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(59,130,246,0.3)", background: "transparent", color: "#3B82F6", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>- Glass</button>
        </div>
      </div>

      {/* Sleep */}
      <div style={S.card("#8B5CF6")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#8B5CF6", marginBottom: 12 }}>😴 SLEEP TRACKER</div>
        <label style={S.label}>HOURS SLEPT LAST NIGHT</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" value={sleep} onChange={e => setSleep(e.target.value)} placeholder="7.5" min={0} max={24} step={0.5} style={{ ...S.inp, flex: 1 }} />
          <button onClick={saveSleep} style={{ padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "#8B5CF6", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14 }}>LOG</button>
        </div>
        {sleepHistory.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 50 }}>
              {sleepHistory.slice(0, 7).reverse().map((s, i) => {
                const h = (s.hours / 10) * 50;
                const color = s.hours >= 7 ? "#8B5CF6" : s.hours >= 6 ? "#FFE66D" : "#ff4444";
                return <div key={i} style={{ flex: 1, height: h, background: color, borderRadius: "3px 3px 0 0", position: "relative" }}>
                  <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", fontSize: 9, color, whiteSpace: "nowrap", fontFamily: "'Rajdhani', sans-serif" }}>{s.hours}h</div>
                </div>;
              })}
            </div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>Last 7 nights · {sleepHistory.length > 0 ? (sleepHistory.slice(0, 7).reduce((s, h) => s + h.hours, 0) / Math.min(sleepHistory.length, 7)).toFixed(1) : "--"}h avg</div>
          </div>
        )}
      </div>

      {/* Calorie balance */}
      <div style={S.card(balance === null ? "#888" : balance < 0 ? "#4ECDC4" : "#FF6B35")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: balance === null ? "rgba(255,255,255,0.5)" : balance < 0 ? "#4ECDC4" : "#FF6B35", marginBottom: 12 }}>⚖️ CALORIE BALANCE</div>
        <label style={S.label}>CALORIES CONSUMED TODAY</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input type="number" value={calorieIn} onChange={e => setCalorieIn(e.target.value)} placeholder="e.g. 1800" style={{ ...S.inp, flex: 1 }} />
          <button onClick={saveCaloriesIn} style={{ padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer", background: "#FF6B35", color: "#fff", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 14 }}>SET</button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          {[
            { label: "CONSUMED", val: calorieIn || "--", color: "#FF6B35" },
            { label: "BURNED", val: calBurned, color: "#4ECDC4" },
            { label: "BALANCE", val: balance !== null ? (balance > 0 ? `+${balance}` : balance) : "--", color: balance === null ? "rgba(255,255,255,0.3)" : balance < 0 ? "#4ECDC4" : "#FF6B35" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, letterSpacing: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {balance !== null && <div style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center" }}>{balance < -500 ? "Great deficit! On track for weight loss." : balance < 0 ? "Good! Slight calorie deficit." : balance < 300 ? "Near maintenance calories." : "Calorie surplus today."}</div>}
      </div>
    </div>
  );
}

/* ─── WORKOUT CALENDAR ───────────────────────────────────────────────────────── */
function WorkoutCalendar() {
  const [planned, setPlanned] = useState(() => getLS("planned_workouts", {}));
  const [selected, setSelected] = useState(null);
  const [workoutType, setWorkoutType] = useState("Run");
  const calHistory = getLS("cal_history", []);
  const runHistory = getLS("run_history", []);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const workoutDays = new Set([...calHistory, ...runHistory].map(h => new Date(h.date).toDateString()));
  const monthName = today.toLocaleString("default", { month: "long" });

  // Deload check
  const last28Days = Array.from({ length: 28 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toDateString(); });
  const activeCount = last28Days.filter(d => workoutDays.has(d)).length;
  const deloadSuggested = activeCount >= 20;

  // Consecutive training days
  let consecDays = 0;
  for (let i = 0; i < 28; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (workoutDays.has(d.toDateString())) consecDays++;
    else break;
  }
  const restSuggested = consecDays >= 5;

  const planDay = (day) => {
    const key = new Date(year, month, day).toDateString();
    const newPlanned = { ...planned, [key]: workoutType };
    setPlanned(newPlanned);
    setLS("planned_workouts", newPlanned);
    setSelected(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {deloadSuggested && (
        <div style={S.card("#FFE66D")}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#FFE66D" }}>⚠️ DELOAD WEEK RECOMMENDED</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>You've trained {activeCount} of the last 28 days. Consider a lighter week to prevent overtraining and let your body fully recover.</div>
        </div>
      )}

      {restSuggested && !deloadSuggested && (
        <div style={S.card("#4ECDC4")}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#4ECDC4" }}>💤 REST DAY SUGGESTED</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>{consecDays} consecutive training days. Rest today to recover and come back stronger.</div>
        </div>
      )}

      <div style={S.card("#4ECDC4")}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#4ECDC4", marginBottom: 16, textAlign: "center" }}>{monthName} {year}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = new Date(year, month, day).toDateString();
            const isToday = day === today.getDate();
            const done = workoutDays.has(dateStr);
            const hasPlan = planned[dateStr];
            const isPast = new Date(year, month, day) < today && !isToday;
            return (
              <button key={day} onClick={() => setSelected(selected === day ? null : day)}
                style={{ aspectRatio: "1", borderRadius: 8, border: isToday ? "2px solid #4ECDC4" : "1px solid rgba(255,255,255,0.06)", background: done ? "rgba(78,205,196,0.25)" : hasPlan ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.03)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 2 }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: isToday ? 700 : 400, color: done ? "#4ECDC4" : isToday ? "#fff" : "rgba(255,255,255,0.5)" }}>{day}</div>
                {done && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4ECDC4" }} />}
                {hasPlan && !done && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#A78BFA" }} />}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          <span>🟢 Done</span><span>🟣 Planned</span>
        </div>
      </div>

      {selected && (
        <div style={S.card("#A78BFA")}>
          <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#A78BFA", marginBottom: 12 }}>PLAN {monthName} {selected}</div>
          <select value={workoutType} onChange={e => setWorkoutType(e.target.value)} style={{ ...S.inp, marginBottom: 12 }}>
            {["Run", "Strength", "HIIT", "Cycling", "Rest", "Swimming", "Yoga"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => planDay(selected)} style={S.btn("#A78BFA")}>SCHEDULE {workoutType.toUpperCase()}</button>
        </div>
      )}
    </div>
  );
}

/* ─── CALORIMETER ────────────────────────────────────────────────────────────── */
function Calorimeter() {
  const [subTab, setSubTab] = useState("lookup"); // lookup | log | diet | kitchen
  const [foodInput, setFoodInput] = useState("");
  const [portion, setPortion] = useState(100);
  const [foodResult, setFoodResult] = useState(null);
  const [loadingFood, setLoadingFood] = useState(false);
  const [foodLog, setFoodLog] = useState(() => getLS("food_log", []));
  const [kitchenItems, setKitchenItems] = useState("");
  const [goal, setGoal] = useState("fat_loss");
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [tdeeWeight, setTdeeWeight] = useState(75);
  const [tdeeHeight, setTdeeHeight] = useState(175);
  const [tdeeAge, setTdeeAge] = useState(25);
  const [tdeeSex, setTdeeSex] = useState("male");
  const [tdeeActivity, setTdeeActivity] = useState("moderate");
  const [tdee, setTdee] = useState(null);

  const activityMult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };

  const calcTDEE = () => {
    const bmr = tdeeSex === "male"
      ? 10 * tdeeWeight + 6.25 * tdeeHeight - 5 * tdeeAge + 5
      : 10 * tdeeWeight + 6.25 * tdeeHeight - 5 * tdeeAge - 161;
    const maintenance = Math.round(bmr * activityMult[tdeeActivity]);
    setTdee({ maintenance, fat_loss: Math.round(maintenance * 0.8), aggressive: Math.round(maintenance * 0.65) });
  };

  const lookupFood = async () => {
    if (!foodInput.trim()) return;
    setLoadingFood(true);
    setFoodResult(null);
    const result = await callClaude(
      [{ role: "user", content: `Nutritional info for: "${foodInput}", portion: ${portion}g. Return ONLY JSON: { "food": "...", "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0, "tips": "brief note about this food for fat loss in 1 sentence" }` }],
      "You are a precise nutritionist. Return valid JSON only. All values per the given portion size in grams."
    );
    try {
      const clean = result.replace(/```json|```/g, "").trim();
      setFoodResult(JSON.parse(clean));
    } catch { setFoodResult({ error: true }); }
    setLoadingFood(false);
  };

  const logFood = () => {
    if (!foodResult || foodResult.error) return;
    const entry = { ...foodResult, portion, date: new Date().toISOString() };
    const newLog = [entry, ...foodLog].slice(0, 100);
    setFoodLog(newLog);
    setLS("food_log", newLog);
    setFoodInput(""); setFoodResult(null); setPortion(100);
    setSubTab("log");
  };

  const logFood = () => {
    if (!foodResult || foodResult.error) return;
    const entry = { ...foodResult, portion, date: new Date().toISOString() };
    const newLog = [entry, ...foodLog].slice(0, 100);
    setFoodLog(newLog);
    setLS("food_log", newLog);
    setFoodInput(""); setFoodResult(null); setPortion(100);
    setSubTab("log");
  };

  const genKitchenDiet = async () => {
    setLoadingDiet(true); setDietPlan(null);
    const prompt = `Create a 1-day fat-loss meal plan using ONLY these ingredients: "${kitchenItems}". Goal: ${goal}. Return ONLY JSON: { "dailyCalories": 0, "meals": [{ "name": "Breakfast", "time": "8:00 AM", "foods": ["..."], "calories": 0, "protein": 0, "prep": "..." }], "tips": ["..."] }`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], "You are a professional nutritionist. Return valid JSON only.");
      const clean = raw.replace(/```json|```/g, "").trim();
      setDietPlan(JSON.parse(clean));
    } catch { setDietPlan({ error: true }); }
    setLoadingDiet(false);
  };

  const genRapidFatLossDiet = async () => {
    setLoadingDiet(true); setDietPlan(null);
    const prompt = `Create an aggressive but healthy 1-day rapid fat loss meal plan. Target: ~1400 kcal, high protein (150g+), low carb. Include meal timing for fat loss. Return ONLY JSON: { "dailyCalories": 0, "meals": [{ "name": "...", "time": "...", "foods": ["..."], "calories": 0, "protein": 0, "prep": "..." }], "tips": ["..."] }`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], "You are a sports nutritionist specializing in fat loss. Return valid JSON only.");
      const clean = raw.replace(/```json|```/g, "").trim();
      setDietPlan(JSON.parse(clean));
    } catch { setDietPlan({ error: true }); }
    setLoadingDiet(false);
  };

  const todayLog = foodLog.filter(f => new Date(f.date).toDateString() === new Date().toDateString());
  const todayCalories = todayLog.reduce((s, f) => s + (f.calories || 0), 0);
  const todayProtein = todayLog.reduce((s, f) => s + (f.protein || 0), 0);

  const subTabs = [
    { id: "lookup", label: "SCAN", icon: "🔍" },
    { id: "log", label: "LOG", icon: "📋" },
    { id: "tdee", label: "TDEE", icon: "🧮" },
    { id: "kitchen", label: "CHEF", icon: "👨‍🍳" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: subTab === t.id ? "rgba(34,197,94,0.2)" : "transparent", fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: subTab === t.id ? "#22C55E" : "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 14 }}>{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>

      {/* Today summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "EATEN TODAY", val: todayCalories, unit: "kcal", color: "#22C55E" },
          { label: "PROTEIN", val: Math.round(todayProtein), unit: "g", color: "#F59E0B" },
          { label: "MEALS", val: todayLog.length, unit: "logged", color: "#3B82F6" },
        ].map(s => (
          <div key={s.label} style={{ background: `${s.color}12`, border: `1px solid ${s.color}30`, borderRadius: 12, padding: "12px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* LOOKUP */}
      {subTab === "lookup" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#22C55E", marginBottom: 12 }}>🔍 FOOD CALORIE SCANNER</div>
            <label style={S.label}>WHAT DID YOU EAT?</label>
            <input value={foodInput} onChange={e => setFoodInput(e.target.value)} onKeyDown={e => e.key === "Enter" && lookupFood()} placeholder="e.g. 2 boiled eggs, rice with chicken, banana..." style={{ ...S.inp, marginBottom: 12 }} />
            <label style={S.label}>PORTION SIZE: {portion}g</label>
            <input type="range" min={10} max={500} step={10} value={portion} onChange={e => setPortion(+e.target.value)} style={{ width: "100%", accentColor: "#22C55E", marginBottom: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.2)", fontSize: 11, marginBottom: 12 }}>
              <span>10g</span><span>500g</span>
            </div>
            <button onClick={lookupFood} disabled={loadingFood} style={{ ...S.btn("#22C55E"), opacity: loadingFood ? 0.7 : 1 }}>
              {loadingFood ? "ANALYZING..." : "GET NUTRITION INFO 🥗"}
            </button>
          </div>

          {foodResult && !foodResult.error && (
            <div style={{ background: "rgba(34,197,94,0.1)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.3)", animation: "fadeIn 0.3s ease" }}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#22C55E", marginBottom: 12 }}>{foodResult.food}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                {[
                  { label: "CALORIES", val: foodResult.calories, unit: "kcal", color: "#FF6B35" },
                  { label: "PROTEIN", val: `${foodResult.protein}g`, unit: "", color: "#F59E0B" },
                  { label: "CARBS", val: `${foodResult.carbs}g`, unit: "", color: "#3B82F6" },
                  { label: "FAT", val: `${foodResult.fat}g`, unit: "", color: "#EC4899" },
                ].map(n => (
                  <div key={n.label} style={{ textAlign: "center", background: `${n.color}15`, borderRadius: 10, padding: "10px 4px", border: `1px solid ${n.color}25` }}>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: n.color }}>{n.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 1 }}>{n.label}</div>
                  </div>
                ))}
              </div>
              {foodResult.tips && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontStyle: "italic", marginBottom: 12, lineHeight: 1.5 }}>💡 {foodResult.tips}</div>}
              <button onClick={logFood} style={S.btn("#22C55E")}>+ LOG THIS FOOD</button>
            </div>
          )}

          {/* Quick lookup buttons */}
          <div>
            <div style={S.sectionTitle}>QUICK ADD COMMON FOODS</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Boiled egg", "White rice 100g", "Banana", "Chicken breast 100g", "Roti", "Dal 1 cup", "Milk 200ml", "Apple", "Oats 50g", "Almonds 30g"].map(f => (
                <button key={f} onClick={() => { setFoodInput(f); setPortion(100); }}
                  style={{ padding: "7px 12px", borderRadius: 20, border: "1px solid rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)", color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", fontSize: 12, cursor: "pointer" }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOG */}
      {subTab === "log" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#22C55E", marginBottom: 4 }}>TODAY'S FOOD LOG</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          {todayLog.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", padding: "40px 0", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
              No food logged today<br /><span style={{ fontSize: 12 }}>Use SCAN tab to log meals</span>
            </div>
          ) : (
            todayLog.map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500 }}>{f.food}</div>
                  <div style={{ color: "#FF6B35", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{f.calories} kcal</div>
                </div>
                <div style={{ display: "flex", gap: 12, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                  <span>P: {f.protein}g</span><span>C: {f.carbs}g</span><span>F: {f.fat}g</span>
                  <span style={{ marginLeft: "auto" }}>{new Date(f.date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            ))
          )}
          {foodLog.filter(f => new Date(f.date).toDateString() !== new Date().toDateString()).length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", letterSpacing: 2 }}>PREVIOUS DAYS</summary>
              {foodLog.filter(f => new Date(f.date).toDateString() !== new Date().toDateString()).slice(0, 10).map((f, i) => (
                <div key={i} style={{ ...S.row }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{f.food} · {new Date(f.date).toLocaleDateString()}</span>
                  <span style={{ color: "#22C55E", fontFamily: "'Rajdhani', sans-serif" }}>{f.calories} kcal</span>
                </div>
              ))}
            </details>
          )}
        </div>
      )}

      {/* TDEE */}
      {subTab === "tdee" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(245,158,11,0.08)", borderRadius: 14, padding: 16, border: "1px solid rgba(245,158,11,0.2)" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>🧮 HOW MANY CALORIES TO EAT?</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Calculate your daily calorie targets</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "WEIGHT (KG)", val: tdeeWeight, set: setTdeeWeight, min: 40, max: 180 },
              { label: "HEIGHT (CM)", val: tdeeHeight, set: setTdeeHeight, min: 140, max: 220 },
              { label: "AGE", val: tdeeAge, set: setTdeeAge, min: 14, max: 80 },
            ].map(f => (
              <div key={f.label}>
                <label style={{ ...S.label, fontSize: 9 }}>{f.label}: {f.val}</label>
                <input type="range" min={f.min} max={f.max} value={f.val} onChange={e => f.set(+e.target.value)} style={{ width: "100%", accentColor: "#F59E0B" }} />
              </div>
            ))}
            <div>
              <label style={{ ...S.label, fontSize: 9 }}>SEX</label>
              <select value={tdeeSex} onChange={e => setTdeeSex(e.target.value)} style={{ ...S.inp, padding: "8px 10px", fontSize: 13 }}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label style={S.label}>ACTIVITY LEVEL</label>
            <select value={tdeeActivity} onChange={e => setTdeeActivity(e.target.value)} style={{ ...S.inp }}>
              <option value="sedentary">🪑 Sedentary (desk job, no exercise)</option>
              <option value="light">🚶 Light (1-3 days/week)</option>
              <option value="moderate">🏃 Moderate (3-5 days/week)</option>
              <option value="active">💪 Active (6-7 days/week)</option>
              <option value="very_active">🔥 Very Active (twice/day)</option>
            </select>
          </div>

          <button onClick={calcTDEE} style={S.btn("#F59E0B")}>CALCULATE MY CALORIES 🧮</button>

          {tdee && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, animation: "fadeIn 0.3s ease" }}>
              {[
                { label: "MAINTENANCE", sub: "Stay same weight", val: tdee.maintenance, color: "#3B82F6", icon: "⚖️" },
                { label: "FAT LOSS", sub: "Lose ~0.5kg/week", val: tdee.fat_loss, color: "#22C55E", icon: "🔥" },
                { label: "RAPID FAT LOSS", sub: "Lose ~1kg/week", val: tdee.aggressive, color: "#FF6B35", icon: "⚡" },
              ].map(t => (
                <div key={t.label} style={{ background: `${t.color}12`, border: `1px solid ${t.color}30`, borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, color: t.color, letterSpacing: 2 }}>{t.icon} {t.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{t.sub}</div>
                  </div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: t.color }}>{t.val}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}> kcal</span></div>
                </div>
              ))}
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.6 }}>
                  💡 <strong style={{ color: "rgba(255,255,255,0.7)" }}>Pro tip:</strong> Eat in 3 meals. Have your biggest meal post-workout. Cut processed carbs before bed. Prioritize protein at every meal — it keeps you full longest.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* KITCHEN / DIET PLAN */}
      {subTab === "kitchen" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: 14, padding: 16, border: "1px solid rgba(34,197,94,0.2)" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#22C55E", marginBottom: 4 }}>👨‍🍳 KITCHEN DIET PLAN</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Tell me what's in your kitchen — AI builds your diet plan</div>
          </div>

          <div>
            <label style={S.label}>WHAT'S IN YOUR KITCHEN?</label>
            <textarea value={kitchenItems} onChange={e => setKitchenItems(e.target.value)}
              placeholder="e.g. eggs, chicken, rice, spinach, tomatoes, oats, milk, banana, olive oil, lentils..."
              rows={4}
              style={{ ...S.inp, resize: "vertical", lineHeight: 1.6 }} />
          </div>

          <div>
            <label style={S.label}>GOAL</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} style={S.inp}>
              <option value="fat_loss">🔥 Fat Loss</option>
              <option value="muscle_gain">💪 Muscle Gain</option>
              <option value="maintenance">⚖️ Maintenance</option>
            </select>
          </div>

          <button onClick={genKitchenDiet} disabled={loadingDiet || !kitchenItems.trim()} style={{ ...S.btn("#22C55E"), opacity: loadingDiet || !kitchenItems.trim() ? 0.6 : 1 }}>
            {loadingDiet ? "BUILDING PLAN..." : "🥗 BUILD MY DIET PLAN"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif" }}>OR</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          <button onClick={genRapidFatLossDiet} disabled={loadingDiet} style={{ ...S.btn("#FF6B35"), opacity: loadingDiet ? 0.6 : 1 }}>
            {loadingDiet ? "GENERATING..." : "⚡ RAPID FAT LOSS DIET (AI)"}
          </button>

          {dietPlan?.error && <div style={{ ...S.card("#ff4444"), color: "#ff9999" }}>Failed to generate. Try again.</div>}

          {dietPlan && !dietPlan.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.3s ease" }}>
              <div style={{ ...S.card("#22C55E"), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, color: "#22C55E" }}>DAILY TOTAL</div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 36, fontWeight: 700, color: "#22C55E" }}>{dietPlan.dailyCalories} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>kcal</span></div>
              </div>
              {dietPlan.meals?.map((meal, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 14, border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#22C55E" }}>{meal.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{meal.time} · {meal.calories} kcal</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                    {meal.foods?.map((f, j) => (
                      <span key={j} style={{ padding: "4px 10px", background: "rgba(34,197,94,0.1)", borderRadius: 20, color: "rgba(255,255,255,0.7)", fontSize: 12, border: "1px solid rgba(34,197,94,0.2)" }}>{f}</span>
                    ))}
                  </div>
                  {meal.prep && <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontStyle: "italic" }}>🍳 {meal.prep}</div>}
                  <div style={{ color: "#F59E0B", fontSize: 12, marginTop: 4 }}>Protein: {meal.protein}g</div>
                </div>
              ))}
              {dietPlan.tips && (
                <div style={S.card("#F59E0B")}>
                  <div style={{ ...S.sectionTitle, color: "#F59E0B" }}>NUTRITION TIPS</div>
                  {dietPlan.tips.map((t, i) => <div key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, padding: "5px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>• {t}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── HOME EXERCISES ─────────────────────────────────────────────────────────── */
const HOME_EXERCISES = [
  // Cardio
  { id: "jumping_jacks", name: "Jumping Jacks", cat: "Cardio", icon: "⭐", kcal_min: 8, muscles: "Full Body", difficulty: "Easy", sets: "3×45s", rest: "30s", desc: "Stand with feet together, arms at sides. Jump spreading feet wide while raising arms overhead. Return and repeat.", tips: "Land softly on balls of feet. Keep core tight throughout." },
  { id: "burpees", name: "Burpees", cat: "Cardio", icon: "💥", kcal_min: 12, muscles: "Full Body", difficulty: "Hard", sets: "3×10", rest: "45s", desc: "From standing, squat down, place hands on floor, jump feet back to plank, do a push-up, jump feet forward, then jump up with arms overhead.", tips: "Scale by removing push-up or jump. Pace yourself." },
  { id: "high_knees", name: "High Knees", cat: "Cardio", icon: "🏃", kcal_min: 10, muscles: "Legs, Core", difficulty: "Medium", sets: "3×45s", rest: "30s", desc: "Run in place, driving knees up to hip level with each step. Pump arms for momentum.", tips: "Keep torso upright. Land on balls of feet, not heels." },
  { id: "mountain_climbers", name: "Mountain Climbers", cat: "Cardio", icon: "🧗", kcal_min: 11, muscles: "Core, Shoulders", difficulty: "Medium", sets: "3×40s", rest: "30s", desc: "Start in push-up position. Drive one knee toward chest, then switch rapidly — like running horizontally.", tips: "Keep hips level with shoulders. Don't let them rise up." },
  { id: "jump_rope_sim", name: "Jump Rope (Simulated)", cat: "Cardio", icon: "⚡", kcal_min: 11, muscles: "Calves, Cardio", difficulty: "Easy", sets: "3×60s", rest: "30s", desc: "Jump with feet together on the spot, rotating wrists as if holding a rope. Low jumps, stay on toes.", tips: "Keep jumps small — only 2-3cm off floor. Focus on rhythm." },
  { id: "box_step", name: "Box Step / Step Ups", cat: "Cardio", icon: "📦", kcal_min: 7, muscles: "Legs, Glutes", difficulty: "Easy", sets: "3×20 each", rest: "30s", desc: "Step up onto a step/chair with one foot, bring the other up, then step back down. Alternate lead foot.", tips: "Use a stable surface. Drive through the heel of the stepping foot." },
  { id: "squat_jumps", name: "Jump Squats", cat: "Cardio", icon: "🦘", kcal_min: 10, muscles: "Quads, Glutes", difficulty: "Medium", sets: "3×15", rest: "45s", desc: "Squat down to parallel, then explode upward into a jump. Land softly back into the squat position.", tips: "Land toe-heel-flat to absorb impact. Keep chest up." },
  { id: "lateral_shuffles", name: "Lateral Shuffles", cat: "Cardio", icon: "↔️", kcal_min: 8, muscles: "Legs, Core", difficulty: "Easy", sets: "3×30s", rest: "30s", desc: "In an athletic stance, shuffle sideways 3-4 steps left, then 3-4 steps right. Stay low in a semi-squat.", tips: "Don't cross feet. Keep knees bent throughout." },
  { id: "bear_crawl", name: "Bear Crawl", cat: "Cardio", icon: "🐻", kcal_min: 9, muscles: "Full Body, Core", difficulty: "Medium", sets: "3×20m", rest: "45s", desc: "On hands and feet with knees hovering 2cm above floor. Crawl forward moving opposite hand and foot together.", tips: "Keep back flat like a table. Move slowly and controlled." },
  { id: "speed_skaters", name: "Speed Skaters", cat: "Cardio", icon: "⛸️", kcal_min: 9, muscles: "Glutes, Inner Thigh", difficulty: "Medium", sets: "3×40s", rest: "30s", desc: "Leap laterally landing on one foot, sweeping other foot behind. Swing arms like a speed skater.", tips: "Lean forward from hips. Control landing — don't crash down." },
  // Strength
  { id: "pushups", name: "Push-Ups", cat: "Strength", icon: "💪", kcal_min: 7, muscles: "Chest, Triceps", difficulty: "Medium", sets: "3×15", rest: "60s", desc: "Hands shoulder-width, body straight from head to heels. Lower chest to floor, push back up.", tips: "Keep core tight. Don't let hips sag. Scale: drop to knees." },
  { id: "wide_pushups", name: "Wide Push-Ups", cat: "Strength", icon: "🤜", kcal_min: 7, muscles: "Chest (Outer)", difficulty: "Medium", sets: "3×12", rest: "60s", desc: "Like regular push-ups but hands placed wider than shoulders. Targets outer chest more.", tips: "Elbows flare out to sides. Full range of motion." },
  { id: "diamond_pushups", name: "Diamond Push-Ups", cat: "Strength", icon: "💎", kcal_min: 7, muscles: "Triceps, Inner Chest", difficulty: "Hard", sets: "3×10", rest: "60s", desc: "Form a diamond shape with thumbs and index fingers touching. Lower chest toward hands.", tips: "Keep elbows close to body. Very tricep focused." },
  { id: "squats", name: "Bodyweight Squats", cat: "Strength", icon: "🏋️", kcal_min: 6, muscles: "Quads, Glutes", difficulty: "Easy", sets: "3×20", rest: "45s", desc: "Feet shoulder-width. Sit back and down as if into a chair. Thighs parallel to floor, knees over toes.", tips: "Chest up, weight in heels. Pause briefly at the bottom." },
  { id: "lunges", name: "Reverse Lunges", cat: "Strength", icon: "🦵", kcal_min: 6, muscles: "Quads, Hamstrings", difficulty: "Medium", sets: "3×12 each", rest: "45s", desc: "From standing, step one foot back and lower that knee toward floor. Front thigh should be parallel to floor. Return and switch.", tips: "Keep front knee over ankle. Reverse lunges are easier on knees than forward." },
  { id: "glute_bridge", name: "Glute Bridge", cat: "Strength", icon: "🌉", kcal_min: 5, muscles: "Glutes, Hamstrings", difficulty: "Easy", sets: "3×20", rest: "30s", desc: "Lie on back, knees bent, feet flat. Drive hips up squeezing glutes, forming straight line from knees to shoulders. Hold 1s, lower.", tips: "Press through heels. Squeeze hard at the top." },
  { id: "plank", name: "Plank Hold", cat: "Core", icon: "🪵", kcal_min: 4, muscles: "Core, Shoulders", difficulty: "Medium", sets: "3×45s", rest: "30s", desc: "Forearms on floor, elbows under shoulders. Body straight from head to heels. Hold.", tips: "Don't hold breath. Brace abs like you're about to be punched." },
  { id: "side_plank", name: "Side Plank", cat: "Core", icon: "📐", kcal_min: 4, muscles: "Obliques, Core", difficulty: "Medium", sets: "3×30s each", rest: "30s", desc: "On one forearm, body straight sideways, feet stacked. Hold, then switch sides.", tips: "Stack feet or stagger for easier version. Keep hips lifted." },
  { id: "bicycle_crunch", name: "Bicycle Crunches", cat: "Core", icon: "🚲", kcal_min: 6, muscles: "Abs, Obliques", difficulty: "Medium", sets: "3×20", rest: "30s", desc: "Lie on back, hands behind head. Bring one knee toward chest while rotating elbow to meet it. Alternate sides.", tips: "Don't pull on neck. Slow, controlled — feel the oblique twist." },
  { id: "leg_raises", name: "Leg Raises", cat: "Core", icon: "🦶", kcal_min: 5, muscles: "Lower Abs", difficulty: "Medium", sets: "3×15", rest: "30s", desc: "Lie flat, arms by sides or under lower back. Lift legs straight up to 90°, lower slowly without touching floor.", tips: "Press lower back to floor throughout. Slow the descent." },
  { id: "superman", name: "Superman Hold", cat: "Core", icon: "🦸", kcal_min: 3, muscles: "Lower Back, Glutes", difficulty: "Easy", sets: "3×12", rest: "30s", desc: "Lie face down, arms extended. Simultaneously lift arms, chest, and legs off floor. Hold 2s, lower.", tips: "Don't strain neck — look at floor. Squeeze glutes at top." },
  { id: "wall_sit", name: "Wall Sit", cat: "Strength", icon: "🧱", kcal_min: 5, muscles: "Quads, Glutes", difficulty: "Medium", sets: "3×45s", rest: "45s", desc: "Back flat against wall, slide down until thighs are parallel to floor. Hold.", tips: "Keep knees at 90° and don't let them cave in. Push back into wall." },
  { id: "calf_raises", name: "Calf Raises", cat: "Strength", icon: "🦵", kcal_min: 3, muscles: "Calves", difficulty: "Easy", sets: "3×25", rest: "30s", desc: "Stand with feet hip-width. Rise onto balls of feet as high as possible. Lower slowly.", tips: "Do single-leg version for more challenge. Full range — all the way up and down." },
  { id: "tricep_dips", name: "Tricep Dips (Chair)", cat: "Strength", icon: "🪑", kcal_min: 6, muscles: "Triceps, Chest", difficulty: "Medium", sets: "3×12", rest: "45s", desc: "Hands on edge of chair behind you, legs extended. Bend elbows lowering hips toward floor, push back up.", tips: "Keep back close to chair. Don't let shoulders shrug up." },
  { id: "inchworm", name: "Inchworm", cat: "Flexibility", icon: "🪱", kcal_min: 5, muscles: "Hamstrings, Core, Shoulders", difficulty: "Easy", sets: "3×8", rest: "30s", desc: "Stand, hinge forward, walk hands out to plank. Optionally do a push-up. Walk feet to hands. Stand. Repeat.", tips: "Great warm-up exercise. Keep legs as straight as you can." },
];

const WEEKLY_PLANS = {
  fat_loss_beginner: {
    name: "Fat Loss — Beginner",
    goal: "Burn fat, build base fitness",
    days: [
      { day: "Monday", focus: "Full Body Cardio", exercises: ["jumping_jacks", "high_knees", "squats", "pushups", "plank"], rest: false },
      { day: "Tuesday", focus: "Active Rest", exercises: ["inchworm", "superman", "glute_bridge"], rest: true },
      { day: "Wednesday", focus: "Cardio Blast", exercises: ["burpees", "mountain_climbers", "lateral_shuffles", "jump_rope_sim", "bicycle_crunch"], rest: false },
      { day: "Thursday", focus: "Rest Day", exercises: [], rest: true },
      { day: "Friday", focus: "Strength + Core", exercises: ["squats", "lunges", "pushups", "glute_bridge", "leg_raises", "side_plank"], rest: false },
      { day: "Saturday", focus: "Cardio Circuit", exercises: ["squat_jumps", "speed_skaters", "bear_crawl", "box_step", "plank"], rest: false },
      { day: "Sunday", focus: "Full Rest", exercises: [], rest: true },
    ]
  },
  fat_loss_intermediate: {
    name: "Fat Loss — Intermediate",
    goal: "Accelerate fat burn with HIIT",
    days: [
      { day: "Monday", focus: "HIIT Cardio", exercises: ["burpees", "squat_jumps", "mountain_climbers", "high_knees", "speed_skaters"], rest: false },
      { day: "Tuesday", focus: "Upper Body", exercises: ["pushups", "wide_pushups", "diamond_pushups", "tricep_dips", "plank", "side_plank"], rest: false },
      { day: "Wednesday", focus: "Active Recovery", exercises: ["inchworm", "superman", "glute_bridge", "calf_raises"], rest: true },
      { day: "Thursday", focus: "Lower Body Burn", exercises: ["squat_jumps", "lunges", "wall_sit", "glute_bridge", "calf_raises"], rest: false },
      { day: "Friday", focus: "Core + Cardio", exercises: ["mountain_climbers", "bicycle_crunch", "leg_raises", "plank", "bear_crawl", "jumping_jacks"], rest: false },
      { day: "Saturday", focus: "Full Body Circuit", exercises: ["burpees", "pushups", "squats", "plank", "high_knees", "superman"], rest: false },
      { day: "Sunday", focus: "Full Rest", exercises: [], rest: true },
    ]
  },
  strength_home: {
    name: "Home Strength Builder",
    goal: "Build muscle without equipment",
    days: [
      { day: "Monday", focus: "Push Day", exercises: ["pushups", "wide_pushups", "diamond_pushups", "tricep_dips", "plank"], rest: false },
      { day: "Tuesday", focus: "Legs", exercises: ["squats", "lunges", "squat_jumps", "wall_sit", "glute_bridge", "calf_raises"], rest: false },
      { day: "Wednesday", focus: "Rest", exercises: [], rest: true },
      { day: "Thursday", focus: "Core Day", exercises: ["plank", "side_plank", "bicycle_crunch", "leg_raises", "superman", "mountain_climbers"], rest: false },
      { day: "Friday", focus: "Full Body", exercises: ["burpees", "pushups", "squats", "glute_bridge", "inchworm"], rest: false },
      { day: "Saturday", focus: "Cardio", exercises: ["jumping_jacks", "high_knees", "jump_rope_sim", "lateral_shuffles", "bear_crawl"], rest: false },
      { day: "Sunday", focus: "Rest", exercises: [], rest: true },
    ]
  },
};
function HomeExercises() {
  const [subTab, setSubTab] = useState("browse"); // browse | workout | plan
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedEx, setSelectedEx] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("fat_loss_beginner");
  const [workoutDay, setWorkoutDay] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [activeExercise, setActiveExercise] = useState(null);
  const [exTimer, setExTimer] = useState(0);
  const [exRunning, setExRunning] = useState(false);
  const exTimerRef = useRef(null);
  const [aiWorkout, setAiWorkout] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiGoal, setAiGoal] = useState("fat_loss");
  const [aiDuration, setAiDuration] = useState(20);
  const [aiLevel, setAiLevel] = useState("beginner");

  const cats = ["All", "Cardio", "Strength", "Core", "Flexibility"];

  const filtered = selectedCat === "All" ? HOME_EXERCISES : HOME_EXERCISES.filter(e => e.cat === selectedCat);
  const plan = WEEKLY_PLANS[selectedPlan];
  const today = new Date().toLocaleDateString("en", { weekday: "long" });
  const todayWorkout = plan.days.find(d => d.day === today);

  useEffect(() => {
    if (exRunning) {
      exTimerRef.current = setInterval(() => setExTimer(t => t + 1), 1000);
    } else clearInterval(exTimerRef.current);
    return () => clearInterval(exTimerRef.current);
  }, [exRunning]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const genAIWorkout = async () => {
    setLoadingAI(true); setAiWorkout(null);
    const exerciseNames = HOME_EXERCISES.map(e => e.name).join(", ");
    const prompt = `Create a ${aiDuration}-minute home workout for a ${aiLevel} with goal: ${aiGoal}. Use ONLY exercises from this list: ${exerciseNames}. Return ONLY JSON: { "name": "...", "totalMinutes": ${aiDuration}, "warmup": [{"exercise":"...","duration":"...","note":"..."}], "main": [{"exercise":"...","sets":0,"reps":"...","rest":"...","note":"..."}], "cooldown": [{"exercise":"...","duration":"...","note":"..."}], "calories": 0 }`;
    try {
      const raw = await callClaude([{ role: "user", content: prompt }], "You are a certified personal trainer. Return valid JSON only.");
      const clean = raw.replace(/```json|```/g, "").trim();
      setAiWorkout(JSON.parse(clean));
    } catch { setAiWorkout({ error: true }); }
    setLoadingAI(false);
  };

  const diffColor = { Easy: "#22C55E", Medium: "#F59E0B", Hard: "#FF6B35" };
  const catColor = { Cardio: "#FF6B35", Strength: "#A78BFA", Core: "#3B82F6", Flexibility: "#22C55E" };

  const subTabs = [
    { id: "browse", label: "BROWSE", icon: "🤸" },
    { id: "plan", label: "WEEK PLAN", icon: "📅" },
    { id: "workout", label: "AI WORKOUT", icon: "🤖" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 4 }}>
        {subTabs.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            style={{ flex: 1, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: subTab === t.id ? "rgba(255,107,53,0.2)" : "transparent", fontFamily: "'Rajdhani', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, color: subTab === t.id ? "#FF6B35" : "rgba(255,255,255,0.3)" }}>
            <div style={{ fontSize: 14 }}>{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>

      {/* BROWSE */}
      {subTab === "browse" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Category filter */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {cats.map(c => (
              <button key={c} onClick={() => setSelectedCat(c)}
                style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${selectedCat === c ? "#FF6B35" : "rgba(255,255,255,0.1)"}`, background: selectedCat === c ? "rgba(255,107,53,0.15)" : "transparent", color: selectedCat === c ? "#FF6B35" : "rgba(255,255,255,0.4)", fontFamily: "'Rajdhani', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {c}
              </button>
            ))}
          </div>

          {/* Exercise list or detail */}
          {selectedEx ? (
            <div style={{ animation: "fadeIn 0.25s ease" }}>
              <button onClick={() => setSelectedEx(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontFamily: "'Rajdhani', sans-serif", fontSize: 13, cursor: "pointer", marginBottom: 12, padding: 0, letterSpacing: 2 }}>← BACK</button>
              <div style={{ background: `${catColor[selectedEx.cat]}12`, borderRadius: 16, padding: 18, border: `1px solid ${catColor[selectedEx.cat]}30` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 4 }}>{selectedEx.icon}</div>
                    <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff" }}>{selectedEx.name}</div>
                    <div style={{ color: catColor[selectedEx.cat], fontSize: 12, letterSpacing: 2, fontFamily: "'Rajdhani', sans-serif" }}>{selectedEx.cat} · {selectedEx.muscles}</div>
                  </div>
                  <span style={{ padding: "4px 10px", background: `${diffColor[selectedEx.difficulty]}20`, borderRadius: 20, color: diffColor[selectedEx.difficulty], fontSize: 11, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{selectedEx.difficulty}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "SETS/REPS", val: selectedEx.sets },
                    { label: "REST", val: selectedEx.rest },
                    { label: "KCAL/MIN", val: `~${selectedEx.kcal_min}` },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>{s.val}</div>
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 1 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={S.sectionTitle}>HOW TO DO IT</div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7 }}>{selectedEx.desc}</div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 12, marginBottom: 14 }}>
                  <div style={{ color: "#F59E0B", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>💡 PRO TIP</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.5 }}>{selectedEx.tips}</div>
                </div>

                {/* Exercise timer */}
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 48, fontWeight: 700, color: exRunning ? "#FF6B35" : "#fff" }}>{fmt(exTimer)}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => { setExRunning(r => !r); setActiveExercise(selectedEx.id); }}
                      style={{ ...S.btn(exRunning ? "#ff4444" : "#FF6B35"), flex: 2, padding: "12px" }}>
                      {exRunning ? "⏸ PAUSE" : exTimer > 0 ? "▶ RESUME" : "▶ START EXERCISE"}
                    </button>
                    {exTimer > 0 && !exRunning && (
                      <button onClick={() => { setExTimer(0); setExRunning(false); }}
                        style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.4)", fontFamily: "'Rajdhani', sans-serif", cursor: "pointer" }}>RESET</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 3 }}>{filtered.length} EXERCISES</div>
              {filtered.map(ex => (
                <button key={ex.id} onClick={() => setSelectedEx(ex)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", textAlign: "left", width: "100%", transition: "background 0.15s" }}>
                  <div style={{ fontSize: 28, minWidth: 36, textAlign: "center" }}>{ex.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{ex.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>{ex.muscles} · {ex.sets}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ padding: "3px 8px", background: `${catColor[ex.cat]}15`, borderRadius: 12, color: catColor[ex.cat], fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>{ex.cat}</span>
                    <span style={{ color: diffColor[ex.difficulty], fontSize: 10, fontFamily: "'Rajdhani', sans-serif" }}>{ex.difficulty}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WEEKLY PLAN */}
      {subTab === "plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={S.label}>CHOOSE YOUR PLAN</label>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={S.inp}>
              {Object.entries(WEEKLY_PLANS).map(([k, v]) => (
                <option key={k} value={k}>{v.name} — {v.goal}</option>
              ))}
            </select>
          </div>

          {/* Today highlight */}
          {todayWorkout && (
            <div style={{ background: todayWorkout.rest ? "rgba(78,205,196,0.08)" : "rgba(255,107,53,0.1)", borderRadius: 16, padding: 16, border: `1px solid ${todayWorkout.rest ? "rgba(78,205,196,0.2)" : "rgba(255,107,53,0.25)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: todayWorkout.rest ? "#4ECDC4" : "#FF6B35" }}>TODAY · {todayWorkout.day.toUpperCase()}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{todayWorkout.focus}</div>
              </div>
              {todayWorkout.rest ? (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>💤 Rest & recover today. Your muscles grow during rest.</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {todayWorkout.exercises.map(id => {
                    const ex = HOME_EXERCISES.find(e => e.id === id);
                    return ex ? (
                      <button key={id} onClick={() => { setSelectedEx(ex); setSubTab("browse"); }}
                        style={{ padding: "6px 12px", background: completedExercises.has(id) ? "rgba(34,197,94,0.2)" : "rgba(255,107,53,0.1)", borderRadius: 20, border: `1px solid ${completedExercises.has(id) ? "rgba(34,197,94,0.4)" : "rgba(255,107,53,0.2)"}`, color: completedExercises.has(id) ? "#22C55E" : "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif", fontSize: 12, cursor: "pointer" }}>
                        {completedExercises.has(id) ? "✅ " : ""}{ex.icon} {ex.name}
                      </button>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Full week */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={S.sectionTitle}>FULL WEEK</div>
            {plan.days.map((d, i) => {
              const isToday = d.day === today;
              return (
                <div key={i} style={{ background: isToday ? "rgba(255,107,53,0.06)" : "rgba(255,255,255,0.02)", borderRadius: 14, padding: "12px 14px", border: `1px solid ${isToday ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: d.exercises.length > 0 ? 8 : 0 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 14, fontWeight: 700, color: isToday ? "#FF6B35" : "rgba(255,255,255,0.5)", minWidth: 80 }}>{d.day.slice(0, 3).toUpperCase()}{isToday ? " •" : ""}</div>
                      <div style={{ color: d.rest ? "#4ECDC4" : "rgba(255,255,255,0.6)", fontSize: 12 }}>{d.focus}</div>
                    </div>
                    {!d.rest && <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{d.exercises.length} exercises</div>}
                  </div>
                  {d.exercises.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {d.exercises.map(id => {
                        const ex = HOME_EXERCISES.find(e => e.id === id);
                        return ex ? <span key={id} style={{ padding: "3px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 12, color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{ex.icon} {ex.name}</span> : null;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI WORKOUT GENERATOR */}
      {subTab === "workout" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "rgba(167,139,250,0.08)", borderRadius: 14, padding: 16, border: "1px solid rgba(167,139,250,0.2)" }}>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#A78BFA", marginBottom: 4 }}>🤖 AI WORKOUT BUILDER</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Custom home workout, no equipment needed</div>
          </div>

          {[
            { label: "GOAL", node: <select value={aiGoal} onChange={e => setAiGoal(e.target.value)} style={S.inp}><option value="fat_loss">🔥 Rapid Fat Loss</option><option value="muscle_tone">💪 Tone & Strengthen</option><option value="cardio">🏃 Cardio Endurance</option><option value="full_body">⚡ Full Body Blast</option></select> },
            { label: "FITNESS LEVEL", node: <select value={aiLevel} onChange={e => setAiLevel(e.target.value)} style={S.inp}><option value="beginner">🟢 Beginner</option><option value="intermediate">🟡 Intermediate</option><option value="advanced">🔴 Advanced</option></select> },
          ].map(f => <div key={f.label}><label style={S.label}>{f.label}</label>{f.node}</div>)}

          <div>
            <label style={S.label}>DURATION: {aiDuration} MINUTES</label>
            <input type="range" min={10} max={60} step={5} value={aiDuration} onChange={e => setAiDuration(+e.target.value)} style={{ width: "100%", accentColor: "#A78BFA" }} />
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 4 }}><span>10</span><span>60 min</span></div>
          </div>

          <button onClick={genAIWorkout} disabled={loadingAI} style={{ ...S.btn("#A78BFA"), opacity: loadingAI ? 0.7 : 1 }}>
            {loadingAI ? "BUILDING WORKOUT..." : "🤖 GENERATE WORKOUT"}
          </button>

          {aiWorkout?.error && <div style={{ ...S.card("#ff4444"), color: "#ff9999" }}>Generation failed. Try again.</div>}

          {aiWorkout && !aiWorkout.error && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.3s ease" }}>
              <div style={{ ...S.card("#A78BFA"), display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#A78BFA" }}>{aiWorkout.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{aiWorkout.totalMinutes} min · ~{aiWorkout.calories} kcal</div>
                </div>
                <div style={{ fontSize: 28 }}>🤸</div>
              </div>

              {[
                { title: "🔥 WARM UP", items: aiWorkout.warmup, color: "#F59E0B", isSet: false },
                { title: "💪 MAIN WORKOUT", items: aiWorkout.main, color: "#FF6B35", isSet: true },
                { title: "🧘 COOL DOWN", items: aiWorkout.cooldown, color: "#4ECDC4", isSet: false },
              ].map(section => section.items?.length > 0 && (
                <div key={section.title} style={{ background: `${section.color}08`, borderRadius: 14, padding: 14, border: `1px solid ${section.color}20` }}>
                  <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700, color: section.color, letterSpacing: 2, marginBottom: 10 }}>{section.title}</div>
                  {section.items.map((item, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 500 }}>{item.exercise}</div>
                        <div style={{ color: section.color, fontFamily: "'Rajdhani', sans-serif", fontSize: 13, fontWeight: 700 }}>
                          {section.isSet ? `${item.sets}×${item.reps}` : item.duration}
                        </div>
                      </div>
                      {item.note && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 2 }}>💡 {item.note}</div>}
                      {section.isSet && item.rest && <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>Rest: {item.rest}</div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState("calories");
  const [menuOpen, setMenuOpen] = useState(false);

  const tabComponents = {
    calories: <CalorieBurn />,
    running: <RunningTracker />,
    aiplan: <AIPlan />,
    bodyscan: <BodyScan />,
    analytics: <Analytics />,
    tools: <SmartTools />,
    goals: <Goals />,
    coach: <AICoach />,
    lifestyle: <Lifestyle />,
    calendar: <WorkoutCalendar />,
    calorimeter: <Calorimeter />,
    exercises: <HomeExercises />,
  };

  const activeTabInfo = TABS.find(t => t.id === activeTab);
  const visibleTabs = TABS.slice(0, 5);
  const moreTabs = TABS.slice(5);

  return (
    <>
      <FontLink />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #0a0a0a; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: currentColor; cursor: pointer; }
        select option { background: #1a1a1a; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#fff", fontFamily: "'Outfit', sans-serif", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700, letterSpacing: 3, color: "#fff" }}>
              FIT<span style={{ color: "#FF6B35" }}>FORGE</span>
            </div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 2, fontFamily: "'Rajdhani', sans-serif" }}>
              {activeTabInfo?.label}
            </div>
          </div>
          <div style={{ fontSize: 24 }}>{activeTabInfo?.icon}</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "20px 20px 100px", overflowY: "auto" }}>
          <div style={{ animation: "fadeIn 0.3s ease" }} key={activeTab}>
            {tabComponents[activeTab]}
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 0 12px", zIndex: 100 }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {visibleTabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", minWidth: 52 }}>
                <div style={{ fontSize: 20, filter: activeTab === tab.id ? "none" : "grayscale(1) opacity(0.4)" }}>{tab.icon}</div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 9, letterSpacing: 1, color: activeTab === tab.id ? "#FF6B35" : "rgba(255,255,255,0.3)", fontWeight: activeTab === tab.id ? 700 : 400 }}>{tab.label}</div>
              </button>
            ))}
            {/* More button */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenuOpen(m => !m)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", minWidth: 52 }}>
                <div style={{ fontSize: 20, filter: moreTabs.some(t => t.id === activeTab) ? "none" : "grayscale(1) opacity(0.4)" }}>⋯</div>
                <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 9, letterSpacing: 1, color: moreTabs.some(t => t.id === activeTab) ? "#FF6B35" : "rgba(255,255,255,0.3)", fontWeight: 700 }}>MORE</div>
              </button>
              {menuOpen && (
                <div style={{ position: "absolute", bottom: "100%", right: 0, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 8, minWidth: 160, boxShadow: "0 -8px 30px rgba(0,0,0,0.5)", zIndex: 200 }}>
                  {moreTabs.map(tab => (
                    <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMenuOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: activeTab === tab.id ? "rgba(255,107,53,0.1)" : "none", border: "none", borderRadius: 10, cursor: "pointer", padding: "10px 12px", color: activeTab === tab.id ? "#FF6B35" : "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}>
                      <span>{tab.icon}</span><span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
