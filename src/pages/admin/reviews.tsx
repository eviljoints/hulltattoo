//src\pages\admin\reviews.tsx
import React, { useEffect, useState } from "react";
import { Box, Button, Text, VStack, Heading, Select } from "@chakra-ui/react";
import Cookies from "js-cookie";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Validate token on load
    const token = Cookies.get("authToken");
    if (token) validateToken(token);
  }, []);

  // Validate existing token
  const validateToken = async (token: string) => {
    try {
      const res = await fetch("/api/auth/validate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        fetchReviews(); // Load reviews if token is valid
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

  const fetchReviews = async () => {
    const token = Cookies.get("authToken");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        alert("Failed to fetch reviews.");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAction = async (id: number, action: string) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        fetchReviews(); // Refresh list
      } else {
        alert("Failed to update review.");
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDelete = async (id: number) => {
    const token = Cookies.get("authToken");
    if (!token) return;

    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchReviews(); // Refresh list
      } else {
        alert("Failed to delete review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const authenticate = async () => {
    // Prompt for login if user is not authenticated
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
        fetchReviews();
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
    setReviews([]);
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

      <Heading mb={4}>Admin Review Management</Heading>

      <Select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
        }}
        mb={4}
      >
        <option value="pending">Pending</option>
        <option value="approved">Published</option>
        <option value="rejected">Rejected</option>
      </Select>

      <VStack spacing={4} align="stretch">
        {reviews.map((review) => (
          <Box
            key={review.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="gray.700"
            color="white"
          >
            <Text>
              <strong>Name:</strong> {review.name}
            </Text>
            <Text>
              <strong>Rating:</strong> {review.rating}
            </Text>
            <Text>
              <strong>Comment:</strong> {review.comment}
            </Text>
            <Text>
              <strong>Status:</strong> {review.status}
            </Text>

            <Box mt={4}>
              {statusFilter === "pending" && (
                <>
                  <Button
                    colorScheme="green"
                    mr={2}
                    onClick={() => handleAction(review.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleAction(review.id, "reject")}
                  >
                    Reject
                  </Button>
                </>
              )}

              <Button
                colorScheme="red"
                ml={2}
                onClick={() => handleDelete(review.id)}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default AdminReviews;
