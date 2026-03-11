import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ScheduleContext } from "@/types";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEYの環境変数が設定されていません。"
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function formatScheduleContext(context: ScheduleContext): string {
  const now = new Date();
  const today = now.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const lines: string[] = [
    `## 現在日時: ${today}`,
    "",
    "### Googleカレンダーの予定",
  ];

  if (context.events.length === 0) {
    lines.push("（予定なし）");
  } else {
    for (const event of context.events) {
      const start = event.isAllDay
        ? event.start
        : new Date(event.start).toLocaleString("ja-JP");
      const end = event.isAllDay
        ? event.end
        : new Date(event.end).toLocaleString("ja-JP");
      lines.push(`- **${event.title}**: ${start} 〜 ${end}`);
      if (event.description) {
        lines.push(`  説明: ${event.description}`);
      }
      if (event.location) {
        lines.push(`  場所: ${event.location}`);
      }
    }
  }

  lines.push("", "### Google Todoリストのタスク");

  if (context.tasks.length === 0) {
    lines.push("（タスクなし）");
  } else {
    for (const task of context.tasks) {
      const due = task.dueDate ? ` 期日: ${task.dueDate}` : "";
      const list = ` [${task.taskListTitle}]`;
      lines.push(
        `- **${task.title}** [${task.status === "needsAction" ? "未完了" : task.status}]${due}${list}`
      );
    }
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `あなたは優秀なスケジュール管理コンサルタントAIです。
ユーザーのGoogleカレンダーとGoogle Todoリストのタスクを把握した上で、以下のことを支援します：

1. **予定の確認**: 今日・明日・今週の予定、締め切りが迫っているタスクを確認する
2. **スケジュール調整**: 遊びの予定や新しい予定を追加・変更する際に、既存の予定を考慮して最適なタイミングを提案する
3. **スケジュール立案**: 大きな目標や曖昧な課題に対して、具体的なステップとスケジュールを立てる
4. **相談・提案**: 優先順位の付け方や時間の使い方について提案・相談に乗る

回答は日本語で、親しみやすく、具体的に行ってください。
スケジュールに関する提案をする際は、実際の予定データを参照して現実的な提案をしてください。`;

export async function generateChatResponse(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  scheduleContext?: ScheduleContext
): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Build history for multi-turn conversation (all but the last message)
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({
    history,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
  });

  const lastMessage = messages[messages.length - 1];
  let userContent = lastMessage.content;

  if (scheduleContext) {
    const contextText = formatScheduleContext(scheduleContext);
    userContent = `${userContent}\n\n---\n以下は最新のスケジュール情報です：\n\n${contextText}`;
  }

  const result = await chat.sendMessage(userContent);
  return result.response.text();
}
