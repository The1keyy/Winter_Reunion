import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/profiles";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getProfile(supabase, user.id) : null;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-xl font-light text-off-white md:text-2xl">
        Welcome{profile ? `, ${profile.name}` : ""}.
      </h1>
      <p className="text-sm font-normal text-off-white/70">
        Trip planning starts here.
      </p>
    </div>
  );
}
