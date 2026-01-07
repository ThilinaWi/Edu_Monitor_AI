import { useState } from "react";
import axios from "axios";

function Dashboard() {
  const [currentView, setCurrentView] = useState("stress-prediction");
  const [studentData, setStudentData] = useState({
    name: "Kasun",
    id: "ST001",
    grade: "11-A",
    stressScore: null
  });
  
  const [formData, setFormData] = useState({
    term_mark_avg: "",
    prev_term_mark_avg: "",
    daily_study: "",
    travel_time: "",
    financial_status: "0",
    social_media: "",
    sleep_hours: "",
    attendance: "",
    tuition_hours_per_week: "",
    disaster_impact: "0"
  });

  const [prediction, setPrediction] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitPrediction = async () => {
    try {
      const payload = {
        studentId: studentData.id,
        term_mark_avg: Number(formData.term_mark_avg),
        prev_term_mark_avg: Number(formData.prev_term_mark_avg),
        daily_study: Number(formData.daily_study),
        prefer_study: 0,
        travel_time: Number(formData.travel_time),
        financial_status: Number(formData.financial_status),
        social_media: Number(formData.social_media),
        sleep_hours: Number(formData.sleep_hours),
        attendance: Number(formData.attendance),
        tuition_hours_per_week: Number(formData.tuition_hours_per_week),
        disaster_impact: Number(formData.disaster_impact)
      };

      const res = await axios.post("http://localhost:5000/api/predict", payload);
      
      setPrediction(res.data.stress_level);
      setRecommendations(res.data.ai_recommendations || []);
      setStudentData({ ...studentData, stressScore: res.data.prediction_code * 12.5 + 25 });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const getStressColor = () => {
    if (!prediction) return "#94a3b8";
    if (prediction === "Good") return "#14b8a6";
    if (prediction === "Bad") return "#f59e0b";
    return "#ef4444";
  };

  const getWellnessFactors = () => {
    return [
      {
        icon: "🌙",
        title: "Sleep Hours",
        value: formData.sleep_hours || "0",
        target: "8",
        unit: "hrs/night",
        status: Number(formData.sleep_hours) >= 7 ? "On track" : "Needs attention",
        color: Number(formData.sleep_hours) >= 7 ? "#14b8a6" : "#f59e0b"
      },
      {
        icon: "📚",
        title: "Study Hours",
        value: formData.daily_study || "0",
        target: "4",
        unit: "hrs/day",
        status: Number(formData.daily_study) >= 3 ? "On track" : "Below target",
        color: Number(formData.daily_study) >= 3 ? "#14b8a6" : "#f59e0b"
      },
      {
        icon: "📝",
        title: "Tuition Hours",
        value: formData.tuition_hours_per_week || "0",
        target: "10",
        unit: "hrs/week",
        status: Number(formData.tuition_hours_per_week) <= 10 ? "Balanced" : "Overload",
        color: Number(formData.tuition_hours_per_week) <= 10 ? "#14b8a6" : "#ef4444"
      },
      {
        icon: "🎯",
        title: "Academic Performance",
        value: formData.term_mark_avg || "0",
        target: "75",
        unit: "%",
        status: Number(formData.term_mark_avg) >= 75 ? "Excellent" : "Keep improving",
        color: Number(formData.term_mark_avg) >= 75 ? "#14b8a6" : "#f59e0b"
      }
    ];
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F3F4F6", fontFamily: "Arial, sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ width: "260px", background: "#1e293b", color: "white", padding: "20px", boxShadow: "2px 0 10px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", background: "#14b8a6", borderRadius: "12px", margin: "0 auto 15px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
            🎓
          </div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>EduMonitor AI</h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>Grade 11 • Sri Lanka</p>
        </div>

        <nav>
          <NavItem icon="🏠" text="Home" active={currentView === "home"} onClick={() => setCurrentView("home")} />
          <NavItem icon="📊" text="Attendance Analytics" active={currentView === "attendance"} onClick={() => setCurrentView("attendance")} />
          <NavItem icon="📖" text="Learning Paths" active={currentView === "learning"} onClick={() => setCurrentView("learning")} />
          <NavItem icon="⚠️" text="Risk Predictor" active={currentView === "risk"} onClick={() => setCurrentView("risk")} />
          <NavItem icon="🧠" text="Stress Prediction" active={currentView === "stress-prediction"} onClick={() => setCurrentView("stress-prediction")} />
        </nav>

        <div style={{ position: "absolute", bottom: "20px", width: "220px" }}>
          <NavItem icon="⚙️" text="Settings" active={false} />
          <NavItem icon="🚪" text="Sign Out" active={false} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: "#111827" }}>Exam Stress Prediction</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <input 
              type="text" 
              placeholder="Search students..." 
              style={{ padding: "10px 15px", borderRadius: "8px", border: "2px solid #E5E7EB", width: "250px", fontSize: "14px" }}
            />
            <div style={{ background: "white", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <span style={{ fontSize: "20px" }}>🔔</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px 15px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ width: "35px", height: "35px", background: "#14b8a6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px" }}>
                K
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Mr. S. Perera</div>
                <div style={{ fontSize: "12px", color: "#6B7280" }}>Class Teacher • {studentData.grade}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Journey Card */}
        <div style={{ 
          background: "linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #F97316 100%)", 
          borderRadius: "20px", 
          padding: "40px", 
          marginBottom: "30px",
          boxShadow: "0 10px 30px rgba(168,85,247,0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white"
        }}>
          <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
            <div style={{ width: "100px", height: "100px", border: "4px solid rgba(255,255,255,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", fontWeight: "700", background: "rgba(255,255,255,0.1)" }}>
              {studentData.name[0]}
            </div>
            <div>
              <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "8px", background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "20px", display: "inline-block" }}>
                💖 Your Wellness Journey
              </div>
              <h2 style={{ margin: "0 0 10px 0", fontSize: "42px", fontWeight: "800" }}>
                Hello, {studentData.name}! 👋
              </h2>
              <p style={{ margin: "0 0 20px 0", fontSize: "18px", opacity: 0.95 }}>
                {prediction ? (prediction === "Good" ? "You're doing great! Keep up the balanced routine." : "Let's work together to improve your wellness.") : "Enter your data to see your wellness status."}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ background: "rgba(255,255,255,0.25)", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                  Grade {studentData.grade}
                </span>
                <span style={{ background: "rgba(255,255,255,0.25)", padding: "8px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "600" }}>
                  {studentData.id}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stress Score Circle */}
          <div style={{ position: "relative" }}>
            <svg width="180" height="180">
              <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="15" />
              <circle 
                cx="90" 
                cy="90" 
                r="75" 
                fill="none" 
                stroke={getStressColor()} 
                strokeWidth="15" 
                strokeDasharray={`${(studentData.stressScore || 0) * 4.71} 471`}
                strokeLinecap="round"
                transform="rotate(-90 90 90)"
              />
              <text x="90" y="85" textAnchor="middle" fill="white" fontSize="42" fontWeight="800">
                {Math.round(studentData.stressScore || 0)}
              </text>
              <text x="90" y="110" textAnchor="middle" fill="white" fontSize="14" opacity="0.9">
                Stress Score
              </text>
            </svg>
          </div>
        </div>

        {/* Wellness Factors */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "24px", fontWeight: "700", color: "#111827", display: "flex", alignItems: "center", gap: "10px" }}>
            🎯 Your Wellness Factors
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {getWellnessFactors().map((factor, i) => (
              <div key={i} style={{ background: "white", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "2px solid #F3F4F6" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>{factor.icon}</div>
                <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "8px", fontWeight: "600" }}>{factor.title}</div>
                <div style={{ fontSize: "36px", fontWeight: "800", color: "#111827", marginBottom: "5px" }}>
                  {factor.value}
                </div>
                <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "12px" }}>
                  {factor.unit} • Target: {factor.target}
                </div>
                <div style={{ 
                  fontSize: "12px", 
                  fontWeight: "600", 
                  color: factor.color,
                  background: factor.color + "15",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  display: "inline-block"
                }}>
                  {factor.status}
                </div>
                <div style={{ width: "100%", height: "4px", background: "#E5E7EB", borderRadius: "2px", marginTop: "15px" }}>
                  <div style={{ width: `${Math.min((Number(factor.value) / Number(factor.target)) * 100, 100)}%`, height: "100%", background: factor.color, borderRadius: "2px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Form + Action Plan */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", marginBottom: "30px" }}>
          
          {/* Input Form */}
          <div style={{ background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 25px 0", fontSize: "22px", fontWeight: "700", color: "#111827" }}>📝 Enter Your Data</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <InputField label="Current Term Marks (%)" name="term_mark_avg" value={formData.term_mark_avg} onChange={handleInputChange} />
              <InputField label="Previous Term Marks (%)" name="prev_term_mark_avg" value={formData.prev_term_mark_avg} onChange={handleInputChange} />
              <InputField label="Daily Study Hours" name="daily_study" value={formData.daily_study} onChange={handleInputChange} />
              <InputField label="Sleep Hours" name="sleep_hours" value={formData.sleep_hours} onChange={handleInputChange} />
              <InputField label="Attendance (%)" name="attendance" value={formData.attendance} onChange={handleInputChange} />
              <InputField label="Social Media (hrs/day)" name="social_media" value={formData.social_media} onChange={handleInputChange} />
              <InputField label="Tuition Hours/Week" name="tuition_hours_per_week" value={formData.tuition_hours_per_week} onChange={handleInputChange} />
              <InputField label="Travel Time (hrs/day)" name="travel_time" value={formData.travel_time} onChange={handleInputChange} />
              <SelectField label="Financial Status" name="financial_status" value={formData.financial_status} onChange={handleInputChange} options={[{value: "0", label: "Stable"}, {value: "1", label: "Stressed"}]} />
              <SelectField label="Disaster Impact" name="disaster_impact" value={formData.disaster_impact} onChange={handleInputChange} options={[{value: "0", label: "None"}, {value: "1", label: "Low"}, {value: "2", label: "Moderate"}, {value: "3", label: "High"}]} />
            </div>

            <button 
              onClick={submitPrediction}
              style={{
                width: "100%",
                marginTop: "25px",
                padding: "16px",
                background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(20,184,166,0.4)"
              }}
            >
              🔮 Analyze My Stress Level
            </button>

            {prediction && (
              <div style={{
                marginTop: "25px",
                padding: "20px",
                background: prediction === "Good" ? "#d1fae5" : prediction === "Bad" ? "#fef3c7" : "#fee2e2",
                borderRadius: "12px",
                border: `2px solid ${prediction === "Good" ? "#14b8a6" : prediction === "Bad" ? "#f59e0b" : "#ef4444"}`
              }}>
                <div style={{ fontSize: "16px", fontWeight: "700", color: prediction === "Good" ? "#065f46" : prediction === "Bad" ? "#92400e" : "#991b1b", marginBottom: "5px" }}>
                  Stress Level Prediction:
                </div>
                <div style={{ fontSize: "28px", fontWeight: "800", color: prediction === "Good" ? "#14b8a6" : prediction === "Bad" ? "#f59e0b" : "#ef4444" }}>
                  {prediction === "Good" ? "Low Risk 😊" : prediction === "Bad" ? "Moderate Risk ⚠️" : "High Risk 🚨"}
                </div>
              </div>
            )}
          </div>

          {/* Personalized Action Plan */}
          <div style={{ background: "white", borderRadius: "20px", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "20px", fontWeight: "700", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
              ✨ Your Personalized Action Plan
            </h3>
            <p style={{ margin: "0 0 25px 0", fontSize: "14px", color: "#6B7280" }}>
              Complete these tasks to reduce stress and improve well-being
            </p>

            {recommendations.length > 0 ? (
              <div>
                {recommendations.slice(0, 5).map((rec, i) => (
                  <div key={i} style={{ marginBottom: "15px" }}>
                    <label style={{ display: "flex", gap: "12px", cursor: "pointer", padding: "15px", background: completedTasks.includes(i) ? "#F3F4F6" : "#FAFAFA", borderRadius: "10px", border: "2px solid #E5E7EB", transition: "all 0.2s" }}>
                      <input 
                        type="checkbox" 
                        checked={completedTasks.includes(i)}
                        onChange={() => {
                          if (completedTasks.includes(i)) {
                            setCompletedTasks(completedTasks.filter(t => t !== i));
                          } else {
                            setCompletedTasks([...completedTasks, i]);
                          }
                        }}
                        style={{ width: "20px", height: "20px", cursor: "pointer" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "5px", textDecoration: completedTasks.includes(i) ? "line-through" : "none" }}>
                          {rec}
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                          <span style={{ fontSize: "11px", padding: "4px 10px", background: i < 2 ? "#FEE2E2" : "#FEF3C7", color: i < 2 ? "#991B1B" : "#92400E", borderRadius: "6px", fontWeight: "600" }}>
                            {i < 2 ? "High Impact" : "Medium Impact"}
                          </span>
                          <span style={{ fontSize: "11px", padding: "4px 10px", background: "#DBEAFE", color: "#1E40AF", borderRadius: "6px", fontWeight: "600" }}>
                            Balance
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}

                <div style={{ marginTop: "25px", padding: "20px", background: "#f0fdfa", borderRadius: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>Progress</span>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "#14b8a6" }}>
                      {Math.round((completedTasks.length / recommendations.length) * 100)}%
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                    {completedTasks.length} of {recommendations.length} completed
                  </div>
                  <div style={{ width: "100%", height: "12px", background: "#e5e7eb", borderRadius: "6px" }}>
                    <div style={{ width: `${(completedTasks.length / recommendations.length) * 100}%`, height: "100%", background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)", borderRadius: "6px", transition: "width 0.3s" }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#9CA3AF" }}>
                <div style={{ fontSize: "48px", marginBottom: "15px" }}>📋</div>
                <div style={{ fontSize: "14px" }}>Submit your data to get personalized recommendations</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Components
function NavItem({ icon, text, active, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: "12px 15px", 
        marginBottom: "8px", 
        borderRadius: "10px", 
        cursor: "pointer",
        background: active ? "#14b8a6" : "transparent",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "15px",
        fontWeight: active ? "600" : "500",
        transition: "all 0.2s"
      }}
    >
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
        {label}
      </label>
      <input 
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        style={{ 
          width: "100%", 
          padding: "12px", 
          borderRadius: "8px", 
          border: "2px solid #E5E7EB",
          fontSize: "14px",
          boxSizing: "border-box"
        }}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
        {label}
      </label>
      <select 
        name={name}
        value={value}
        onChange={onChange}
        style={{ 
          width: "100%", 
          padding: "12px", 
          borderRadius: "8px", 
          border: "2px solid #E5E7EB",
          fontSize: "14px",
          boxSizing: "border-box"
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default Dashboard;
