export const config = {
  runtime: 'edge',
};

const SITE_PASSWORD = process.env.SITE_PASSWORD;

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Site-Password',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const sitePassword = req.headers.get('X-Site-Password');
  if (!SITE_PASSWORD || sitePassword !== SITE_PASSWORD) {
    return new Response(JSON.stringify({ error: 'Unauthorised' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { topic, area, outputType } = await req.json();
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    // Step 1 — Perplexity Agent API with pro-search preset
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
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      throw new Error(`Perplexity API error: ${perplexityResponse.status} — ${errText}`);
    }

    const perplexityData = await perplexityResponse.json();

    // Extract research text and sources from response
    let researchSummary = '';
    const sources = [];

    if (perplexityData.output) {
      for (const block of perplexityData.output) {
        // Extract text content
        if (block.type === 'message' && block.content) {
          for (const content of block.content) {
            if (content.type === 'output_text') {
              researchSummary += content.text;
            }
          }
        }
        // Extract search result sources
        if (block.results) {
          for (const result of block.results) {
            if (result.url && result.title) {
              sources.push({ title: result.title, url: result.url });
            }
          }
        }
      }
    }

    // Fallback — use output_text if available
    if (!researchSummary && perplexityData.output_text) {
      researchSummary = perplexityData.output_text;
    }

    if (!researchSummary) {
      throw new Error('No research content returned from Perplexity. Please try again.');
    }

    // Step 2 — Claude generates content from research
    const isCard = outputType === 'card';

    const contentPrompt = isCard
      ? `Based on this research, generate a "Lessons I Have Learnt" card for Banke Ajayi's personal brand.

RESEARCH:
${researchSummary}

TARGET AUDIENCE: Non-technical business owners who know they need to act but cannot build the systems themselves.

VOICE: Clear, concise, direct without blunt. Plain language. No em dashes. Never preachy.

CARD FORMAT:
- HERO: one to four words, punchy, sentence case with full stop. e.g. "Context matters."
- SUPPORTING: ALL CAPS, three to five sentences, closes on a principle not a call to action. No em dashes.

Find the sharpest single insight from the research that connects to this audience.

Return ONLY valid JSON — no markdown, no preamble:
{
  "hero": "Short punchy text.",
  "supporting": "SENTENCE ONE. SENTENCE TWO. SENTENCE THREE.",
  "insight": "One sentence — the core research insight",
  "pillar": "Most relevant content pillar"
}`
      : `Based on this research, generate a LinkedIn post for Banke Ajayi's personal brand.

RESEARCH:
${researchSummary}

ABOUT BANKE: AI Implementation Consultant and founder. 20 years in quantitative risk at tier-1 banks. Bi-continental Lagos and London. Building for African SMEs and global consulting clients.

TARGET AUDIENCE: Non-technical business owners who know they need to act but cannot build the systems themselves.

VOICE:
- Clear, concise, articulate, engaging, approachable
- Direct without blunt. Plain language. Moves from observation to principle to implication.
- Short paragraphs — two to four sentences each.
- Opens with observation or reframe — never a definition.
- Closes with a principle — never a hard sell or engagement question.
- NEVER use em dashes, "delve", "leverage", "unlock", "game-changer", "transformative"
- 150 to 250 words. No hashtags.

Ground the post in the real research — reference a specific finding or development. Make it current and grounded, not generic.

Return ONLY valid JSON — no markdown, no preamble:
{
  "post": "Full post text",
  "pillar": "Most relevant content pillar",
  "opening_line": "First line only",
  "insight": "The core research finding that grounds this post",
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

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
