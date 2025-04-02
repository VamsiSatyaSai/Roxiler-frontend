import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Grid,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
    fetchRatings();
  }, []);

  const fetchStoreData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/store-owner/store`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStoreData(response.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/store-owner/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatings(response.data);
      if (response.data.length > 0) {
        const avg = response.data.reduce((acc, curr) => acc + curr.rating, 0) / response.data.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Store Owner Dashboard
        </Typography>

        {storeData && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Store Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Name:</strong> {storeData.name}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Email:</strong> {storeData.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Address:</strong> {storeData.address}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Average Rating:</strong> {averageRating.toFixed(1)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            User Ratings
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ratings.map((rating) => (
                  <TableRow key={rating.id}>
                    <TableCell>{rating.userName}</TableCell>
                    <TableCell>{rating.rating}</TableCell>
                    <TableCell>
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default StoreOwnerDashboard; 