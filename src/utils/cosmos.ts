
import { toast } from "@/components/ui/use-toast";

// Constants for Cosmos Hub
export const CHAIN_ID = "cosmoshub-4";
export const DENOM = "uatom";
export const DENOM_DISPLAY = "ATOM";
export const DENOM_DECIMAL = 6;
export const MINTSCAN_URL = "https://www.mintscan.io/cosmos";

export interface KeplrWindow extends Window {
  keplr?: {
    enable: (chainId: string) => Promise<void>;
    experimentalSuggestChain: (chainInfo: any) => Promise<void>;
    getOfflineSigner: (chainId: string) => any;
    getKey: (chainId: string) => Promise<{
      name: string;
      algo: string;
      pubKey: Uint8Array;
      address: Uint8Array;
      bech32Address: string;
    }>;
  };
}

// Function to connect to Keplr wallet
export const connectKeplr = async () => {
  try {
    const keplrWindow = window as KeplrWindow;
    
    if (!keplrWindow.keplr) {
      toast({
        variant: "destructive",
        title: "Keplr wallet not found",
        description: "Please install Keplr wallet extension",
      });
      return null;
    }

    await keplrWindow.keplr.enable(CHAIN_ID);
    const key = await keplrWindow.keplr.getKey(CHAIN_ID);
    return key.bech32Address;
  } catch (error) {
    console.error("Error connecting to Keplr:", error);
    toast({
      variant: "destructive",
      title: "Connection Error",
      description: error instanceof Error ? error.message : "Failed to connect to Keplr wallet",
    });
    return null;
  }
};

// Function to fetch balance
export const fetchBalance = async (address: string) => {
  try {
    const response = await fetch(
      `https://lcd-cosmoshub.keplr.app/cosmos/bank/v1beta1/balances/${address}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch balance");
    }
    
    const data = await response.json();
    const atomBalance = data.balances.find((b: any) => b.denom === DENOM);
    
    if (atomBalance) {
      return {
        amount: atomBalance.amount,
        formatted: formatAtom(atomBalance.amount),
      };
    }
    
    return { amount: "0", formatted: "0" };
  } catch (error) {
    console.error("Error fetching balance:", error);
    toast({
      variant: "destructive",
      title: "Balance Error",
      description: error instanceof Error ? error.message : "Failed to fetch balance",
    });
    throw error;
  }
};

// Function to format ATOM amount
export const formatAtom = (amount: string) => {
  const atomAmount = parseInt(amount) / Math.pow(10, DENOM_DECIMAL);
  return atomAmount.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  });
};

// Function to send ATOM
export const sendAtom = async (senderAddress: string, recipientAddress: string, amount: string) => {
  try {
    const keplrWindow = window as KeplrWindow;
    
    if (!keplrWindow.keplr) {
      toast({
        variant: "destructive",
        title: "Keplr wallet not found",
        description: "Please install Keplr wallet extension",
      });
      throw new Error("Keplr wallet not found");
    }

    const amountInt = parseFloat(amount) * Math.pow(10, DENOM_DECIMAL);
    
    // Get the offline signer from Keplr
    const offlineSigner = keplrWindow.keplr.getOfflineSigner(CHAIN_ID);
    
    // Create a cosmos client - using dynamic import to avoid TypeScript errors
    const stargate = await import('@cosmjs/stargate');
    const signingClient = await stargate.SigningStargateClient.connectWithSigner(
      "https://rpc-cosmoshub.keplr.app", 
      offlineSigner
    );
    
    // Prepare the transaction
    const fee = {
      amount: [{ denom: DENOM, amount: "5000" }],
      gas: "200000",
    };
    
    // Send the transaction
    const result = await signingClient.sendTokens(
      senderAddress,
      recipientAddress,
      [{ denom: DENOM, amount: amountInt.toString() }],
      fee,
      "Sent via Cosmos Wallet"
    );
    
    return {
      success: true,
      txHash: result.transactionHash,
      mintscanUrl: `${MINTSCAN_URL}/tx/${result.transactionHash}`,
    };
  } catch (error) {
    console.error("Error sending ATOM:", error);
    toast({
      variant: "destructive",
      title: "Transaction Error",
      description: error instanceof Error ? error.message : "Failed to send ATOM",
    });
    throw error;
  }
};

export const isValidCosmosAddress = (address: string) => {
  // Simple regex for Cosmos address validation
  // A more thorough validation would require bech32 implementation
  return /^cosmos1[a-z0-9]{38}$/.test(address);
};
