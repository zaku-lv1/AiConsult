# AiConsult - AIスケジュールコンサルタント

NotionとGoogleカレンダーのAPIとGeminiのAPIを活用した、AIスケジュール管理コンサルタントアプリです。

## 機能

- �� **予定確認**: 今日・明日・今週のGoogleカレンダー予定を確認
- ✅ **タスク管理**: Notionのタスク・締め切りを確認
- 🔄 **スケジュール調整**: 新しい予定を追加したい時に既存の予定を考慮した提案
- 📋 **スケジュール立案**: 大きなプロジェクトやゴールに向けたスケジュール設計
- 💬 **チャット相談**: Gemini AIによる自然な会話でスケジュール相談

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Google Gemini API (`@google/generative-ai`)
- **カレンダー**: Google Calendar API (`googleapis`)
- **タスク管理**: Notion API (`@notionhq/client`)
- **デプロイ**: Vercel

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、各APIキーを設定します。

```bash
cp .env.local.example .env.local
```

#### Gemini API Key

1. [Google AI Studio](https://aistudio.google.com/app/apikey) でAPIキーを取得
2. `GEMINI_API_KEY` に設定

#### Google Calendar API

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成
2. Google Calendar APIを有効化
3. OAuth2クライアントIDを作成（デスクトップアプリタイプ）
4. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` を設定
5. OAuth2フローでリフレッシュトークンを取得し `GOOGLE_REFRESH_TOKEN` を設定

#### Notion API

1. [Notion Integrations](https://www.notion.so/my-integrations) でインテグレーションを作成
2. 対象データベースにインテグレーションを追加
3. `NOTION_API_KEY` にシークレットキーを設定
4. `NOTION_DATABASE_ID` にデータベースIDを設定（URL から取得）

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## Vercelへのデプロイ

1. GitHubリポジトリをVercelに接続
2. 環境変数を Vercel のダッシュボードで設定
3. デプロイ実行

## APIエンドポイント

| エンドポイント | メソッド | 説明 |
|---|---|---|
| `/api/chat` | POST | Gemini AIとのチャット |
| `/api/schedule` | GET | カレンダー・タスク一覧取得 |
| `/api/events` | POST | カレンダーイベント作成 |
| `/api/events` | PUT | カレンダーイベント更新 |
| `/api/events` | DELETE | カレンダーイベント削除 |

## Notionデータベースの形式

以下のプロパティに対応しています（日本語・英語の列名どちらも可）:

| 用途 | 日本語名 | 英語名 |
|---|---|---|
| タイトル | 名前 / タイトル | Name / Title |
| ステータス | ステータス | Status |
| 期日 | 期日 / 締切 | Due / Due Date |
| 優先度 | 優先度 | Priority |
