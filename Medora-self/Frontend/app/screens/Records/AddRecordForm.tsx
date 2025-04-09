// screens/Records/AddRecordForm.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import RecordUploadForm from '../RecordUploadForm';

const AddRecordForm = () => {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <RecordUploadForm />
    </ScrollView>
  );
};

export default AddRecordForm;
