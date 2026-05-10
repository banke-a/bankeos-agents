import { useState } from "react";
import { callClaude } from "./api.js";

const SYSTEM_PROMPT = `You are a content agent for Banke Ajayi's personal brand. You repurpose video transcripts and rough notes into LinkedIn posts.

ABOUT BANKE:
- AI Implementation Consultant, founder, builder. 20 years in quantitative risk at Barclays, Deutsche Bank, BNP Paribas, Citigroup.
- Bi-continental: Lagos and London. Building for African SMEs and global consulting clients.
- Author of "No One Cares About Dashboards". SSRN white paper on Africa's trust infrastructure.
- Target audience: the non-technical business owner who knows they need to be doing something but cannot build the systems themselves.

VOICE:
- Clear, concise, articulate, engaging, approachable
- Direct without blunt. Plain language. Never preachy.
- Short paragraphs — two to four sentences. Opens with observation or reframe, never a definition.
- Closes with principle or implication — never a hard sell.
- NEVER use: em dashes, "delve", "leverage", "unlock", "game-changer", "transformative", "robust", "seamless", "comprehensive", "thought leader"
- Arguments in prose. Bullets only for practical lists. Never summarise at the end. No hashtags.

REPURPOSING RULES:
- Do NOT summarise — extract the sharpest single idea and build the post around it.
- The post must stand alone without the viewer needing to watch the video.
- Cut anything that only works spoken — filler, verbal transitions, repeated points.
- Clean up rough or unpolished transcripts — the post should read as written, not transcribed.

POST FORMAT:
- 150 to 250 words. Strong opening line. Short paragraphs. Closes on principle.

OUTPUT FORMAT — ONLY valid JSON:
{
  "post": "Full post text",
  "pillar": "Pillar name",
  "core_idea": "The sharpest single idea extracted",
  "opening_line": "First line only",
  "word_count": 180
}`;

const PILLARS = ["Foundations before tools","Context-aware building","The founder journey","First principles thinking","Life by design"];

export default function RepurposeAgent({ password }) {
  const [transcript, setTranscript] = useState("");
  const [context, setContext] = useState("");
  const [pillar, setPillar] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!transcript.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const parsed = await callClaude(password, {
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Repurpose this into a LinkedIn post.\n\nTranscript:\n${transcript}\n\n${context ? `Context: ${context}` : ""}\n${pillar ? `Pillar: ${pillar}` : "Choose the most appropriate pillar."}\n\nReturn only the JSON object.` }]
      });
      setResult(parsed);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const s = { input: { width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"12px 16px", fontSize:14, fontFamily:"'Georgia',serif", color:"#1a1a1a", resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.7 }, label: { display:"block", fontFamily:"monospace", fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"#999", marginBottom:8 } };

  return (
    <div style={{ minHeight:"100vh", background:"#F5F0E8", fontFamily:"'Georgia',serif", padding:"48px 24px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:680, marginBottom:48 }}>
        <p style={{ fontFamily:"monospace", fontSize:11, letterSpacing:"0.2em", color:"#999", textTransform:"uppercase", margin:"0 0 8px 0" }}>BankeOS</p>
        <h1 style={{ fontSize:28, fontWeight:700, color:"#1a1a1a", margin:0, letterSpacing:"-0.02em" }}>Repurpose Agent</h1>
        <p style={{ fontSize:14, color:"#666", margin:"8px 0 0 0", fontFamily:"monospace" }}>Video transcript or rough notes → LinkedIn post</p>
      </div>

      <div style={{ width:"100%", maxWidth:680, background:"#fff", border:"1px solid #e0d8cc", padding:32, marginBottom:32 }}>
        <div style={{ marginBottom:20 }}>
          <label style={s.label}>Transcript or rough notes</label>
          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste your video transcript, voiceover script, or rough notes here..." rows={8} style={s.input} />
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={s.label}>Additional context (optional)</label>
          <textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g. Sit-down video about why founders should understand how code works" rows={2} style={{ ...s.input, lineHeight:1.6 }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={s.label}>Content pillar (optional)</label>
          <select value={pillar} onChange={(e) => setPillar(e.target.value)}
            style={{ width:"100%", border:"1px solid #e0d8cc", background:"#faf8f4", padding:"10px 14px", fontSize:13, fontFamily:"monospace", color:"#1a1a1a", outline:"none", cursor:"pointer" }}>
            <option value="">Auto-select</option>
            {PILLARS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading || !transcript.trim()}
          style={{ width:"100%", background:loading||!transcript.trim()?"#ccc":"#1a1a1a", color:"#fff", border:"none", padding:"14px 24px", fontSize:13, fontFamily:"monospace", letterSpacing:"0.15em", textTransform:"uppercase", cursor:loading||!transcript.trim()?"not-allowed":"pointer" }}>
          {loading ? "Repurposing..." : "Generate LinkedIn post"}
        </button>
      </div>

      {error && <div style={{ width:"100%", maxWidth:680, background:"#fff0f0", border:"1px solid #ffcccc", padding:"16px 20px", marginBottom:24, fontFamily:"monospace", fontSize:13, color:"#cc0000" }}>{error}</div>}

      {result && (
        <div style={{ width:"100%", maxWidth:680 }}>
          <div style={{ background:"#1a1a1a", padding:"16px 20px", marginBottom:16, fontFamily:"monospace", fontSize:12, color:"#F5F0E8", lineHeight:1.6 }}>
            <span style={{ color:"#999", textTransform:"uppercase", letterSpacing:"0.1em", fontSize:10, display:"block", marginBottom:4 }}>Core idea extracted</span>
            {result.core_idea}
          </div>
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
