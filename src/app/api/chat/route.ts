import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { getCalendarEvents } from "@/lib/google-calendar";
import { getGoogleTasks } from "@/lib/google-tasks";
import type { ChatRequest, ScheduleContext } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, includeSchedule } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "メッセージが空です。" },
        { status: 400 }
      );
    }

    let scheduleContext: ScheduleContext | undefined;

    if (includeSchedule) {
      const [events, tasks] = await Promise.allSettled([
        getCalendarEvents(14),
        getGoogleTasks(),
      ]);

      scheduleContext = {
        events: events.status === "fulfilled" ? events.value : [],
        tasks: tasks.status === "fulfilled" ? tasks.value : [],
        fetchedAt: new Date().toISOString(),
      };
    }

    const responseText = await generateChatResponse(messages, scheduleContext);

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
