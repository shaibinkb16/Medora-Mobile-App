import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  Easing,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth } = Dimensions.get('window');

interface HealthChartProps {
  title: string;
  labels: string[];
  dataPoints: number[];
  color?: string;
  unit?: string;
  threshold?: number;
}

const HealthChart = ({ 
  title, 
  labels, 
  dataPoints, 
  color = '#4CAF50', 
  unit = '',
  threshold
}: HealthChartProps) => {
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showThreshold, setShowThreshold] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const trendAnim = useRef(new Animated.Value(0)).current;
  const validData = dataPoints.filter(d => typeof d === 'number' && !isNaN(d));
  const lastValue = validData[validData.length - 1];
  const prevValue = validData[validData.length - 2];
  const trend = lastValue - prevValue;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(trendAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDataPointPress = (index: number) => {
    Haptics.selectionAsync();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const getTrendIndicator = () => {
    if (validData.length < 2) return null;
    
    const trendText = `${Math.abs(trend).toFixed(1)}${unit}`;
    const trendColor = trend > 0 ? '#4CAF50' : '#FF5252';
    const iconName = trend > 0 ? 'trending-up' : 'trending-down';

    return (
      <Animated.View style={[styles.trendContainer, {
        opacity: trendAnim,
        transform: [{
          translateY: trendAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0]
          })
        }]
      }]}>
        <Ionicons name={iconName} size={20} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {trendText}
        </Text>
      </Animated.View>
    );
  };

  const renderThresholdLine = () => {
    if (!threshold || validData.length === 0) return null;
    
    return (
      <Path
        key="threshold-line"
        d={`M0 ${threshold} L${screenWidth * 0.9} ${threshold}`}
        stroke={colors.notification}
        strokeDasharray="4 4"
        strokeWidth={1}
      />
    );
  };

  const renderTooltip = () => {
    if (selectedIndex === null || !validData[selectedIndex]) return null;

    return (
      <Animated.View style={[
        styles.tooltip,
        {
          left: (screenWidth * 0.9 / validData.length) * selectedIndex,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <BlurView intensity={25} style={styles.tooltipBlur}>
          <Text style={[styles.tooltipText, { color: colors.text }]}>
            {labels[selectedIndex]}
          </Text>
          <Text style={[
            styles.tooltipValue,
            { color: validData[selectedIndex] >= (threshold || 0) ? '#FF5252' : '#4CAF50' }
          ]}>
            {validData[selectedIndex]}{unit}
          </Text>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[
      styles.container, 
      { 
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      <BlurView intensity={25} tint="dark" style={styles.blurContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowThreshold(!showThreshold)}
          style={styles.header}
        >
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Last recorded: {lastValue}{unit}
            </Text>
          </View>
          {getTrendIndicator()}
        </TouchableOpacity>

        {validData.length > 0 ? (
          <View>
            <LineChart
              data={{
                labels,
                datasets: [{ data: validData }],
              }}
              width={screenWidth * 0.9}
              height={220}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              fromZero
              chartConfig={{
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 1,
                color: () => `rgba(255, 255, 255, 0.3)`,
                labelColor: () => colors.text,
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
                propsForBackgroundLines: {
                  stroke: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              bezier
              style={styles.chart}
              decorator={() => (
                <>
                  <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor={color} stopOpacity={0.8} />
                      <Stop offset="100%" stopColor={color} stopOpacity={0.1} />
                    </LinearGradient>
                  </Defs>
                  {showThreshold && renderThresholdLine()}
                </>
              )}
            />

            {renderTooltip()}

            <View style={styles.xAxis}>
              {labels.map((label, index) => (
                <TouchableOpacity 
                  key={`label-${index}`}
                  onPress={() => handleDataPointPress(index)}
                  style={styles.labelTouchable}
                >
                  <Text style={[
                    styles.labelText, 
                    { 
                      color: colors.text,
                      opacity: selectedIndex === index ? 1 : 0.6
                    }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="analytics" size={40} color={colors.text} />
            <Text style={[styles.noDataText, { color: colors.text }]}>
              No data available
            </Text>
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 25,
    marginVertical: 15,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  blurContainer: {
    padding: 20,
    borderRadius: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 15,
    paddingLeft: 10,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 8,
  },
  labelTouchable: {
    padding: 6,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tooltip: {
    position: 'absolute',
    top: 30,
    minWidth: 80,
  },
  tooltipBlur: {
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '700',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.6,
  },
});

export default HealthChart;