import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoApi, type SearchResult } from "@/lib/api";

interface CryptoSearchProps {
  onSelectCoin: (coinId: string, coinName: string, coinSymbol: string) => void;
  placeholder?: string;
  className?: string;
}

const CryptoSearch: React.FC<CryptoSearchProps> = ({
  onSelectCoin,
  placeholder = "Search cryptocurrencies...",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["crypto-search", debouncedQuery],
    queryFn: () => coingeckoApi.searchCoins(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSelect = (
    coinId: string,
    coinName: string,
    coinSymbol: string
  ) => {
    onSelectCoin(coinId, coinName, coinSymbol);
    setOpen(false);
    setSearchQuery("");
  };

  const formatMarketCap = (rank: number) => {
    if (rank <= 10) return "Top 10";
    if (rank <= 50) return "Top 50";
    if (rank <= 100) return "Top 100";
    return `#${rank}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-background border-border/50 hover:bg-muted/50",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {searchQuery || placeholder}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder="Type to search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="border-0 focus:ring-0"
          />
          <CommandList className="max-h-[300px]">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            )}

            {error && (
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground">
                    Error loading results. Please try again.
                  </p>
                </div>
              </CommandEmpty>
            )}

            {!isLoading &&
              !error &&
              searchResults?.coins &&
              searchResults.coins.length === 0 && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No cryptocurrencies found.
                    </p>
                  </div>
                </CommandEmpty>
              )}

            {!isLoading &&
              !error &&
              searchResults?.coins &&
              searchResults.coins.length > 0 && (
                <CommandGroup>
                  {searchResults.coins.slice(0, 10).map((coin) => (
                    <CommandItem
                      key={coin.id}
                      value={coin.id}
                      onSelect={() =>
                        handleSelect(
                          coin.id,
                          coin.name,
                          coin.symbol.toUpperCase()
                        )
                      }
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={coin.large} alt={coin.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {coin.symbol.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {coin.name}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {coin.symbol.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Market Cap Rank:{" "}
                            {formatMarketCap(coin.market_cap_rank)}
                          </span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CryptoSearch;

