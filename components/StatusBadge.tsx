export default function StatusBadge({
  status,
  label,
}: {
  status: 'available' | 'busy' | 'inactive';
  label: string;
}) {
  return (
    <span className={`badge status-${status}`}>
      <span className="badge-dot" aria-hidden />
      {label}
    </span>
  );
}
