import { google } from "googleapis";
import type { CalendarEvent } from "@/types";

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Calendar APIの環境変数が設定されていません。" +
        "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKENを設定してください。"
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export async function getCalendarEvents(
  daysAhead = 7
): Promise<CalendarEvent[]> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const now = new Date();
  const future = new Date(now);
  future.setDate(future.getDate() + daysAhead);

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    timeMax: future.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  const items = response.data.items ?? [];

  return items.map((item) => {
    const start = item.start?.dateTime ?? item.start?.date ?? "";
    const end = item.end?.dateTime ?? item.end?.date ?? "";
    const isAllDay = !item.start?.dateTime;

    return {
      id: item.id ?? "",
      title: item.summary ?? "(タイトルなし)",
      start,
      end,
      description: item.description ?? undefined,
      location: item.location ?? undefined,
      isAllDay,
    };
  });
}

export async function createCalendarEvent(
  title: string,
  start: string,
  end: string,
  description?: string,
  location?: string
): Promise<CalendarEvent> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const isAllDay = !start.includes("T");

  const eventBody = {
    summary: title,
    description,
    location,
    start: isAllDay ? { date: start } : { dateTime: start },
    end: isAllDay ? { date: end } : { dateTime: end },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: eventBody,
  });

  const created = response.data;
  const createdStart = created.start?.dateTime ?? created.start?.date ?? "";
  const createdEnd = created.end?.dateTime ?? created.end?.date ?? "";

  return {
    id: created.id ?? "",
    title: created.summary ?? title,
    start: createdStart,
    end: createdEnd,
    description: created.description ?? undefined,
    location: created.location ?? undefined,
    isAllDay: !created.start?.dateTime,
  };
}

export async function updateCalendarEvent(
  eventId: string,
  title: string,
  start: string,
  end: string,
  description?: string,
  location?: string
): Promise<CalendarEvent> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  const isAllDay = !start.includes("T");

  const eventBody = {
    summary: title,
    description,
    location,
    start: isAllDay ? { date: start } : { dateTime: start },
    end: isAllDay ? { date: end } : { dateTime: end },
  };

  const response = await calendar.events.update({
    calendarId: "primary",
    eventId,
    requestBody: eventBody,
  });

  const updated = response.data;
  const updatedStart = updated.start?.dateTime ?? updated.start?.date ?? "";
  const updatedEnd = updated.end?.dateTime ?? updated.end?.date ?? "";

  return {
    id: updated.id ?? "",
    title: updated.summary ?? title,
    start: updatedStart,
    end: updatedEnd,
    description: updated.description ?? undefined,
    location: updated.location ?? undefined,
    isAllDay: !updated.start?.dateTime,
  };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  });
}
