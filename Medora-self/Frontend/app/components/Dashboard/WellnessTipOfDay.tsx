import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const wellnessTips: string[] = [
  "Stay hydrated – drink at least 8 glasses of water a day.",
  "Take a 10-minute walk after meals to aid digestion.",
  "Practice mindful breathing for 5 minutes to reduce stress.",
  "Aim for 7-9 hours of sleep every night.",
  "Stretch your body every morning to boost energy.",
  "Eat at least one fruit and one vegetable daily.",
  "Digital detox: Take a break from screens for 30 minutes today.",
  "Journal your thoughts to boost mental clarity.",
  "Laugh more—it boosts immunity and lowers stress!",
];

export default function WellnessTipOfDay() {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Select a random tip each day (based on date)
    const today = new Date();
    const index = today.getDate() % wellnessTips.length;
    setTipIndex(index);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="leaf-outline" size={22} color="#50fa7b" />
        <Text style={styles.headerText}>Wellness Tip of the Day</Text>
      </View>
      <Text style={styles.tipText}>{wellnessTips[tipIndex]}</Text>
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>See More Tips</Text>
        <Icon name="chevron-forward-outline" size={16} color="#ccc" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipText: {
    color: '#e0e0e0',
    fontSize: 14,
    lineHeight: 20,
  },
  moreButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreButtonText: {
    color: '#aaa',
    fontSize: 13,
    marginRight: 4,
  },
});
