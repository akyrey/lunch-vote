import { SLACK_ENABLED, SLACK_WEBHOOK_URL } from "./config";

interface SlackMessage {
  text: string;
  blocks?: unknown[];
}

async function sendSlackMessage(msg: SlackMessage): Promise<void> {
  if (!SLACK_ENABLED || !SLACK_WEBHOOK_URL) return;
  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg),
  });
}

export async function notifyPollOpen(appUrl: string): Promise<void> {
  await sendSlackMessage({
    text: `🍽️ Today's lunch poll is open! Vote now: ${appUrl}`,
  });
}

export async function notifyPollClosed(
  winnerName: string,
  totalVotes: number
): Promise<void> {
  await sendSlackMessage({
    text: `🏆 Today's winner: *${winnerName}* (${totalVotes} ballots cast)`,
  });
}
