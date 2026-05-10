// Standard serverless function — longer timeout than edge runtime
const SITE_PASSWORD = process.env.SITE_PASSWORD;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Site-Password');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sitePassword = req.headers['x-site-password'];
  if (!SITE_PASSWORD || sitePassword !== SITE_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorised' });
  }

  try {
    const { topic, area, outputType } = req.body;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // Step 1 — Perplexity Agent API
    const searchInput = `Research what is currently being discussed about: "${topic}"${area ? ` in the context of ${area}` : ''}.

Find:
1. Recent news, data, or developments (last 30 days where possible)
2. What practitioners, founders, or business leaders are saying
3. Relevant statistics, case studies, or real examples
4. African market context if relevant

Return a structured summary with the most interesting angle, key facts, and source URLs.`;

    const perplexityResponse = await fetch('https://api.perplexity.ai/v1/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        preset: 'pro-search',
        input: searchInput,
      }),
      signal: AbortSignal.timeout(45000), // 45 second timeout
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      throw new Error(`Perplexity error ${perplexityResponse.status}: ${errText.slice(0, 200)}`);
    }

    const perplexityData = await perplexityResponse.json();

    // Extract research text and sources
    let researchSummary = perplexityData.output_text || '';
    const sources = [];

    if (perplexityData.output) {
      for (const block of perplexityData.output) {
        if (block.type === 'message' && block.content && !researchSummary) {
          for (const content of block.content) {
            if (content.type === 'output_text') researchSummary += content.text;
          }
        }
        if (block.results) {
          for (const result of block.results) {
            if (result.url && result.title) sources.push({ title: result.title, url: result.url });
          }
        }
      }
    }

    if (!researchSummary) throw new Error('No research content returned. Please try again.');

    // Step 2 — Claude generates content
    const isCard = outputType === 'card';

    const contentPrompt = isCard
      ? `Based on this research, generate a "Lessons I Have Learnt" card for Banke Ajayi's personal brand.

RESEARCH:
${researchSummary.slice(0, 3000)}

TARGET AUDIENCE: Non-technical business owners who know they need to act but cannot build the systems themselves.

CARD FORMAT:
- HERO: one to four words, punchy, sentence case with full stop. e.g. "Context matters."
- SUPPORTING: ALL CAPS, three to five sentences, closes on a principle. No em dashes.

Return ONLY valid JSON:
{
  "hero": "Short punchy text.",
  "supporting": "SENTENCE ONE. SENTENCE TWO. SENTENCE THREE.",
  "insight": "One sentence — the core research insight",
  "pillar": "Most relevant content pillar"
}`
      : `Based on this research, generate a LinkedIn post for Banke Ajayi's personal brand.

RESEARCH:
${researchSummary.slice(0, 3000)}

ABOUT BANKE: AI Implementation Consultant and founder. 20 years in quantitative risk at tier-1 banks. Bi-continental Lagos and London. Consulting is global; platforms focus on African SMEs.

TARGET AUDIENCE: Non-technical business owners who know they need to act but cannot build the systems themselves.

VOICE: Clear, concise, direct. Plain language. Short paragraphs. Opens with observation or reframe. Closes with principle. NEVER use em dashes, "delve", "leverage", "unlock", "game-changer", "transformative". 150 to 250 words. No hashtags.

Ground the post in the actual research — reference a specific finding. Make it current, not generic.

Return ONLY valid JSON:
{
  "post": "Full post text",
  "pillar": "Most relevant content pillar",
  "opening_line": "First line only",
  "insight": "Core research finding that grounds this post",
  "word_count": 180
}`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: contentPrompt }],
      }),
    });

    const claudeData = await claudeResponse.json();
    const claudeText = claudeData.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const clean = claudeText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    parsed.sources = sources.slice(0, 3);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Trend agent error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
