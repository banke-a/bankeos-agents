# BankeOS Agents

Content generation agents for Banke Ajayi's personal brand.

## Agents

- **Card Agent** — Generates "Lessons I Have Learnt" card content (hero text + supporting text)
- LinkedIn Agent (coming soon)
- Repurpose Agent (coming soon)

## Setup

1. Clone this repo
2. Run `npm install`
3. Copy `.env.example` to `.env.local`
4. Add your Anthropic API key to `.env.local`
5. Run `npm run dev`

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel at vercel.com
3. Add `VITE_ANTHROPIC_API_KEY` as an environment variable in Vercel project settings
4. Deploy

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key from console.anthropic.com |
