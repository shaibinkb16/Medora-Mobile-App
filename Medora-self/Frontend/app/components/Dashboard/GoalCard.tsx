import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';

interface GoalCardProps {
  title: string;
  completed: boolean;
  onPress?: () => void;
}

const GoalCard = ({ title, completed, onPress }: GoalCardProps) => {
  return (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      style={[styles.card, completed && styles.completedCard]}
    >
      <TouchableOpacity onPress={onPress} style={styles.content}>
        <Icon
          name={completed ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={completed ? '#00FFAB' : '#ffffff'}
          style={styles.icon}
        />
        <Text style={[styles.title, completed && styles.completedTitle]}>
          {title}
        </Text>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#00d4ff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  completedCard: {
    backgroundColor: 'rgba(0,255,171,0.15)',
    borderLeftColor: '#00FFAB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#aaffc3',
  },
});

export default GoalCard;
