# Hugging Face Prompt Workspace

A lightweight Next.js app for a frontend engineering assessment. Users can enter a prompt, send it to Hugging Face, view the response, handle loading and error states, and review locally saved prompt history.

## Features

- Prompt input with submit action
- Hugging Face Inference Providers integration with streaming responses
- Streaming response rendering
- Loading and error states
- Local chat history using `localStorage`
- Clear history button

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root:

```bash
HF_TOKEN=your_huggingface_token_here
HF_MODEL=swiss-ai/Apertus-8B-Instruct-2509:publicai
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

```bash
npm run dev
npm run lint
npx next build --webpack
```

## Project Structure

```text
src/app/page.tsx                           App entry point
src/app/api/generate/route.ts              API route for prompt submission
src/features/chat/components/*             Chat UI components
src/features/chat/hooks/use-chat-history.ts  Browser persistence hook
src/features/chat/lib/*                    Client-side chat utilities
src/features/huggingface/server/*          Hugging Face server integration
src/types/chat.ts                          Shared chat types
src/app/globals.css                        Global styling and theme tokens
```

## Notes

- The Hugging Face token stays on the server because requests go through the Next.js route handler.
- The default route uses the official `@huggingface/inference` SDK with `chatCompletionStream(...)`.
- Prompt history is stored in the browser, so it persists locally between refreshes.
- In this environment, `npx next build --webpack` is the reliable production build command.
