import { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState("");

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
        "attendance","tuition_hours_per_week"
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

      {/* Recommendations removed from frontend; backend will provide guidance */}
    </div>
  );
}

export default App;
