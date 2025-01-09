import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Flex,
  Text,
  Icon,
  useDisclosure,
  Box,
  ButtonProps,
} from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";
import ClientReviewModal from "./ClientReviewModal";

interface Review {
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsModalProps {
  buttonProps?: ButtonProps; // Allows external styles
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({ buttonProps }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(data.reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen]);

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        as={FaStar}
        color={i < rating ? "yellow.400" : "gray.600"}
        w={6}
        h={6}
        transition="transform 0.3s ease"
        _hover={{ transform: "scale(1.3)" }}
      />
    ));

  return (
    <><>
      <Button onClick={onOpen} {...buttonProps}>
        Reviews
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="rgba(0, 0, 0, 0.8)" maxH="80vh" overflowY="auto">
          <ModalHeader textAlign="center" color="white">
            Reviews
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            {loading ? (
              <Spinner size="xl" color="#ff007f" />
            ) : reviews && reviews.length > 0 ? (
              <Flex direction="column" gap={6}>
                {reviews.map((review, i) => (
                  <Box
                    key={i}
                    bg="rgba(0,0,0,0.5)"
                    p={6}
                    borderRadius="md"
                    boxShadow="0 0 10px #ff007f"
                    textAlign="center"
                    color="white"
                  >
                    <Text fontWeight="bold" fontSize="lg">
                      {review.name}
                    </Text>
                    <Flex justifyContent="center" mb={2}>
                      {renderStars(review.rating)}
                    </Flex>
                    <Text fontSize="md">{review.comment}</Text>
                    <Text fontSize="sm" fontStyle="italic" mt={1}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>
                ))}
              </Flex>
            ) : (
              <Text textAlign="center" fontSize="lg">
                No reviews available at this time.
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="pink">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </><ClientReviewModal reviews={reviews} /></>
  );
};

export default ReviewsModal;
