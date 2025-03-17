
// Constants for Cosmos Hub
export const CHAIN_ID = "cosmoshub-4";
export const DENOM = "uatom";
export const DENOM_DISPLAY = "ATOM";
export const DENOM_DECIMAL = 6;
export const MINTSCAN_URL = "https://www.mintscan.io/cosmos";

// Function to connect to Keplr wallet
export const connectKeplr = async () => {
  try {
    const keplrWindow = window;
    if (!keplrWindow.keplr) {
      console.error("Keplr wallet not found");
      return null;
    }
    
    await keplrWindow.keplr.enable(CHAIN_ID);
    const key = await keplrWindow.keplr.getKey(CHAIN_ID);
    return key.bech32Address;
  } catch (error) {
    console.error("Error connecting to Keplr:", error);
    return null;
  }
};

// Function to fetch balance
export const fetchBalance = async (address: string) => {
  try {
    const response = await fetch(`https://lcd-cosmoshub.keplr.app/cosmos/bank/v1beta1/balances/${address}`);
    if (!response.ok) {
      throw new Error("Failed to fetch balance");
    }
    
    const data = await response.json();
    const atomBalance = data.balances.find((b: { denom: string }) => b.denom === DENOM);
    
    if (atomBalance) {
      return {
        amount: atomBalance.amount,
        formatted: formatAtom(atomBalance.amount)
      };
    }
    
    return {
      amount: "0",
      formatted: "0"
    };
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};

// Function to format ATOM amount
export const formatAtom = (amount: string) => {
  const atomAmount = parseInt(amount) / Math.pow(10, DENOM_DECIMAL);
  return atomAmount.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0
  });
};

// Function to send ATOM
export const sendAtom = async (senderAddress: string, recipientAddress: string, amount: string) => {
  try {
    const keplrWindow = window;
    if (!keplrWindow.keplr) {
      console.error("Keplr wallet not found");
      throw new Error("Keplr wallet not found");
    }
    
    const amountInt = parseFloat(amount) * Math.pow(10, DENOM_DECIMAL);
    
    // Get the offline signer from Keplr
    const offlineSigner = keplrWindow.keplr.getOfflineSigner(CHAIN_ID);
    
    // Create a cosmos client - using dynamic import to avoid TypeScript errors
    const { SigningStargateClient } = await import('@cosmjs/stargate');
    const signingClient = await SigningStargateClient.connectWithSigner(
      "https://rpc-cosmoshub.keplr.app", 
      offlineSigner
    );
    
    // Prepare the transaction
    const fee = {
      amount: [
        {
          denom: DENOM,
          amount: "5000"
        }
      ],
      gas: "200000"
    };
    
    // Send the transaction
    const result = await signingClient.sendTokens(
      senderAddress,
      recipientAddress,
      [
        {
          denom: DENOM,
          amount: amountInt.toString()
        }
      ],
      fee,
      "Sent via Cosmos Wallet"
    );
    
    return {
      success: true,
      txHash: result.transactionHash,
      mintscanUrl: `${MINTSCAN_URL}/tx/${result.transactionHash}`
    };
  } catch (error) {
    console.error("Error sending ATOM:", error);
    throw error;
  }
};

export const isValidCosmosAddress = (address: string) => {
  // Simple regex for Cosmos address validation
  // A more thorough validation would require bech32 implementation
  return /^cosmos1[a-z0-9]{38}$/.test(address);
};
