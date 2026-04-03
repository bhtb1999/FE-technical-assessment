"use client";

import { useEffect, useState } from "react";

import {
  clearChatSessions,
  loadChatSessions,
  saveChatSessions,
} from "@/features/chat/lib/history-storage";
import { ChatEntry, ChatSession } from "@/types/chat";

function sortSessions(sessions: ChatSession[]) {
  return [...sessions].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function buildChatTitle(prompt: string) {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  return normalized.length > 56 ? `${normalized.slice(0, 56)}...` : normalized;
}

export function useChatSessions(storageKey: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const loadedSessions = sortSessions(loadChatSessions(storageKey));
      setSessions(loadedSessions);
      setActiveChatId(loadedSessions[0]?.id ?? null);
      setHasLoadedStorage(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    saveChatSessions(storageKey, sessions);
  }, [hasLoadedStorage, sessions, storageKey]);

  function createChat(initialPrompt?: string) {
    const timestamp = new Date().toISOString();
    const nextSession: ChatSession = {
      id: crypto.randomUUID(),
      title: initialPrompt ? buildChatTitle(initialPrompt) : "New chat",
      createdAt: timestamp,
      updatedAt: timestamp,
      messages: [],
    };

    setSessions((current) => [nextSession, ...current]);
    setActiveChatId(nextSession.id);
    return nextSession.id;
  }

  function removeEmptyChatIfNeeded(chatId: string | null) {
    if (!chatId) {
      return;
    }

    setSessions((current) => {
      const targetSession = current.find((session) => session.id === chatId);

      if (!targetSession || targetSession.messages.length > 0) {
        return current;
      }

      const nextSessions = current.filter((session) => session.id !== chatId);

      setActiveChatId((activeId) =>
        activeId === chatId ? nextSessions[0]?.id ?? null : activeId,
      );

      if (nextSessions.length === 0) {
        clearChatSessions(storageKey);
      }

      return nextSessions;
    });
  }

  function upsertMessage(chatId: string, entry: ChatEntry) {
    setSessions((current) =>
      sortSessions(
        current.map((session) => {
          if (session.id !== chatId) {
            return session;
          }

          return {
            ...session,
            title:
              session.messages.length === 0 ? buildChatTitle(entry.prompt) : session.title,
            updatedAt: entry.createdAt,
            messages: [...session.messages, entry],
          };
        }),
      ),
    );
  }

  function deleteChat(chatId: string) {
    setSessions((current) => {
      const nextSessions = current.filter((session) => session.id !== chatId);

      setActiveChatId((activeId) => {
        if (activeId !== chatId) {
          return activeId;
        }

        return nextSessions[0]?.id ?? null;
      });

      if (nextSessions.length === 0) {
        clearChatSessions(storageKey);
      }

      return nextSessions;
    });
  }

  function clearAllChats() {
    setSessions([]);
    setActiveChatId(null);
    clearChatSessions(storageKey);
  }

  const activeChat =
    sessions.find((session) => session.id === activeChatId) ?? null;

  return {
    sessions,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    upsertMessage,
    deleteChat,
    removeEmptyChatIfNeeded,
    clearAllChats,
  };
}
