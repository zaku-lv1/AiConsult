import { NextRequest, NextResponse } from "next/server";
import { getCalendarEvents } from "@/lib/google-calendar";
import { getGoogleTasks } from "@/lib/google-tasks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const daysAhead = parseInt(searchParams.get("days") ?? "7", 10);

  const [eventsResult, tasksResult] = await Promise.allSettled([
    getCalendarEvents(daysAhead),
    getGoogleTasks(),
  ]);

  const events =
    eventsResult.status === "fulfilled" ? eventsResult.value : [];
  const tasks =
    tasksResult.status === "fulfilled" ? tasksResult.value : [];

  const errors: string[] = [];
  if (eventsResult.status === "rejected") {
    errors.push(
      `Googleカレンダー: ${eventsResult.reason instanceof Error ? eventsResult.reason.message : "取得エラー"}`
    );
  }
  if (tasksResult.status === "rejected") {
    errors.push(
      `Google Tasks: ${tasksResult.reason instanceof Error ? tasksResult.reason.message : "取得エラー"}`
    );
  }

  return NextResponse.json({
    events,
    tasks,
    ...(errors.length > 0 && { error: errors.join("; ") }),
  });
}
