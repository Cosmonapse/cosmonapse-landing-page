import { redirect } from "next/navigation";

// Engram's canonical home is /docs/python/engram (inside the Python
// reference, where the menu item lives). Keep this URL working.
export default function EngramDocsRedirect() {
  redirect("/docs/python/engram");
}
