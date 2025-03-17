
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { ConnectWallet } from "@/components/connect-wallet";
import { BalanceDisplay } from "@/components/balance-display";
import { TransferForm } from "@/components/transfer-form";
import { TransactionResult } from "@/components/transaction-result";
import { fetchBalance, sendAtom } from "@/utils/cosmos";
import { type TransferFormValues } from "@/schemas/transfer";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{
    txHash: string;
    mintscanUrl: string;
  } | null>(null);

  const queryClient = useQueryClient();

  const { data: balanceData, isLoading } = useQuery({
    queryKey: ["balance", address],
    queryFn: () => (address ? fetchBalance(address) : Promise.resolve({ formatted: "0", amount: "0" })),
    enabled: !!address,
  });

  const transferMutation = useMutation({
    mutationFn: async (values: TransferFormValues) => {
      if (!address) throw new Error("Wallet not connected");
      return sendAtom(address, values.recipientAddress, values.amount);
    },
    onSuccess: (data) => {
      setTxResult({
        txHash: data.txHash,
        mintscanUrl: data.mintscanUrl,
      });
      toast({
        title: "Transaction Successful",
        description: "Your transfer has been submitted to the blockchain",
      });
      // Invalidate balance query to refresh after transaction
      queryClient.invalidateQueries({ queryKey: ["balance", address] });
    },
  });

  const handleConnect = (walletAddress: string) => {
    setAddress(walletAddress);
    toast({
      title: "Wallet Connected",
      description: "Your Cosmos Hub wallet has been connected successfully",
    });
  };

  const handleTransfer = async (values: TransferFormValues) => {
    await transferMutation.mutateAsync(values);
  };

  const handleRefreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: ["balance", address] });
  };

  const closeTransactionResult = () => {
    setTxResult(null);
  };

  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-background flex flex-col">
        <header className="container py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent"></div>
            <h1 className="text-xl font-bold">Cosmos Wallet</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectWallet 
              onConnect={handleConnect}
              isConnected={!!address}
              address={address || undefined}
            />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 container py-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {txResult ? (
              <TransactionResult 
                txHash={txResult.txHash}
                mintscanUrl={txResult.mintscanUrl}
                onClose={closeTransactionResult}
              />
            ) : (
              <>
                {address ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    <BalanceDisplay 
                      balance={balanceData?.formatted || "0"} 
                      isLoading={isLoading}
                      onRefresh={handleRefreshBalance}
                    />
                    <TransferForm 
                      onSubmit={handleTransfer}
                      balance={balanceData?.formatted || "0"}
                      isLoading={isLoading || transferMutation.isPending}
                    />
                  </div>
                ) : (
                  <div className="text-center py-16 px-4">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Connect Your Wallet</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                      Connect your Keplr wallet to view your ATOM balance and make transfers on Cosmos Hub.
                    </p>
                    <ConnectWallet 
                      onConnect={handleConnect}
                      isConnected={!!address}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <footer className="border-t py-4">
          <div className="container text-center text-sm text-muted-foreground">
            <p>Cosmos Wallet Interface — Built with ShadCN UI and React</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  );
};

export default Index;
