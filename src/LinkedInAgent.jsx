import { useState } from "react";
import { callClaude } from "./api.js";

const SYSTEM_PROMPT = `You are a content agent for Banke Ajayi's personal brand. You generate original LinkedIn thought leadership posts.

ABOUT BANKE:
- AI Implementation Consultant, founder, builder. 20 years in quantitative risk at Barclays, Deutsche Bank, BNP Paribas, Citigroup.
- Bi-continental: Lagos and London. Building for African SMEs and global consulting clients.
- Platforms: CommandHQ, BankeOS, Find A Biz Africa, YouSabiSell, BizTraka, Ahjayee Consulting.
- Author of "No One Cares About Dashboards". Published SSRN white paper on Africa's trust infrastructure.
- Target audience: the non-technical business owner who knows they need to be doing something but cannot build the systems themselves.

VOICE:
- Clear, concise, articulate, engaging, approachable
- Direct without blunt. Warm without performative. Authoritative without intimidating.
- Plain language. Never preachy. Moves from observation to principle to implication.
- Short paragraphs — two to four sentences maximum.
- Opens with personal observation or direct reframe — never a definition.
- Closes with principle or quiet implication — never a hard sell or "drop a comment below".
- NEVER use em dashes (—) under any circumstances. Not in any sentence. Not for any reason. Replace with a full stop, a comma, or rewrite the sentence entirely.
- NEVER use: "delve", "leverage", "unlock", "game-changer", "transformative", "robust", "seamless", "comprehensive", "thought leader"
- Arguments in prose, not bullets. Bullets only for practical lists. Never summarise at the end.

CONTENT PILLARS:
1. Foundations before tools
2. Context-aware building
3. The founder journey
4. First principles thinking
5. Life by design

POST FORMAT:
- 150 to 250 words
- Strong opening line — stops the scroll, no preamble
- Short paragraphs throughout
- Closes on principle or implication — never an engagement question
- No hashtags

OUTPUT FORMAT — ONLY valid JSON:
{
  "post": "Full post text",
  "pillar": "Pillar name",
  "opening_line": "First line only",
  "word_count": 180
}`;

const PILLARS = ["Foundations before tools","Context-aware building","The founder journey","First principles thinking","Life by design"];

export default function LinkedInAgent({ password }) {
  const [topic, setTopic] = useState("");
  const [angle, setAngle] = useState("");
  const [pillar, setPillar] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const parsed = await callClaude(password, {
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Generate an original LinkedIn post.\n\nTopic: ${topic}\n${angle ? `Angle: ${angle}` : ""}\n${pillar ? `Pillar: ${pillar}` : "Choose the most appropriate pillar."}\n\nReturn only the JSON object.` }]
      });
      setResult(parsed);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const s = { input: { width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"12px 16px", fontSize:15, fontFamily:"'Georgia',serif", color:"#1a1a1a", resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.6 }, label: { display:"block", fontFamily:"monospace", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#999", marginBottom:8 } };

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0E8", fontFamily:"'Georgia',serif", padding:"48px 24px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:680, marginBottom:48 }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", color:"#999", textTransform:"uppercase", margin:"0 0 8px 0" }}>BankeOS</p>
        <h1 style={{ fontSize:28, fontWeight:700, color:"#1a1a1a", margin:0, letterSpacing:"-0.02em" }}>LinkedIn Agent</h1>
        <p style={{ fontSize:14, color:"#666", margin:"8px 0 0 0", fontFamily:"monospace" }}>Original thought leadership posts</p>
      </div>

      <div style={{ width:"100%", maxWidth:680, background:"#fff", border:"1px solid #e0d8cc", padding:32, marginBottom:32 }}>
        <div style={{ marginBottom:20 }}>
          <label style={s.label}>Topic</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Why most AI implementations fail before they start" rows={2} style={s.input} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={s.label}>Specific angle or opinion (optional)</label>
          <textarea value={angle} onChange={(e) => setAngle(e.target.value)} placeholder="e.g. Nobody documented the process the AI is supposed to replace" rows={2} style={s.input} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={s.label}>Content pillar (optional)</label>
          <select value={pillar} onChange={(e) => setPillar(e.target.value)}
            style={{ width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"10px 14px", fontSize:13, fontFamily:"monospace", color:"#1a1a1a", outline:"none", cursor:"pointer" }}>
            <option value="">Auto-select</option>
            {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading || !topic.trim()}
          style={{ width:"100%", background:loading||!topic.trim()?"#ccc":"#1a1a1a", color:"#fff", border:"none", padding:"14px 24px", fontSize:13, fontFamily:"monospace", letterSpacing:"0.15em", textTransform:"uppercase", cursor:loading||!topic.trim()?"not-allowed":"pointer" }}>
          {loading ? "Generating..." : "Generate post"}
        </button>
      </div>

      {error && <div style={{ width:"100%", maxWidth:680, background:"#fff0f0", border:"1px solid #ffcccc", padding:"16px 20px", marginBottom:24, fontFamily:"monospace", fontSize:13, color:"#cc0000" }}>{error}</div>}

      {result && (
        <div style={{ width:"100%", maxWidth:680 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, fontFamily:"monospace", fontSize:11, color:"#999", letterSpacing:"0.1em", textTransform:"uppercase" }}>
            <span>Pillar: {result.pillar}</span>
            <span>{result.word_count} words</span>
          </div>
          <div style={{ background:"#fff", border:"1px solid #e0d8cc", padding:32, marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, paddingBottom:16, borderBottom:"1px solid #f0ece4" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:"#1a1a1a", display:"flex", alignItems:"center", justifyContent:"center", color:"#F5F0E8", fontFamily:"monospace", fontSize:14, fontWeight:700 }}>BA</div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#1a1a1a" }}>Banke Ajayi</p>
                <p style={{ margin:0, fontSize:11, color:"#999", fontFamily:"monospace" }}>AI Implementation Consultant · Founder</p>
              </div>
            </div>
            <div style={{ fontSize:15, color:"#1a1a1a", lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"'Georgia',serif" }}>{result.post}</div>
          </div>
          <div style={{ background:"#faf8f4", border:"1px solid #e0d8cc", borderLeft:"3px solid #1a1a1a", padding:"12px 16px", marginBottom:16, fontFamily:"monospace", fontSize:12, color:"#555" }}>
            <span style={{ color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", fontSize:10 }}>Opening line: </span>{result.opening_line}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(result.post); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            style={{ width:"100%", background:copied?"#1a1a1a":"#fff", color:copied?"#fff":"#1a1a1a", border:"1px solid #1a1a1a", padding:"14px 24px", fontSize:13, fontFamily:"monospace", letterSpacing:"0.15em", textTransform:"uppercase", cursor:"pointer" }}>
            {copied ? "Copied to clipboard" : "Copy post"}
          </button>
        </div>
      )}
    </div>
  );
}
