import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WellnessTip {
  id: string;
  title: string;
  content: string;
  category: 'nutrition' | 'fitness' | 'mental_health' | 'preventive_care';
  tags: string[];
  source?: string;
}

class WellnessTipsService {
  private apiClient = axios.create({
    baseURL: 'http://192.168.162.200:5000/api/wellness-tips',
  });

  // Fetch daily wellness tips
  async fetchDailyTips(): Promise<WellnessTip[]> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await this.apiClient.get('/daily', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wellness tips', error);
      throw error;
    }
  }

  // Get tips by category
  async getTipsByCategory(category: string): Promise<WellnessTip[]> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await this.apiClient.get(`/category/${category}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tips by category', error);
      throw error;
    }
  }
}

export default new WellnessTipsService();