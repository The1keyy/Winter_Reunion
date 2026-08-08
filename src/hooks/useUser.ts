"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/lib/supabase/profiles";
import type { Profile } from "@/types/database";

interface UseUserResult {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isCoAdmin: boolean;
  loading: boolean;
}

/**
 * Client-side hook exposing the current auth user, their profile row, and
 * convenience role flags. These flags are for UI purposes only (showing or
 * hiding controls) - every write is still enforced server-side via RLS.
 */
export function useUser(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!isMounted) return;
      setUser(currentUser);

      if (currentUser) {
        const currentProfile = await getProfile(supabase, currentUser.id);
        if (isMounted) setProfile(currentProfile);
      } else {
        setProfile(null);
      }

      if (isMounted) setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    isAdmin: profile?.role === "admin",
    isCoAdmin: profile?.role === "co-admin",
    loading,
  };
}
