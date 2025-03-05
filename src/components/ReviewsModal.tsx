import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Text,
  ButtonProps,
} from "@chakra-ui/react";

interface ReviewsModalProps {
  buttonProps?: ButtonProps; // Allows external styles
}

const ReviewsModal: React.FC<ReviewsModalProps> = ({ buttonProps }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} {...buttonProps}>
        Reviews
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="rgba(0, 0, 0, 0.8)">
          <ModalHeader textAlign="center" color="white">
            Google Reviews
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Text textAlign="center" color="white" mb={4}>
              Check out our reviews on Google!
            </Text>
            <Button
              as="a"
              href="https://g.page/r/CayasoLxlsxyEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              colorScheme="pink"
              width="full"
            >
              Leave a Review 
            </Button>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="pink" variant="outline">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ReviewsModal;