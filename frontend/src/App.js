import { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState("");
  const [tips, setTips] = useState([]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const payload = {
      term_mark_avg: Number(form.term_mark_avg),
      prev_term_mark_avg: Number(form.prev_term_mark_avg),
      daily_study: Number(form.daily_study),
      prefer_study: Number(form.prefer_study),
      travel_time: Number(form.travel_time),
      financial_status: Number(form.financial_status),
      social_media: Number(form.social_media),
      sleep_hours: Number(form.sleep_hours),
      attendance: Number(form.attendance),
      tuition_hours_per_week: Number(form.tuition_hours_per_week)
    };

    const res = await axios.post("http://localhost:5000/api/predict", payload);
    setResult(res.data.stress_level);
    generateTips(payload, res.data.stress_level);
  };

const generateTips = (d, level) => {
  let t = [];

  // UNIVERSAL ACADEMIC ADVICE
  if (d.term_mark_avg < 50)
    t.push("Your academic performance is low. Create a weekly revision plan and consult subject teachers.");

  if (d.prev_term_mark_avg - d.term_mark_avg > 10)
    t.push("Your performance has dropped significantly compared to last term. Identify weak subjects early.");

  // SLEEP ANALYSIS
  if (d.sleep_hours < 5)
    t.push("You are severely sleep deprived. Target at least 7–8 hours of sleep daily.");

  else if (d.sleep_hours < 6.5)
    t.push("Your sleep duration is below healthy range. Try going to bed 1 hour earlier.");

  // ATTENDANCE & COMMITMENT
  if (d.attendance < 60)
    t.push("Your attendance is critically low. Meet your class teacher and create a recovery plan.");

  else if (d.attendance < 75)
    t.push("Improve your attendance to avoid academic penalties.");

  // SOCIAL MEDIA & DISTRACTION
  if (d.social_media >= 3)
    t.push("High social media usage detected. Limit screen time during study hours.");

  // TUITION LOAD
  if (d.tuition_hours_per_week > 12)
    t.push("Too many tuition hours may cause burnout. Review and prioritize essential classes only.");

  // FINANCIAL STRESS
  if (d.financial_status === 1)
    t.push("Financial pressure may be affecting your studies. Seek scholarship or counseling support.");

  // TRAVEL FATIGUE
  if (d.travel_time >= 4)
    t.push("Long travel hours detected. Try optimizing your schedule to reduce fatigue.");

  // (disaster_impact removed from UI) external-impact checks handled server-side

  // FINAL RISK-LEVEL BASED GUIDANCE
  if (level === "Awful") {
    t.push("⚠ Immediate academic intervention recommended.");
    t.push("Book a meeting with school counselor this week.");
  }

  if (level === "Bad") {
    t.push("Your stress level is rising. Implement these changes within 7 days.");
  }

  if (level === "Good") {
    t.push("You are managing well. Continue your balanced academic routine.");
  }

  setTips(t);
};


  const displayLabel = () => {
    if (result === "Good") return "Low Risk";
    if (result === "Bad") return "Moderate Risk";
    if (result === "Awful") return "High Risk";
    return "";
  };

  return (
    <div style={{ padding: "20px", maxWidth: "420px", margin: "auto" }}>
      <h2>Edu Monitor AI – Stress Level Predictor</h2>

      {[
        "term_mark_avg","prev_term_mark_avg","daily_study","prefer_study",
        "travel_time","financial_status","social_media","sleep_hours",
        "attendance","tuition_hours_per_week","disaster_impact"
      ].map(f => (
        <input
          key={f}
          name={f}
          onChange={handleChange}
          placeholder={f}
          style={{ width:"100%", margin:"5px", padding:"6px" }}
        />
      ))}

      <button onClick={submit}>Predict Stress Level</button>

      <h3>Stress Level: {displayLabel()}</h3>

      <ul>
        {tips.map((tip, i) => <li key={i}>{tip}</li>)}
      </ul>
    </div>
  );
}

export default App;
