import { NextRequest, NextResponse } from "next/server";
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/google-calendar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, start, end, description, location } = body;

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "title, start, endは必須です。" },
        { status: 400 }
      );
    }

    const event = await createCalendarEvent(
      title,
      start,
      end,
      description,
      location
    );
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Events POST error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, start, end, description, location } = body;

    if (!id || !title || !start || !end) {
      return NextResponse.json(
        { error: "id, title, start, endは必須です。" },
        { status: 400 }
      );
    }

    const event = await updateCalendarEvent(
      id,
      title,
      start,
      end,
      description,
      location
    );
    return NextResponse.json(event);
  } catch (error) {
    console.error("Events PUT error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "idクエリパラメータが必要です。" },
        { status: 400 }
      );
    }

    await deleteCalendarEvent(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Events DELETE error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
