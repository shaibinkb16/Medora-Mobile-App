// RecordUploadForm.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { useAuth } from '../store/authContext';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const API_BASE_URL = 'http://192.168.162.200:5000';

interface RecordFormData {
  category: string;
  description: string;
  condition: string;
  tags: string;
  emergencyUse: boolean;
  familyMember: string;
  labName: string;
  doctor: string;
}

type FileType = {
  uri: string;
  name: string;
  type: string;
};

const RecordUploadForm = () => {
  const params = useLocalSearchParams();
  const { user, token } = useAuth();

  const [recordData, setRecordData] = useState<RecordFormData>({
    category: '',
    description: '',
    condition: '',
    tags: '',
    emergencyUse: false,
    familyMember: '',
    labName: '',
    doctor: '',
  });

  const [file, setFile] = useState<FileType | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (params?.preSelectedCategory) {
      setRecordData((prevData) => ({
        ...prevData,
        category: params.preSelectedCategory as string,
      }));
    }
  }, [params?.preSelectedCategory]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selected = result.assets[0];
      const fileName = selected.fileName || selected.uri.split('/').pop() || `image-${Date.now()}.jpg`;
      const extension = fileName.split('.').pop()?.toLowerCase();
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

      setFile({ uri: selected.uri, name: fileName, type: mimeType });
    }
  };

  const handlePickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name || 'document.pdf',
        type: asset.mimeType || 'application/pdf',
      });
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      Object.entries(recordData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      const response = await axios.post(`${API_BASE_URL}/api/records/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        setShowSuccessModal(true);
        setFile(null);
        setRecordData({
          category: '',
          description: '',
          condition: '',
          tags: '',
          emergencyUse: false,
          familyMember: '',
          labName: '',
          doctor: '',
        });

        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2500);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#00d4ff', '#0095ff', '#0077b6']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#00d4ff" barStyle="light-content" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Upload New Health Record</Text>

            <Picker
              selectedValue={recordData.category}
              onValueChange={(value) => setRecordData({ ...recordData, category: value })}
              enabled={!params?.preSelectedCategory}
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
              <Picker.Item label="Lab Report" value="Lab Report" />
              <Picker.Item label="Prescription" value="Prescription" />
              <Picker.Item label="Doctor Note" value="Doctor Note" />
              <Picker.Item label="Imaging" value="Imaging" />
              <Picker.Item label="Medical Expense" value="Medical Expense" />
            </Picker>

            <TextInput
              placeholder="Description"
              style={styles.input}
              placeholderTextColor="#eee"
              value={recordData.description}
              onChangeText={(text) => setRecordData({ ...recordData, description: text })}
            />

            <TextInput
              placeholder="Condition (e.g. Diabetes)"
              style={styles.input}
              placeholderTextColor="#eee"
              value={recordData.condition}
              onChangeText={(text) => setRecordData({ ...recordData, condition: text })}
            />

            <TextInput
              placeholder="Family Member"
              style={styles.input}
              placeholderTextColor="#eee"
              value={recordData.familyMember}
              onChangeText={(text) => setRecordData({ ...recordData, familyMember: text })}
            />

            <TextInput
              placeholder="Lab/Clinic Name"
              style={styles.input}
              placeholderTextColor="#eee"
              value={recordData.labName}
              onChangeText={(text) => setRecordData({ ...recordData, labName: text })}
            />

            <TextInput
              placeholder="Doctor"
              style={styles.input}
              placeholderTextColor="#eee"
              value={recordData.doctor}
              onChangeText={(text) => setRecordData({ ...recordData, doctor: text })}
            />

            <TextInput
              placeholder="Tags (comma-separated)"
              style={styles.input}
              placeholderTextColor="#eee"
              value={recordData.tags}
              onChangeText={(text) => setRecordData({ ...recordData, tags: text })}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Mark as Emergency Record</Text>
              <Switch
                value={recordData.emergencyUse}
                onValueChange={(val) => setRecordData({ ...recordData, emergencyUse: val })}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handlePickImage}>
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handlePickPDF}>
              <Text style={styles.buttonText}>Select PDF</Text>
            </TouchableOpacity>

            {file && <Text style={styles.fileName}>{file.name || 'Selected file'}</Text>}

            <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Upload Record</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ✅ Lottie success modal */}
        <Modal visible={showSuccessModal} transparent animationType="fade">
          <View style={styles.lottieModal}>
            <LottieView
              source={require('../../assets/email-verification-success.json')}
              autoPlay
              loop={false}
              style={{ width: 180, height: 180 }}
            />
            <Text style={styles.successText}>Record Uploaded Successfully!</Text>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RecordUploadForm;

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  picker: {
    backgroundColor: '#ffffff20',
    borderRadius: 10,
    marginVertical: 8,
    color: '#fff',
  },
  input: {
    backgroundColor: '#ffffff20',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    justifyContent: 'space-between',
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00b4d8',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fileName: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  uploadButton: {
    backgroundColor: '#03045e',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lottieModal: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 12,
    fontWeight: 'bold',
  },
});

