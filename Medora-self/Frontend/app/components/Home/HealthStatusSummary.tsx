// components/Home/HealthStatusSummary.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface HealthStatusSummaryProps {
  statusMessage: string;
  statusType: 'good' | 'warning' | 'critical'; // optional customization
}

export default function HealthStatusSummary({ statusMessage, statusType }: HealthStatusSummaryProps) {
  const getIconColor = () => {
    switch (statusType) {
      case 'good': return '#4CD964';
      case 'warning': return '#FF9500';
      case 'critical': return '#FF3B30';
      default: return '#aaa';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getIconColor() }]}>
      <Icon name="pulse-outline" size={24} color={getIconColor()} style={styles.icon} />
      <Text style={styles.message}>{statusMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#1e1e2e',
    borderRadius: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    color: '#ffffff',
    fontSize: 15,
    flex: 1,
  },
});
