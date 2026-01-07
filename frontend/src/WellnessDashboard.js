import { useState, useEffect } from "react";
import axios from "axios";

function WellnessDashboard() {
  const [formData, setFormData] = useState({
    studentName: "Kasun Perera",
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
  const [stressScore, setStressScore] = useState(25);
  const [recommendations, setRecommendations] = useState([]);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingCycle, setBreathingCycle] = useState(0);

  // Breathing exercise timer
  useEffect(() => {
    if (!showBreathing) return;

    const phases = [
      { name: "inhale", duration: 4000, text: "Breathe In...", color: "#10b981" },
      { name: "hold1", duration: 4000, text: "Hold...", color: "#3b82f6" },
      { name: "exhale", duration: 4000, text: "Breathe Out...", color: "#8b5cf6" },
      { name: "hold2", duration: 4000, text: "Hold...", color: "#3b82f6" }
    ];

    let phaseIndex = 0;
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setBreathingPhase(phases[phaseIndex].name);
      
      if (phaseIndex === 0) {
        setBreathingCycle(prev => {
          if (prev >= 4) {
            setShowBreathing(false);
            return 0;
          }
          return prev + 1;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [showBreathing, breathingCycle]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitPrediction = async () => {
    try {
      const payload = {
        studentId: "ST001",
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
      
      // Calculate score: Good=25, Bad=50, Awful=75
      const scoreMap = { "Good": 25, "Bad": 50, "Awful": 75 };
      setStressScore(scoreMap[res.data.stress_level] || 25);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const getStressColor = () => {
    if (stressScore <= 35) return "#6ee7b7"; // Light green
    if (stressScore <= 60) return "#fbbf24"; // Yellow
    return "#f87171"; // Red
  };

  const getStressLabel = () => {
    if (stressScore <= 35) return "Low";
    if (stressScore <= 60) return "Moderate";
    return "High";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafb", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      
      {/* Sidebar */}
      <div style={{ width: "240px", background: "#1e293b", color: "white", padding: "25px 20px", position: "fixed", height: "100vh", boxShadow: "2px 0 10px rgba(0,0,0,0.1)" }}>
        <div style={{ marginBottom: "50px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <div style={{ width: "45px", height: "45px", background: "#14b8a6", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
              🎓
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "700" }}>EduMonitor AI</div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Grade 11 • Sri Lanka</div>
            </div>
          </div>
        </div>

        <nav style={{ marginBottom: "auto" }}>
          <NavItem icon="🏠" text="Home" active={false} />
          <NavItem icon="📊" text="Attendance Analytics" active={false} />
          <NavItem icon="📖" text="Learning Paths" active={false} />
          <NavItem icon="⚠️" text="Risk Predictor" active={false} />
          <NavItem icon="🧠" text="Stress Prediction" active={true} />
        </nav>

        <div style={{ position: "absolute", bottom: "30px", width: "200px" }}>
          <NavItem icon="⚙️" text="Settings" active={false} />
          <NavItem icon="🚪" text="Sign Out" active={false} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: "240px", flex: 1, padding: "30px 40px", overflowY: "auto" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", color: "#1e293b" }}>Exam Stress Prediction</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ position: "relative" }}>
              <input 
                type="text" 
                placeholder="Search students..." 
                style={{ 
                  padding: "10px 15px 10px 40px", 
                  borderRadius: "10px", 
                  border: "1px solid #e2e8f0", 
                  width: "250px", 
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              <span style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
            </div>
            <div style={{ background: "white", padding: "10px 12px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer", position: "relative" }}>
              <span style={{ fontSize: "20px" }}>🔔</span>
              <div style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px 15px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ width: "40px", height: "40px", background: "#14b8a6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "16px" }}>
                K
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formData.studentName}</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Student • 11-A</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Dashboard Header */}
        <div style={{ 
          background: "linear-gradient(135deg, #d1fae5 0%, #e0f2fe 100%)", 
          padding: "15px 25px", 
          borderRadius: "12px", 
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "20px" }}>⚕️</span>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#065f46" }}>Your Wellness Dashboard</span>
        </div>

        {/* Main Wellness Circle */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ margin: "0 0 10px 0", fontSize: "32px", fontWeight: "800", color: "#1e293b" }}>
            Hello, {formData.studentName}
          </h2>
          <p style={{ margin: "0 0 35px 0", fontSize: "16px", color: "#64748b" }}>
            Let's check in on your well-being
          </p>
          
          <div style={{ display: "inline-block", position: "relative" }}>
            <div style={{ 
              width: "280px", 
              height: "280px", 
              borderRadius: "50%", 
              background: getStressColor(),
              boxShadow: `0 20px 60px ${getStressColor()}40`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <div style={{ fontSize: "14px", color: "#047857", fontWeight: "600", marginBottom: "8px" }}>
                Your Stress Level
              </div>
              <div style={{ fontSize: "72px", fontWeight: "800", color: "#065f46", lineHeight: "1" }}>
                {stressScore}
              </div>
              <div style={{ fontSize: "18px", color: "#047857", fontWeight: "600", marginTop: "8px" }}>
                {getStressLabel()}
              </div>
            </div>
          </div>
        </div>

        {/* Wellness Factors Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "40px" }}>
          <WellnessCard 
            icon="🌙" 
            iconBg="#d1fae5"
            iconColor="#065f46"
            title="SLEEP" 
            value={formData.sleep_hours || "7"}
            unit="h"
            subtitle="/ night"
            color="#10b981"
          />
          <WellnessCard 
            icon="⏰" 
            iconBg="#dbeafe"
            iconColor="#1e40af"
            title="STUDY TIME" 
            value={formData.daily_study || "15"}
            unit="h"
            subtitle="/ week"
            color="#3b82f6"
          />
          <WellnessCard 
            icon="�" 
            iconBg="#fef3c7"
            iconColor="#92400e"
            title="SCREEN TIME" 
            value={formData.social_media || "2"}
            unit="h"
            subtitle="/ day"
            color="#f59e0b"
          />
          <WellnessCard 
            icon="📈" 
            iconBg="#fce7f3"
            iconColor="#be185d"
            title="PERFORMANCE" 
            value={formData.term_mark_avg || "88"}
            unit="%"
            subtitle="average"
            color="#ec4899"
          />
        </div>

        {/* Breathing Exercise & Wellness Insights */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "25px", marginBottom: "40px" }}>
          
          {/* Breathing Exercise */}
          <div style={{ 
            background: "white", 
            borderRadius: "16px", 
            padding: "35px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" }}>
              <div style={{ fontSize: "28px" }}>🫁</div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Breathe</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>4-4-4 breathing exercise</p>
              </div>
            </div>
            
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.7", marginBottom: "15px" }}>
                Take a moment to center yourself.<br/>
                Follow the breathing pattern to reduce stress.
              </p>
            </div>

            <button 
              onClick={() => setShowBreathing(!showBreathing)}
              style={{
                width: "100%",
                padding: "14px",
                background: "#14b8a6",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>▶</span> Start Exercise
            </button>
          </div>

          {/* Wellness Insights */}
          <div style={{ 
            background: "linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)", 
            borderRadius: "16px", 
            padding: "35px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #e9d5ff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "25px" }}>
              <div style={{ fontSize: "28px" }}>💜</div>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>Wellness Insights</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#7c3aed" }}>Personalized for you</p>
              </div>
            </div>

            <div style={{ 
              background: "white", 
              borderRadius: "12px", 
              padding: "20px",
              border: "1px solid #e9d5ff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px" }}>✨</span>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>You're Doing Great</span>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#64748b", lineHeight: "1.7" }}>
                {prediction === "Good" 
                  ? "Your stress levels are healthy. Keep maintaining this balance between study, rest, and self-care."
                  : prediction 
                  ? "Let's work together to improve your wellness. Focus on the recommendations below."
                  : "Fill in your data below to get personalized wellness insights and stress predictions."}
              </p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div style={{ 
          background: "white", 
          borderRadius: "16px", 
          padding: "35px", 
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e2e8f0",
          marginBottom: "30px"
        }}>
          <h3 style={{ margin: "0 0 25px 0", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>📝 Enter Your Wellness Data</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px", marginBottom: "25px" }}>
            <InputField label="Current Term Marks (%)" name="term_mark_avg" value={formData.term_mark_avg} onChange={handleInputChange} />
            <InputField label="Previous Term Marks (%)" name="prev_term_mark_avg" value={formData.prev_term_mark_avg} onChange={handleInputChange} />
            <InputField label="Daily Study Hours" name="daily_study" value={formData.daily_study} onChange={handleInputChange} />
            <InputField label="Sleep Hours" name="sleep_hours" value={formData.sleep_hours} onChange={handleInputChange} />
            <InputField label="Attendance (%)" name="attendance" value={formData.attendance} onChange={handleInputChange} />
            <InputField label="Social Media (hrs/day)" name="social_media" value={formData.social_media} onChange={handleInputChange} />
            <InputField label="Tuition Hours/Week" name="tuition_hours_per_week" value={formData.tuition_hours_per_week} onChange={handleInputChange} />
            <InputField label="Travel Time (hrs/day)" name="travel_time" value={formData.travel_time} onChange={handleInputChange} />
            <SelectField label="Financial Status" name="financial_status" value={formData.financial_status} onChange={handleInputChange} 
              options={[{value: "0", label: "Stable"}, {value: "1", label: "Stressed"}]} />
            <SelectField label="Disaster Impact" name="disaster_impact" value={formData.disaster_impact} onChange={handleInputChange} 
              options={[{value: "0", label: "None"}, {value: "1", label: "Low"}, {value: "2", label: "Moderate"}, {value: "3", label: "High"}]} />
          </div>

          <button 
            onClick={submitPrediction}
            style={{
              padding: "16px 40px",
              background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: "pointer",
              boxShadow: "0 6px 24px rgba(20,184,166,0.3)"
            }}
          >
            🔮 Analyze My Wellness
          </button>

          {prediction && (
            <div style={{
              marginTop: "25px",
              padding: "20px 25px",
              background: prediction === "Good" ? "#d1fae5" : prediction === "Bad" ? "#fef3c7" : "#fee2e2",
              borderRadius: "12px",
              border: `2px solid ${prediction === "Good" ? "#10b981" : prediction === "Bad" ? "#f59e0b" : "#ef4444"}`
            }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: prediction === "Good" ? "#065f46" : prediction === "Bad" ? "#92400e" : "#991b1b", marginBottom: "5px" }}>
                Stress Prediction Result:
              </div>
              <div style={{ fontSize: "32px", fontWeight: "800", color: prediction === "Good" ? "#10b981" : prediction === "Bad" ? "#f59e0b" : "#ef4444" }}>
                {prediction === "Good" ? "Low Risk ✅" : prediction === "Bad" ? "Moderate Risk ⚠️" : "High Risk 🚨"}
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <div style={{ 
            background: "white", 
            borderRadius: "16px", 
            padding: "35px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>💡 AI-Powered Recommendations</h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{ 
                  padding: "15px 20px", 
                  background: "#f8fafc", 
                  borderRadius: "10px",
                  borderLeft: "4px solid #14b8a6",
                  fontSize: "14px",
                  color: "#475569",
                  lineHeight: "1.6"
                }}>
                  <strong style={{ color: "#1e293b" }}>{i + 1}.</strong> {rec}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Breathing Exercise Modal */}
      {showBreathing && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{ textAlign: "center", color: "white" }}>
            <h2 style={{ fontSize: "32px", marginBottom: "20px", fontWeight: "700" }}>
              4-4-4 Breathing Exercise
            </h2>
            <p style={{ fontSize: "18px", marginBottom: "40px", color: "#94a3b8" }}>
              Cycle {breathingCycle + 1} of 5
            </p>
            
            <div style={{
              width: breathingPhase === "inhale" ? "200px" : breathingPhase === "exhale" ? "100px" : "150px",
              height: breathingPhase === "inhale" ? "200px" : breathingPhase === "exhale" ? "100px" : "150px",
              borderRadius: "50%",
              background: breathingPhase === "inhale" ? "#10b981" : breathingPhase === "exhale" ? "#8b5cf6" : "#3b82f6",
              margin: "0 auto 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 4s ease-in-out",
              boxShadow: `0 0 60px ${breathingPhase === "inhale" ? "#10b981" : breathingPhase === "exhale" ? "#8b5cf6" : "#3b82f6"}80`
            }}>
              <span style={{ fontSize: "24px", fontWeight: "700" }}>
                {breathingPhase === "inhale" ? "Breathe In..." : breathingPhase === "exhale" ? "Breathe Out..." : "Hold..."}
              </span>
            </div>
            
            <button 
              onClick={() => {
                setShowBreathing(false);
                setBreathingCycle(0);
              }}
              style={{
                padding: "14px 32px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Components
function NavItem({ icon, text, active }) {
  return (
    <div style={{ 
      padding: "12px 15px", 
      marginBottom: "6px", 
      borderRadius: "10px", 
      cursor: "pointer",
      background: active ? "#14b8a6" : "transparent",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "14px",
      fontWeight: active ? "600" : "500",
      color: active ? "white" : "#94a3b8",
      transition: "all 0.2s"
    }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function WellnessCard({ icon, iconBg, iconColor, title, value, unit, subtitle, color }) {
  return (
    <div style={{ 
      background: "linear-gradient(135deg, #d1fae5 0%, #e0f2fe 50%, #fce7f3 100%)",
      borderRadius: "16px", 
      padding: "25px", 
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      border: "1px solid #e2e8f0"
    }}>
      <div style={{ 
        width: "48px", 
        height: "48px", 
        background: iconBg,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        marginBottom: "15px"
      }}>
        {icon}
      </div>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", marginBottom: "10px", letterSpacing: "0.5px" }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "5px" }}>
        <span style={{ fontSize: "42px", fontWeight: "800", color: "#1e293b", lineHeight: "1" }}>
          {value}
        </span>
        <span style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b" }}>
          {unit}
        </span>
      </div>
      <div style={{ fontSize: "13px", color: "#64748b" }}>
        {subtitle}
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>
        {label}
      </label>
      <input 
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        style={{ 
          width: "100%", 
          padding: "11px 14px", 
          borderRadius: "10px", 
          border: "1px solid #e2e8f0",
          fontSize: "14px",
          boxSizing: "border-box",
          outline: "none",
          transition: "border-color 0.2s"
        }}
        onFocus={(e) => e.target.style.borderColor = "#14b8a6"}
        onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#475569" }}>
        {label}
      </label>
      <select 
        name={name}
        value={value}
        onChange={onChange}
        style={{ 
          width: "100%", 
          padding: "11px 14px", 
          borderRadius: "10px", 
          border: "1px solid #e2e8f0",
          fontSize: "14px",
          boxSizing: "border-box",
          outline: "none"
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default WellnessDashboard;
