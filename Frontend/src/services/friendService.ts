
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';

// Function to get the auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Service object for friend-related API calls
const friendService = {
  // Fetch all users
  getAllUsers: async () => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/friends/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Send a friend request
  sendFriendRequest: async (receiverUsername: string) => {
    const token = await getAuthToken();
    await axios.post(`${API_URL}/friends/request/${receiverUsername}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get pending friend requests
  getPendingRequests: async () => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/friends/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Accept a friend request
  acceptFriendRequest: async (friendshipId: number) => {
    const token = await getAuthToken();
    await axios.post(`${API_URL}/friends/accept/${friendshipId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Decline a friend request
  declineFriendRequest: async (friendshipId: number) => {
    const token = await getAuthToken();
    await axios.post(`${API_URL}/friends/decline/${friendshipId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get all friends
  getFriends: async () => {
    const token = await getAuthToken();
    const response = await axios.get(`${API_URL}/friends`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Unfriend a user
  unfriend: async (friendshipId: number) => {
    const token = await getAuthToken();
    await axios.delete(`${API_URL}/friends/${friendshipId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export default friendService;
