// screens/Records/PatientHistory.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';

const PatientHistory = () => {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-lg font-bold mb-4">Patient History Overview</Text>
      <Text className="text-gray-600">Coming soon: Timeline & Charts of all uploaded records with visual insights.</Text>
    </ScrollView>
  );
};

export default PatientHistory;
