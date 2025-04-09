import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const moods = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😖', label: 'Stressed' },
  { emoji: '😴', label: 'Tired' },
];

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleMoodSelect = (label: string) => {
    setSelectedMood(label);
    // TODO: Store mood in local DB / server if needed
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <View style={styles.moodList}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.label}
            style={[
              styles.moodItem,
              selectedMood === mood.label && styles.selectedMoodItem,
            ]}
            onPress={() => handleMoodSelect(mood.label)}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text style={styles.label}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selectedMood && (
        <Text style={styles.selectedText}>
          You’re feeling: <Text style={{ fontWeight: 'bold' }}>{selectedMood}</Text>
        </Text>
      )}
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
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  moodList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    width: 60,
  },
  selectedMoodItem: {
    backgroundColor: '#2575FC',
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  selectedText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
  },
});
