import { notFound } from "next/navigation";
import { LogForm } from "@/components/LogForm";
import { getAttemptsByIds } from "@/lib/db";
import { PRINCIPLE_NAMES } from "@/lib/principles";

export const dynamic = "force-dynamic";

const principle = (p: number | null) => (p === null ? "" : `P${p}`);

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const attempt = Number.isInteger(id) ? (await getAttemptsByIds([id])).get(id) : undefined;
  if (!attempt) notFound();
  return (
    <main>
      <h1>Edit attempt</h1>
      <LogForm
        id={id}
        principleNames={PRINCIPLE_NAMES}
        defaults={{
          attemptedOn: attempt.attemptedOn,
          problem: String(attempt.problem),
          title: attempt.title,
          chosenPrinciple: principle(attempt.chosenPrinciple),
          correctPrinciple: principle(attempt.correctPrinciple),
          outcome: attempt.outcome,
          note: attempt.note,
        }}
      />
    </main>
  );
}
