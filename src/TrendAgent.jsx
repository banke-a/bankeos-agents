import { useState } from "react";

const AREAS = [
  "African business and SME markets",
  "AI implementation for non-technical businesses",
  "Founder and entrepreneurship",
  "Data and analytics for growing businesses",
  "Digital transformation",
];

const TOPICS = [
  "AI adoption challenges for SMEs",
  "Digital payments in Africa",
  "Trust infrastructure in African markets",
  "Founders using AI to automate operations",
  "Data literacy in growing businesses",
  "WhatsApp commerce in emerging markets",
];

export default function TrendAgent({ password }) {
  const [topic, setTopic] = useState("");
  const [area, setArea] = useState("");
  const [outputType, setOutputType] = useState("linkedin");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStage("Searching the web for current trends...");

    try {
      const response = await fetch("/api/trend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Site-Password": password,
        },
        body: JSON.stringify({ topic, area, outputType }),
      });

      setStage("Synthesising research and generating content...");

      if (response.status === 401) throw new Error("Unauthorised");
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "API error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setStage("");
    }
  };

  const s = {
    label: { display: "block", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 8 },
    input: { width: "100%", border: "1px solid #e0d8cc", background: "#faf8f4", padding: "12px 16px", fontSize: 15, fontFamily: "'Georgia',serif", color: "#1a1a1a", outline: "none", boxSizing: "border-box", lineHeight: 1.6 },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Georgia',serif", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 680, marginBottom: 48 }}>
        <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", margin: "0 0 8px 0" }}>BankeOS</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>Trend Agent</h1>
        <p style={{ fontSize: 14, color: "#666", margin: "8px 0 0 0", fontFamily: "monospace" }}>Real-time research → content grounded in what's happening now</p>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a9d5c" }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em" }}>POWERED BY PERPLEXITY + CLAUDE</span>
        </div>
      </div>

      {/* Input Panel */}
      <div style={{ width: "100%", maxWidth: 680, background: "#fff", border: "1px solid #e0d8cc", padding: 32, marginBottom: 32 }}>

        {/* Topic */}
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Topic to research</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. AI adoption challenges for African SMEs"
            list="topic-suggestions"
            style={{ ...s.input, resize: undefined }}
          />
          <datalist id="topic-suggestions">
            {TOPICS.map((t) => <option key={t} value={t} />)}
          </datalist>
          <p style={{ fontFamily: "monospace", fontSize: 10, color: "#bbb", margin: "6px 0 0 0", letterSpacing: "0.05em" }}>Type your own or pick a suggestion</p>
        </div>

        {/* Area */}
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>Context area (optional)</label>
          <select value={area} onChange={(e) => setArea(e.target.value)}
            style={{ width: "100%", border: "1px solid #e0d8cc", background: "#faf8f4", padding: "10px 14px", fontSize: 13, fontFamily: "monospace", color: "#1a1a1a", outline: "none", cursor: "pointer" }}>
            <option value="">General — let the agent decide</option>
            {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        {/* Output type */}
        <div style={{ marginBottom: 24 }}>
          <label style={s.label}>Output format</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { id: "linkedin", label: "LinkedIn post", desc: "Full thought leadership post" },
              { id: "card", label: "Card content", desc: "Hero + supporting text" },
            ].map((opt) => (
              <button key={opt.id} onClick={() => setOutputType(opt.id)}
                style={{
                  background: outputType === opt.id ? "#1a1a1a" : "#faf8f4",
                  color: outputType === opt.id ? "#fff" : "#1a1a1a",
                  border: "1px solid #e0d8cc",
                  padding: "12px 16px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}>
                <p style={{ margin: "0 0 2px 0", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>{opt.label}</p>
                <p style={{ margin: 0, fontSize: 10, opacity: 0.7 }}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generate} disabled={loading || !topic.trim()}
          style={{ width: "100%", background: loading || !topic.trim() ? "#ccc" : "#1a1a1a", color: "#fff", border: "none", padding: "14px 24px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", cursor: loading || !topic.trim() ? "not-allowed" : "pointer" }}>
          {loading ? stage || "Researching..." : "Research and generate"}
        </button>

        {loading && (
          <p style={{ fontFamily: "monospace", fontSize: 11, color: "#999", margin: "12px 0 0 0", textAlign: "center", letterSpacing: "0.05em" }}>
            This takes 15–30 seconds — the agent is searching the web in real time.
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ width: "100%", maxWidth: 680, background: "#fff0f0", border: "1px solid #ffcccc", padding: "16px 20px", marginBottom: 24, fontFamily: "monospace", fontSize: 13, color: "#cc0000" }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ width: "100%", maxWidth: 680 }}>

          {/* Research insight */}
          <div style={{ background: "#1a1a1a", padding: "16px 20px", marginBottom: 16 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Research insight</span>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#F5F0E8", margin: 0, lineHeight: 1.6 }}>{result.insight}</p>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div style={{ background: "#faf8f4", border: "1px solid #e0d8cc", padding: "16px 20px", marginBottom: 16 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Sources</span>
              {result.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", fontFamily: "monospace", fontSize: 11, color: "#555", marginBottom: 4, textDecoration: "none", letterSpacing: "0.02em" }}>
                  → {s.title || s.url}
                </a>
              ))}
            </div>
          )}

          {/* LinkedIn output */}
          {outputType === "linkedin" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                <span>Pillar: {result.pillar}</span>
                <span>{result.word_count} words</span>
              </div>
              <div style={{ background: "#fff", border: "1px solid #e0d8cc", padding: 32, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #f0ece4" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5F0E8", fontFamily: "monospace", fontSize: 14, fontWeight: 700 }}>BA</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>Banke Ajayi</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#999", fontFamily: "monospace" }}>AI Implementation Consultant · Founder</p>
                  </div>
                </div>
                <div style={{ fontSize: 15, color: "#1a1a1a", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "'Georgia',serif" }}>{result.post}</div>
              </div>
              <div style={{ background: "#faf8f4", border: "1px solid #e0d8cc", borderLeft: "3px solid #1a1a1a", padding: "12px 16px", marginBottom: 16, fontFamily: "monospace", fontSize: 12, color: "#555" }}>
                <span style={{ color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 10 }}>Opening line: </span>{result.opening_line}
              </div>
              <button onClick={() => { navigator.clipboard.writeText(result.post); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                style={{ width: "100%", background: copied ? "#1a1a1a" : "#fff", color: copied ? "#fff" : "#1a1a1a", border: "1px solid #1a1a1a", padding: "14px 24px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
                {copied ? "Copied to clipboard" : "Copy post"}
              </button>
            </>
          )}

          {/* Card output */}
          {outputType === "card" && (
            <>
              <div style={{ background: "#F5F0E8", border: "1px solid #e0d8cc", padding: "64px 48px 48px", marginBottom: 16, minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 64, fontWeight: 900, color: "#1a1a1a", margin: 0, lineHeight: 1, letterSpacing: "-0.03em", fontFamily: "'Georgia',serif" }}>{result.hero}</h2>
                <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.12em", color: "#555", margin: 0, lineHeight: 1.7, maxWidth: "55%", alignSelf: "flex-end", textAlign: "right" }}>{result.supporting}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <button onClick={() => { navigator.clipboard.writeText(result.hero); setCopied("hero"); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: copied === "hero" ? "#1a1a1a" : "#fff", color: copied === "hero" ? "#fff" : "#1a1a1a", border: "1px solid #1a1a1a", padding: "12px 20px", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                  {copied === "hero" ? "Copied" : "Copy hero"}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(result.supporting); setCopied("supporting"); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: copied === "supporting" ? "#1a1a1a" : "#fff", color: copied === "supporting" ? "#fff" : "#1a1a1a", border: "1px solid #1a1a1a", padding: "12px 20px", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                  {copied === "supporting" ? "Copied" : "Copy supporting"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
