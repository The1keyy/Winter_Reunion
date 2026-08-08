import { redirect } from "next/navigation";

import { PageGuide } from "@/components/guidance/page-guide";
import { RsvpForm } from "@/components/rsvp/rsvp-form";
import { getRegistration } from "@/lib/supabase/registrations";
import { createClient } from "@/lib/supabase/server";

export default async function RsvpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const registration = await getRegistration(supabase, user.id);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <PageGuide
        step={registration ? "Update anytime" : "Step one"}
        title="RSVP"
        body="Tell the crew if you're in. One clear answer helps everyone plan cabins, rides, and budget."
      />

      <div className="wr-panel wr-fade-up-delay-1">
        <RsvpForm registration={registration} />
      </div>
    </div>
  );
}
