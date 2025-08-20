import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseApi, demoData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useWatchlist = () => {
  const { user, isDemoMode } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get watchlist data
  const {
    data: watchlist = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["watchlist", user?.id, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        // Return demo data for guest users
        return demoData.watchlist;
      }
      if (!user) {
        return [];
      }
      return await supabaseApi.getWatchlist();
    },
    enabled: !!user || isDemoMode,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Add to watchlist mutation
  const addToWatchlistMutation = useMutation({
    mutationFn: async ({
      coinId,
      coinName,
      coinSymbol,
    }: {
      coinId: string;
      coinName: string;
      coinSymbol: string;
    }) => {
      if (isDemoMode) {
        // In demo mode, create a mock response
        const newItem = {
          id: `demo-${Date.now()}`,
          coin_id: coinId,
          coin_name: coinName,
          coin_symbol: coinSymbol,
          added_at: new Date().toISOString(),
          user_id: "demo-user",
        };
        return newItem;
      }
      if (!user) {
        throw new Error("User not authenticated");
      }
      return await supabaseApi.addToWatchlist({
        coin_id: coinId,
        coin_name: coinName,
        coin_symbol: coinSymbol,
        user_id: user.id,
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["watchlist", user?.id, isDemoMode],
        (old: any) => {
          const currentList = old || [];
          // Check if coin already exists
          const exists = currentList.some(
            (item: any) => item.coin_id === data.coin_id
          );
          if (exists) {
            return currentList;
          }
          return [...currentList, data];
        }
      );
      toast({
        title: "Added to Watchlist",
        description: `${data.coin_name} has been added to your watchlist.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add to watchlist",
        variant: "destructive",
      });
    },
  });

  // Remove from watchlist mutation
  const removeFromWatchlistMutation = useMutation({
    mutationFn: async (coinId: string) => {
      if (isDemoMode) {
        // In demo mode, just return success
        return;
      }
      if (!user) {
        throw new Error("User not authenticated");
      }
      return await supabaseApi.removeFromWatchlist(coinId);
    },
    onSuccess: (_, coinId) => {
      queryClient.setQueryData(
        ["watchlist", user?.id, isDemoMode],
        (old: any) => {
          return (old || []).filter((item: any) => item.coin_id !== coinId);
        }
      );
      toast({
        title: "Removed from Watchlist",
        description: "Coin has been removed from your watchlist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove from watchlist",
        variant: "destructive",
      });
    },
  });

  // Check if coin is in watchlist
  const isInWatchlist = (coinId: string) => {
    return watchlist.some((item) => item.coin_id === coinId);
  };

  // Add to watchlist
  const addToWatchlist = (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => {
    addToWatchlistMutation.mutate({ coinId, coinName, coinSymbol });
  };

  // Remove from watchlist
  const removeFromWatchlist = (coinId: string) => {
    removeFromWatchlistMutation.mutate(coinId);
  };

  // Toggle watchlist (add if not present, remove if present)
  const toggleWatchlist = (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => {
    if (isInWatchlist(coinId)) {
      removeFromWatchlist(coinId);
    } else {
      addToWatchlist(coinId, coinName, coinSymbol);
    }
  };

  return {
    watchlist,
    isLoading,
    error,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isAdding: addToWatchlistMutation.isPending,
    isRemoving: removeFromWatchlistMutation.isPending,
  };
};
