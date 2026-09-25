import { statusBadgeClass } from "@/lib/bookingStatus";

export default function StatusBadge({ status }) {
  return (
    <span className={`cc-status-badge ${statusBadgeClass(status)}`}>
      {status}
    </span>
  );
}
