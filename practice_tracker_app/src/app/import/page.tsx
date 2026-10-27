import { ImportForm } from "@/components/ImportForm";
import { Notices } from "@/components/Notices";

export const dynamic = "force-dynamic";

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string | string[] }>;
}) {
  const { n } = await searchParams;
  return (
    <main>
      <Notices n={n} />
      <h1>Import</h1>
      <ImportForm />
    </main>
  );
}
