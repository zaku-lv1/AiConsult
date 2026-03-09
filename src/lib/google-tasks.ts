import { google } from "googleapis";
import type { GoogleTask } from "@/types";

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Tasks APIの環境変数が設定されていません。" +
        "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKENを設定してください。"
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

/** Extract the date portion (YYYY-MM-DD) from an RFC 3339 timestamp. */
function parseDueDate(due: string | null | undefined): string | undefined {
  if (!due) return undefined;
  const match = due.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : undefined;
}

export async function getGoogleTasks(): Promise<GoogleTask[]> {
  const auth = getOAuth2Client();
  const tasksApi = google.tasks({ version: "v1", auth });

  const listResponse = await tasksApi.tasklists.list({ maxResults: 20 });
  const taskLists = listResponse.data.items ?? [];

  const allTasks: GoogleTask[] = [];

  await Promise.all(
    taskLists.map(async (taskList) => {
      const taskListId = taskList.id ?? "";
      const taskListTitle = taskList.title ?? "(リストなし)";

      const tasksResponse = await tasksApi.tasks.list({
        tasklist: taskListId,
        showCompleted: false,
        showHidden: false,
        maxResults: 100,
      });

      const items = tasksResponse.data.items ?? [];

      for (const item of items) {
        allTasks.push({
          id: item.id ?? "",
          title: item.title ?? "(タイトルなし)",
          status: item.status ?? "needsAction",
          dueDate: parseDueDate(item.due),
          notes: item.notes ?? undefined,
          taskListId,
          taskListTitle,
        });
      }
    })
  );

  return allTasks;
}

export async function createGoogleTask(
  title: string,
  taskListId: string,
  dueDate?: string,
  notes?: string
): Promise<GoogleTask> {
  const auth = getOAuth2Client();
  const tasksApi = google.tasks({ version: "v1", auth });

  const taskBody: {
    title: string;
    notes?: string;
    due?: string;
  } = { title, notes };

  if (dueDate) {
    taskBody.due = `${dueDate}T00:00:00.000Z`;
  }

  const response = await tasksApi.tasks.insert({
    tasklist: taskListId,
    requestBody: taskBody,
  });

  const created = response.data;

  const listResponse = await tasksApi.tasklists.get({ tasklist: taskListId });

  return {
    id: created.id ?? "",
    title: created.title ?? title,
    status: created.status ?? "needsAction",
    dueDate: parseDueDate(created.due),
    notes: created.notes ?? undefined,
    taskListId,
    taskListTitle: listResponse.data.title ?? "(リストなし)",
  };
}

export async function updateGoogleTask(
  taskId: string,
  taskListId: string,
  title: string,
  dueDate?: string,
  notes?: string
): Promise<GoogleTask> {
  const auth = getOAuth2Client();
  const tasksApi = google.tasks({ version: "v1", auth });

  const taskBody: {
    id: string;
    title: string;
    notes?: string;
    due?: string;
  } = { id: taskId, title, notes };

  if (dueDate) {
    taskBody.due = `${dueDate}T00:00:00.000Z`;
  }

  const response = await tasksApi.tasks.update({
    tasklist: taskListId,
    task: taskId,
    requestBody: taskBody,
  });

  const updated = response.data;

  const listResponse = await tasksApi.tasklists.get({ tasklist: taskListId });

  return {
    id: updated.id ?? "",
    title: updated.title ?? title,
    status: updated.status ?? "needsAction",
    dueDate: parseDueDate(updated.due),
    notes: updated.notes ?? undefined,
    taskListId,
    taskListTitle: listResponse.data.title ?? "(リストなし)",
  };
}

export async function deleteGoogleTask(
  taskId: string,
  taskListId: string
): Promise<void> {
  const auth = getOAuth2Client();
  const tasksApi = google.tasks({ version: "v1", auth });

  await tasksApi.tasks.delete({
    tasklist: taskListId,
    task: taskId,
  });
}
