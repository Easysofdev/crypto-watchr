import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoApi, type Coin, type CoinChartData } from "@/lib/api";
import { useWatchlist } from "@/hooks/useWatchlist";

interface PriceChartProps {
  coinId: string;
  coinName: string;
  coinSymbol: string;
  coinImage?: string;
  className?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  coinId,
  coinName,
  coinSymbol,
  coinImage,
  className,
}) => {
  const [timeframe, setTimeframe] = useState<"1" | "7" | "30" | "90" | "365">(
    "30"
  );

  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Fetch coin data
  const { data: coinData, isLoading: coinLoading } = useQuery({
    queryKey: ["coin-data", coinId],
    queryFn: () => coingeckoApi.getCoin(coinId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch chart data
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["chart-data", coinId, timeframe],
    queryFn: () => coingeckoApi.getCoinChart(coinId, parseInt(timeframe)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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

  const formatChartData = (data: CoinChartData) => {
    return data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp).toLocaleDateString(),
      price: price,
      timestamp: timestamp,
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-4 shadow-2xl">
          <p className="text-sm text-muted-foreground mb-2">{label}</p>
          <p className="text-lg font-bold text-primary">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const timeframes = [
    { value: "1", label: "1D" },
    { value: "7", label: "7D" },
    { value: "30", label: "1M" },
    { value: "90", label: "3M" },
    { value: "365", label: "1Y" },
  ];

  if (coinLoading || chartLoading) {
    return (
      <Card className={cn("crypto-card border-0 shadow-xl", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={coinImage} alt={coinName} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-crypto-orange text-primary-foreground">
                  {coinSymbol}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{coinName}</CardTitle>
                <p className="text-sm text-muted-foreground">{coinSymbol}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coinData || !chartData) {
    return (
      <Card className={cn("crypto-card border-0 shadow-xl", className)}>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = formatChartData(chartData);

  return (
    <Card className={cn("crypto-card border-0 shadow-xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={coinData.image} alt={coinData.name} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-crypto-orange text-primary-foreground text-lg font-bold">
                {coinData.symbol.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{coinData.name}</CardTitle>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {coinData.symbol.toUpperCase()}
                </p>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  #{coinData.market_cap_rank}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleWatchlist(coinId, coinName, coinSymbol)}
                className={cn(
                  "transition-all duration-200",
                  isInWatchlist(coinId)
                    ? "text-primary border-primary bg-primary/10"
                    : "hover:text-primary hover:border-primary"
                )}
              >
                <Star
                  className={cn(
                    "h-4 w-4 mr-2",
                    isInWatchlist(coinId) ? "fill-current" : ""
                  )}
                />
                {isInWatchlist(coinId) ? "Watching" : "Watch"}
              </Button>
            </div>
            <p className="text-3xl font-bold text-primary mt-2">
              {formatPrice(coinData.current_price)}
            </p>
            {formatPercentage(coinData.price_change_percentage_24h)}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as any)}
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-secondary/50">
              {timeframes.map((tf) => (
                <TabsTrigger
                  key={tf.value}
                  value={tf.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tf.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={timeframe} className="mt-0">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedData}>
                  <defs>
                    <linearGradient
                      id="priceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#priceGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Price Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">24h High</p>
                <p className="font-bold text-lg text-crypto-green">
                  {formatPrice(coinData.high_24h)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">24h Low</p>
                <p className="font-bold text-lg text-crypto-red">
                  {formatPrice(coinData.low_24h)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Market Cap</p>
                <p className="font-bold text-lg">
                  ${(coinData.market_cap / 1e9).toFixed(2)}B
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Volume</p>
                <p className="font-bold text-lg">
                  ${(coinData.total_volume / 1e9).toFixed(2)}B
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
