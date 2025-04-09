import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const challenges = [
  'Drink 3 glasses of water before lunch 💧',
  'Take a 5-minute stretch break 🧘‍♀️',
  'Walk for 10 minutes after dinner 🚶‍♂️',
  'Do 10 deep breaths to relax 😌',
  'Eat one fruit today 🍎',
  'Do 15 squats 🏋️‍♂️',
  'Sleep before 11 PM tonight 💤',
];

export default function MicroChallenge() {
  const [challenge, setChallenge] = useState<string>('');

  useEffect(() => {
    // Pick one random challenge for the day
    const random = challenges[Math.floor(Math.random() * challenges.length)];
    setChallenge(random);
  }, []);

  const handleRefresh = () => {
    const newChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    setChallenge(newChallenge);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
      <Text style={styles.title}>🎯 Micro Challenge</Text>
<TouchableOpacity onPress={handleRefresh}>
  <Icon name="refresh" size={20} color="#ffffff" />
</TouchableOpacity>

      </View>
      <Text style={styles.challengeText}>{challenge}</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
});
