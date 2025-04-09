// screens/Records/EmergencyRecords.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const EmergencyRecords = () => {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-4">Emergency Records</Text>
      <Text className="text-gray-600">Coming soon: Filter and view health records tagged for emergency use.</Text>
    </ScrollView>
  );
};

export default EmergencyRecords;
