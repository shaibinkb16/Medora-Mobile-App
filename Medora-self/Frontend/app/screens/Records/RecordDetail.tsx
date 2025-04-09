// screens/Records/RecordDetail.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../store/authContext';
import { WebView } from 'react-native-webview';

const RecordDetail = () => {
  const { id } = useLocalSearchParams();
  const { token } = useAuth();

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecord = async () => {
    try {
      const response = await axios.get(
        `http://192.168.162.200:5000/api/records/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRecord(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch record details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  const getFileExtension = (url: string) => {
    return url?.split('.').pop()?.toLowerCase();
  };

  const renderFilePreview = () => {
    const ext = getFileExtension(record?.imageUrl);

    if (!record?.imageUrl) {
      return (
        <View style={styles.unsupportedFile}>
          <Text style={styles.unsupportedText}>⚠️ No file available</Text>
        </View>
      );
    }

    if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: record.imageUrl }}
            style={styles.image}
            resizeMode="contain"
            onError={() => Alert.alert('Error', 'Failed to load image')}
          />
        </View>
      );
    }

    if (ext === 'pdf') {
      const pdfViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
        record.imageUrl
      )}`;

      return (
        <View style={styles.pdfContainer}>
          <WebView
            source={{ uri: pdfViewerUrl }}
            style={styles.pdf}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color="#00d4ff" />
              </View>
            )}
            onError={() => {
              Alert.alert(
                'Error',
                'Failed to load PDF viewer. Opening in browser...',
                [
                  {
                    text: 'Open Externally',
                    onPress: () => Linking.openURL(record.imageUrl),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          />
          <TouchableOpacity
            style={styles.externalButton}
            onPress={() => Linking.openURL(record.imageUrl)}
          >
            <Text style={styles.externalButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.unsupportedFile}>
        <Text style={styles.unsupportedText}>
          ⚠️ File preview not supported for this format
        </Text>
        <TouchableOpacity
          style={styles.externalButton}
          onPress={() => Linking.openURL(record.imageUrl)}
        >
          <Text style={styles.externalButtonText}>Open Externally</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00d4ff" />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Record not found.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#00d4ff', '#090979', '#020024']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{record.title || 'Health Record'}</Text>
          
          {renderFilePreview()}

          <View style={styles.card}>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{record.category}</Text>

            <Text style={styles.label}>Lab Name:</Text>
            <Text style={styles.value}>{record.labName}</Text>

            <Text style={styles.label}>Description:</Text>
            <Text style={styles.value}>{record.description || 'N/A'}</Text>

            <Text style={styles.label}>Uploaded By:</Text>
            <Text style={styles.value}>{record.uploadedBy?.name || 'N/A'}</Text>

            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {new Date(record.createdAt).toLocaleDateString()}
            </Text>

            {record.tags?.length > 0 && (
              <>
                <Text style={styles.label}>Tags:</Text>
                <Text style={styles.value}>{record.tags.join(', ')}</Text>
              </>
            )}

            {record.isEmergency && (
              <Text style={styles.emergencyTag}>⚠️ Marked as Emergency</Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020024',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020024',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    color: '#a0a0a0',
    fontSize: 14,
    marginTop: 12,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
  },
  emergencyTag: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxHeight: 300,
    backgroundColor: '#00000030',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  pdfContainer: {
    height: height * 0.7,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  pdf: {
    flex: 1,
  },
  unsupportedFile: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffddcc33',
    borderRadius: 12,
    alignItems: 'center',
  },
  unsupportedText: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  externalButton: {
    padding: 10,
    backgroundColor: '#00d4ff',
    borderRadius: 8,
    marginTop: 10,
  },
  externalButtonText: {
    color: '#020024',
    fontWeight: 'bold',
  },
});

export default RecordDetail;