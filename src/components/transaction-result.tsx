
import { CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface TransactionResultProps {
  txHash: string;
  mintscanUrl: string;
  onClose: () => void;
}

export function TransactionResult({ txHash, mintscanUrl, onClose }: TransactionResultProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-green-400/30 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <CardTitle>Transaction Successful</CardTitle>
        </div>
        <CardDescription>Your transfer has been submitted to the blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Transaction Hash:</span>
            <div className="mt-1 p-2 bg-background rounded border overflow-x-auto">
              <code className="text-xs break-all">{txHash}</code>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => window.open(mintscanUrl, "_blank")}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Mintscan
        </Button>
        <Button className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}
