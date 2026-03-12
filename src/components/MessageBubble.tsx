"use client";

import { useState, useEffect } from "react";
import type { ChatMessage } from "@/types";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  const [time, setTime] = useState("");

  useEffect(() => {
    setTime(
      message.createdAt.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [message.createdAt]);

  // Simple markdown-like formatting: bold and newlines
  const formatContent = (text: string) => {
    return text
      .split("\n")
      .map((line, i) => {
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        const formatted = parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        });
        return (
          <span key={i}>
            {formatted}
            {i < text.split("\n").length - 1 && <br />}
          </span>
        );
      });
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2`}
    >
      {!isUser && (
        <div className="shrink-0 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          AI
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[75%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm"
          }`}
        >
          {formatContent(message.content)}
        </div>
        <span className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {time}
        </span>
      </div>

      {isUser && (
        <div className="shrink-0 h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-bold">
          私
        </div>
      )}
    </div>
  );
}
