import { redirect } from "next/navigation";

// Visiting bare /admin sends you to the dashboard if you're logged in,
// or to /admin/login (via middleware) if you're not.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
