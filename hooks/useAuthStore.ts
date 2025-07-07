import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
// User data type
export interface UserData {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  phone?: string;
  bio?: string;
  location?: string;
  profile_photo?: string;
  role?: "user" | "vendor"; 
  created_at: string;
  updated_at?: string;
}

// Store state interface
interface UserAuthState {
  // State
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: UserData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // login: (email: string, password: string) => Promise<boolean>;
  loginWithPhone: (phone: string) => Promise<boolean>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    userData?: Partial<UserData>
  ) => Promise<boolean>;
  updateProfile: (userData: Partial<UserData>) => Promise<boolean>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

// Create the store
export const useUserAuthStore = create<UserAuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      // Login function
      // login: async (email, password) => {
      //   try {
      //     set({ isLoading: true, error: null });

      //     const { data, error } = await supabase.auth.signInWithPassword({
      //       email: email.toLowerCase().trim(),
      //       password,
      //     });

      //     if (error) {
      //       set({ error: error.message, isLoading: false });
      //       return false;
      //     }

      //     if (data.user) {
      //       // Fetch user profile from Users table
      //       const { data: profileData } = await supabase
      //         .from('Users')
      //         .select('*')
      //         .eq('id', data.user.id)
      //         .single();

      //       const userData: UserData = {
      //         id: data.user.id,
      //         email: data.user.email!,
      //         created_at: data.user.created_at,
      //         updated_at: profileData?.updated_at,
      //       };

      //       set({
      //         user: userData,
      //         isAuthenticated: true,
      //         isLoading: false,
      //         error: null
      //       });
      //       return true;
      //     }

      //     set({ isLoading: false });
      //     return false;
      //   } catch (error) {
      //     const errorMessage = error instanceof Error ? error.message : 'Login failed';
      //     set({ error: errorMessage, isLoading: false });
      //     return false;
      //   }
      // },

      loginWithPhone: async (phone) => {
        try {
          set({ isLoading: true, error: null });

          // Request OTP to be sent to user's phone
          const { error } = await supabase.auth.signInWithOtp({
            phone: phone.trim(),
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }
          
          // You will need to redirect or show an input for the OTP next
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      verifyPhoneOtp: async (phone: string, token: string) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.verifyOtp({
            phone: phone.trim(),
            token,
            type: "sms",
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          const user = data.user;
          if (!user) {
            set({ error: "Invalid user", isLoading: false });
            return false;
          }

          // check profile exist?
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();


          // If profile doesn't exist, create it
          if (!profile) {
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                phone: user.phone,
              });

            if (profileError) {
              console.error("Profile creation error:", profileError);
              // Don't fail login if profile creation fails
            }
          }

          const userData: UserData = {
            id: user.id,
            phone: profile?.phone ?? user.phone,
            created_at: user.created_at,
            updated_at: profile?.updated_at,
          };

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "OTP verification failed";
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Register function

      register: async (email, password, additionalData = {}) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase.auth.signUp({
            email: email.toLowerCase().trim(),
            password,
            options: {
              data: {
                full_name: additionalData.full_name,
                phone: additionalData.phone,
              },
            },
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          if (data.user) {
            // Create profile in profiles table
            const { error: profileError } = await supabase
              .from("Users")
              .insert({
                id: data.user.id,
                email: data.user.email,
              });

            if (profileError) {
              console.error("Profile creation error:", profileError);
              // Don't fail registration if profile creation fails
            }

            set({ isLoading: false, error: null });
            return true;
          }

          set({ isLoading: false });
          return false;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Registration failed";
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Logout function
      logout: async () => {
        try {
          set({ isLoading: true });

          const { error } = await supabase.auth.signOut();

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Logout failed";
          set({ error: errorMessage, isLoading: false });
        }
      },

      // Update profile function
      updateProfile: async (userData) => {
        try {
          const currentUser = get().user;
          if (!currentUser) {
            set({ error: "No user logged in" });
            return false;
          }

          set({ isLoading: true, error: null });

          // Update in profiles table
          const { error } = await supabase
            .from("profiles")
            .update({
              // ✅ Map to correct database column names
              username: userData.username, // or just 'name' if that's your column
              phone: userData.phone,
              bio: userData.bio,
              location: userData.location,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentUser.id);

          if (error) {
            console.error("Database update error:", error);
            set({ error: error.message, isLoading: false });
            return false;
          }

          // Update local state
          const updatedUser = { ...currentUser, ...userData };
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Update failed";
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Check current auth status
      checkAuthStatus: async () => {
        try {
          set({ isLoading: true, error: null });

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          if (session?.user) {
            // Fetch user profile
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const userData: UserData = {
              id: session.user.id,
              email: session.user.email!,
              username: profileData?.username,
              phone: profileData?.phone || session.user.user_metadata?.phone,
              bio: profileData?.bio,
              location: profileData?.location,
              profile_photo:
                profileData?.profile_photo ||
                session.user.user_metadata?.avatar_url,
              role: profileData?.role || "user", // Default to 'user' if not set
              created_at: session.user.created_at,
              updated_at: profileData?.updated_at,
            };

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Auth check failed";
          set({ error: errorMessage, isLoading: false });
        }
      },
    }),
    {
      name: "user-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  const { setUser, checkAuthStatus } = useUserAuthStore.getState();

  if (event === "SIGNED_OUT" || !session) {
    setUser(null);
  } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    checkAuthStatus();
  }
});
