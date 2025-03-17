
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Container,
  useColorModeValue,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Container maxW="container.md" py={16}>
      <Box
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        borderColor={borderColor}
        bg={bgColor}
        textAlign="center"
      >
        <VStack spacing={6}>
          <Heading size="2xl">404</Heading>
          <Heading size="md">Page Not Found</Heading>
          <Text>The page you're looking for doesn't exist or has been moved.</Text>
          <Button as={Link} to="/" colorScheme="blue">
            Return Home
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default NotFound;
