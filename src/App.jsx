import { useState, useEffect } from "react";
import CardAgent from "./CardAgent.jsx";
import LinkedInAgent from "./LinkedInAgent.jsx";
import RepurposeAgent from "./RepurposeAgent.jsx";
import TrendAgent from "./TrendAgent.jsx";
import PasswordGate from "./PasswordGate.jsx";

const AGENTS = [
  { id:"card", label:"Card Agent", description:"Lessons I Have Learnt — hero text + supporting text", tag:"Weekly series" },
  { id:"linkedin", label:"LinkedIn Agent", description:"Original thought leadership posts", tag:"Original content" },
  { id:"repurpose", label:"Repurpose Agent", description:"Video transcript or rough notes → LinkedIn post", tag:"Repurpose" },
  { id:"trend", label:"Trend Agent", description:"Real-time research → content grounded in what's happening now", tag:"Live research · Perplexity + Claude" },
];

function Home({ onSelect }) {
  return (
    <div style={{ minHeight:"100vh", background:"#F5F0E8", fontFamily:"'Georgia',serif", padding:"64px 24px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:680 }}>
        <div style={{ marginBottom:64 }}>
          <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", color:"#999", textTransform:"uppercase", margin:"0 0 12px 0" }}>BankeOS</p>
          <h1 style={{ fontSize:48, fontWeight:900, color:"#1a1a1a", margin:"0 0 16px 0", letterSpacing:"-0.03em", lineHeight:1 }}>Content<br />Agents.</h1>
          <p style={{ fontSize:15, color:"#666", margin:0, lineHeight:1.6, maxWidth:420 }}>Your personal brand content system. Select an agent to generate content in your voice.</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {AGENTS.map((agent) => (
            <button key={agent.id} onClick={() => onSelect(agent.id)}
              style={{ background:"#fff", border:"1px solid #e0d8cc", padding:"24px 28px", textAlign:"left", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'Georgia',serif" }}
              onMouseEnter={(e) => e.currentTarget.style.background="#faf8f4"}
              onMouseLeave={(e) => e.currentTarget.style.background="#fff"}>
              <div>
                <p style={{ fontFamily:"monospace", fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color: agent.id === "trend" ? "#2a9d5c" : "#999", margin:"0 0 6px 0" }}>{agent.tag}</p>
                <h2 style={{ fontSize:18, fontWeight:700, color:"#1a1a1a", margin:"0 0 4px 0", letterSpacing:"-0.01em" }}>{agent.label}</h2>
                <p style={{ fontSize:13, color:"#666", margin:0, fontFamily:"monospace" }}>{agent.description}</p>
              </div>
              <span style={{ fontSize:20, color:"#ccc", marginLeft:16, flexShrink:0 }}>→</span>
            </button>
          ))}
        </div>
        <p style={{ fontFamily:"monospace", fontSize:11, color:"#bbb", marginTop:48, letterSpacing:"0.1em" }}>BANKEOS · CONTENT SYSTEM · {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [password, setPassword] = useState(null);
  const [currentAgent, setCurrentAgent] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("bankeos_pw");
    if (saved) setPassword(saved);
  }, []);

  if (!password) return <PasswordGate onUnlock={setPassword} />;
  if (!currentAgent) return <Home onSelect={setCurrentAgent} />;

  return (
    <div>
      <div style={{ position:"fixed", top:0, left:0, right:0, background:"#F5F0E8", borderBottom:"1px solid #e0d8cc", padding:"12px 24px", zIndex:100, display:"flex", alignItems:"center" }}>
        <button onClick={() => setCurrentAgent(null)}
          style={{ background:"none", border:"none", fontFamily:"monospace", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#999", cursor:"pointer", padding:0 }}>
          ← All agents
        </button>
      </div>
      <div style={{ paddingTop:48 }}>
        {currentAgent === "card" && <CardAgent password={password} />}
        {currentAgent === "linkedin" && <LinkedInAgent password={password} />}
        {currentAgent === "repurpose" && <RepurposeAgent password={password} />}
        {currentAgent === "trend" && <TrendAgent password={password} />}
      </div>
    </div>
  );
}
