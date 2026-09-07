# Chapterkin

Personalized bedtime stories for a family to read aloud. A parent creates one family account, adds the kids (and optional grandparents, pets, and other household people), then picks a child and generates tonight’s story. Stories can be standalone or the next chapter of a series. Each story is paginated with optional storybook illustrations. The family library keeps every night.

The public site will live at [chapterkin.com](https://chapterkin.com). Print-and-ship and native mobile apps are planned later. Page layout is already square so a future print partner can reuse the same pages.

## What you need

- Node.js 20.9 or newer
- Docker (for local Postgres)
- An [OpenAI API key](https://platform.openai.com/api-keys) for stories, pictures, and moderation

This app needs Node 20.9+.

## Setup

```bash
cp .env.example .env.local
```

Edit `.env.local`:

- `BETTER_AUTH_SECRET` — a long random string
- `OPENAI_API_KEY` — required for the default provider
- `STORY_PROVIDER` — `openai` (default), `local` (Ollama + local pictures), or `mock` (no models)
- Database URL can stay as the Docker default

Then:

```bash
npm install
npm run db:up
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a family account, add the kids, pick a child, and generate a story.

Stories and pictures come from OpenAI. Restart `npm run dev` after you add or change the key.

Optional local mode (no OpenAI key):

```bash
# in .env.local
STORY_PROVIDER=local

ollama serve
ollama pull llama3.2
python3 -m venv .venv-sd
.venv-sd/bin/pip install -r requirements-images.txt
npm run images:up
npm run dev
```

With `STORY_PROVIDER=mock`, generate uses canned text and placeholder frames instead.

## Everyday use

1. Create a family account and add the kids (siblings are the other children; pets and grandparents are shared).
2. On Tonight, pick the child the story is for.
3. Choose tonight-only or a series, and optionally describe something from the day.
4. Read the paginated story. Pictures fill in after the text if image generation succeeds.
5. Reopen nights from the family library, or write the next chapter.

Stories remember a series through a short running summary, not the full text of earlier nights.

## Safety

- Parent accounts only. Children do not sign in.
- Daily notes are checked with a local filter and OpenAI moderation before generation.
- The story model is instructed to stay bedtime-safe and not invent extra family members.
- Illustrations are requested as painted storybook art, not photorealistic children.

## Project layout

- `src/app` — pages and API routes (auth, story status, page images)
- `src/lib/ai` — story generation, character bible, images, safety
- `src/lib/db` — Drizzle schema and client
- `storage/images` — generated illustrations (not committed)

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run db:up` | Start local Postgres |
| `npm run db:push` | Apply the Drizzle schema |
| `npm run db:studio` | Browse the database |
| `npm run images:up` | Optional local illustration server |
| `npm run build` | Production build |
