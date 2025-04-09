import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Ionicons';

interface FamilySummaryCardProps {
  name: string;
  relation: string;
  healthStatus: 'Good' | 'Moderate' | 'Critical';
}

const FamilySummaryCard = ({ name, relation, healthStatus }: FamilySummaryCardProps) => {
  const getIconAndColor = () => {
    switch (healthStatus) {
      case 'Good':
        return { icon: 'heart-circle', color: '#4CAF50' };
      case 'Moderate':
        return { icon: 'alert-circle', color: '#FFB300' };
      case 'Critical':
        return { icon: 'skull', color: '#FF5252' };
      default:
        return { icon: 'information-circle', color: '#ccc' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Animatable.View animation="fadeInLeft" duration={600} style={[styles.card, { borderLeftColor: color }]}>
      <Icon name={icon} size={30} color={color} style={styles.icon} />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.relation}>{relation}</Text>
        <Text style={[styles.status, { color }]}>{healthStatus} Health</Text>
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderLeftWidth: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  relation: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginVertical: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FamilySummaryCard;
