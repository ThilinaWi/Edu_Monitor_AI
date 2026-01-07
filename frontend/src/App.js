import { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

function App() {
  const [form, setForm] = useState({});
  const [result, setResult] = useState("");
  const [tips, setTips] = useState([]);
  const [aiPowered, setAiPowered] = useState(false);
  const [earlyWarning, setEarlyWarning] = useState(null);
  const [predictionId, setPredictionId] = useState(null);
  const [stressHistory, setStressHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);
  const [showBreathing, setShowBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [showBreathingPrompt, setShowBreathingPrompt] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Breathing exercise logic
  useEffect(() => {
    if (!showBreathing) return;

    const phases = [
      { name: "inhale", duration: 4000, text: "Breathe In..." },
      { name: "hold1", duration: 4000, text: "Hold..." },
      { name: "exhale", duration: 4000, text: "Breathe Out..." },
      { name: "hold2", duration: 4000, text: "Hold..." }
    ];

    let phaseIndex = 0;
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setBreathingPhase(phases[phaseIndex].name);
      
      if (phaseIndex === 0) {
        setBreathingCycle(prev => prev + 1);
        if (breathingCycle >= 5) {
          setShowBreathing(false);
          setBreathingCycle(0);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [showBreathing, breathingCycle]);

  // Fetch stress history
  const fetchHistory = async () => {
    if (!form.studentId) {
      alert("Please enter Student ID to view history");
      return;
    }
    
    try {
      const res = await axios.get(`http://localhost:5000/api/history/${form.studentId}`);
      const historyData = res.data.map(item => ({
        date: new Date(item.timestamp).toLocaleDateString(),
        stressCode: item.predictionCode,
        stressLevel: item.stressLevel
      }));
      
      setStressHistory(historyData.slice(-historyDays));
      setShowHistory(true);
    } catch (error) {
      alert("No history found for this student ID");
    }
  };

  // Generate PDF Report
  const generatePDF = () => {
    if (!result) {
      alert("Please get your stress analysis first!");
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.text("Student Stress Assessment Report", 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    // Student ID
    if (form.studentId) {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(`Student ID: ${form.studentId}`, 20, 45);
    }
    
    // Stress Level Result
    doc.setFontSize(16);
    if (result === "Good") {
      doc.setTextColor(76, 175, 80);
    } else if (result === "Bad") {
      doc.setTextColor(255, 152, 0);
    } else {
      doc.setTextColor(244, 67, 54);
    }
    doc.text(`Stress Level: ${result}`, 20, 60);
    
    // AI Badge
    if (aiPowered) {
      doc.setFontSize(10);
      doc.setTextColor(46, 125, 50);
      doc.text("AI-Powered Personalized Analysis", 20, 70);
    }
    
    // Recommendations
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Recommendations:", 20, 85);
    
    doc.setFontSize(11);
    let yPos = 95;
    tips.forEach((tip, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${tip}`, 170);
      lines.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 25, yPos);
        yPos += 7;
      });
    });
    
    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("This is an educational wellness tool. Not a substitute for professional advice.", 20, 285);
    
    // Save
    doc.save(`stress-report-${form.studentId || 'anonymous'}-${Date.now()}.pdf`);
  };

  const submit = async () => {
    const payload = {
      studentId: form.studentId || null,
      term_mark_avg: Number(form.term_mark_avg),
      prev_term_mark_avg: Number(form.prev_term_mark_avg),
      daily_study: Number(form.daily_study),
      prefer_study: 0, // Hidden field - default value
      travel_time: Number(form.travel_time),
      financial_status: Number(form.financial_status),
      social_media: Number(form.social_media),
      sleep_hours: Number(form.sleep_hours),
      attendance: Number(form.attendance),
      tuition_hours_per_week: Number(form.tuition_hours_per_week),
      disaster_impact: Number(form.disaster_impact)
    };

    const res = await axios.post("http://localhost:5000/api/predict", payload);
    
    setResult(res.data.stress_level);
    setPredictionId(res.data.predictionId);
    setEarlyWarning(res.data.earlyWarning || null);
    
    if (res.data.ai_recommendations && res.data.ai_recommendations.length > 0) {
      setTips(res.data.ai_recommendations);
    } else {
      setTips(["No recommendations available."]);
    }
    
    setAiPowered(res.data.ai_powered || false);
    
    // Show breathing exercise prompt for high stress
    if (res.data.stress_level === "Awful" || res.data.stress_level === "Bad") {
      setShowBreathingPrompt(true);
    } else {
      setShowBreathingPrompt(false);
    }
  };

  const displayLabel = () => {
    if (result === "Good") return "Low Risk";
    if (result === "Bad") return "Moderate Risk";
    if (result === "Awful") return "High Risk";
    return "";
  };

  const getBreathingText = () => {
    switch (breathingPhase) {
      case "inhale": return "Breathe In...";
      case "hold1": return "Hold...";
      case "exhale": return "Breathe Out...";
      case "hold2": return "Hold...";
      default: return "Breathe...";
    }
  };

  const getBreathingCircleSize = () => {
    if (breathingPhase === "inhale") return 150;
    if (breathingPhase === "exhale") return 80;
    return 115;
  };

  return (
    <div style={{ 
      minHeight:"100vh",
      background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding:"40px 20px"
    }}>
      <div style={{maxWidth:"700px", margin:"0 auto"}}>
        {/* Header */}
        <div style={{
          textAlign:"center", 
          marginBottom:"40px",
          animation:"fadeIn 0.6s ease-in"
        }}>
          <h1 style={{
            fontSize:"42px",
            fontWeight:"800",
            color:"white",
            marginBottom:"10px",
            textShadow:"2px 2px 4px rgba(0,0,0,0.2)"
          }}>
            Edu Monitor AI
          </h1>
          <p style={{
            fontSize:"18px",
            color:"rgba(255,255,255,0.9)",
            fontWeight:"500"
          }}>
            AI-Powered Student Stress Analysis & Wellness Platform
          </p>
          <div style={{
            display:"inline-block",
            backgroundColor:"rgba(255,255,255,0.2)",
            padding:"8px 20px",
            borderRadius:"20px",
            marginTop:"10px",
            backdropFilter:"blur(10px)"
          }}>
            <span style={{color:"white", fontSize:"14px", fontWeight:"600"}}>
              🇱🇰 Designed for Sri Lankan O/L Students
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          backgroundColor:"white",
          borderRadius:"20px",
          padding:"40px",
          boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
          marginBottom:"30px"
        }}>
          
          {/* Student ID Field */}
          <div style={{marginBottom:"30px"}}>
            <label style={{
              display:"block", 
              fontSize:"16px", 
              marginBottom:"10px", 
              fontWeight:"600",
              color:"#333"
            }}>
              🆔 Student ID (Optional)
            </label>
            <input
              name="studentId"
              onChange={handleChange}
              placeholder="e.g., ST001 - Required for history tracking"
              style={{
                width:"100%", 
                padding:"16px", 
                fontSize:"16px", 
                border:"2px solid #e0e0e0", 
                borderRadius:"12px", 
                boxSizing:"border-box",
                transition:"all 0.3s",
                outline:"none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
            />
          </div>

          {/* Section Divider */}
          <div style={{
            borderTop:"2px solid #f0f0f0",
            margin:"30px 0",
            position:"relative"
          }}>
            <span style={{
              position:"absolute",
              top:"-12px",
              left:"50%",
              transform:"translateX(-50%)",
              backgroundColor:"white",
              padding:"0 15px",
              color:"#667eea",
              fontWeight:"700",
              fontSize:"14px"
            }}>
              ASSESSMENT FORM
            </span>
          </div>

      {[
        {name:"term_mark_avg", label:"Current Term Average (%)"},
        {name:"prev_term_mark_avg", label:"Previous Term Average (%)"},
        {name:"daily_study", label:"Daily Study Hours"},
        {name:"travel_time", label:"Travel Time (hours/day)"},
        {name:"financial_status", label:"Financial Stress? (0=No, 1=Yes)"},
        {name:"social_media", label:"Social Media (hours/day)"},
        {name:"sleep_hours", label:"Sleep Hours/Night"},
        {name:"attendance", label:"Attendance (%)"},
        {name:"tuition_hours_per_week", label:"Weekly Tuition Hours"},
        {name:"disaster_impact", label:"Disaster Impact (0=None, 5=Severe)"}
      ].map(field => (
        <div key={field.name} style={{marginBottom:"25px"}}>
          <label style={{
            display:"block", 
            fontSize:"15px", 
            marginBottom:"10px", 
            fontWeight:"600",
            color:"#444"
          }}>
            {field.label}
          </label>
          <input
            name={field.name}
            type="number"
            onChange={handleChange}
            style={{
              width:"100%", 
              padding:"14px", 
              fontSize:"16px", 
              border:"2px solid #e8e8e8", 
              borderRadius:"10px", 
              boxSizing:"border-box",
              transition:"all 0.3s",
              outline:"none",
              backgroundColor:"#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.backgroundColor = "white";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e8e8e8";
              e.target.style.backgroundColor = "#fafafa";
            }}
          />
        </div>
      ))}

      <button 
        onClick={submit}
        style={{
          width:"100%", 
          padding:"20px", 
          fontSize:"18px", 
          fontWeight:"700", 
          background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color:"white", 
          border:"none", 
          borderRadius:"12px", 
          cursor:"pointer", 
          marginTop:"30px", 
          boxShadow:"0 8px 20px rgba(102,126,234,0.4)",
          transition:"all 0.3s",
          textTransform:"uppercase",
          letterSpacing:"1px"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "translateY(-2px)";
          e.target.style.boxShadow = "0 12px 30px rgba(102,126,234,0.5)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "0 8px 20px rgba(102,126,234,0.4)";
        }}
      >
        Analyze My Stress Level
      </button>

      {/* Action Buttons */}
      {form.studentId && (
        <div style={{display:"flex", gap:"12px", marginTop:"20px"}}>
          <button 
            onClick={fetchHistory}
            style={{
              flex:1, 
              padding:"16px", 
              fontSize:"15px", 
              fontWeight:"700", 
              background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color:"white", 
              border:"none", 
              borderRadius:"10px", 
              cursor:"pointer",
              boxShadow:"0 4px 12px rgba(102,126,234,0.3)",
              transition:"all 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            View History
          </button>
          <button 
            onClick={() => setShowBreathing(true)}
            style={{
              flex:1, 
              padding:"16px", 
              fontSize:"15px", 
              fontWeight:"700", 
              background:"linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              color:"white", 
              border:"none", 
              borderRadius:"10px", 
              cursor:"pointer",
              boxShadow:"0 4px 12px rgba(17,153,142,0.3)",
              transition:"all 0.3s"
            }}
            onMouseEnter={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.target.style.transform = "translateY(0)"}
          >
            Breathing
          </button>
        </div>
      )}
      </div>

      {/* Breathing Exercise Widget */}
      {showBreathing && (
        <div style={{
          position:"fixed", 
          top:0, 
          left:0, 
          right:0, 
          bottom:0, 
          backgroundColor:"rgba(0,0,0,0.9)", 
          display:"flex", 
          alignItems:"center", 
          justifyContent:"center", 
          zIndex:1000,
          flexDirection:"column"
        }}>
          <div style={{textAlign:"center", color:"white"}}>
            <h2 style={{fontSize:"32px", marginBottom:"40px"}}>Guided Breathing Exercise</h2>
            <p style={{fontSize:"18px", marginBottom:"30px"}}>Cycle {breathingCycle + 1} of 5</p>
            
            <div style={{
              width: getBreathingCircleSize() + "px",
              height: getBreathingCircleSize() + "px",
              borderRadius:"50%",
              backgroundColor:"#4CAF50",
              margin:"0 auto 30px",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              transition:"all 4s ease-in-out",
              boxShadow:"0 0 50px rgba(76, 175, 80, 0.6)"
            }}>
              <span style={{fontSize:"24px", fontWeight:"bold"}}>{getBreathingText()}</span>
            </div>
            
            <button 
              onClick={() => setShowBreathing(false)}
              style={{
                padding:"15px 40px", 
                fontSize:"16px", 
                backgroundColor:"#f44336", 
                color:"white", 
                border:"none", 
                borderRadius:"8px", 
                cursor:"pointer",
                marginTop:"20px"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stress History Graph */}
      {showHistory && stressHistory.length > 0 && (
        <div style={{
          backgroundColor:"#fff", 
          padding:"25px", 
          borderRadius:"12px", 
          marginTop:"25px", 
          boxShadow:"0 4px 12px rgba(0,0,0,0.15)",
          border:"2px solid #673AB7"
        }}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px"}}>
            <h3 style={{margin:0, color:"#673AB7"}}>Your Stress History</h3>
            <div>
              <select 
                value={historyDays} 
                onChange={(e) => {setHistoryDays(Number(e.target.value)); fetchHistory();}}
                style={{padding:"8px", borderRadius:"6px", border:"2px solid #673AB7"}}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stressHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" style={{fontSize:"12px"}} />
              <YAxis domain={[0, 2]} ticks={[0, 1, 2]} />
              <Tooltip 
                content={({ payload }) => {
                  if (payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{backgroundColor:"white", padding:"10px", border:"2px solid #673AB7", borderRadius:"6px"}}>
                        <p style={{margin:0, fontWeight:"bold"}}>{data.date}</p>
                        <p style={{margin:0, color: data.stressCode === 0 ? "#4CAF50" : data.stressCode === 1 ? "#FF9800" : "#f44336"}}>
                          {data.stressLevel}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="stressCode" 
                stroke="#673AB7" 
                strokeWidth={3}
                name="Stress Level (0=Good, 1=Bad, 2=Awful)"
                dot={{fill:"#673AB7", r:6}}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <button 
            onClick={() => setShowHistory(false)}
            style={{
              width:"100%", 
              padding:"12px", 
              marginTop:"15px", 
              backgroundColor:"#e0e0e0", 
              border:"none", 
              borderRadius:"8px", 
              cursor:"pointer",
              fontSize:"14px"
            }}
          >
            Hide History
          </button>
        </div>
      )}

      {result && (
        <div style={{
          backgroundColor:"white",
          borderRadius:"20px",
          padding:"40px",
          boxShadow:"0 20px 60px rgba(0,0,0,0.3)",
          marginBottom:"30px",
          animation:"slideIn 0.5s ease-out"
        }}>
          <div style={{
            textAlign:"center", 
            padding:"40px", 
            background:result === "Good" 
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
              : result === "Bad" 
              ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" 
              : "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            borderRadius:"16px",
            marginBottom:"30px",
            boxShadow:"0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{
              fontSize:"16px",
              color:"white",
              fontWeight:"600",
              marginBottom:"10px",
              opacity:0.9,
              textTransform:"uppercase",
              letterSpacing:"2px"
            }}>
              Your Stress Assessment
            </div>
            <h2 style={{
              margin:"0", 
              fontSize:"36px", 
              color:"white",
              fontWeight:"800",
              textShadow:"2px 2px 4px rgba(0,0,0,0.2)"
            }}>
              {displayLabel()}
            </h2>
          </div>
          
          {showBreathingPrompt && (
            <div style={{
              background:"linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              padding:"30px", 
              borderRadius:"16px", 
              marginBottom:"25px",
              boxShadow:"0 8px 20px rgba(0,0,0,0.1)",
              textAlign:"center"
            }}>
              <h3 style={{color:"#2c3e50", margin:"0 0 15px 0", fontSize:"22px", fontWeight:"700"}}>
                Take a Moment to Breathe
              </h3>
              <p style={{margin:"0 0 20px 0", color:"#34495e", fontSize:"16px"}}>
                A 5-minute guided breathing can reduce stress significantly
              </p>
              <div style={{display:"flex", gap:"15px", justifyContent:"center", flexWrap:"wrap"}}>
                <button 
                  onClick={() => {
                    setShowBreathing(true);
                    setBreathingCycle(0);
                    setShowBreathingPrompt(false);
                  }}
                  style={{
                    padding:"14px 32px", 
                    fontSize:"16px", 
                    fontWeight:"700",
                    background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color:"white", 
                    border:"none", 
                    borderRadius:"10px", 
                    cursor:"pointer",
                    boxShadow:"0 4px 12px rgba(102,126,234,0.4)",
                    transition:"all 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                >
                  ✨ Yes, Start Now
                </button>
                <button 
                  onClick={() => setShowBreathingPrompt(false)}
                  style={{
                    padding:"14px 32px", 
                    fontSize:"16px", 
                    fontWeight:"600",
                    backgroundColor:"white", 
                    color:"#666", 
                    border:"2px solid #e0e0e0", 
                    borderRadius:"10px", 
                    cursor:"pointer",
                    transition:"all 0.3s"
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                >
                  Maybe Later
                </button>
              </div>
            </div>
          )}
          
          {earlyWarning && (
            <div style={{
              background:"linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)",
              padding:"25px", 
              borderRadius:"16px", 
              marginBottom:"25px",
              boxShadow:"0 8px 20px rgba(255,107,107,0.3)",
              border:"3px solid #ee5a6f"
            }}>
              <h4 style={{color:"white", margin:"0 0 10px 0", fontSize:"20px", fontWeight:"700"}}>
                {earlyWarning.message}
              </h4>
              <p style={{margin:0, color:"white", fontSize:"16px", fontWeight:"500"}}>
                <strong>Action Required:</strong> {earlyWarning.recommendation}
              </p>
            </div>
          )}
          
          {aiPowered && (
            <div style={{
              background:"linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              padding:"16px", 
              borderRadius:"12px", 
              marginBottom:"25px",
              textAlign:"center",
              boxShadow:"0 4px 12px rgba(0,0,0,0.1)"
            }}>
              <span style={{
                color:"#2c3e50", 
                fontWeight:"700", 
                fontSize:"16px",
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                gap:"8px"
              }}>
                <span style={{fontSize:"24px"}}>AI</span>
                AI-Powered Personalized Analysis
              </span>
            </div>
          )}

          <div style={{
            backgroundColor:"#f8f9fa",
            padding:"30px", 
            borderRadius:"16px",
            boxShadow:"0 4px 12px rgba(0,0,0,0.05)"
          }}>
            <h4 style={{
              color:"#2c3e50", 
              marginTop:0,
              marginBottom:"20px",
              fontSize:"20px",
              fontWeight:"700",
              display:"flex",
              alignItems:"center",
              gap:"10px"
            }}>
              Your Personalized Recommendations
            </h4>
            <ul style={{
              lineHeight:"2.2", 
              color:"#444",
              paddingLeft:"20px",
              margin:0
            }}>
              {tips.map((tip, i) => (
                <li key={i} style={{
                  marginBottom:"12px",
                  fontSize:"15px",
                  backgroundColor:"white",
                  padding:"12px 15px",
                  borderRadius:"8px",
                  boxShadow:"0 2px 4px rgba(0,0,0,0.05)",
                  listStyle:"none",
                  position:"relative",
                  paddingLeft:"35px"
                }}>
                  <span style={{
                    position:"absolute",
                    left:"12px",
                    top:"12px",
                    color:"#667eea",
                    fontWeight:"700"
                  }}>
                    {i + 1}.
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* PDF Export Button */}
          <button 
            onClick={generatePDF}
            style={{
              width:"100%", 
              padding:"18px", 
              marginTop:"25px",
              fontSize:"17px", 
              fontWeight:"700", 
              background:"linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color:"white", 
              border:"none", 
              borderRadius:"12px", 
              cursor:"pointer",
              boxShadow:"0 6px 16px rgba(240,147,251,0.4)",
              transition:"all 0.3s",
              textTransform:"uppercase",
              letterSpacing:"1px"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(240,147,251,0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 16px rgba(240,147,251,0.4)";
            }}
          >
            Download PDF Report
          </button>

          {predictionId && (
            <div style={{
              textAlign:"center",
              marginTop:"20px",
              padding:"12px",
              backgroundColor:"rgba(102,126,234,0.1)",
              borderRadius:"8px"
            }}>
              <span style={{fontSize:"14px", color:"#667eea", fontWeight:"600"}}>
                ✓ Assessment saved to database
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Footer */}
      <div style={{
        textAlign:"center",
        marginTop:"40px",
        padding:"25px",
        backgroundColor:"rgba(255,255,255,0.1)",
        borderRadius:"16px",
        backdropFilter:"blur(10px)"
      }}>
        <p style={{
          fontSize:"14px", 
          color:"white", 
          lineHeight:"1.8",
          margin:0,
          fontWeight:"500"
        }}>
          <strong>Important:</strong> This is an educational wellness tool for Sri Lankan O/L students.<br/>
          Not a substitute for professional medical or psychological advice.
        </p>
      </div>
    </div>
    </div>
  );
}

export default App;
