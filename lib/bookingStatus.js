export const BOOKING_STATUSES = [
  "Pending",
  "Under Review",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
];

const STATUS_CLASS_MAP = {
  Pending: "cc-status-pending",
  "Under Review": "cc-status-under-review",
  Confirmed: "cc-status-confirmed",
  "In Progress": "cc-status-in-progress",
  Completed: "cc-status-completed",
  Cancelled: "cc-status-cancelled",
};

export function statusBadgeClass(status) {
  return STATUS_CLASS_MAP[status] || "cc-status-pending";
}
