export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { StoreCreationWizard } from "@/components/store-creation-wizard";
import { isFounderEmail } from "@/lib/access";
import { getCurrentUser } from "@/lib/data";

export default async function NewStorePage() {
  const user = await getCurrentUser();
  if (!user || !isFounderEmail(user.email)) redirect("/dashboard/stores");

  return <StoreCreationWizard />;
}
