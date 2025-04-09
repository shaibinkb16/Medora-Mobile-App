import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface RecordItem {
  id: string;
  type: string;
  title: string;
  date: string;
  imageUrl?: string;
  doctor?: string;
}

interface Props {
  records: RecordItem[];
  onRecordPress: (record: RecordItem) => void;
}

const RecentRecordsList: React.FC<Props> = ({ records, onRecordPress }) => {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (records.length === 0) {
    return (
      <Animated.View 
        style={[
          styles.noDataContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={['#f0f0f0', '#e0e0e0']}
          style={styles.noDataGradient}
        >
          <Ionicons name="document-text-outline" size={60} color="#888" />
          <Text style={styles.noDataText}>No records found</Text>
          <Text style={styles.noDataSubText}>Add your first medical record</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {records.map((item, index) => (
        <Animated.View
          key={item.id}
          style={{
            opacity: fadeAnim,
            transform: [{
              translateY: translateY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50 * (index + 1)],
              }),
            }],
          }}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={() => onRecordPress(item)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f8f8']}
              style={styles.cardGradient}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-outline" size={24} color="#fff" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.recordTitle}>{item.title}</Text>
                  <Text style={styles.recordType}>
                    <Ionicons name="time-outline" size={12} color="#666" /> {item.type} | {item.date}
                  </Text>
                  {item.doctor && (
                    <Text style={styles.recordDoctor}>
                      <Ionicons name="medical-outline" size={12} color="#666" /> {item.doctor}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward-outline" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  recordDoctor: {
    fontSize: 13,
    color: '#666',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height * 0.5,
  },
  noDataGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});

export default RecentRecordsList;


/* 
import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export interface RecordItem {
  id: string;
  type: string;
  title: string;
  date: string;
  imageUrl?: string;
  doctor?: string;
}

interface Props {
  records: RecordItem[];
  onRecordPress: (record: RecordItem) => void;
}

const RecentRecordsList: React.FC<Props> = ({ records, onRecordPress }) => {
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (records.length === 0) {
    return (
      <Animated.View 
        style={[
          styles.noDataContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <LinearGradient
          colors={['#f0f0f0', '#e0e0e0']}
          style={styles.noDataGradient}
        >
          <Ionicons name="document-text-outline" size={60} color="#888" />
          <Text style={styles.noDataText}>No records found</Text>
          <Text style={styles.noDataSubText}>Add your first medical record</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {records.map((item, index) => (
        <Animated.View
          key={item.id}
          style={{
            opacity: fadeAnim,
            transform: [{
              translateY: translateY.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 50 * (index + 1)],
              }),
            }],
          }}
        >
          <TouchableOpacity
            style={styles.card}
            onPress={() => onRecordPress(item)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#ffffff', '#f8f8f8']}
              style={styles.cardGradient}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="document-outline" size={24} color="#fff" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.recordTitle}>{item.title}</Text>
                  <Text style={styles.recordType}>
                    <Ionicons name="time-outline" size={12} color="#666" /> {item.type} | {item.date}
                  </Text>
                  {item.doctor && (
                    <Text style={styles.recordDoctor}>
                      <Ionicons name="medical-outline" size={12} color="#666" /> {item.doctor}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward-outline" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  recordDoctor: {
    fontSize: 13,
    color: '#666',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: Dimensions.get('window').height * 0.5,
  },
  noDataGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
  },
  noDataSubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});

export default RecentRecordsList; */