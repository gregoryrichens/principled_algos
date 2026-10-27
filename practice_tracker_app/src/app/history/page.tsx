import { DeleteButton } from "@/components/DeleteButton";
import { Notices } from "@/components/Notices";
import { listAttempts } from "@/lib/db";

export const dynamic = "force-dynamic";

const principle = (p: number | null) => (p === null ? "" : `P${p}`);

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string | string[] }>;
}) {
  const { n } = await searchParams;
  const attempts = await listAttempts();
  return (
    <main>
      <Notices n={n} />
      <h1>History</h1>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Problem</th>
              <th>Chosen</th>
              <th>Correct</th>
              <th>Outcome</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.attemptedOn}</td>
                <td>{`#${a.problem} ${a.title}`.trim()}</td>
                <td>{principle(a.chosenPrinciple)}</td>
                <td>{principle(a.correctPrinciple)}</td>
                <td>{a.outcome}</td>
                <td>{a.note}</td>
                <td>
                  <DeleteButton id={a.id} date={a.attemptedOn} problem={a.problem} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
