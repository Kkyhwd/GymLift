// components/CoachSection.js
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export const CoachSection = ({ isLoading, message, onAsk }) => {
  return (
    <View style={styles.container}>
      {message ? (
        <View style={styles.coachBox}>
          <Text style={styles.coachTitle}>⚡ AI COACH SAYS:</Text>
          <Text style={styles.coachText}>{message}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.aiBtn}
        onPress={onAsk}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.aiBtnText}>ASK AI COACH</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  aiBtn: {
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  aiBtnText: { color: "#000", fontWeight: "900" },
  coachBox: {
    backgroundColor: "#1A2E1A",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#00FF00",
  },
  coachTitle: { color: "#00FF00", fontSize: 10, fontWeight: "900" },
  coachText: { color: "#FFF", fontSize: 14, fontStyle: "italic" },
});
