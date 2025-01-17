// ./src/pages/loyalty.tsx

import React, { useState } from "react";
import Head from "next/head";
import {
  Box,
  Heading,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  Button,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

// If you want SSR with query params, you can uncomment and use getServerSideProps below.
// export const getServerSideProps = async (context) => {
//   const { name, clientId } = context.query;
//   // 1. If name/clientId exist, you could fetch data from DB here
//   // 2. Return the data as props, then handle it in the component
//   // 3. For SSR optimization, ensure your DB has an index on name + clientId

//   return {
//     props: {
//       initialName: name || "",
//       initialClientId: clientId || "",
//       // potential data if you want to SSR directly
//     },
//   };
// };

interface ClientData {
  name: string;
  clientId: string;
  hours: number;
  stamps: number;
  signUpDate: string;
}

const ClientLoyaltyPage = () => {
  // --------------------------------------------
  //  If you used SSR above, you could initialize
  //  local state with those props instead:
  //   const [name, setName] = useState(initialName || "");
  //   const [clientId, setClientId] = useState(initialClientId || "");
  // --------------------------------------------

  // 1. SIGN-UP form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  // 2. LOOKUP form state
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [stampSlots, setStampSlots] = useState<boolean[]>(Array(6).fill(false));
  const [prevStamps, setPrevStamps] = useState(0);

  const toast = useToast();

  // ---------------------------------
  // SIGN-UP Handler
  // ---------------------------------
  const signUp = async () => {
    try {
      // Make sure we don't send empty data
      if (!signupName.trim() || !signupEmail.trim()) {
        toast({
          title: "Missing Info",
          description: "Please enter both name and email.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const res = await fetch("/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Registration Error",
          description: data.error || "Failed to register. Please try again.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: "Registration Successful!",
        description:
          "You're now part of Hull Tattoo Studio's Loyalty Program. " +
          "Check your email for your Client ID and details. Keep track of " +
          "your hours to earn free sessions!",
        status: "success",
        duration: 8000,
        isClosable: true,
      });

      // Reset form
      setSignupName("");
      setSignupEmail("");
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // ---------------------------------
  // LOOKUP Handler
  // ---------------------------------
  const fetchClientData = async () => {
    try {
      if (!name.trim() || !clientId.trim()) {
        toast({
          title: "Missing Info",
          description: "Please enter both name and Client ID.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Possibly add caching or indexing on DB side for (name + clientId)
      const res = await fetch(`/api/clients?name=${name}&clientId=${clientId}`);
      if (!res.ok) {
        setClientData(null);
        toast({
          title: "Lookup Error",
          description: "Client not found or server error.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      const data: ClientData = await res.json();
      setClientData(data);

      // Stamps
      const stamps = Math.min(data.stamps, 6);
      // Show toast notifications for newly earned stamps
      if (stamps > prevStamps) {
        for (let s = prevStamps + 1; s <= stamps; s++) {
          toast({
            title: `Congratulations!`,
            description: `You just earned stamp #${s}! Keep going!`,
            status: "success",
            duration: 4000,
            isClosable: true,
          });
        }
      }
      setPrevStamps(stamps);

      // Update stamp slots
      setStampSlots(
        Array(6)
          .fill(false)
          .map((_, i) => i < stamps)
      );
    } catch (error) {
      console.error("Error fetching client data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch client data. Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  // Calculate hours needed for the next stamp
  const hoursUntilNextStamp = () => {
    if (!clientData) return 0;
    if (clientData.stamps >= 6) return 0;
    const threshold = (clientData.stamps + 1) * 4; // 4 hours per stamp
    const remaining = threshold - clientData.hours;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <>
      {/* 1. Head & Meta Tags */}
      <Head>
        <title>HTS Loyalty Program | Hull Tattoo Studio</title>
        <meta
          name="description"
          content="Join Hull Tattoo Studio's Loyalty Program and earn rewards for your hours of tattooing. Complete your card and claim a free tattoo session!"
        />
        <meta
          name="keywords"
          content="Hull Tattoo Studio, Loyalty Program, Tattoo Rewards, Free Tattoo Session, Tattoo Stamps"
        />
        <meta name="author" content="Hull Tattoo Studio" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph Meta */}
        <meta
          property="og:title"
          content="HTS Loyalty Program | Hull Tattoo Studio"
        />
        <meta
          property="og:description"
          content="Earn rewards for your loyalty at Hull Tattoo Studio. Get 1 free tattoo session after completing your loyalty card!"
        />
        <meta
          property="og:url"
          content="https://hulltattoostudio.com/loyalty"
        />
        {/* Make sure this URL is correct and publicly accessible */}
        <meta
          property="og:image"
          content="https://hulltattoostudio.com/images/loyalty.png"
        />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="HTS Loyalty Program | Hull Tattoo Studio"
        />
        <meta
          name="twitter:description"
          content="Earn rewards for your loyalty at Hull Tattoo Studio. Complete your loyalty card to claim a free tattoo session!"
        />
        {/* Make sure this URL is correct and publicly accessible */}
        <meta
          name="twitter:image"
          content="https://hulltattoostudio.com/images/loyalty.png"
        />

        {/* Misc/Google */}
        <meta name="google-adsense-account" content="ca-pub-6959045179650835" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Canonical URL */}
        <link
          rel="canonical"
          href="https://hulltattoostudio.com/loyalty"
        />
      </Head>

      {/* 2. Page Layout */}
      <Box
        as="main"
        position="relative"
        color="white"
        w="100%"
        p={8}
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        bg="black"
        overflow="hidden"
      >
        {/* SIGN UP SECTION */}
        <Box
          bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          maxW="900px"
          w="100%"
          textAlign="center"
          mb={8}
        >
          <Heading
            mb={4}
            fontSize="2xl"
            textShadow="0 0 10px #ff007f, 0 0 20px #00d4ff"
          >
            Sign Up for HTS Loyalty Program
          </Heading>
          <Text mb={6} fontSize="md" px={4}>
            Complete the form below to join our Loyalty Program. We’ll email you
            your unique Client ID. Start collecting stamps and earn a free
            tattoo session!
          </Text>
          <VStack spacing={4} width={{ base: "100%", md: "50%" }} mx="auto">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                bg="white"
                color="black"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="email@example.com"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                bg="white"
                color="black"
              />
            </FormControl>
            <Button
              colorScheme="pink"
              boxShadow="0 0 10px #ff007f"
              _hover={{
                boxShadow: "0 0 20px #ff007f, 0 0 40px #00d4ff",
                transform: "scale(1.05)",
              }}
              onClick={signUp}
            >
              Sign Up
            </Button>
          </VStack>
        </Box>

        {/* LOOKUP SECTION */}
        <Box
          bgGradient="radial(rgba(54,39,255,0.6), rgba(128,0,128,0.6), rgba(0,0,0,0.6))"
          borderRadius="md"
          p={8}
          boxShadow="0 0 20px #9b5de5, 0 0 30px #f15bb5"
          position="relative"
          maxW="900px"
          w="100%"
          textAlign="center"
          mb={8}
        >
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
              Earn rewards for your loyalty. Complete your card to claim a free
              tattoo session!
            </Text>
          </motion.div>

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

          {/* CLIENT INFO DISPLAY */}
          {clientData && (
            <Box textAlign="center" mb={8}>
              <Text>
                <strong>Total Tattoo Hours:</strong> {clientData.hours}
              </Text>
              <Text>
                <strong>Signed Up:</strong>{" "}
                {new Date(clientData.signUpDate).toLocaleDateString("en-GB")}
              </Text>
              {clientData.stamps < 6 && (
                <Text>
                  <strong>Hours until next stamp:</strong>{" "}
                  {hoursUntilNextStamp()}
                </Text>
              )}
            </Box>
          )}

          {/* LOYALTY CARD DISPLAY */}
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
                    w={{ base: "60px", md: "80px" }}
                    h={{ base: "60px", md: "80px" }}
                    bg={stamped ? "pink.500" : "gray.700"}
                    borderRadius="50%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 0 10px #ff007f"
                  >
                    {stamped && (
                      <Text
                        fontSize="lg"
                        color="white"
                        textShadow="0 0 5px black"
                      >
                        HTS
                      </Text>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Terms & Conditions */}
          <motion.div>
            <Box
              mt={6}
              p={6}
              bg="pink.800"
              color="white"
              borderRadius="md"
              textAlign="center"
            >
              <Heading as="h3" size="md" mb={4}>
                Terms and Conditions
              </Heading>
              <Text fontSize="sm">
                - Earn 1 stamp for every 4 hours of tattooing.
              </Text>
              <Text fontSize="sm">
                - Complete all 6 stamps to claim 1 full day of tattooing.
              </Text>
              <Text fontSize="sm">- Stamps reset after redemption.</Text>
              <Text fontSize="sm">
                - Loyalty reward can be gifted but must be claimed within 1 year
                of the last stamp.
              </Text>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </>
  );
};

export default ClientLoyaltyPage;
