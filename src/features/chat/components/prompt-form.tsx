"use client";

import { KeyboardEvent } from "react";

type PromptFormProps = {
  prompt: string;
  error: string;
  isLoading: boolean;
  canClearHistory: boolean;
  placeholder?: string;
  onPromptChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClearHistory: () => void;
};

export function PromptForm({
  prompt,
  error,
  isLoading,
  canClearHistory,
  placeholder = "Ask Hugging Face to summarize, brainstorm, rewrite, or explain something.",
  onPromptChange,
  onSubmit,
  onClearHistory,
}: PromptFormProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <label className="block space-y-2">
        <textarea
          className="min-h-28 w-full rounded-3xl border border-stone-300 bg-[#171717] px-5 py-4 text-base text-stone-50 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-500"
          placeholder={placeholder}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="inline-flex min-w-44 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isLoading ? "Generating..." : "Submit Prompt"}
        </button>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={isLoading || !canClearHistory}
          className="inline-flex min-w-36 items-center justify-center rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear History
        </button>
      </div>

      {error ? (
        <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
