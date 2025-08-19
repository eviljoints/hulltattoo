// /src/pages/admin/loyalty.tsx
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

type LoyaltyClient = {
  id: number;
  name: string;
  clientId: string;
  hours: number;
  stamps: number;
  signUpDate?: string;
};

const AdminLoyaltyPage = () => {
  const [clients, setClients] = useState<LoyaltyClient[]>([]);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [hours, setHours] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) validateToken(token);
  }, []);

  const validateToken = async (token: string) => {
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
      Cookies.remove("authToken");
      setIsAuthenticated(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) return;

      const res = await fetch("/api/admin/clients", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Be resilient to different shapes
        const list: LoyaltyClient[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.clients)
          ? data.clients
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setClients(list);
      } else {
        alert("Failed to fetch clients.");
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    }
  };

  const authenticate = async () => {
    const username = prompt("Enter Username:");
    const password = prompt("Enter Password:");
    if (!username || !password) return;

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
    if (!token) return;

    try {
      const newClientData = {
        name,
        clientId,
        signUpDate: new Date().toISOString(),
      };

      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newClientData),
      });

      if (res.ok) {
        fetchClients();
        setName("");
        setClientId("");
      } else {
        alert("Failed to add client.");
      }
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  // Add to existing hours, clamp at 0
  const updateHours = async (id: number, additionalHours: string) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    const client = clients.find((c) => c.id === id);
    if (!client) return;

    const currentHours = Number(client.hours) || 0;
    const toAdd = Number(additionalHours) || 0;
    const totalHours = Math.max(0, currentHours + toAdd);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, hours: totalHours }),
      });

      if (res.ok) {
        fetchClients();
      } else {
        alert("Failed to update hours.");
      }
    } catch (error) {
      console.error("Error updating hours:", error);
    }
  };

  const resetHours = async (id: number) => {
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    await updateHours(id, String(-Number(client.hours || 0))); // will clamp to 0
  };

  const deleteClient = async (id: number) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    try {
      const res = await fetch("/api/admin/clients", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchClients();
      } else {
        alert("Failed to delete client.");
      }
    } catch (error) {
      console.error("Error deleting client:", error);
    }
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
            {Array.isArray(clients) && clients.length > 0 ? (
              clients.map((client) => (
                <Tr key={client.id}>
                  <Td>{client.name}</Td>
                  <Td>{client.clientId}</Td>
                  <Td>{client.hours}</Td>
                  <Td>{client.stamps}</Td>
                  <Td>
                    {client.signUpDate
                      ? new Date(client.signUpDate).toLocaleString()
                      : "N/A"}
                  </Td>
                  <Td>
                    <Input
                      placeholder="Add hours"
                      onChange={(e) => setHours(e.target.value)}
                    />
                    <Button ml={2} onClick={() => updateHours(client.id, hours)}>
                      Add
                    </Button>
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
              ))
            ) : (
              <Tr>
                <Td colSpan={8}>No clients yet.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default AdminLoyaltyPage;
