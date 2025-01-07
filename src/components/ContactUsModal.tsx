import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Text,
  ButtonProps,
} from "@chakra-ui/react";

interface ContactUsModalProps {
  buttonProps?: ButtonProps; // Allows external styles
}

const ContactUsModal: React.FC<ContactUsModalProps> = ({ buttonProps }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmailOrPhone("");
    setMessage("");
    setImages(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    if (!name || !emailOrPhone || !message) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build form data to send to our Next.js API
      const formData = new FormData();
      formData.append("name", name);
      formData.append("emailOrPhone", emailOrPhone);
      formData.append("message", message);

      if (images) {
        Array.from(images).forEach((file, index) =>
          formData.append(`image${index}`, file)
        );
      }

      // Send the form data to our Next.js API endpoint
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage("Your message has been sent successfully!");
      } else {
        alert("Failed to send your message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} {...buttonProps}>
        Contact Us
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="rgba(0, 0, 0, 0.8)">
          <ModalHeader textAlign="center" color="white">
            Contact Us
          </ModalHeader>
          <ModalCloseButton color="white" onClick={handleClose} />
          <ModalBody>
            {successMessage ? (
              <Text color="green.400" textAlign="center" mb={4}>
                {successMessage}
              </Text>
            ) : (
              <>
                <FormControl mb={4} isRequired>
                  <FormLabel color="white">Name</FormLabel>
                  <Input
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    bg="white"
                    color="black"
                  />
                </FormControl>
                <FormControl mb={4} isRequired>
                  <FormLabel color="white">Email or Phone Number</FormLabel>
                  <Input
                    placeholder="Your Email or Phone Number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    bg="white"
                    color="black"
                  />
                </FormControl>
                <FormControl mb={4} isRequired>
                  <FormLabel color="white">Message</FormLabel>
                  <Textarea
                    placeholder="What would you like to ask?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    bg="white"
                    color="black"
                  />
                </FormControl>
                <FormControl mb={4}>
                  <FormLabel color="white">Upload Images (Optional)</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(e.target.files)}
                    bg="white"
                    color="black"
                  />
                </FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            {successMessage ? (
              <Button onClick={resetForm} colorScheme="teal" ml={3}>
                Send Another
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                colorScheme="teal"
                isLoading={isSubmitting}
                loadingText="Sending"
              >
                Send Message
              </Button>
            )}
            <Button onClick={handleClose} colorScheme="pink" ml={3}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContactUsModal;
