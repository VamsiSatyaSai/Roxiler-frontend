import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Rating,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
    fetchUserRatings();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stores`);
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/ratings/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ratingsMap = {};
      response.data.forEach(rating => {
        ratingsMap[rating.storeId] = rating.value;
      });
      setUserRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching user ratings:', error);
    }
  };

  const handleRatingSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/ratings`,
        {
          storeId: selectedStore.id,
          value: rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUserRatings(prev => ({
        ...prev,
        [selectedStore.id]: rating
      }));
      setRatingDialog(false);
      fetchStores(); // Refresh store data to update average rating
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Typography>Loading stores...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Stores
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search stores by name or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />
        <Grid container spacing={3}>
          {filteredStores.map((store) => (
            <Grid item xs={12} sm={6} md={4} key={store.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {store.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {store.address}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography component="legend">Average Rating:</Typography>
                    <Rating value={store.averageRating || 0} readOnly precision={0.1} />
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                      ({store.totalRatings || 0} ratings)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography component="legend">Your Rating:</Typography>
                    <Rating
                      value={userRatings[store.id] || 0}
                      readOnly
                      precision={0.1}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSelectedStore(store);
                      setRating(userRatings[store.id] || 0);
                      setRatingDialog(true);
                    }}
                  >
                    {userRatings[store.id] ? 'Update Rating' : 'Rate Store'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)}>
        <DialogTitle>Rate {selectedStore?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              precision={1}
            />
            <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
              {rating}/5
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog(false)}>Cancel</Button>
          <Button onClick={handleRatingSubmit} variant="contained" color="primary">
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreList; 
