import { NextRequest, NextResponse } from "next/server";
import {
  createGoogleTask,
  updateGoogleTask,
  deleteGoogleTask,
} from "@/lib/google-tasks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, taskListId, dueDate, notes } = body;

    if (!title || !taskListId) {
      return NextResponse.json(
        { error: "title, taskListIdは必須です。" },
        { status: 400 }
      );
    }

    const task = await createGoogleTask(title, taskListId, dueDate, notes);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, taskListId, title, dueDate, notes } = body;

    if (!id || !taskListId || !title) {
      return NextResponse.json(
        { error: "id, taskListId, titleは必須です。" },
        { status: 400 }
      );
    }

    const task = await updateGoogleTask(id, taskListId, title, dueDate, notes);
    return NextResponse.json(task);
  } catch (error) {
    console.error("Tasks PUT error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const taskListId = searchParams.get("taskListId");

    if (!id || !taskListId) {
      return NextResponse.json(
        { error: "idとtaskListIdクエリパラメータが必要です。" },
        { status: 400 }
      );
    }

    await deleteGoogleTask(id, taskListId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Tasks DELETE error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
