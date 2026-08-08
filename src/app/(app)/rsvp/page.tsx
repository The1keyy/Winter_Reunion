import { redirect } from "next/navigation";

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
    <div className="flex w-full max-w-lg flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-light text-off-white md:text-3xl">
          RSVP
        </h1>
        <p className="text-sm font-normal text-off-white/70">
          Let us know if you&apos;re coming to Winter Reunion 2027.
        </p>
      </div>

      <RsvpForm registration={registration} />
    </div>
  );
}
