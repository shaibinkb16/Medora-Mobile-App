import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get('window');

interface RecommendationCardProps {
  title: string;
  description: string;
  type: "diet" | "exercise" | "prediction" | "ai";
  priority?: "high" | "medium" | "low";
}

const RecommendationCard = ({ title, description, type, priority = "medium" }: RecommendationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const viewRef = React.useRef<Animatable.View & View>(null);

  const getIcon = () => {
    const icons = {
      diet: "restaurant",
      exercise: "barbell",
      prediction: "pulse",
      ai: "sparkles",
    };
    return icons[type] || "bulb";
  };

  const priorityColor = {
    high: "#ff4757",
    medium: "#ffa502",
    low: "#2ed573"
  };

  const handlePress = () => {
    setIsExpanded(!isExpanded);
    viewRef.current?.animate({
      0: { transform: [{ rotate: '-2deg' }, { translateY: 0 }] },
      1: { transform: [{ rotate: '2deg' }, { translateY: -5 }] },
    }).then(() => {
      viewRef.current?.animate({
        0: { transform: [{ rotate: '2deg' }, { translateY: -5 }] },
        1: { transform: [{ rotate: '-2deg' }, { translateY: 0 }] },
      });
    });
  };

  return (
    <Animatable.View 
      ref={viewRef}
      animation="fadeInUp"
      duration={800}
      delay={100 * Math.random()}
      useNativeDriver
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={handlePress}
      >
        <LinearGradient
          colors={type === 'ai' ? ['#00d4ff', '#0066ff'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={[0, 0]}
          end={[1, 1]}
          style={[
            styles.card, 
            type === "ai" && styles.aiCard,
            { borderLeftWidth: 4, borderLeftColor: priorityColor[priority] }
          ]}
        >
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            duration={2000}
            style={styles.iconContainer}
          >
            <Icon 
              name={getIcon()} 
              size={28} 
              color={type === 'ai' ? "#fff" : priorityColor[priority]} 
            />
          </Animatable.View>
          
          <View style={styles.textContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Icon 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="rgba(255,255,255,0.6)" 
              />
            </View>
            
            <Animatable.Text 
              style={styles.description}
              numberOfLines={isExpanded ? undefined : 2}
              transition="opacity"
              duration={300}
            >
              {description}
            </Animatable.Text>

            {type === 'ai' && (
              <Animatable.View 
                style={styles.shimmer}
                animation="fadeIn"
                duration={1000}
                iterationCount="infinite"
              />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  aiCard: {
    borderLeftWidth: 0,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
  },
  textContainer: { 
    flex: 1, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700",
    flex: 1,
  },
  description: { 
    color: "rgba(255,255,255,0.8)", 
    fontSize: 14.5, 
    lineHeight: 22,
  },
  shimmer: {
    position: 'absolute',
    top: -50,
    left: -50,
    height: width * 2,
    width: width * 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    transform: [{ rotate: '20deg' }],
  },
});

export default RecommendationCard;