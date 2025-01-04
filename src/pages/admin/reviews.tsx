import React, { useEffect, useState } from "react";
import { Box, Button, Text, VStack, Heading, Select } from "@chakra-ui/react";
import Cookies from "js-cookie";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const fetchReviews = async () => {
    const token = Cookies.get("authToken");
    try {
      const res = await fetch(`/api/admin/reviews?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data); // Ensure only reviews with the selected status are fetched
      } else {
        alert("Failed to fetch reviews.");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAction = async (id, action) => {
    const token = Cookies.get("authToken");
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
        fetchReviews(); // Refresh the reviews list to reflect the changes
      } else {
        alert("Failed to update review.");
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDelete = async (id) => {
    const token = Cookies.get("authToken");
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
        fetchReviews(); // Refresh the reviews list to reflect the deletion
      } else {
        alert("Failed to delete review.");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <Box p={8}>
      <Heading mb={4}>Admin Review Management</Heading>
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
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
            <Text><strong>Name:</strong> {review.name}</Text>
            <Text><strong>Rating:</strong> {review.rating}</Text>
            <Text><strong>Comment:</strong> {review.comment}</Text>
            <Text><strong>Status:</strong> {review.status}</Text>
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
