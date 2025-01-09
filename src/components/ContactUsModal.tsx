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
  Alert,
  AlertIcon,
} from "@chakra-ui/react";

interface ContactUsModalProps {
  buttonProps?: ButtonProps; // Allows external styles
}

const MAX_FILE_SIZE_MB = 5;        // 5 MB per file
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = 10;              // user can select up to 3 files

const ContactUsModal: React.FC<ContactUsModalProps> = ({ buttonProps }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmailOrPhone("");
    setMessage("");
    setImages(null);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Validate files on selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Check total file count
    if (selectedFiles.length > MAX_FILES) {
      setErrorMessage(`You can only upload up to ${MAX_FILES} files.`);
      e.target.value = "";
      return;
    }

    // Check each file's size
    for (const file of Array.from(selectedFiles)) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB} MB.`);
        e.target.value = "";
        return; // Exit so we don’t set any large files
      }
    }

    setImages(selectedFiles);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!name || !emailOrPhone || !message) {
      setErrorMessage("Please fill in all mandatory fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Build form data to send to our Next.js API
      const formData = new FormData();
      formData.append("name", name);
      formData.append("emailOrPhone", emailOrPhone);
      formData.append("message", message);

      if (images) {
        // Double-check file count and size before upload
        if (images.length > MAX_FILES) {
          setErrorMessage(`You can only upload up to ${MAX_FILES} files.`);
          setIsSubmitting(false);
          return;
        }

        for (const file of Array.from(images)) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            setErrorMessage(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB} MB.`);
            setIsSubmitting(false);
            return;
          }
        }

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
        const data = await response.json();
        setErrorMessage(data.error || "Failed to send your message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting the form:", error);
      setErrorMessage("An error occurred. Please try again.");
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
                {errorMessage && (
                  <Alert status="error" mb={4}>
                    <AlertIcon />
                    {errorMessage}
                  </Alert>
                )}
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
                  <FormLabel color="white">
                    Upload Images (Optional, max {MAX_FILE_SIZE_MB} MB each, up to {MAX_FILES} files)
                  </FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelection}
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
