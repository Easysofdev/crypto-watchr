import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Coin } from "@/lib/api";

interface CoinOverviewCardProps {
  coin: Coin;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => void;
  className?: string;
}

const CoinOverviewCard: React.FC<CoinOverviewCardProps> = ({
  coin,
  isInWatchlist = false,
  onToggleWatchlist,
  className,
}) => {
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

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) {
      return `$${(volume / 1e12).toFixed(2)}T`;
    } else if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else {
      return `$${volume.toLocaleString()}`;
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

  const handleToggleWatchlist = () => {
    if (onToggleWatchlist) {
      onToggleWatchlist(coin.id, coin.name, coin.symbol.toUpperCase());
    }
  };

  return (
    <Card
      className={cn(
        "crypto-card border-0 shadow-xl group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={coin.image} alt={coin.name} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-crypto-orange text-primary-foreground font-bold">
                {coin.symbol.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                {coin.name}
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs"
                >
                  #{coin.market_cap_rank}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium">
                {coin.symbol.toUpperCase()}
              </p>
            </div>
          </div>
          {onToggleWatchlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleWatchlist}
              className={cn(
                "transition-all duration-200",
                isInWatchlist
                  ? "text-primary border-primary bg-primary/10 opacity-100"
                  : "opacity-0 group-hover:opacity-100 hover:text-primary hover:border-primary"
              )}
            >
              <Star
                className={cn("h-4 w-4", isInWatchlist && "fill-current")}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Price */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">
              Current Price
            </span>
            <span className="text-3xl font-bold text-primary">
              {formatPrice(coin.current_price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">
              24h Change
            </span>
            {formatPercentage(coin.price_change_percentage_24h)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Market Cap */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Market Cap
            </div>
            <p className="font-bold text-lg">
              {formatMarketCap(coin.market_cap)}
            </p>
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              24h Volume
            </div>
            <p className="font-bold text-lg">
              {formatVolume(coin.total_volume)}
            </p>
          </div>

          {/* High/Low */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              24h High
            </div>
            <p className="font-bold text-lg text-crypto-green">
              {formatPrice(coin.high_24h)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              24h Low
            </div>
            <p className="font-bold text-lg text-crypto-red">
              {formatPrice(coin.low_24h)}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Circulating Supply: </span>
              <span className="font-bold">
                {coin.circulating_supply.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium">Max Supply: </span>
              <span className="font-bold">
                {coin.max_supply ? coin.max_supply.toLocaleString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinOverviewCard;
