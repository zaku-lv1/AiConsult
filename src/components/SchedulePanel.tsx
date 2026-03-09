"use client";

import { useEffect, useState, useCallback } from "react";
import type { CalendarEvent, NotionTask } from "@/types";

interface Props {
  onClose: () => void;
}

interface ScheduleData {
  events: CalendarEvent[];
  tasks: NotionTask[];
  error?: string;
}

export default function SchedulePanel({ onClose }: Props) {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(7);

  const fetchSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/schedule?days=${daysAhead}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ events: [], tasks: [], error: "データの取得に失敗しました。" });
    } finally {
      setIsLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const formatEventDate = (event: CalendarEvent) => {
    if (event.isAllDay) {
      return new Date(event.start).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
        weekday: "short",
      });
    }
    return new Date(event.start).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateStr?: string) => {
    if (!dateStr) return false;
    const due = new Date(dateStr);
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    return due <= threeDays && due >= new Date();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
          スケジュール
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="閉じる"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Days selector */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-500">表示期間:</span>
        {[3, 7, 14].map((d) => (
          <button
            key={d}
            onClick={() => setDaysAhead(d)}
            className={`text-xs px-2 py-1 rounded-full transition-colors ${
              daysAhead === d
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {d}日
          </button>
        ))}
        <button
          onClick={fetchSchedule}
          className="ml-auto text-xs text-blue-600 hover:underline"
          disabled={isLoading}
        >
          更新
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : (
          <>
            {data?.error && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-3 text-xs text-yellow-800 dark:text-yellow-300">
                ⚠️ {data.error}
              </div>
            )}

            {/* Calendar Events */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                📅 カレンダー ({data?.events.length ?? 0})
              </h3>
              {data?.events.length === 0 ? (
                <p className="text-xs text-gray-400">予定はありません</p>
              ) : (
                <ul className="space-y-2">
                  {data?.events.map((event) => (
                    <li
                      key={event.id}
                      className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-2.5"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                        {formatEventDate(event)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          📍 {event.location}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Notion Tasks */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                ✅ タスク ({data?.tasks.length ?? 0})
              </h3>
              {data?.tasks.length === 0 ? (
                <p className="text-xs text-gray-400">タスクはありません</p>
              ) : (
                <ul className="space-y-2">
                  {data?.tasks.map((task) => (
                    <li
                      key={task.id}
                      className={`rounded-lg border p-2.5 ${
                        task.dueDate && isUpcoming(task.dueDate)
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-700"
                      }`}
                    >
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-900 dark:text-white hover:underline line-clamp-2"
                      >
                        {task.title}
                      </a>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded">
                          {task.status}
                        </span>
                        {task.priority && (
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                            {task.priority}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={`text-xs ${
                              isUpcoming(task.dueDate)
                                ? "text-red-600 dark:text-red-400 font-semibold"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            期日: {task.dueDate}
                            {isUpcoming(task.dueDate) && " ⚠️"}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
