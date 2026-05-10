export const config = {
  maxDuration: 120,
};

const SITE_PASSWORD = process.env.SITE_PASSWORD;

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
    const { topic, area } = req.body;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;

    const searchInput = `Research what is currently being discussed about: "${topic}"${area ? ` in the context of ${area}` : ''}.

Find:
1. Recent news, data, or developments (last 30 days where possible)
2. What practitioners, founders, or business leaders are saying
3. Relevant statistics, case studies, or real examples
4. African market context if relevant

Return a structured summary with the most interesting angle, key facts, and source URLs.`;

    console.time('perplexity');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 110000);

    let perplexityResponse;
    try {
      perplexityResponse = await fetch('https://api.perplexity.ai/v1/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityKey}`,
        },
        body: JSON.stringify({
          preset: 'pro-search',
          input: searchInput,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    console.timeEnd('perplexity');

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      throw new Error(`Perplexity error ${perplexityResponse.status}: ${errText.slice(0, 300)}`);
    }

    const perplexityData = await perplexityResponse.json();

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

    return res.status(200).json({
      summary: researchSummary,
      sources: sources.slice(0, 3),
    });

  } catch (err) {
    console.error('Research error:', err.message);

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return res.status(504).json({ error: 'Research timed out. Try a narrower topic.' });
    }

    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
