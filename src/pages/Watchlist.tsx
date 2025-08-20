import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoApi, type Coin } from "@/lib/api";
import { useWatchlist } from "@/hooks/useWatchlist";
import CoinOverviewCard from "@/components/crypto/CoinOverviewCard";

const Watchlist: React.FC = () => {
  const {
    watchlist,
    isLoading: watchlistLoading,
    removeFromWatchlist,
  } = useWatchlist();

  // Fetch current data for all watchlist coins
  const { data: watchlistCoins, isLoading: coinsLoading } = useQuery({
    queryKey: ["watchlist-coins", watchlist.map((item) => item.coin_id)],
    queryFn: async () => {
      if (watchlist.length === 0) return [];

      // Fetch data for all watchlist coins
      const coinPromises = watchlist.map((item) =>
        coingeckoApi.getCoin(item.coin_id).catch(() => null)
      );

      const results = await Promise.all(coinPromises);
      return results.filter(Boolean) as Coin[];
    },
    enabled: watchlist.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });

  const handleRemoveFromWatchlist = (coinId: string) => {
    removeFromWatchlist(coinId);
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(price);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 6,
        maximumFractionDigits: 8,
      }).format(price);
    }
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    return (
      <span
        className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-crypto-green" : "text-crypto-red"
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(percentage).toFixed(2)}%
      </span>
    );
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toLocaleString()}`;
    }
  };

  if (watchlistLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="crypto-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Watchlist</h1>
          <Badge variant="secondary" className="text-sm">
            {watchlist.length} {watchlist.length === 1 ? "coin" : "coins"}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Track your favorite cryptocurrencies and monitor their performance
        </p>
      </div>

      {/* Empty State */}
      {watchlist.length === 0 && (
        <Card className="crypto-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Your watchlist is empty
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Start building your watchlist by searching for cryptocurrencies
              and clicking the star icon to add them.
            </p>
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Coins */}
      {watchlist.length > 0 && (
        <div className="grid gap-6">
          {coinsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: watchlist.length }).map((_, i) => (
                <Card key={i} className="crypto-card">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlistCoins?.map((coin) => (
                <CoinOverviewCard
                  key={coin.id}
                  coin={coin}
                  isInWatchlist={true}
                  onToggleWatchlist={(coinId) =>
                    handleRemoveFromWatchlist(coinId)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Watchlist Summary */}
      {watchlist.length > 0 && watchlistCoins && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="crypto-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crypto-green/10">
                  <TrendingUp className="h-5 w-5 text-crypto-green" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold">
                    $
                    {watchlistCoins
                      .reduce((sum, coin) => sum + coin.current_price, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crypto-blue/10">
                  <Activity className="h-5 w-5 text-crypto-blue" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Avg 24h Change
                  </p>
                  <p className="text-2xl font-bold">
                    {watchlistCoins.length > 0
                      ? (
                          watchlistCoins.reduce(
                            (sum, coin) =>
                              sum + coin.price_change_percentage_24h,
                            0
                          ) / watchlistCoins.length
                        ).toFixed(2)
                      : "0"}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-crypto-purple/10">
                  <DollarSign className="h-5 w-5 text-crypto-purple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Market Cap
                  </p>
                  <p className="text-2xl font-bold">
                    {formatMarketCap(
                      watchlistCoins.reduce(
                        (sum, coin) => sum + coin.market_cap,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Watchlist;

