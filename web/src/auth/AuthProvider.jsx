import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../server/supabase/supabaseClient";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetches profile and updates state. Memoized with useCallback.
  const fetchUserProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setProfile(userProfile);
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      setProfile(null); // Clear profile on error
    }
  }, []);

  // Function to be called from components to trigger a profile refresh.
  // It actively gets the current user to avoid using stale session data.
  const refreshUserProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await fetchUserProfile(user);
  }, [fetchUserProfile]);

  // Effect to handle initial session/profile load and auth state changes.
  useEffect(() => {
    const getSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      await fetchUserProfile(session?.user);
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        await fetchUserProfile(newSession?.user);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const value = useMemo(() => ({
    session,
    profile,
    user: session?.user,
    refreshUserProfile,
  }), [session, profile, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
