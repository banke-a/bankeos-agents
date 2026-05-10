import { useState } from "react";
import { callClaude } from "./api.js";

const SYSTEM_PROMPT = `You are a content agent for Banke Ajayi's personal brand. You generate content for her "Lessons I Have Learnt" card series.

ABOUT BANKE:
- AI Implementation Consultant, founder, builder. 20 years in quantitative risk at Barclays, Deutsche Bank, BNP Paribas, Citigroup.
- Bi-continental: Lagos and London. Building for African SMEs and global consulting clients.
- Platforms: CommandHQ, BankeOS, Find A Biz Africa, YouSabiSell, BizTraka, Ahjayee Consulting.
- Author of "No One Cares About Dashboards". Published SSRN white paper on Africa's trust infrastructure.
- Through-line: problem solving using properly structured systems and data.

VOICE:
- Clear, concise, articulate, engaging, approachable
- Direct without blunt. Warm without performative. Authoritative without intimidating.
- Plain language. If it needs jargon to explain, the thinking is not clear enough yet.
- Never preachy — state the principle once, trust the reader.
- Moves from observation to principle to implication.
- NEVER use em dashes (—), "delve", "leverage", "unlock", "game-changer", "transformative", "robust", "seamless", "comprehensive", "thought leader"

CONTENT PILLARS:
1. Foundations before tools
2. Context-aware building
3. The founder journey
4. First principles thinking
5. Life by design

CARD FORMAT:
Two text elements only:
1. HERO TEXT — one to four words maximum. Punchy. Sentence case with full stop. e.g. "Build anyway." / "Fix the foundation."
2. SUPPORTING TEXT — written in ALL CAPS. Three to five sentences. No preamble. Closes on a principle, never a call to action. No em dashes.

OUTPUT FORMAT:
Return ONLY valid JSON. No preamble, no markdown, no explanation:
{
  "hero": "Short punchy text.",
  "supporting": "FIRST SENTENCE. SECOND SENTENCE. THIRD SENTENCE.",
  "pillar": "Pillar name",
  "number": "003"
}`;

const PILLARS = [
  "Foundations before tools",
  "Context-aware building",
  "The founder journey",
  "First principles thinking",
  "Life by design",
];

export default function CardAgent({ password }) {
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("");
  const [cardNumber, setCardNumber] = useState("003");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const parsed = await callClaude(password, {
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `Generate a Lessons I Have Learnt card.\n\nTopic: ${topic}\n${pillar ? `Pillar: ${pillar}` : "Choose the most appropriate pillar."}\nCard number: ${cardNumber}\n\nReturn only the JSON object.`
        }]
      });
      setResult(parsed);
      setCardNumber(String(parseInt(cardNumber) + 1).padStart(3, "0"));
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0E8", fontFamily:"'Georgia',serif", padding:"48px 24px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:680, marginBottom:48 }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", color:"#999", textTransform:"uppercase", margin:"0 0 8px 0" }}>BankeOS</p>
        <h1 style={{ fontSize:28, fontWeight:700, color:"#1a1a1a", margin:0, letterSpacing:"-0.02em" }}>Card Agent</h1>
        <p style={{ fontSize:14, color:"#666", margin:"8px 0 0 0", fontFamily:"monospace" }}>Lessons I Have Learnt — content generator</p>
      </div>

      <div style={{ width:"100%", maxWidth:680, background:"#fff", border:"1px solid #e0d8cc", padding:32, marginBottom:32 }}>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:"block", fontFamily:"monospace", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#999", marginBottom:8 }}>Topic or idea</label>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. The data literacy problem" rows={3}
            style={{ width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"12px 16px", fontSize:15, fontFamily:"'Georgia',serif", color:"#1a1a1a", resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.6 }} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
          <div>
            <label style={{ display:"block", fontFamily:"monospace", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#999", marginBottom:8 }}>Pillar (optional)</label>
            <select value={pillar} onChange={(e) => setPillar(e.target.value)}
              style={{ width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"10px 14px", fontSize:13, fontFamily:"monospace", color:"#1a1a1a", outline:"none", cursor:"pointer" }}>
              <option value="">Auto-select</option>
              {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display:"block", fontFamily:"monospace", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#999", marginBottom:8 }}>Card number</label>
            <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
              style={{ width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"10px 14px", fontSize:13, fontFamily:"monospace", color:"#1a1a1a", outline:"none", boxSizing:"border-box" }} />
          </div>
        </div>
        <button onClick={generate} disabled={loading || !topic.trim()}
          style={{ width:"100%", background:loading||!topic.trim()?"#ccc":"#1a1a1a", color:"#fff", border:"none", padding:"14px 24px", fontSize:13, fontFamily:"monospace", letterSpacing:"0.15em", textTransform:"uppercase", cursor:loading||!topic.trim()?"not-allowed":"pointer" }}>
          {loading ? "Generating..." : "Generate card content"}
        </button>
      </div>

      {error && <div style={{ width:"100%", maxWidth:680, background:"#fff0f0", border:"1px solid #ffcccc", padding:"16px 20px", marginBottom:24, fontFamily:"monospace", fontSize:13, color:"#cc0000" }}>{error}</div>}

      {result && (
        <div style={{ width:"100%", maxWidth:680 }}>
          <div style={{ background:"#F5F0E8", border:"1px solid #e0d8cc", padding:"64px 48px 48px", marginBottom:24, minHeight:480, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
            <h2 style={{ fontSize:72, fontWeight:900, color:"#1a1a1a", margin:0, lineHeight:1, letterSpacing:"-0.03em", fontFamily:"'Georgia',serif" }}>{result.hero}</h2>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
              <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.12em", color:"#555", margin:0, lineHeight:1.7, textAlign:"right", maxWidth:"55%" }}>{result.supporting}</p>
              <p style={{ fontFamily:"monospace", fontSize:11, color:"#999", margin:0, letterSpacing:"0.1em" }}>{result.number}</p>
            </div>
          </div>
          <p style={{ fontFamily:"monospace", fontSize:11, color:"#999", letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:24 }}>Pillar: {result.pillar}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            <button onClick={() => copyText(result.hero, "hero")}
              style={{ background:copied==="hero"?"#1a1a1a":"#fff", color:copied==="hero"?"#fff":"#1a1a1a", border:"1px solid #1a1a1a", padding:"12px 20px", fontSize:12, fontFamily:"monospace", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
              {copied==="hero" ? "Copied" : "Copy hero text"}
            </button>
            <button onClick={() => copyText(result.supporting, "supporting")}
              style={{ background:copied==="supporting"?"#1a1a1a":"#fff", color:copied==="supporting"?"#fff":"#1a1a1a", border:"1px solid #1a1a1a", padding:"12px 20px", fontSize:12, fontFamily:"monospace", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
              {copied==="supporting" ? "Copied" : "Copy supporting text"}
            </button>
          </div>
          <button onClick={() => copyText(`HERO: ${result.hero}\n\nSUPPORTING: ${result.supporting}\n\nNUMBER: ${result.number}\nPILLAR: ${result.pillar}`, "all")}
            style={{ width:"100%", background:copied==="all"?"#1a1a1a":"transparent", color:copied==="all"?"#fff":"#999", border:"1px solid #e0d8cc", padding:"12px 20px", fontSize:12, fontFamily:"monospace", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}>
            {copied==="all" ? "Copied" : "Copy all for designer"}
          </button>
        </div>
      )}
    </div>
  );
}
