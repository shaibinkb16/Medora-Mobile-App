import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useAuth } from "../store/authContext";
import axios from "axios";
import Constants from "expo-constants";

import ProfileHeader from "../components/Dashboard/ProfileHeader";
import HealthMetricCard from "../components/Dashboard/HealthMetricCard";
import WellnessTipCard from "../components/Dashboard/WellnessTipCard";
import RecommendationCard from "../components/Dashboard/RecommendationCard";
import PeriodSummaryCard from "../components/Dashboard/PeriodSummaryCard";
import EmergencyAccessCard from "../components/Dashboard/EmergencyAccessCard";

interface OCRData {
  extractedText: string;
  extractedMetrics: {
    bloodSugar?: number;
    bloodPressure?: string;
    cholesterol?: number;
  };
  createdAt: string;
}

interface AIRecommendation {
  category: string;
  title: string;
  recommendation: string;
  priority: string;
  rationale: string;
}

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 32;
const chartHeight = 220;

export default function DashboardScreen(): JSX.Element {
  const { user, token } = useAuth();
  const [ocrData, setOcrData] = useState<OCRData[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [latestMetrics, setLatestMetrics] = useState<{
    bloodSugar?: number;
    bloodPressure?: string;
    cholesterol?: number;
  }>({});

  const apiBaseUrl ='http://192.168.162.200:5000';

  const fetchHealthData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/records/ocr`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setOcrData(data);
      processMetrics(data);
    } catch (error) {
      console.error("Health data fetch error:", error);
      Alert.alert("Error", "Failed to fetch health data");
    }
  }, [token]);

  const fetchAIRecommendations = useCallback(async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/api/gemini-recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000
      });
      if (Array.isArray(data.recommendations)) {
        setAiRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("AI recommendations error:", error);
      Alert.alert("Error", "Could not get AI recommendations");
    }
  }, [token]);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchHealthData(), fetchAIRecommendations()]);
    } catch (error) {
      console.error("Data load error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchHealthData, fetchAIRecommendations]);

  useEffect(() => {
    if (token) loadAllData();
  }, [token, loadAllData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData().finally(() => setRefreshing(false));
  }, [loadAllData]);

  const processMetrics = useCallback((data: OCRData[]) => {
    try {
      const latestEntry = data
        .filter(item => item?.extractedMetrics)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (latestEntry) {
        setLatestMetrics(latestEntry.extractedMetrics);
      }
    } catch (error) {
      console.error("Metrics processing error:", error);
    }
  }, []);

  const chartConfig = {
    backgroundColor: '#020024',
    backgroundGradientFrom: '#090979',
    backgroundGradientTo: '#00d4ff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#ffa726' },
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 20,
    paddingBottom: 20,
    propsForLabels: { fontSize: 12 }
  };

  // Data processing functions
  const getBloodSugarData = () => {
    return ocrData
      .filter(item => item.extractedMetrics?.bloodSugar !== undefined)
      .map(item => ({
        date: new Date(item.createdAt).toLocaleDateString(),
        value: item.extractedMetrics.bloodSugar!
      }));
  };

  const getBloodPressureData = () => {
    return ocrData
      .filter(item => item.extractedMetrics?.bloodPressure != null)
      .map(item => {
        const bp = item.extractedMetrics.bloodPressure!;
        const [systolic, diastolic] = bp.split(/\s*\/\s*/).map(Number);
        return {
          date: new Date(item.createdAt).toLocaleDateString(),
          systolic,
          diastolic
        };
      })
      .filter(item => !isNaN(item.systolic) && !isNaN(item.diastolic));
  };

  const getCholesterolData = () => {
    return ocrData
      .filter(item => item.extractedMetrics?.cholesterol !== undefined)
      .map(item => ({
        date: new Date(item.createdAt).toLocaleDateString(),
        value: item.extractedMetrics.cholesterol!
      }));
  };

  return (
    <LinearGradient colors={["#00d4ff", "#090979", "#020024"]} style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
              tintColor="#00d4ff" 
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {user && <ProfileHeader user={user} notificationCount={0} />}

          {/* Health Metrics Cards */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsContainer}
          >
            {latestMetrics.bloodSugar !== undefined && (
              <HealthMetricCard 
                metric={{ 
                  type: "Blood Sugar", 
                  value: latestMetrics.bloodSugar, 
                  unit: "mg/dL", 
                  status: "Current" 
                }} 
              />
            )}
            {latestMetrics.bloodPressure && (
              <HealthMetricCard 
                metric={{ 
                  type: "Blood Pressure", 
                  value: latestMetrics.bloodPressure, 
                  unit: "mmHg", 
                  status: "Latest" 
                }} 
              />
            )}
            {latestMetrics.cholesterol !== undefined && (
              <HealthMetricCard 
                metric={{ 
                  type: "Cholesterol", 
                  value: latestMetrics.cholesterol, 
                  unit: "mg/dL", 
                  status: "Current" 
                }} 
              />
            )}
          </ScrollView>

          {/* Charts Section */}
          <View style={styles.chartsContainer}>
            {/* Blood Sugar Chart */}
            {getBloodSugarData().length > 0 && (
              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Blood Sugar Trends</Text>
                <LineChart
                  data={{
                    labels: getBloodSugarData().map(d => d.date),
                    datasets: [{ data: getBloodSugarData().map(d => d.value) }]
                  }}
                  width={chartWidth}
                  height={chartHeight}
                  yAxisSuffix=" mg/dL"
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  segments={4}
                />
              </View>
            )}

            {/* Blood Pressure Chart */}
            {getBloodPressureData().length > 0 && (
              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Blood Pressure Trends</Text>
                <BarChart
                  data={{
                    labels: getBloodPressureData().map(d => d.date),
                    datasets: [
                      { data: getBloodPressureData().map(d => d.systolic) },
                      { data: getBloodPressureData().map(d => d.diastolic) }
                    ]
                  }}
                  width={chartWidth}
                  height={chartHeight}
                  yAxisLabel=""
                  yAxisSuffix=" mmHg"
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  style={styles.chart}
                  fromZero={true}
                  withVerticalLabels={true}
                  segments={4}
                />
              </View>
            )}

            {/* Cholesterol Chart */}
            {getCholesterolData().length > 0 && (
              <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Cholesterol Levels</Text>
                <BarChart
                  data={{
                    labels: getCholesterolData().map(d => d.date),
                    datasets: [{ data: getCholesterolData().map(d => d.value) }]
                  }}
                  width={chartWidth}
                  height={chartHeight}
                  yAxisLabel=""
                  yAxisSuffix=" mg/dL"
                  chartConfig={chartConfig}
                  verticalLabelRotation={30}
                  style={styles.chart}
                  fromZero={true}
                  withVerticalLabels={true}
                  segments={4}
                />
              </View>
            )}
          </View>

          {/* AI Recommendations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recommendations</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : aiRecommendations.length > 0 ? (
              aiRecommendations.map((rec, index) => (
                <RecommendationCard 
                  key={index} 
                  title={rec.category} 
                  description={rec.recommendation} 
                  type="ai" 
                />
              ))
            ) : (
              <Text style={styles.noDataText}>No recommendations available</Text>
            )}
          </View>

          {/* Wellness Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wellness Tips</Text>
            <WellnessTipCard 
              tip={{ 
                id: "1", 
                title: "Regular Checkups", 
                content: "Review your medical records regularly.", 
                category: "Health" 
              }} 
            />
            <WellnessTipCard 
              tip={{ 
                id: "2", 
                title: "Balanced Diet", 
                content: "Maintain proper nutrition based on your metrics.", 
                category: "Diet" 
              }} 
            />
          </View>

          {/* Cycle Tracking */}
          {user?.gender === "Female" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cycle Tracking</Text>
              <PeriodSummaryCard 
                lastPeriod="2025-03-01" 
                nextExpected="2025-03-30" 
                cycleLength={28} 
                periodDuration={5} 
              />
            </View>
          )}

          {/* Emergency Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Profile</Text>
            <EmergencyAccessCard 
              bloodType="O+" 
              allergies={["Penicillin", "Peanuts"]} 
              medications={["Amlodipine", "Metformin"]} 
              chronicConditions={["Hypertension", "Diabetes"]} 
              qrCodeUrl="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EMERGENCY123" 
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  chartsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  chartWrapper: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
    marginLeft: -10,
  },
  noDataText: {
    color: "#ffffff90",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
});