import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  Box,
  Text,
  VStack,
  SimpleGrid,
  Alert,
  AlertIcon,
  useDisclosure,
  Heading,
} from "@chakra-ui/react";

interface Review {
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ClientReviewModalProps {
  reviews?: Review[]; // Reviews are optional
}

const ClientReviewModal: React.FC<ClientReviewModalProps> = ({ reviews = [] }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment }),
      });
      const data = await res.json();

      if (res.ok) {
        setName("");
        setRating("5");
        setComment("");
        setSuccessMessage("Thank you for your review!");
      } else {
        setErrorMessage(data.error || "An error occurred while submitting your review.");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="pink" boxShadow="0 0 10px #ff007f">
        Leave a Review
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Leave a Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {successMessage && (
                <Alert status="success">
                  <AlertIcon />
                  {successMessage}
                </Alert>
              )}
              {errorMessage && (
                <Alert status="error">
                  <AlertIcon />
                  {errorMessage}
                </Alert>
              )}
              <Box as="form" onSubmit={handleSubmit}>
                <FormControl isRequired mb={4}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>Rating</FormLabel>
                  <Select value={rating} onChange={(e) => setRating(e.target.value)}>
                    <option value="5">5 ★★★★★</option>
                    <option value="4">4 ★★★★</option>
                    <option value="3">3 ★★★</option>
                    <option value="2">2 ★★</option>
                    <option value="1">1 ★</option>
                  </Select>
                </FormControl>

                <FormControl isRequired mb={4}>
                  <FormLabel>Comment</FormLabel>
                  <Textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="pink"
                  isLoading={loading}
                  isDisabled={loading}
                  w="full"
                >
                  Submit Review
                </Button>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      
    </>
  );
};

export default ClientReviewModal;
