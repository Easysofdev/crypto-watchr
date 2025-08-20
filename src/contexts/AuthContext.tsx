import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabaseApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isDemoMode: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const user = await supabaseApi.getCurrentUser();
        setUser(user);
      } catch (error) {
        console.log("No existing session");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await supabaseApi.signIn(email, password);
      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);
      await supabaseApi.signUp(email, password, fullName);
      toast({
        title: "Success",
        description:
          "Account created! Please check your email to verify your account.",
      });
    } catch (error) {
      console.error("AuthContext signUp error:", error);

      let errorMessage = "Failed to create account";

      if (error instanceof Error) {
        errorMessage = error.message;

        // Handle specific network errors
        if (
          error.message.includes("fetch") ||
          error.message.includes("Network")
        ) {
          errorMessage =
            "Network error: Unable to connect to the server. Please check your internet connection and try again.";
        }

        // Handle Supabase specific errors
        if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address.";
        }
        if (error.message.includes("Password")) {
          errorMessage = "Password must be at least 6 characters long.";
        }
        if (error.message.includes("already registered")) {
          errorMessage =
            "An account with this email already exists. Please try signing in instead.";
        }
        if (error.message.includes("rate limit")) {
          errorMessage =
            "Too many sign-up attempts. Please wait a moment and try again.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabaseApi.signOut();
      setIsDemoMode(false);
      toast({
        title: "Success",
        description: "Signed out successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to sign out",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setUser({
      id: "demo-user",
      email: "demo@example.com",
      user_metadata: { full_name: "Demo User" },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as User);
    toast({
      title: "Demo Mode Enabled",
      description: "You're now in demo mode. Try out all the features!",
    });
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setUser(null);
    toast({
      title: "Demo Mode Disabled",
      description: "Demo mode has been disabled.",
    });
  };

  const value: AuthContextType = {
    user,
    isDemoMode,
    isLoading,
    signIn,
    signUp,
    signOut,
    enableDemoMode,
    disableDemoMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
