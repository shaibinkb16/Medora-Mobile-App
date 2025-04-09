import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HealthMetric {
  id: string;
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'cholesterol';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
  // Additional properties like target range, previous measurements
}

class HealthMetricsService {
  private apiClient = axios.create({
    baseURL: 'http://192.168.162.200:5000/api/health-metrics',
  });

  // Fetch recent health metrics
  async fetchRecentMetrics(): Promise<HealthMetric[]> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await this.apiClient.get('/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch health metrics', error);
      throw error;
    }
  }

  // Add new health metric
  async addHealthMetric(metricData: Omit<HealthMetric, 'id'>): Promise<HealthMetric> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await this.apiClient.post('/', metricData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add health metric', error);
      throw error;
    }
  }

  // Get metric history for detailed view
  async getMetricHistory(metricType: string): Promise<HealthMetric[]> {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await this.apiClient.get(`/history/${metricType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch metric history', error);
      throw error;
    }
  }
}

export default new HealthMetricsService();