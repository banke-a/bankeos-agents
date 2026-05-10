export const config = {
  maxDuration: 30,
};

const SITE_PASSWORD = process.env.SITE_PASSWORD;

const VOICE_RULES = `VOICE:
- Clear, concise, articulate, engaging, approachable
- Direct without blunt. Plain language. Moves from observation to principle to implication.
- Short paragraphs — two to four sentences each.
- Opens with personal observation or direct reframe — never a definition.
- Closes with a principle or quiet implication — never a hard sell or engagement question.
- NEVER use em dashes (—) under any circumstances. Not in any sentence. Not for any reason. Replace with a full stop, a comma, or rewrite the sentence entirely.
- NEVER invent client stories, specific figures, case studies, or personal experiences. If no real example is provided, use a general observation instead. Fabricated specifics destroy credibility.
- NEVER use: "delve", "leverage", "unlock", "game-changer", "transformative", "robust", "seamless", "comprehensive", "thought leader"
- No excessive exclamation marks. Arguments in prose, not bullets. Never summarise at the end.
- No hashtags.`;

const FACT_RULES = `FACT ACCURACY RULES — strictly follow these:
- Only use a statistic if it is explicitly stated in the research for that specific claim. Do not infer, extrapolate, or combine statistics from different parts of the research.
- If a statistic is given as a general range (e.g. "cuts costs by 30% or more"), do not attribute that specific figure to a named company unless the source explicitly does so.
- Named companies may be referenced as examples of a broader trend, but only with claims the source explicitly makes about them.
- When uncertain about a specific claim, state the principle without the specific figure rather than risk misattribution.
- Better to say "some operators have cut costs significantly" than "Hello Tractor cut costs by 30%" if the source does not say that directly.`;

export default async function handler(req, res) {
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
    const { researchSummary, outputType } = req.body;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const isCard = outputType === 'card';

    const contentPrompt = isCard
      ? `Based on this research, generate a "Lessons I Have Learnt" card for Banke Ajayi's personal brand.

RESEARCH:
${researchSummary.slice(0, 3000)}

ABOUT BANKE: AI Implementation Consultant and founder. 20 years in quantitative risk at tier-1 banks. Bi-continental Lagos and London. Consulting is global; platforms focus on African SMEs.

TARGET AUDIENCE: Non-technical business owners who know they need to act but cannot build the systems themselves.

${VOICE_RULES}

${FACT_RULES}

CARD FORMAT:
- HERO: one to four words, punchy, sentence case with full stop. e.g. "Context matters."
- SUPPORTING: ALL CAPS, three to five sentences, closes on a principle not a call to action. Absolutely no em dashes (—).

Find the sharpest single insight from the research that connects to this audience.

Return ONLY valid JSON — no markdown, no preamble:
{
  "hero": "Short punchy text.",
  "supporting": "SENTENCE ONE. SENTENCE TWO. SENTENCE THREE.",
  "insight": "One sentence — the core research insight",
  "pillar": "Most relevant content pillar",
  "verify": "Specific claim in this content that should be checked against the source before publishing"
}`
      : `Based on this research, generate a LinkedIn post for Banke Ajayi's personal brand.

RESEARCH:
${researchSummary.slice(0, 3000)}

ABOUT BANKE: AI Implementation Consultant and founder. 20 years in quantitative risk at tier-1 banks. Bi-continental Lagos and London. Consulting is global; platforms focus on African SMEs.

TARGET AUDIENCE: Non-technical business owners who know they need to act but cannot build the systems themselves.

${VOICE_RULES}

${FACT_RULES}

POST FORMAT: 150 to 250 words. Strong opening line — stops the scroll. Short paragraphs. Closes on principle. Ground the post in the actual research — reference a specific finding or statistic only if the research explicitly states it. Make it current, not generic.

Return ONLY valid JSON — no markdown, no preamble:
{
  "post": "Full post text",
  "pillar": "Most relevant content pillar",
  "opening_line": "First line only",
  "insight": "Core research finding that grounds this post",
  "verify": "Specific claim in this content that should be checked against the source before publishing",
  "word_count": 180
}`;

    console.time('claude');
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
    console.timeEnd('claude');

    if (!claudeResponse.ok) {
      const errText = await claudeResponse.text();
      throw new Error(`Claude error ${claudeResponse.status}: ${errText.slice(0, 300)}`);
    }

    const claudeData = await claudeResponse.json();
    const claudeText = claudeData.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const clean = claudeText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // Safety net — strip any em dashes that slipped through
    const stripEmDashes = (obj) => {
      for (const key of Object.keys(obj)) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/—/g, ',').replace(/–/g, ',');
        }
      }
      return obj;
    };
    stripEmDashes(parsed);

    return res.status(200).json(parsed);

  } catch (err) {
    console.error('Generate content error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
