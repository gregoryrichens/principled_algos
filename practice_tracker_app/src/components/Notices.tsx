export function Notices({ n }: { n?: string | string[] }) {
  const notices = n === undefined ? [] : Array.isArray(n) ? n : [n];
  if (notices.length === 0) return null;
  return (
    <ul className="notices">
      {notices.map((notice, i) => (
        <li key={i}>{notice}</li>
      ))}
    </ul>
  );
}
