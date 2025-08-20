import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoApi, type Coin } from "@/lib/api";
import { useWatchlist } from "@/hooks/useWatchlist";
import CoinOverviewCard from "@/components/crypto/CoinOverviewCard";

const Markets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Fetch top coins with pagination
  const {
    data: coins,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["markets", page],
    queryFn: () => coingeckoApi.getTopCoins(50), // Get 50 coins per page
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleToggleWatchlist = (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => {
    toggleWatchlist(coinId, coinName, coinSymbol);
  };

  const filteredCoins =
    coins?.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Markets</h1>
        <p className="text-muted-foreground">
          Explore all available cryptocurrencies and their market data
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="crypto-card">
        <CardHeader>
          <CardTitle>Search Markets</CardTitle>
          <CardDescription>
            Find cryptocurrencies by name or symbol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Bitcoin, Ethereum, or any other cryptocurrency..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="crypto-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crypto-green/10">
                <TrendingUp className="h-4 w-4 text-crypto-green" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coins</p>
                <p className="text-lg font-semibold">{coins?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crypto-blue/10">
                <TrendingUp className="h-4 w-4 text-crypto-blue" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gainers</p>
                <p className="text-lg font-semibold text-crypto-green">
                  {coins?.filter((coin) => coin.price_change_percentage_24h > 0)
                    .length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crypto-red/10">
                <TrendingDown className="h-4 w-4 text-crypto-red" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Losers</p>
                <p className="text-lg font-semibold text-crypto-red">
                  {coins?.filter((coin) => coin.price_change_percentage_24h < 0)
                    .length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-crypto-purple/10">
                <TrendingUp className="h-4 w-4 text-crypto-purple" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Watchlist</p>
                <p className="text-lg font-semibold">
                  {coins?.filter((coin) => isInWatchlist(coin.id)).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Markets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">All Markets</h2>
          <Badge variant="secondary">
            {filteredCoins.length}{" "}
            {filteredCoins.length === 1 ? "coin" : "coins"}
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
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
        ) : error ? (
          <Card className="crypto-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Error Loading Markets
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                There was an error loading the market data. Please try again
                later.
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredCoins.length === 0 ? (
          <Card className="crypto-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No coins found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Try adjusting your search terms or browse all available
                cryptocurrencies.
              </p>
              <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoins.map((coin) => (
              <CoinOverviewCard
                key={coin.id}
                coin={coin}
                isInWatchlist={isInWatchlist(coin.id)}
                onToggleWatchlist={handleToggleWatchlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && filteredCoins.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Badge variant="secondary">Page {page}</Badge>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={coins && coins.length < 50}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Markets;

