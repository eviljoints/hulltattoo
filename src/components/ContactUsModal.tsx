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
  HStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";

interface ContactUsModalProps {
  buttonProps?: ButtonProps;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = 10;

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUKMobile = (phone: string) => /^07\d{9}$/.test(phone.replace(/\s+/g, ""));

type UploadInfo = {
  uploadUrl: string;
  fileId: string;
  fileType: string;
  fileName: string;
};

type UploadedFile = {
  fileId: string;
  fileType: string;
  fileName: string;
};

async function getWixUploadUrls(files: File[]): Promise<UploadInfo[]> {
  const resp = await fetch("/api/wix-upload-urls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      files: files.map((f) => ({
        fileName: f.name,
        fileType: f.type || "application/octet-stream",
      })),
    }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data?.error || `Failed to get upload URLs (${resp.status})`);
  if (!Array.isArray(data?.uploads)) throw new Error("Invalid upload URLs response from server");
  return data.uploads as UploadInfo[];
}

async function putFileToUploadUrl(uploadUrl: string, file: File) {
  const url = new URL(uploadUrl);
  url.searchParams.set("filename", file.name);

  const resp = await fetch(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Upload failed: ${resp.status} - ${text}`);
  }
}


const ContactUsModal: React.FC<ContactUsModalProps> = ({ buttonProps }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());

  const [globalUploading, setGlobalUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSelectedFiles([]);
    setUploadedFiles([]);
    setUploadingFiles(new Set());
    setGlobalUploading(false);
    setIsSubmitting(false);
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploadedFiles((prev) => prev.filter((f) => f.fileName !== fileName));
    setUploadingFiles((prev) => {
      const next = new Set(prev);
      next.delete(fileName);
      return next;
    });
  };

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;

    if (selectedFiles.length + newFiles.length > MAX_FILES) {
      setErrorMessage(`Maximum ${MAX_FILES} files allowed.`);
      e.target.value = "";
      return;
    }

    for (const f of newFiles) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage(`"${f.name}" exceeds ${MAX_FILE_SIZE_MB} MB limit.`);
        e.target.value = "";
        return;
      }
    }

    setErrorMessage(null);
    setGlobalUploading(true);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    try {
      const uploadInfos = await getWixUploadUrls(newFiles);
      if (uploadInfos.length !== newFiles.length) throw new Error("Mismatch in upload URLs received");

      const newlyUploaded: UploadedFile[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const info = uploadInfos[i];

        setUploadingFiles((prev) => new Set([...prev, file.name]));

        await putFileToUploadUrl(info.uploadUrl, file);

        newlyUploaded.push({
          fileId: info.fileId,
          fileType: info.fileType || file.type || "application/octet-stream",
          fileName: file.name,
        });

        setUploadingFiles((prev) => {
          const next = new Set(prev);
          next.delete(file.name);
          return next;
        });
      }

      setUploadedFiles((prev) => [...prev, ...newlyUploaded]);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setErrorMessage(err?.message || "Upload failed");

      const names = new Set(newFiles.map((f) => f.name));
      setSelectedFiles((prev) => prev.filter((f) => !names.has(f.name)));
      setUploadingFiles((prev) => {
        const next = new Set(prev);
        for (const n of names) next.delete(n);
        return next;
      });
    } finally {
      setGlobalUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !email || !message) {
      setErrorMessage("Please complete all required fields.");
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (phone.trim() && !isValidUKMobile(phone)) {
      setErrorMessage("Invalid UK mobile number (should start with 07...).");
      return;
    }
    if (globalUploading) {
      setErrorMessage("Please wait until file uploads finish.");
      return;
    }
    if (selectedFiles.length && uploadedFiles.length !== selectedFiles.length) {
      setErrorMessage("Some files are not uploaded yet. Please wait and try again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        firstName,
        lastName,
        email,
        message,
        phone: phone.trim() || undefined,
        // ✅ Wix expects displayName too for your form field schema
        uploads: uploadedFiles.map((f) => ({
          fileId: f.fileId,
          fileType: f.fileType,
          displayName: f.fileName, // ✅ REQUIRED now
        })),
      };

      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data?.ok) {
  // clear the fields, but keep the success message visible
  setErrorMessage(null);
  setSuccessMessage("Thank you for sending us a message — we’ll get back to you as soon as possible!");

  setFirstName("");
  setLastName("");
  setEmail("");
  setPhone("");
  setMessage("");
  setSelectedFiles([]);
  setUploadedFiles([]);
  setUploadingFiles(new Set());
  setGlobalUploading(false);
} else {
  setErrorMessage(data?.error || data?.details || "Failed to send message – check console.");
}

    } catch (err: any) {
      console.error("Submit failed:", err);
      setErrorMessage(err?.message || "Network error – please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen} {...buttonProps}>
        Contact Us
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="xl">
        <ModalOverlay />
        <ModalContent bg="rgba(0,0,0,0.85)" color="white">
          <ModalHeader textAlign="center">Get in Touch</ModalHeader>
          <ModalCloseButton onClick={handleClose} />
          <ModalBody pb={6}>
            {successMessage ? (
              <Text color="green.400" textAlign="center" fontSize="lg" my={6}>
                {successMessage}
              </Text>
            ) : (
              <>
                {errorMessage && (
                  <Alert status="error" mb={5} borderRadius="md">
                    <AlertIcon />
                    {errorMessage}
                  </Alert>
                )}

                <FormControl mb={4} isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} bg="whiteAlpha.900" color="black" />
                </FormControl>

                <FormControl mb={4} isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} bg="whiteAlpha.900" color="black" />
                </FormControl>

                <FormControl mb={4} isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} bg="whiteAlpha.900" color="black" />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Mobile (optional – UK format)</FormLabel>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} bg="whiteAlpha.900" color="black" />
                </FormControl>

                <FormControl mb={4} isRequired>
                  <FormLabel>Your Message</FormLabel>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} bg="whiteAlpha.900" color="black" minH="120px" />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Attach Images (max {MAX_FILE_SIZE_MB} MB each, up to {MAX_FILES})</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelection}
                    bg="whiteAlpha.900"
                    color="black"
                    isDisabled={globalUploading || selectedFiles.length >= MAX_FILES}
                  />

                  {selectedFiles.length > 0 && (
                    <HStack mt={3} spacing={3} wrap="wrap">
                      {selectedFiles.map((file) => {
                        const isUploading = uploadingFiles.has(file.name);
                        const isUploaded = uploadedFiles.some((uf) => uf.fileName === file.name);

                        return (
                          <HStack key={file.name} bg="whiteAlpha.200" px={3} py={1} borderRadius="full" spacing={2}>
                            <Badge
                              colorScheme={isUploading ? "yellow" : isUploaded ? "green" : "gray"}
                              variant={isUploading ? "outline" : "solid"}
                            >
                              {file.name}
                            </Badge>
                            {isUploading && <Spinner size="xs" />}
                            {!isUploading && (
                              <Button size="xs" variant="ghost" colorScheme="red" onClick={() => removeFile(file.name)}>
                                ×
                              </Button>
                            )}
                          </HStack>
                        );
                      })}
                    </HStack>
                  )}

                  {globalUploading && (
                    <Text mt={3} fontSize="sm" color="yellow.300">
                      Uploading files... please wait
                    </Text>
                  )}
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {successMessage ? (
              <Button colorScheme="teal" onClick={resetForm}>
                Send Another Message
              </Button>
            ) : (
              <Button
                colorScheme="teal"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Sending..."
                isDisabled={isSubmitting || globalUploading}
              >
                Send Message
              </Button>
            )}

            <Button ml={3} colorScheme="gray" onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ContactUsModal;
