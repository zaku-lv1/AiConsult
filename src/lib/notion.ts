import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  PartialPageObjectResponse,
  PartialDataSourceObjectResponse,
  DataSourceObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NotionTask } from "@/types";

type QueryResult =
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse;

function getNotionClient(): Client {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error(
      "NOTION_API_KEYの環境変数が設定されていません。"
    );
  }
  return new Client({ auth: apiKey });
}

function isFullPage(result: QueryResult): result is PageObjectResponse {
  return result.object === "page" && "properties" in result;
}

function extractTitle(
  properties: PageObjectResponse["properties"]
): string {
  for (const key of ["名前", "タイトル", "Name", "Title", "title", "name"]) {
    const prop = properties[key];
    if (prop?.type === "title" && prop.title.length > 0) {
      return prop.title.map((t) => t.plain_text).join("");
    }
  }
  // Fallback: first title property found
  for (const prop of Object.values(properties)) {
    if (prop.type === "title" && prop.title.length > 0) {
      return prop.title.map((t) => t.plain_text).join("");
    }
  }
  return "(タイトルなし)";
}

function extractStatus(
  properties: PageObjectResponse["properties"]
): string {
  for (const key of ["ステータス", "Status", "status"]) {
    const prop = properties[key];
    if (prop?.type === "status") return prop.status?.name ?? "未設定";
    if (prop?.type === "select") return prop.select?.name ?? "未設定";
  }
  return "未設定";
}

function extractDueDate(
  properties: PageObjectResponse["properties"]
): string | undefined {
  for (const key of ["期日", "締切", "Due", "due", "Due Date", "due_date", "date"]) {
    const prop = properties[key];
    if (prop?.type === "date" && prop.date) {
      return prop.date.start;
    }
  }
  return undefined;
}

function extractPriority(
  properties: PageObjectResponse["properties"]
): string | undefined {
  for (const key of ["優先度", "Priority", "priority"]) {
    const prop = properties[key];
    if (prop?.type === "select") return prop.select?.name ?? undefined;
  }
  return undefined;
}

export async function getNotionTasks(databaseId?: string): Promise<NotionTask[]> {
  const notion = getNotionClient();
  const dbId = databaseId ?? process.env.NOTION_DATABASE_ID;

  if (!dbId) {
    throw new Error(
      "NOTION_DATABASE_IDの環境変数が設定されていません。"
    );
  }

  const response = await notion.dataSources.query({
    data_source_id: dbId,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
    page_size: 50,
  });

  const tasks: NotionTask[] = [];

  for (const result of response.results) {
    if (!isFullPage(result)) continue;

    tasks.push({
      id: result.id,
      title: extractTitle(result.properties),
      status: extractStatus(result.properties),
      dueDate: extractDueDate(result.properties),
      priority: extractPriority(result.properties),
      url: result.url,
    });
  }

  return tasks;
}
