"use client";

type RichResponseProps = {
  text: string;
  isStreaming?: boolean;
};

type Block =
  | { type: "heading"; content: string }
  | { type: "ordered"; items: string[] }
  | { type: "unordered"; items: string[] }
  | { type: "paragraph"; content: string };

function parseBlocks(text: string): Block[] {
  const sections = text
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section) => {
    const lines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 1 && /^#{1,6}\s+/.test(lines[0])) {
      return {
        type: "heading",
        content: lines[0].replace(/^#{1,6}\s+/, ""),
      };
    }

    if (lines.every((line) => /^(\d+)\.\s+/.test(line))) {
      return {
        type: "ordered",
        items: lines.map((line) => line.replace(/^(\d+)\.\s+/, "")),
      };
    }

    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return {
        type: "unordered",
        items: lines.map((line) => line.replace(/^[-*]\s+/, "")),
      };
    }

    return {
      type: "paragraph",
      content: lines.join(" "),
    };
  });
}

function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={`${part}-${index}`}
          className="rounded bg-black/20 px-1.5 py-0.5 font-mono text-[0.95em] text-amber-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export function RichResponse({ text, isStreaming = false }: RichResponseProps) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`${block.content}-${index}`}
              className="text-base font-semibold tracking-tight text-white"
            >
              {renderInline(block.content)}
            </h3>
          );
        }

        if (block.type === "ordered") {
          return (
            <ol
              key={`ordered-${index}`}
              className="space-y-2 pl-5 text-sm leading-7 text-stone-100"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="list-decimal">
                  {renderInline(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "unordered") {
          return (
            <ul
              key={`unordered-${index}`}
              className="space-y-2 pl-5 text-sm leading-7 text-stone-100"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="list-disc">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={`${block.content}-${index}`}
            className="whitespace-pre-wrap text-sm leading-7 text-stone-100"
          >
            {renderInline(block.content)}
          </p>
        );
      })}

      {isStreaming ? <span className="inline-block animate-pulse text-amber-200">|</span> : null}
    </div>
  );
}
