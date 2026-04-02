"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { RichResponse } from "@/features/chat/components/rich-response";
import { ChatEntry, LiveResponse } from "@/types/chat";

type LatestResponsePanelProps = {
  activeChatId: string | null;
  history: ChatEntry[];
  liveResponse?: LiveResponse;
  isLoading: boolean;
  examplePrompts: string[];
  onExampleSelect: (prompt: string) => void;
};

export function LatestResponsePanel({
  activeChatId,
  history,
  liveResponse,
  isLoading,
  examplePrompts,
  onExampleSelect,
}: LatestResponsePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const conversation = [...history];
  const hasConversation = conversation.length > 0 || Boolean(liveResponse);

  function updateScrollState() {
    const element = scrollContainerRef.current;

    if (!element) {
      return;
    }

    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    setShowScrollToBottom(distanceFromBottom > 80);
  }

  function scrollToBottom() {
    if (!bottomAnchorRef.current) {
      return;
    }

    bottomAnchorRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }

  useLayoutEffect(() => {
    if (!isLoading || !bottomAnchorRef.current) {
      return;
    }

    bottomAnchorRef.current.scrollIntoView({
      block: "end",
      behavior: "auto",
    });
  }, [history, liveResponse?.response, isLoading]);

  useEffect(() => {
    updateScrollState();
  }, [history, liveResponse?.response]);

  useEffect(() => {
    if (!activeChatId || !bottomAnchorRef.current) {
      return;
    }

    bottomAnchorRef.current.scrollIntoView({
      block: "end",
      behavior: "auto",
    });
  }, [activeChatId]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={updateScrollState}
      className="mac-scrollbar h-full min-h-0 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-[#171717] p-5 text-stone-50"
    >
        {hasConversation ? (
          <div className="space-y-4">
            {conversation.map((entry) => (
              <div key={entry.id} className="space-y-3">
                <div className="ml-auto max-w-[85%] rounded-[1.25rem] bg-amber-100 px-4 py-3 text-sm leading-6 text-stone-900">
                  {entry.prompt}
                </div>
                <div className="max-w-[92%] rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-sm leading-7 text-stone-100">
                  <RichResponse text={entry.response} />
                </div>
              </div>
            ))}

            {liveResponse ? (
              <div className="space-y-3">
                <div className="ml-auto max-w-[85%] rounded-[1.25rem] bg-amber-100 px-4 py-3 text-sm leading-6 text-stone-900">
                  {liveResponse.prompt}
                </div>
                <div className="max-w-[92%] rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-sm leading-7 text-stone-100">
                  <RichResponse
                    text={liveResponse.response}
                    isStreaming={isLoading}
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-7 text-stone-300">
              Try one of these prompts to see the app in action:
            </p>
            <ul className="space-y-2">
              {examplePrompts.map((examplePrompt) => (
                <li key={examplePrompt}>
                  <button
                    type="button"
                    onClick={() => onExampleSelect(examplePrompt)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-stone-100 transition hover:bg-white/10"
                  >
                    {examplePrompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showScrollToBottom ? (
          <button
            type="button"
            onClick={scrollToBottom}
            className="sticky bottom-4 ml-auto flex rounded-full border border-amber-300/30 bg-stone-950/90 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-amber-200 uppercase shadow-lg transition hover:bg-stone-900"
          >
            Scroll to bottom
          </button>
        ) : null}

        <div ref={bottomAnchorRef} />
    </div>
  );
}
