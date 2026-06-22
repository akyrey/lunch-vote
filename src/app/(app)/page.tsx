import { auth } from "@/lib/auth";
import {
  getTodayPoll,
  getPollCandidates,
  getUserAttendance,
  getUserBallot,
  getPollAttendance,
} from "@/lib/queries";
import { formatDate, formatTime, todayDateStr, isWeekday } from "@/lib/config";
import { TodayScreen } from "@/components/today/today-screen";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const userId = session!.user.id;

  const poll = await getTodayPoll();
  const dateStr = todayDateStr();
  const weekday = isWeekday(dateStr);

  if (!poll || !weekday) {
    return (
      <div className="px-5 pt-14 pb-8">
        <div className="text-[12px] font-bold tracking-[.12em] uppercase text-accent mb-1">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </div>
        <div className="font-display font-bold text-[31px] text-ink leading-tight tracking-tight">
          {weekday ? "No poll today" : "No poll on weekends"}
        </div>
        <p className="text-mut text-sm mt-3 leading-relaxed">
          {weekday
            ? "Today's poll hasn't been created yet. Check back later."
            : "Come back on Monday for the next poll!"}
        </p>
      </div>
    );
  }

  const [candidates, userAttendance, userBallot, allAttendance] =
    await Promise.all([
      getPollCandidates(poll.id),
      getUserAttendance(poll.id, userId),
      getUserBallot(poll.id, userId),
      getPollAttendance(poll.id),
    ]);

  return (
    <TodayScreen
      poll={poll}
      candidates={candidates.map((c) => c.place)}
      isCheckedIn={!!userAttendance}
      hasVoted={!!userBallot}
      attendees={allAttendance.map((a) => a.user)}
      userId={userId}
      dateDisplay={formatDate(new Date())}
      pollOpenTime={formatTime(new Date(poll.opensAt))}
      pollCloseTime={formatTime(new Date(poll.closesAt))}
    />
  );
}
