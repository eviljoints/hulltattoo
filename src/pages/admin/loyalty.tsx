import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react";
import Cookies from "js-cookie";

const AdminLoyaltyPage = () => {
  const [clients, setClients] = useState([]);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [hours, setHours] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) validateToken(token);
  }, []);

  const validateToken = async (token) => {
    try {
      const res = await fetch("/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setIsAuthenticated(true);
        fetchClients();
      } else {
        Cookies.remove("authToken");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error validating token:", error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch("/api/admin/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setClients(await res.json());
      } else {
        alert("Failed to fetch clients.");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const authenticate = async () => {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const { token } = await res.json();
        Cookies.set("authToken", token, { expires: 1 });
        setIsAuthenticated(true);
        fetchClients();
      } else {
        alert("Authentication failed.");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    setIsAuthenticated(false);
    setClients([]);
  };

  const addClient = async () => {
    const token = Cookies.get("authToken");
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, clientId }),
    });

    if (res.ok) {
      fetchClients();
      setName("");
      setClientId("");
    } else {
      alert("Failed to add client.");
    }
  };

  const updateHours = async (id, newHours) => {
    const token = Cookies.get("authToken");
    const res = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, hours: newHours }),
    });

    if (res.ok) {
      fetchClients();
    } else {
      alert("Failed to update hours.");
    }
  };

  const resetHours = async (id) => {
    await updateHours(id, 0); // Reset hours to 0
  };

  const deleteClient = async (id) => {
    const token = Cookies.get("authToken");
    const res = await fetch(`/api/admin/clients`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) fetchClients();
    else alert("Failed to delete client.");
  };

  if (!isAuthenticated) {
    return (
      <Box p={8} minH="100vh" display="flex" justifyContent="center" alignItems="center">
        <Button colorScheme="blue" onClick={authenticate}>
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Button colorScheme="red" mb={4} onClick={handleLogout}>
        Logout
      </Button>
      <VStack spacing={6} align="stretch">
        <Heading>Add New Client</Heading>
        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Client ID</FormLabel>
          <Input value={clientId} onChange={(e) => setClientId(e.target.value)} />
        </FormControl>
        <Button onClick={addClient}>Add Client</Button>

        <Heading>Manage Clients</Heading>
        <Table>
          <Tbody>
            {clients.map((client) => (
              <Tr key={client.id}>
                <Td>{client.name}</Td>
                <Td>{client.clientId}</Td>
                <Td>{client.hours}</Td>
                <Td>{client.stamps}</Td>
                <Td>
                  <Input
                    placeholder="Update hours"
                    onChange={(e) => setHours(e.target.value)}
                  />
                  <Button onClick={() => updateHours(client.id, hours)}>Update</Button>
                </Td>
                <Td>
                  <Button onClick={() => resetHours(client.id)}>Reset Hours</Button>
                </Td>
                <Td>
                  <Button colorScheme="red" onClick={() => deleteClient(client.id)}>
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default AdminLoyaltyPage;
