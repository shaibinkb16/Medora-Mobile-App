import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface RecordCardProps {
  record: {
    category: string;
    description: string;
    condition: string;
    tags: string;
    emergencyUse: boolean;
    fileUrl: string;
    createdAt: string;
  };
}

const RecordCard: React.FC<{ record: RecordCardProps['record'] }> = ({ record }) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-md">
      <Text className="text-lg font-semibold">{record.category}</Text>
      <Text className="text-sm text-gray-600">{record.description}</Text>
      <Text className="text-xs mt-1 text-gray-500">Condition: {record.condition}</Text>
      <Text className="text-xs text-gray-500">Tags: {record.tags}</Text>
      {record.emergencyUse && (
        <Text className="text-xs text-red-600 font-semibold">Marked for Emergency Use</Text>
      )}
      <Text className="text-xs text-gray-400 mt-1">Uploaded: {new Date(record.createdAt).toLocaleDateString()}</Text>
      
      <TouchableOpacity className="mt-3 bg-blue-500 py-2 rounded-lg">
        <Text className="text-center text-white text-sm">View File</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecordCard;
