import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Goal {
  id: string;
  title: string;
  completed: boolean;
}

interface DailyGoalsPreviewProps {
  goals: Goal[];
  onToggleGoal: (goalId: string) => void;
}

export default function DailyGoalsPreview({ goals, onToggleGoal }: DailyGoalsPreviewProps) {
  const completedGoals = goals.filter(goal => goal.completed).length;
  const totalGoals = goals.length;
  const progressPercent = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Goals</Text>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {completedGoals}/{totalGoals} completed
      </Text>

      {/* Goals List */}
      <FlatList
        horizontal
        data={goals}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.goalItem,
              item.completed && styles.goalItemCompleted
            ]}
            onPress={() => onToggleGoal(item.id)}
          >
            <Icon
              name={item.completed ? 'checkbox-outline' : 'square-outline'}
              size={20}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.goalText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00e676',
  },
  progressText: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 10,
  },
  goalList: {
    gap: 10,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginRight: 10,
  },
  goalItemCompleted: {
    backgroundColor: '#2e7d32',
  },
  goalText: {
    color: '#fff',
    fontSize: 14,
  },
});
