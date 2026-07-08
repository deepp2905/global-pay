import { redirect } from "next/navigation";

/** The app's home is the Dashboard module; "/" only forwards there. */
export default function Home() {
  redirect("/dashboard");
}
