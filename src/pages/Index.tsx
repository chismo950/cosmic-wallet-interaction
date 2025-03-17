
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ConnectWallet } from "@/components/connect-wallet";
import { BalanceDisplay } from "@/components/balance-display";
import { TransferForm } from "@/components/transfer-form";
import { type TransferFormValues } from "@/schemas/transfer";
import { ThemeToggle } from "@/components/theme-toggle";
import { fetchBalance, sendAtom } from "@/utils/cosmos";
import { TransactionResult } from "@/components/transaction-result";
import { useToast } from "@/components/ui/use-toast";

export default function Index() {
  const [address, setAddress] = useState<string | null>(null);
  const [txResult, setTxResult] = useState<{ txHash: string; mintscanUrl: string } | null>(null);
  const { toast } = useToast();

  // Query for fetching balance
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["balance", address],
    queryFn: () => (address ? fetchBalance(address) : Promise.resolve({ amount: "0", formatted: "0" })),
    enabled: !!address,
  });

  // Mutation for sending tokens
  const { mutateAsync: sendTokens, isPending: isSending } = useMutation({
    mutationFn: async (values: TransferFormValues) => {
      if (!address) throw new Error("Wallet not connected");
      return sendAtom(address, values.recipientAddress, values.amount);
    },
    onSuccess: (data) => {
      toast({
        title: "Transaction Successful",
        description: `Successfully sent tokens. TX Hash: ${data.txHash.slice(0, 10)}...`,
      });
      setTxResult(data);
      refetchBalance(); // Refresh balance after successful transaction
    },
  });

  const handleConnect = (address: string) => {
    setAddress(address);
    setTxResult(null); // Reset transaction result when connecting
  };

  const handleSubmitTransfer = async (values: TransferFormValues) => {
    await sendTokens(values);
  };

  const handleCloseResult = () => {
    setTxResult(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Cosmos Wallet</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <ConnectWallet onConnect={handleConnect} isConnected={!!address} address={address || undefined} />
          </div>
        </header>

        {address ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col space-y-6">
              <BalanceDisplay
                balance={balanceData?.formatted || "0"}
                isLoading={isBalanceLoading}
                onRefresh={() => refetchBalance()}
              />
              {txResult && (
                <TransactionResult
                  txHash={txResult.txHash}
                  mintscanUrl={txResult.mintscanUrl}
                  onClose={handleCloseResult}
                />
              )}
            </div>
            <TransferForm
              onSubmit={handleSubmitTransfer}
              balance={balanceData?.formatted || "0"}
              isLoading={isBalanceLoading || isSending}
            />
          </div>
        ) : (
          <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-semibold">Welcome to Cosmos Wallet</h2>
            <p className="max-w-md text-muted-foreground">
              Connect your Keplr wallet to view your balance and send ATOM to other addresses.
            </p>
            <ConnectWallet onConnect={handleConnect} isConnected={false} />
          </div>
        )}
      </div>
    </div>
  );
}
