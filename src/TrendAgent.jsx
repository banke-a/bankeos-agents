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

const STAGES = {
  idle: null,
  researching: { label: "Searching the web...", progress: 30 },
  research_done: { label: "Research complete.", progress: 60 },
  generating: { label: "Generating content...", progress: 85 },
  done: { label: "Done.", progress: 100 },
};

export default function TrendAgent({ password }) {
  const [topic, setTopic] = useState("");
  const [area, setArea] = useState("");
  const [outputType, setOutputType] = useState("linkedin");
  const [stage, setStage] = useState("idle");
  const [research, setResearch] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const loading = stage !== "idle" && stage !== "done";

  const headers = {
    "Content-Type": "application/json",
    "X-Site-Password": password,
  };

  const run = async () => {
    if (!topic.trim()) return;
    setError(null);
    setResult(null);
    setResearch(null);

    // Stage 1 — Research
    setStage("researching");
    try {
      const researchRes = await fetch("/api/research", {
        method: "POST",
        headers,
        body: JSON.stringify({ topic, area }),
      });

      if (researchRes.status === 401) throw new Error("Unauthorised");
      if (!researchRes.ok) {
        const err = await researchRes.json();
        throw new Error(err.error || "Research failed");
      }

      const researchData = await researchRes.json();
      setResearch(researchData);
      setStage("research_done");

      // Small pause so user sees the research complete state
      await new Promise((r) => setTimeout(r, 800));

      // Stage 2 — Generate content
      setStage("generating");
      const contentRes = await fetch("/api/generate-content", {
        method: "POST",
        headers,
        body: JSON.stringify({
          researchSummary: researchData.summary,
          outputType,
        }),
      });

      if (!contentRes.ok) {
        const err = await contentRes.json();
        throw new Error(err.error || "Content generation failed");
      }

      const contentData = await contentRes.json();
      contentData.sources = researchData.sources;
      setResult(contentData);
      setStage("done");

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStage("idle");
    }
  };

  const reset = () => {
    setStage("idle");
    setResult(null);
    setResearch(null);
    setError(null);
  };

  const s = {
    label: { display: "block", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#999", marginBottom: 8 },
  };

  const currentStage = STAGES[stage];

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "'Georgia',serif", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 680, marginBottom: 48 }}>
        <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase", margin: "0 0 8px 0" }}>BankeOS</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", margin: 0, letterSpacing: "-0.02em" }}>Trend Agent</h1>
        <p style={{ fontSize: 14, color: "#666", margin: "8px 0 0 0", fontFamily: "monospace" }}>Real-time research → content grounded in what's happening now</p>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2a9d5c" }} />
          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#999", letterSpacing: "0.1em" }}>PERPLEXITY PRO-SEARCH + CLAUDE</span>
        </div>
      </div>

      {/* Input Panel */}
      {stage === "idle" && (
        <div style={{ width: "100%", maxWidth: 680, background: "#fff", border: "1px solid #e0d8cc", padding: 32, marginBottom: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Topic to research</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. AI adoption challenges for African SMEs"
              list="topic-suggestions"
              style={{ width: "100%", border: "1px solid #e0d8cc", background: "#faf8f4", padding: "12px 16px", fontSize: 15, fontFamily: "'Georgia',serif", color: "#1a1a1a", outline: "none", boxSizing: "border-box" }}
            />
            <datalist id="topic-suggestions">
              {TOPICS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={s.label}>Context area (optional)</label>
            <select value={area} onChange={(e) => setArea(e.target.value)}
              style={{ width: "100%", border: "1px solid #e0d8cc", background: "#faf8f4", padding: "10px 14px", fontSize: 13, fontFamily: "monospace", color: "#1a1a1a", outline: "none", cursor: "pointer" }}>
              <option value="">General</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>Output format</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { id: "linkedin", label: "LinkedIn post", desc: "Full thought leadership post" },
                { id: "card", label: "Card content", desc: "Hero + supporting text" },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setOutputType(opt.id)}
                  style={{ background: outputType === opt.id ? "#1a1a1a" : "#faf8f4", color: outputType === opt.id ? "#fff" : "#1a1a1a", border: "1px solid #e0d8cc", padding: "12px 16px", textAlign: "left", cursor: "pointer", fontFamily: "monospace" }}>
                  <p style={{ margin: "0 0 2px 0", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>{opt.label}</p>
                  <p style={{ margin: 0, fontSize: 10, opacity: 0.7 }}>{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={run} disabled={!topic.trim()}
            style={{ width: "100%", background: !topic.trim() ? "#ccc" : "#1a1a1a", color: "#fff", border: "none", padding: "14px 24px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", cursor: !topic.trim() ? "not-allowed" : "pointer" }}>
            Research and generate
          </button>
        </div>
      )}

      {/* Progress */}
      {loading && currentStage && (
        <div style={{ width: "100%", maxWidth: 680 }}>
          <div style={{ background: "#fff", border: "1px solid #e0d8cc", padding: 32, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#1a1a1a", letterSpacing: "0.05em" }}>{currentStage.label}</span>
              <span style={{ fontFamily: "monospace", fontSize: 12, color: "#999" }}>{currentStage.progress}%</span>
            </div>
            <div style={{ height: 2, background: "#e0d8cc", borderRadius: 1 }}>
              <div style={{ height: "100%", background: "#1a1a1a", borderRadius: 1, width: `${currentStage.progress}%`, transition: "width 0.5s ease" }} />
            </div>
            {stage === "researching" && (
              <p style={{ fontFamily: "monospace", fontSize: 11, color: "#999", margin: "16px 0 0 0", letterSpacing: "0.05em" }}>
                Perplexity is searching the web in real time. This takes 20-40 seconds.
              </p>
            )}
          </div>

          {/* Show research summary once available */}
          {stage === "generating" && research && (
            <div style={{ background: "#faf8f4", border: "1px solid #e0d8cc", padding: "20px 24px", marginBottom: 16 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#2a9d5c", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: 8 }}>Research complete — generating content</span>
              <p style={{ fontFamily: "monospace", fontSize: 12, color: "#555", margin: 0, lineHeight: 1.6 }}>{research.summary.slice(0, 300)}...</p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ width: "100%", maxWidth: 680, marginBottom: 24 }}>
          <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", padding: "16px 20px", marginBottom: 12, fontFamily: "monospace", fontSize: 13, color: "#cc0000" }}>
            {error}
          </div>
          <button onClick={reset}
            style={{ background: "none", border: "1px solid #e0d8cc", padding: "10px 20px", fontSize: 12, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", color: "#999" }}>
            Try again
          </button>
        </div>
      )}

      {/* Result */}
      {result && stage === "done" && (
        <div style={{ width: "100%", maxWidth: 680 }}>

          {/* Research insight */}
          <div style={{ background: "#1a1a1a", padding: "16px 20px", marginBottom: 16 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Research insight</span>
            <p style={{ fontFamily: "monospace", fontSize: 12, color: "#F5F0E8", margin: 0, lineHeight: 1.6 }}>{result.insight}</p>
          </div>

          {/* Verify flag */}
          {result.verify && (
            <div style={{ background: "#fff8e6", border: "1px solid #f0d080", padding: "14px 20px", marginBottom: 16 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#b08000", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Check this claim before publishing</span>
              <p style={{ fontFamily: "monospace", fontSize: 12, color: "#555", margin: 0, lineHeight: 1.5 }}>{result.verify}</p>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div style={{ background: "#faf8f4", border: "1px solid #e0d8cc", padding: "16px 20px", marginBottom: 16 }}>
              <span style={{ fontFamily: "monospace", fontSize: 10, color: "#999", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>Sources</span>
              {result.sources.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", fontFamily: "monospace", fontSize: 11, color: "#555", marginBottom: 4, textDecoration: "none" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(result.post); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: copied ? "#1a1a1a" : "#fff", color: copied ? "#fff" : "#1a1a1a", border: "1px solid #1a1a1a", padding: "14px 24px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
                  {copied ? "Copied" : "Copy post"}
                </button>
                <button onClick={reset}
                  style={{ background: "none", border: "1px solid #e0d8cc", padding: "14px 24px", fontSize: 13, fontFamily: "monospace", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", color: "#999" }}>
                  New research
                </button>
              </div>
            </>
          )}

          {/* Card output */}
          {outputType === "card" && (
            <>
              <div style={{ background: "#F5F0E8", border: "1px solid #e0d8cc", padding: "64px 48px 48px", marginBottom: 16, minHeight: 400, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <h2 style={{ fontSize: 64, fontWeight: 900, color: "#1a1a1a", margin: 0, lineHeight: 1, letterSpacing: "-0.03em", fontFamily: "'Georgia',serif" }}>{result.hero}</h2>
                <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "0.12em", color: "#555", margin: 0, lineHeight: 1.7, maxWidth: "55%", alignSelf: "flex-end", textAlign: "right" }}>{result.supporting}</p>
              </div>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: "#999", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Pillar: {result.pillar}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <button onClick={() => { navigator.clipboard.writeText(result.hero); setCopied("hero"); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: copied === "hero" ? "#1a1a1a" : "#fff", color: copied === "hero" ? "#fff" : "#1a1a1a", border: "1px solid #1a1a1a", padding: "12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                  {copied === "hero" ? "Copied" : "Copy hero"}
                </button>
                <button onClick={() => { navigator.clipboard.writeText(result.supporting); setCopied("supporting"); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: copied === "supporting" ? "#1a1a1a" : "#fff", color: copied === "supporting" ? "#fff" : "#1a1a1a", border: "1px solid #1a1a1a", padding: "12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>
                  {copied === "supporting" ? "Copied" : "Copy supporting"}
                </button>
                <button onClick={reset}
                  style={{ background: "none", border: "1px solid #e0d8cc", padding: "12px", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: "#999" }}>
                  New research
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
