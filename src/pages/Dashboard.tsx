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
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Loader2,
  Bitcoin,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoApi, type Coin } from "@/lib/api";
import CryptoSearch from "@/components/crypto/CryptoSearch";
import CoinOverviewCard from "@/components/crypto/CoinOverviewCard";
import PriceChart from "@/components/crypto/PriceChart";
import { useWatchlist } from "@/hooks/useWatchlist";

const Dashboard: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<{
    id: string;
    name: string;
    symbol: string;
    image?: string;
  } | null>(null);

  const { toggleWatchlist, isInWatchlist } = useWatchlist();

  // Fetch top coins for overview
  const { data: topCoins, isLoading: topCoinsLoading } = useQuery({
    queryKey: ["top-coins"],
    queryFn: () => coingeckoApi.getTopCoins(10),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch trending coins
  const { data: trendingCoins, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-coins"],
    queryFn: () => coingeckoApi.getTrending(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch Bitcoin data for featured chart
  const { data: bitcoinData, isLoading: bitcoinLoading } = useQuery({
    queryKey: ["bitcoin-data"],
    queryFn: () => coingeckoApi.getCoin("bitcoin"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSelectCoin = (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => {
    setSelectedCoin({
      id: coinId,
      name: coinName,
      symbol: coinSymbol,
    });
  };

  const handleToggleWatchlist = (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => {
    toggleWatchlist(coinId, coinName, coinSymbol);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-crypto-orange">
            <Bitcoin className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-crypto-orange bg-clip-text text-transparent">
              Crypto Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your favorite cryptocurrencies and stay updated with market
              trends
            </p>
          </div>
        </div>
      </div>

      {/* Featured Bitcoin Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">Featured Chart</h2>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20"
            >
              <Bitcoin className="h-3 w-3 mr-1" />
              Bitcoin
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleWatchlist("bitcoin", "Bitcoin", "BTC")}
            className={cn(
              "transition-all duration-200",
              isInWatchlist("bitcoin")
                ? "text-primary border-primary bg-primary/10"
                : "hover:text-primary hover:border-primary"
            )}
          >
            <Star
              className={cn(
                "h-4 w-4 mr-2",
                isInWatchlist("bitcoin") ? "fill-current" : ""
              )}
            />
            {isInWatchlist("bitcoin") ? "Watching" : "Add to Watchlist"}
          </Button>
        </div>

        <PriceChart
          coinId="bitcoin"
          coinName="Bitcoin"
          coinSymbol="BTC"
          coinImage={bitcoinData?.image}
          className="crypto-card border-0 shadow-xl"
        />
      </div>

      {/* Search Section */}
      <Card className="crypto-card border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Search Cryptocurrencies</CardTitle>
          <CardDescription className="text-base">
            Find any cryptocurrency by name or symbol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CryptoSearch
            onSelectCoin={handleSelectCoin}
            placeholder="Search for Bitcoin, Ethereum, or any other cryptocurrency..."
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Selected Coin Chart */}
      {selectedCoin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Selected Coin</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCoin(null)}
            >
              Close
            </Button>
          </div>
          <PriceChart
            coinId={selectedCoin.id}
            coinName={selectedCoin.name}
            coinSymbol={selectedCoin.symbol}
            coinImage={selectedCoin.image}
            className="crypto-card border-0 shadow-xl"
          />
        </div>
      )}

      {/* Market Overview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Market Overview</h2>
          <Badge variant="secondary" className="text-sm">
            Top 10 by Market Cap
          </Badge>
        </div>

        {topCoinsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="crypto-card border-0 shadow-xl">
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
            {topCoins?.slice(0, 6).map((coin) => (
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

      {/* Trending Coins */}
      {trendingCoins &&
        trendingCoins.coins &&
        trendingCoins.coins.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Trending Today</h2>
              <Badge
                variant="outline"
                className="text-crypto-orange border-crypto-orange bg-crypto-orange/10"
              >
                Hot 🔥
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingCoins.coins.slice(0, 4).map((trendingCoin) => (
                <Card
                  key={trendingCoin.item.id}
                  className="crypto-card border-0 shadow-xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-crypto-orange">
                        <span className="text-xs font-bold text-primary-foreground">
                          {trendingCoin.item.symbol.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {trendingCoin.item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          #{trendingCoin.item.market_cap_rank}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Price BTC
                      </span>
                      <span className="font-semibold text-primary">
                        {trendingCoin.item.price_btc.toFixed(8)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="crypto-card border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-crypto-green to-green-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Market Cap
                </p>
                <p className="text-2xl font-bold text-crypto-green">
                  $
                  {topCoins
                    ? (
                        topCoins.reduce(
                          (sum, coin) => sum + coin.market_cap,
                          0
                        ) / 1e12
                      ).toFixed(2)
                    : "0"}
                  T
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-crypto-blue to-blue-500">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold text-crypto-blue">
                  $
                  {topCoins
                    ? (
                        topCoins.reduce(
                          (sum, coin) => sum + coin.total_volume,
                          0
                        ) / 1e9
                      ).toFixed(2)
                    : "0"}
                  B
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="crypto-card border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-crypto-purple to-purple-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Bitcoin Dominance
                </p>
                <p className="text-2xl font-bold text-crypto-purple">
                  {topCoins && topCoins.length > 0
                    ? (
                        (topCoins[0].market_cap /
                          topCoins.reduce(
                            (sum, coin) => sum + coin.market_cap,
                            0
                          )) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
