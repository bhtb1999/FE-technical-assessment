import { InferenceClient } from "@huggingface/inference";

import { ChatEntry } from "@/types/chat";

const DEFAULT_HUGGINGFACE_MODEL = "swiss-ai/Apertus-8B-Instruct-2509:publicai";

function buildConversationMessages(history: ChatEntry[], prompt: string) {
  const historyMessages = [...history].reverse().flatMap((entry) => [
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

export async function streamHuggingFaceContent(
  prompt: string,
  history: ChatEntry[],
  apiKey: string,
) {
  const client = new InferenceClient(apiKey);
  const stream = client.chatCompletionStream({
    model: process.env.HF_MODEL || DEFAULT_HUGGINGFACE_MODEL,
    messages: buildConversationMessages(history, prompt),
  });

  const iterator = stream[Symbol.asyncIterator]();
  const firstResult = await iterator.next();
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    try {
      if (!firstResult.done) {
        const firstChunk = firstResult.value;
        const text = firstChunk.choices?.[0]?.delta?.content ?? "";

        if (text) {
          await writer.write(encoder.encode(text));
        }
      }

      while (true) {
        const result = await iterator.next();

        if (result.done) {
          break;
        }

        const text = result.value.choices?.[0]?.delta?.content ?? "";

        if (text) {
          await writer.write(encoder.encode(text));
        }
      }
    } catch (error) {
      console.error("Hugging Face streaming failed:", error);
    } finally {
      await writer.close();
    }
  })();

  return readable;
}
