const GEMINI_CHAT_COMPLETIONS_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

import { ChatCompletionMessage, ChatEntry } from "@/types/chat";

const GEMINI_MODEL = "gemini-2.5-flash";

type ChatCompletionStreamEvent = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function parseSseEvent(event: string) {
  const lines = event
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return lines
    .map((line) => {
      if (line === "[DONE]") {
        return "";
      }

      const payload = JSON.parse(line) as ChatCompletionStreamEvent;

      return (
        payload.choices
          ?.map((choice) => choice.delta?.content ?? "")
          .join("") ?? ""
      );
    })
    .join("");
}

function buildConversationMessages(history: ChatEntry[], prompt: string) {
  const historyMessages: ChatCompletionMessage[] = [...history]
    .reverse()
    .flatMap((entry) => [
      {
        role: "user" as const,
        content: entry.prompt,
      },
      {
        role: "assistant" as const,
        content: entry.response,
      },
    ]);

  return [
    ...historyMessages,
    {
      role: "user" as const,
      content: prompt,
    },
  ];
}

export async function streamGeminiContent(
  prompt: string,
  history: ChatEntry[],
  apiKey: string,
) {
  const upstreamResponse = await fetch(GEMINI_CHAT_COMPLETIONS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: buildConversationMessages(history, prompt),
      stream: true,
    }),
  });

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text();

    try {
      const parsed = JSON.parse(errorText) as ChatCompletionStreamEvent;
      throw new Error(
        parsed.error?.message ||
          "Gemini returned an error while generating a streamed chat completion.",
      );
    } catch {
      throw new Error(
        "Gemini returned an error while generating a streamed chat completion.",
      );
    }
  }

  if (!upstreamResponse.body) {
    throw new Error("Gemini streaming response was empty.");
  }

  const reader = upstreamResponse.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          if (buffer.trim()) {
            const finalChunk = parseSseEvent(buffer);

            if (finalChunk) {
              controller.enqueue(encoder.encode(finalChunk));
            }
          }

          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        let emittedChunk = false;

        for (const event of events) {
          const text = parseSseEvent(event);

          if (text) {
            controller.enqueue(encoder.encode(text));
            emittedChunk = true;
          }
        }

        if (emittedChunk) {
          return;
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => undefined);
    },
  });
}
