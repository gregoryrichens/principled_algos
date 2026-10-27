import { LogForm } from "@/components/LogForm";
import { Notices } from "@/components/Notices";
import { latestTitles } from "@/lib/db";
import { todayIn } from "@/lib/dates";
import { PRINCIPLE_NAMES } from "@/lib/principles";

export const dynamic = "force-dynamic";

export default async function LogPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string | string[]; problem?: string | string[] }>;
}) {
  const { n, problem: rawProblem } = await searchParams;
  const problem = (Array.isArray(rawProblem) ? rawProblem[0] : rawProblem) ?? "";
  const title = problem ? ((await latestTitles()).get(Number(problem)) ?? "") : "";
  return (
    <main>
      <Notices n={n} />
      <h1>Log an attempt</h1>
      <LogForm
        principleNames={PRINCIPLE_NAMES}
        defaults={{
          attemptedOn: todayIn(process.env.TZ ?? "UTC"),
          problem,
          title,
          chosenPrinciple: "",
          correctPrinciple: "",
          outcome: "",
          note: "",
        }}
      />
    </main>
  );
}
