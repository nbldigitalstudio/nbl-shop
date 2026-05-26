import { LogOut } from "lucide-react";
import { Button } from "@/components/button";

export function SignOutButton() {
  return (
    <form action="/auth/signout" method="POST">
      <Button type="submit" variant="ghost">
        <LogOut className="size-4" />
        Sign out
      </Button>
    </form>
  );
}
