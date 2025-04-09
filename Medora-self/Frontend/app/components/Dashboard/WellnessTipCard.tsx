import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

interface WellnessTip {
  id: string;
  title: string;
  content: string;
  category: string;
}

export default function WellnessTipCard({ tip }: { tip: WellnessTip }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon
          name={
            tip.category === "Diet"
              ? "fast-food"
              : tip.category === "Exercise"
              ? "walk"
              : tip.category === "Lifestyle"
              ? "leaf"
              : tip.category === "Mental Wellness"
              ? "medkit"
              : "bulb"
          }
          size={20}
          color="#00e5ff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.title}>{tip.title}</Text>
      </View>
      <Text style={styles.content}>{tip.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    marginHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    flexShrink: 1,
  },
  content: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 4,
  },
});
