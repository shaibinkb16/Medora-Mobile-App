// components/Dashboard/HealthMetricCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function HealthMetricCard({ metric }: { metric: any }) {
  return (
    <View style={styles.card}>
      <Text style={styles.metricType}>{metric.type}</Text>
      <Text style={styles.metricValue}>{metric.value} {metric.unit}</Text>
      <Text style={styles.metricStatus}>{metric.status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginRight: 12,
    minWidth: 120,
  },
  metricType: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  metricValue: {
    color: "#00e5ff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  metricStatus: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});
