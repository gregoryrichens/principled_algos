import Link from "next/link";
import { Notices } from "@/components/Notices";
import { todayView } from "@/lib/core";
import { formatLong, todayIn } from "@/lib/dates";

export const dynamic = "force-dynamic";

const principle = (p: number | null) => (p === null ? "" : `P${p}`);

export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string | string[] }>;
}) {
  const { n } = await searchParams;
  const today = todayIn(process.env.TZ ?? "UTC");
  const { due, counts } = await todayView(today);
  return (
    <main>
      <Notices n={n} />
      <h1>Today, {formatLong(today)}</h1>
      <p>{`${counts.due} due · ${counts.inCycle} in a review cycle · ${counts.retired} retired`}</p>
      {due.length === 0 ? (
        <p>Nothing to review today.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Problem</th>
                <th>Review</th>
                <th>Due</th>
                <th>Last failure</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {due.map((r) => {
                const { chosenPrinciple: chosen, correctPrinciple: correct } = r.anchor;
                return (
                  <tr key={r.problem}>
                    <td>{`#${r.problem} ${r.title}`.trim()}</td>
                    <td>{r.stepLabel}</td>
                    <td>
                      <span className="nowrap">{r.dueOn}</span>
                      {r.daysOverdue > 0 && ` (${r.daysOverdue} days overdue)`}
                    </td>
                    <td>
                      {r.anchor.outcome}
                      {chosen !== null && correct !== null && chosen !== correct && (
                        <> · chose {principle(chosen)} → correct {principle(correct)}</>
                      )}
                      {r.anchor.note && <> · {r.anchor.note}</>}
                    </td>
                    <td>
                      <Link href={`/log?problem=${r.problem}`}>Log attempt</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
