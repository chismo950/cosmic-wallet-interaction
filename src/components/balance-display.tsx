
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { DENOM_DISPLAY } from "@/utils/cosmos";

interface BalanceDisplayProps {
  balance: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function BalanceDisplay({ balance, isLoading, onRefresh }: BalanceDisplayProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Your Balance</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onRefresh} 
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh balance</span>
          </Button>
        </div>
        <CardDescription>Available balance on Cosmos Hub</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold">{balance || "0"}</span>
          <span className="text-lg text-muted-foreground">{DENOM_DISPLAY}</span>
        </div>
      </CardContent>
    </Card>
  );
}
