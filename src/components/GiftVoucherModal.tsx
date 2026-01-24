import React from "react";
import {
  Button,
  ButtonProps,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Box,
  Text,
  HStack,
  Link,
} from "@chakra-ui/react";

type Props = {
  artistKey?: "mike" | "jen" | "harley";
  artistName?: string;
  buttonProps?: ButtonProps;
  title?: string;
};

export default function GiftVoucherModal({
  artistKey,
  artistName,
  buttonProps,
  title = "Buy a Gift Voucher",
}: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const baseUrl = process.env.NEXT_PUBLIC_WIX_GIFT_CARD_URL;

  // Allow per-artist linking (optional)
  const url = React.useMemo(() => {
    if (!baseUrl) return "";
    try {
      const u = new URL(baseUrl);
      if (artistKey) u.searchParams.set("artist", artistKey);
      return u.toString();
    } catch {
      // If baseUrl isn't a full URL, fallback
      return artistKey ? `${baseUrl}?artist=${artistKey}` : baseUrl;
    }
  }, [baseUrl, artistKey]);

  if (!baseUrl) {
    return (
      <Box>
        <Button isDisabled {...buttonProps}>
          Gift vouchers unavailable
        </Button>
        <Text fontSize="sm" opacity={0.8} mt={2}>
          Missing <code>NEXT_PUBLIC_WIX_GIFT_CARD_URL</code>
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Button onClick={onOpen} {...buttonProps}>
        Buy Gift Voucher
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="6xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="black" color="white" border="1px solid rgba(255,0,127,0.35)"
          boxShadow="0 0 0 1px rgba(0,212,255,0.25) inset, 0 0 22px rgba(255,0,127,0.35), 0 0 28px rgba(0,212,255,0.25)"
          borderRadius="xl"
        >
          <ModalHeader textShadow="0 0 8px #ff007f, 0 0 12px #00d4ff">
            {artistName ? `Gift Voucher — ${artistName}` : title}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody pb={6}>
            <HStack justify="space-between" mb={3} flexWrap="wrap">
              <Text opacity={0.85}>
                Complete your purchase securely via Wix checkout.
              </Text>
              <Link href={url} isExternal color="#00d4ff">
                Open in new tab
              </Link>
            </HStack>

            <Box
              border="1px solid rgba(255,255,255,0.12)"
              borderRadius="lg"
              overflow="hidden"
              height={{ base: "70vh", md: "80vh" }}
            >
              <iframe
                src={url}
                title="Gift Voucher Checkout"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allow="payment"
              />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
