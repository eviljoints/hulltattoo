import React, { useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import styles from "../components/TextCard.module.css"; // Import neonLines styles

const ClientLoyaltyPage = () => {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientData, setClientData] = useState(null);
  const [stampSlots, setStampSlots] = useState([false, false, false, false, false, false]);

  const fetchClientData = async () => {
    const res = await fetch(`/api/clients?name=${name}&clientId=${clientId}`);
    const data = await res.json();
    setClientData(data);

    // Fill stamps based on fetched data
    const stamps = Math.min(data.stamps, 6);
    setStampSlots(Array(6).fill(false).map((_, i) => i < stamps));
  };

  return (
    <Box
      as="main"
      position="relative"
      color="white"
      w="100%"
      p={8}
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="black"
      overflow="hidden"
    >
      {/* Neon Lines Background */}
      <Box className={styles.neonLines}></Box>

      {/* Page Content Wrapper */}
      <Box
        bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
        borderRadius="md"
        p={8}
        boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
        position="relative"
        maxW="900px"
        w="100%"
        zIndex="1"
      >
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Heading
            mb={4}
            fontSize="3xl"
            textAlign="center"
            textShadow="0 0 15px #ff007f, 0 0 30px #00d4ff"
          >
            HTS Loyalty Program
          </Heading>
          <Text
            fontSize="lg"
            mb={8}
            textAlign="center"
            textShadow="0 0 5px #ff007f, 0 0 10px #00d4ff"
          >
            Earn rewards for your loyalty. Complete your card to claim a free tattoo session!
          </Text>
        </motion.div>

        {/* Input Fields */}
        <VStack spacing={6} align="center" mb={10} width="100%">
          <FormControl width={{ base: "100%", md: "50%" }}>
            <FormLabel textAlign="center">Name</FormLabel>
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              bg="white"
              color="black"
              w="100%"
              boxShadow="0 0 10px #ff007f"
            />
          </FormControl>
          <FormControl width={{ base: "100%", md: "50%" }}>
            <FormLabel textAlign="center">Client ID</FormLabel>
            <Input
              placeholder="Your Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              bg="white"
              color="black"
              w="100%"
              boxShadow="0 0 10px #00d4ff"
            />
          </FormControl>
          <Button
            colorScheme="pink"
            boxShadow="0 0 10px #ff007f"
            _hover={{
              boxShadow: "0 0 20px #ff007f, 0 0 40px #00d4ff",
              transform: "scale(1.05)",
            }}
            onClick={fetchClientData}
          >
            Check Points
          </Button>
        </VStack>

        {/* Loyalty Card */}
        <Box
          border="2px solid pink"
          borderRadius="md"
          p={8}
          bg="black"
          position="relative"
          boxShadow="0 0 20px #ff007f, 0 0 40px #00d4ff"
          maxW="600px"
          mx="auto"
          mb={8}
          zIndex="1"
        >
          <Heading
            as="h2"
            size="lg"
            textAlign="center"
            mb={6}
            textShadow="0 0 15px #ff007f, 0 0 30px #00d4ff"
          >
            Loyalty Card
          </Heading>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={4}>
            {stampSlots.map((stamped, index) => (
              <motion.div
                key={index}
                animate={{ scale: stamped ? 1 : 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <Box
                  w="80px"
                  h="80px"
                  bg={stamped ? "pink.500" : "gray.700"}
                  borderRadius="50%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 0 10px #ff007f"
                >
                  {stamped && (
                    <Text fontSize="lg" color="white" textShadow="0 0 5px black">
                      HTS
                    </Text>
                  )}
                </Box>
              </motion.div>
            ))}
          </Box>
        </Box>

        {/* Terms and Conditions */}
        <motion.div>
          <Box mt={6} p={6} bg="pink.800" color="white" borderRadius="md" textAlign="center">
            <Heading as="h3" size="md" mb={4}>
              Terms and Conditions
            </Heading>
            <Text fontSize="sm">- Earn 1 stamp for every 4 hours of tattooing.</Text>
            <Text fontSize="sm">- Complete all 6 stamps to claim 1 full day of tattooing.</Text>
            <Text fontSize="sm">- Stamps reset after redemption.</Text>
            <Text fontSize="sm">- Loyalty reward can be gifted but must be claimed within 1 year of the last stamp.</Text>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ClientLoyaltyPage;
