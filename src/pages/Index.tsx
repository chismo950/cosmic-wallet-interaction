
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
  useColorModeValue,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { ColorModeToggle } from "../components/ColorModeToggle";
import { ToastProvider } from "../components/Toast";
import {
  connectKeplr,
  fetchBalance,
  sendAtom,
  isValidCosmosAddress,
  DENOM_DISPLAY,
} from "../utils/cosmos";

const Index = () => {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({ amount: "0", formatted: "0" });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientError, setRecipientError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [txResult, setTxResult] = useState<any>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const walletAddress = await connectKeplr();
      if (walletAddress) {
        setAddress(walletAddress);
        const balanceResult = await fetchBalance(walletAddress);
        setBalance(balanceResult);
      }
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    
    if (!recipient || !isValidCosmosAddress(recipient)) {
      setRecipientError("Please enter a valid Cosmos address");
      isValid = false;
    } else {
      setRecipientError("");
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError("Please enter a valid amount");
      isValid = false;
    } else if (parseFloat(amount) > parseFloat(balance.formatted)) {
      setAmountError("Insufficient balance");
      isValid = false;
    } else {
      setAmountError("");
    }
    
    return isValid;
  };
  
  const handleSend = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const result = await sendAtom(address, recipient, amount);
      setTxResult(result);
      onOpen();
      // Reset form
      setRecipient("");
      setAmount("");
    } catch (error) {
      console.error("Send error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ToastProvider>
      <Container maxW="container.md" py={8}>
        <Flex justifyContent="flex-end" mb={4}>
          <ColorModeToggle />
        </Flex>
        <VStack spacing={6} align="stretch">
          <Box p={6} borderWidth="1px" borderRadius="lg" borderColor={borderColor} bg={bgColor}>
            <Heading size="lg" mb={4}>Cosmos Wallet</Heading>
            
            {!address ? (
              <Button
                onClick={handleConnect}
                isLoading={isConnecting}
                loadingText="Connecting..."
                size="lg"
                width="full"
              >
                Connect Keplr Wallet
              </Button>
            ) : (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold">Address:</Text>
                  <Text fontSize="sm" isTruncated>{address}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold">Balance:</Text>
                  <Text fontSize="xl">{balance.formatted} {DENOM_DISPLAY}</Text>
                </Box>
                
                <FormControl isInvalid={!!recipientError}>
                  <FormLabel>Recipient Address</FormLabel>
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="cosmos1..."
                  />
                  {recipientError && <FormErrorMessage>{recipientError}</FormErrorMessage>}
                </FormControl>
                
                <FormControl isInvalid={!!amountError}>
                  <FormLabel>Amount ({DENOM_DISPLAY})</FormLabel>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    type="number"
                    step="0.000001"
                  />
                  {amountError && <FormErrorMessage>{amountError}</FormErrorMessage>}
                </FormControl>
                
                <Button
                  onClick={handleSend}
                  isLoading={isLoading}
                  loadingText="Sending..."
                  colorScheme="blue"
                >
                  Send {DENOM_DISPLAY}
                </Button>
              </VStack>
            )}
          </Box>
        </VStack>
        
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transaction Result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {txResult && (
                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="bold">Transaction Hash:</Text>
                  <Text fontSize="sm" isTruncated>{txResult.txHash}</Text>
                  <Button
                    as="a"
                    href={txResult.mintscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    rightIcon={<ExternalLinkIcon />}
                    variant="outline"
                  >
                    View on Mintscan
                  </Button>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </ToastProvider>
  );
};

export default Index;
