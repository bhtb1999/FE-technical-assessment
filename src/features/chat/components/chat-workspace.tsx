"use client";

import { startTransition, useState } from "react";

import { ChatSidebar } from "@/features/chat/components/chat-sidebar";
import { LatestResponsePanel } from "@/features/chat/components/latest-response-panel";
import { PromptForm } from "@/features/chat/components/prompt-form";
import {
  CHAT_HISTORY_STORAGE_KEY,
  EXAMPLE_PROMPTS,
} from "@/features/chat/constants";
import { useChatSessions } from "@/features/chat/hooks/use-chat-sessions";
import { streamPromptResponse } from "@/features/chat/lib/chat-api";
import { ChatEntry, LiveResponse } from "@/types/chat";

export function ChatWorkspace() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveResponse, setLiveResponse] = useState<LiveResponse>();
  const {
    sessions,
    activeChat,
    activeChatId,
    setActiveChatId,
    createChat,
    upsertMessage,
    deleteChat,
    removeEmptyChatIfNeeded,
    clearAllChats,
  } = useChatSessions(CHAT_HISTORY_STORAGE_KEY);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    const chatId = activeChatId ?? createChat(trimmedPrompt);
    setLiveResponse({
      prompt: trimmedPrompt,
      response: "",
    });

    try {
      let responseText = "";

      await streamPromptResponse(
        trimmedPrompt,
        activeChat?.messages ?? [],
        (chunk) => {
          responseText += chunk;
          setLiveResponse({
            prompt: trimmedPrompt,
            response: responseText,
          });
        },
      );

      if (!responseText.trim()) {
        throw new Error("Gemini did not return any text for this prompt.");
      }

      const nextEntry: ChatEntry = {
        id: crypto.randomUUID(),
        prompt: trimmedPrompt,
        response: responseText,
        createdAt: new Date().toISOString(),
      };

      startTransition(() => {
        upsertMessage(chatId, nextEntry);
        setPrompt("");
        setLiveResponse(undefined);
      });
    } catch (submissionError) {
      setLiveResponse(undefined);
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to generate a response right now.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleClearHistory() {
    setError("");
    setLiveResponse(undefined);
    clearAllChats();
  }

  function handleCreateChat() {
    removeEmptyChatIfNeeded(activeChatId);
    setError("");
    setPrompt("");
    setLiveResponse(undefined);
    createChat();
  }

  function handleSelectChat(chatId: string) {
    if (chatId === activeChatId) {
      return;
    }

    removeEmptyChatIfNeeded(activeChatId);
    setActiveChatId(chatId);
    setError("");
    setLiveResponse(undefined);
  }

  const sessionList = sessions;
  const activeMessages = activeChat?.messages ?? [];
  const activeChatTitle = activeChat?.title ?? "New chat";
  const canClearChats = sessionList.length > 0 || Boolean(liveResponse);

  return (
    <main className="h-screen overflow-hidden bg-black text-stone-100">
      <div className="relative flex h-full w-full">
        <button
          type="button"
          onClick={() => setSidebarOpen((current) => !current)}
          className={`absolute top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#171717] text-stone-200 transition-[left,background-color] duration-300 hover:bg-white/10 md:top-6 ${
            sidebarOpen ? "left-70" : "left-4 md:left-6"
          }`}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
          </span>
        </button>

        <ChatSidebar
          sessions={sessionList}
          activeChatId={activeChatId}
          isOpen={sidebarOpen}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
          onDeleteChat={deleteChat}
        />

        <section className="relative z-10 flex min-h-0 flex-1 overflow-hidden bg-[#212121]">
          <div className="mx-auto flex h-full w-full max-w-5xl min-h-0 flex-col p-4 md:p-6">
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-white/8 bg-[#212121] p-3 md:p-4">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase">
                    Active chat
                  </p>
                  <h1 className="mt-1 text-xl font-semibold text-white">
                    {activeChatTitle}
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-emerald-300 uppercase">
                    {isLoading ? "Thinking" : "Ready"}
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    disabled={!canClearChats || isLoading}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1">
                <LatestResponsePanel
                  activeChatId={activeChatId}
                  history={activeMessages}
                  liveResponse={liveResponse}
                  isLoading={isLoading}
                  examplePrompts={EXAMPLE_PROMPTS}
                  onExampleSelect={setPrompt}
                />
              </div>

              <div className="shrink-0 border-t border-white/8 bg-[#212121] pt-4">
                <PromptForm
                  prompt={prompt}
                  error={error}
                  isLoading={isLoading}
                  canClearHistory={canClearChats}
                  onPromptChange={setPrompt}
                  onSubmit={handleSubmit}
                  onClearHistory={handleClearHistory}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
