import { GenerateResponse, ChatEntry } from "@/types/chat";

function isJsonResponse(contentType: string | null) {
  return contentType?.includes("application/json");
}

export async function streamPromptResponse(
  prompt: string,
  history: ChatEntry[],
  onChunk: (chunk: string) => void,
) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, history }),
  });

  if (!response.ok) {
    if (isJsonResponse(response.headers.get("content-type"))) {
      const data = (await response.json()) as GenerateResponse;
      throw new Error(data.error || "Something went wrong while contacting Gemini.");
    }

    throw new Error("Something went wrong while contacting Gemini.");
  }

  if (!response.body) {
    throw new Error("Streaming is not available in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      onChunk(decoder.decode(value, { stream: true }));
    }

    const finalChunk = decoder.decode();

    if (finalChunk) {
      onChunk(finalChunk);
    }
  } finally {
    reader.releaseLock();
  }
}
