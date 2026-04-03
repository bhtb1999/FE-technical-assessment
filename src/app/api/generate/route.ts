import { NextRequest, NextResponse } from "next/server";

import { streamHuggingFaceContent } from "@/features/huggingface/server/stream-generate-content";
import { ChatEntry } from "@/types/chat";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.HF_TOKEN;

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Missing HF_TOKEN. Add it to your environment before sending prompts.",
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as { prompt?: string; history?: ChatEntry[] };
    const prompt = body.prompt?.trim();
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt) {
      return NextResponse.json(
        { error: "Please provide a prompt before submitting." },
        { status: 400 },
      );
    }
    const stream = await streamHuggingFaceContent(prompt, history, apiKey);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The request could not be completed. Check your Hugging Face configuration.",
      },
      { status: 500 },
    );
  }
}
