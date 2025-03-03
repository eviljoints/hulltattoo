import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Textarea,
  Text,
  Heading,
  Divider,
} from '@chakra-ui/react';

const ConsentForm = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <Box
      ref={ref}
      maxW="800px"
      mx="auto"
      p={6}
      bg="white"
      color="black"
      borderRadius="md"
      border="1px solid black"
      fontSize="14px"
      lineHeight="1.4"
    >
      {/* Header */}
      <Heading as="h1" fontSize="20px" mb={2} textAlign="center">
        Hull Tattoo Studio Consent Form
      </Heading>
      <Text textAlign="center" mb={3}>
        652 Anlaby Road, Hull, HU3 6UU | Phone: [Your Contact Number] | Email: [Your Contact Email]
      </Text>
      <Divider />

      {/* Client Information */}
      <Heading as="h2" fontSize="16px" mt={3} mb={2}>
        Client Information
      </Heading>
      <FormControl isRequired>
        <FormLabel>Full Name:</FormLabel>
        <Input size="sm" bg="gray.100" />
      </FormControl>
      <FormControl isRequired mt={2}>
        <FormLabel>Date of Birth:</FormLabel>
        <Text>__________</Text>
      </FormControl>
      <FormControl isRequired mt={2}>
        <FormLabel>Address:</FormLabel>
        <Input size="sm" bg="gray.100" />
      </FormControl>
      <Flex gap={3} mt={2}>
        <FormControl isRequired>
          <FormLabel>Phone Number:</FormLabel>
          <Input size="sm" bg="gray.100" />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email:</FormLabel>
          <Input type="email" size="sm" bg="gray.100" />
        </FormControl>
      </Flex>
      <FormControl isRequired mt={2}>
        <FormLabel>Appointment Date:</FormLabel>
        <Text>__________</Text>
      </FormControl>
      <Divider mt={3} />

      {/* Medical History */}
      <Heading as="h2" fontSize="16px" mt={3} mb={2}>
        Medical History (Tick Any That Apply)
      </Heading>
      <Flex gap={4} flexWrap="wrap">
        {[
          'Skin Conditions (Eczema, Psoriasis, etc.)',
          'Heart Conditions',
          'Blood Disorders',
          'Seizures (Epilepsy, etc.)',
          'Diabetes',
          'Hepatitis (A, B, C)',
          'HIV',
          'Cancer or Cancer Treatments',
          'Allergies (Latex, Pigments, etc.)',
          'Pregnant or Breastfeeding',
          'Taking Medications (e.g., Anticoagulants)',
        ].map((condition) => (
          <Checkbox
            key={condition}
            size="sm"
            colorScheme="blackAlpha"
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderColor: 'black',
              _checked: {
                bg: 'black',
                borderColor: 'black',
              },
            }}
          >
            {condition}
          </Checkbox>
        ))}
      </Flex>
      <FormControl mt={2}>
        <FormLabel>Additional Medical Information:</FormLabel>
        <Textarea size="sm" bg="gray.100" height="50px" />
      </FormControl>
      <Divider mt={3} />

      {/* Consent Acknowledgments */}
      <Heading as="h2" fontSize="16px" mt={3} mb={2}>
        Consent and Acknowledgements
      </Heading>
      <Stack pl={2} spacing={1}>
        {[
          'I confirm that I am over 18 years of age. (ID may be required)',
          'I have eaten within the last 2 hours.',
          'I have not consumed alcohol or drugs in the last 24 hours.',
          'I understand the potential risks associated with tattooing, including infection, allergic reactions, and scarring.',
          'I acknowledge that I may have an allergic reaction to pigments or materials used.',
          'I agree to follow the aftercare instructions provided to ensure proper healing.',
          'I confirm that the information provided is accurate to the best of my knowledge.',
        ].map((statement) => (
          <Checkbox
            key={statement}
            size="sm"
            colorScheme="blackAlpha"
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderColor: 'black',
              _checked: {
                bg: 'black',
                borderColor: 'black',
              },
            }}
          >
            {statement}
          </Checkbox>
        ))}
      </Stack>
      <Divider mt={3} />

      {/* Signature Section */}
      <Heading as="h2" fontSize="16px" mt={3} mb={2}>
        Signatures
      </Heading>
      <FormControl isRequired>
        <FormLabel>Client Signature:</FormLabel>
        <Text>__________</Text>
      </FormControl>
      <FormControl isRequired mt={2}>
        <FormLabel>Date:</FormLabel>
        <Text>__________</Text>
      </FormControl>
      <Flex gap={3} mt={2}>
        <FormControl>
          <FormLabel>Practitioner's Name:</FormLabel>
          <Text>__________</Text>
        </FormControl>
        <FormControl>
          <FormLabel>Practitioner's Signature:</FormLabel>
          <Text>__________</Text>
        </FormControl>
      </Flex>
    </Box>
  );
});

const ConsentPage = () => {
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleSaveAsImage = async () => {
    if (formRef.current) {
      // Capture the form as a canvas
      const canvas = await html2canvas(formRef.current);
      // Convert the canvas to a data URL
      const dataUrl = canvas.toDataURL('image/png');
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'ConsentForm.png';
      link.click();
    }
  };

  return (
    <Box p={6}>
      <ConsentForm ref={formRef} />

      <Box textAlign="center" mt={4}>
        <Button onClick={handleSaveAsImage} colorScheme="pink">
          Save as Image
        </Button>
      </Box>
    </Box>
  );
};

export default ConsentPage;
