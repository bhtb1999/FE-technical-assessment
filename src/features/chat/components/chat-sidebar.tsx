"use client";

import { ChatSession } from "@/types/chat";

type ChatSidebarProps = {
  sessions: ChatSession[];
  activeChatId: string | null;
  isOpen: boolean;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onClose?: () => void;
};

export function ChatSidebar({
  sessions,
  activeChatId,
  isOpen,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
}: ChatSidebarProps) {
  return (
    <aside
      className={`flex h-full shrink-0 flex-col overflow-hidden border-r border-white/8 bg-[#171717] text-stone-50 transition-[width] duration-300 ${
        isOpen ? "w-66" : "w-0 border-r-0"
      }`}
    >
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={onCreateChat}
          className="inline-flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-3 text-sm font-medium text-stone-200 transition hover:bg-white/6"
        >
          <span>New chat</span>
          <span className="text-base leading-none">✎</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between px-3">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-stone-500 uppercase">
          Chats
        </p>
        <span className="text-[11px] text-stone-500">{sessions.length}</span>
      </div>

      <div className="mac-scrollbar mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {sessions.length === 0 ? (
          <div className="mx-1 rounded-xl border border-dashed border-white/10 px-3 py-4 text-sm leading-6 text-stone-400">
            Start a new chat to create a conversation list here.
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => {
              const isActive = session.id === activeChatId;
              const preview =
                session.messages.at(-1)?.response || "No messages yet";

              return (
                <article
                  key={session.id}
                  className={`group rounded-xl transition ${
                    isActive ? "bg-white/10" : "hover:bg-white/6"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectChat(session.id)}
                    className="w-full rounded-xl px-3 py-2.5 text-left outline-none"
                  >
                    <p className="truncate text-sm font-medium text-stone-100">
                      {session.title}
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs leading-5 text-stone-400">
                      {preview}
                    </p>
                  </button>
                  <div className="flex items-center justify-between px-3 pb-2">
                    <p className="text-[11px] text-stone-500">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => onDeleteChat(session.id)}
                      className="rounded-md px-2 py-1 text-[11px] text-stone-500 opacity-0 transition hover:bg-rose-400/10 hover:text-rose-300 group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
