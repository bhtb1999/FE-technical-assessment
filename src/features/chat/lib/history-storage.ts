import { ChatSession } from "@/types/chat";

export function loadChatSessions(storageKey: string): ChatSession[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedSessions = window.localStorage.getItem(storageKey);

  if (!savedSessions) {
    return [];
  }

  try {
    return JSON.parse(savedSessions) as ChatSession[];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

export function saveChatSessions(storageKey: string, sessions: ChatSession[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(sessions));
}

export function clearChatSessions(storageKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(storageKey);
}
