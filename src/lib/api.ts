import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// CoinGecko API base URL
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Types for CoinGecko API responses
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: null | {
    currency: string;
    percentage: number;
    times: number;
  };
  last_updated: string;
}

export interface CoinChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface SearchResult {
  coins: Array<{
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    thumb: string;
    large: string;
  }>;
}

// CoinGecko API functions
export const coingeckoApi = {
  // Get trending coins
  async getTrending(): Promise<{ coins: Coin[] }> {
    const response = await fetch(`${COINGECKO_API_BASE}/search/trending`);
    if (!response.ok) throw new Error("Failed to fetch trending coins");
    return response.json();
  },

  // Search coins
  async searchCoins(query: string): Promise<SearchResult> {
    const response = await fetch(
      `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to search coins");
    return response.json();
  },

  // Get coin details
  async getCoin(id: string): Promise<Coin> {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    if (!response.ok) throw new Error("Failed to fetch coin data");
    return response.json();
  },

  // Get coin chart data
  async getCoinChart(id: string, days: number = 30): Promise<CoinChartData> {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!response.ok) throw new Error("Failed to fetch chart data");
    return response.json();
  },

  // Get top coins by market cap
  async getTopCoins(limit: number = 20): Promise<Coin[]> {
    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&locale=en`
    );
    if (!response.ok) throw new Error("Failed to fetch top coins");
    return response.json();
  },
};

// Supabase types
type Tables = Database["public"]["Tables"];
type WatchlistRow = Tables["watchlist"]["Row"];
type WatchlistInsert = Tables["watchlist"]["Insert"];
type ProfileRow = Tables["profiles"]["Row"];

// Supabase API functions
export const supabaseApi = {
  // Auth functions
  async signUp(email: string, password: string, fullName?: string) {
    try {
      console.log("Attempting to sign up with:", { email, fullName });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        console.error("Supabase signUp error:", error);
        throw error;
      }

      console.log("Sign up successful:", data);
      return data;
    } catch (error) {
      console.error("Sign up failed:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("fetch")) {
          throw new Error(
            "Network error: Unable to connect to authentication service. Please check your internet connection."
          );
        }
        if (error.message.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.");
        }
        if (error.message.includes("Password")) {
          throw new Error("Password must be at least 6 characters long.");
        }
        if (error.message.includes("already registered")) {
          throw new Error(
            "An account with this email already exists. Please try signing in instead."
          );
        }
      }

      throw error;
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Watchlist functions
  async getWatchlist(): Promise<WatchlistRow[]> {
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .order("added_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addToWatchlist(coin: WatchlistInsert): Promise<WatchlistRow> {
    const { data, error } = await supabase
      .from("watchlist")
      .insert(coin)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromWatchlist(coinId: string): Promise<void> {
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("coin_id", coinId);

    if (error) throw error;
  },

  async isInWatchlist(coinId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("coin_id", coinId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return !!data;
  },

  // Profile functions
  async getProfile(): Promise<ProfileRow | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async updateProfile(updates: Partial<ProfileRow>): Promise<ProfileRow> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Demo data for demo mode
export const demoData = {
  watchlist: [
    {
      id: "demo-1",
      coin_id: "bitcoin",
      coin_name: "Bitcoin",
      coin_symbol: "BTC",
      added_at: new Date().toISOString(),
      user_id: "demo-user",
    },
    {
      id: "demo-2",
      coin_id: "ethereum",
      coin_name: "Ethereum",
      coin_symbol: "ETH",
      added_at: new Date().toISOString(),
      user_id: "demo-user",
    },
    {
      id: "demo-3",
      coin_id: "cardano",
      coin_name: "Cardano",
      coin_symbol: "ADA",
      added_at: new Date().toISOString(),
      user_id: "demo-user",
    },
  ],
};
