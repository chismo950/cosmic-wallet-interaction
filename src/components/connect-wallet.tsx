
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { connectKeplr } from "@/utils/cosmos";

interface ConnectWalletProps {
  onConnect: (address: string) => void;
  isConnected: boolean;
  address?: string;
}

export function ConnectWallet({ onConnect, isConnected, address }: ConnectWalletProps) {
  const handleConnect = async () => {
    const address = await connectKeplr();
    if (address) {
      onConnect(address);
    }
  };

  return (
    <div className="flex items-center">
      {isConnected ? (
        <div className="flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "Connected"}
          </span>
        </div>
      ) : (
        <Button onClick={handleConnect} className="flex items-center space-x-2">
          <Wallet className="h-4 w-4" />
          <span>Connect Keplr</span>
        </Button>
      )}
    </div>
  );
}
