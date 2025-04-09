import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';

interface PeriodSummaryCardProps {
  lastPeriod: string;
  nextExpected: string;
  cycleLength: number;
  periodDuration: number;
}

const PeriodSummaryCard = ({
  lastPeriod,
  nextExpected,
  cycleLength,
  periodDuration,
}: PeriodSummaryCardProps) => {
  return (
    <Animatable.View animation="fadeInRight" duration={600} style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon name="calendar" size={28} color="#E91E63" />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Period Summary</Text>
        <Text style={styles.label}>Last Period:</Text>
        <Text style={styles.text}>{lastPeriod}</Text>
        <Text style={styles.label}>Next Expected:</Text>
        <Text style={styles.text}>{nextExpected}</Text>
        <Text style={styles.label}>Cycle Length: <Text style={styles.text}>{cycleLength} days</Text></Text>
        <Text style={styles.label}>Period Duration: <Text style={styles.text}>{periodDuration} days</Text></Text>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 15,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  heading: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  text: {
    color: '#fff',
    fontSize: 15,
  },
});

export default PeriodSummaryCard;
