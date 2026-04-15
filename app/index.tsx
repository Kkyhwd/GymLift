import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CoachSection } from "../components/CoachSection";
import { AIConsultant } from "../utils/aiConsultant";
import { auth } from "../utils/firebaseConfig";
import { FitnessEngine } from "../utils/fitnessEngine";
import styles from "./index.styles";

// --- Type Definitions ---
type HistoryItem = {
  id: string;
  exercise: string;
  weight: number;
  reps: number;
  unit: string;
  date: string;
  oneRepMax: number;
};
type Category = "UPPER" | "LOWER" | "CORE";
type ExerciseMap = Record<Category, string[]>;

const DEFAULT_MAP: ExerciseMap = {
  UPPER: ["Bench", "Press", "Rows", "Pull-ups"],
  LOWER: ["Squat", "Deadlift", "Leg Press", "Lunge"],
  CORE: ["Plank", "Abs"],
};

const CATEGORIES: Category[] = ["UPPER", "LOWER", "CORE"];

export default function Index() {
  const [view, setView] = useState<"calc" | "history">("calc");
  const [activeCategory, setActiveCategory] = useState<Category>("LOWER");
  const [exercise, setExercise] = useState<string>("Squat");
  const [exerciseMap, setExerciseMap] = useState<ExerciseMap>(DEFAULT_MAP);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight] = useState<string>("135");
  const [reps, setReps] = useState<string>("5");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- AI STATE ---
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [coachMessage, setCoachMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const savedHistory = await AsyncStorage.getItem("gym_history");
    const savedMap = await AsyncStorage.getItem("gym_exercise_map");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedMap) setExerciseMap(JSON.parse(savedMap));
  };

  // --- AI HANDLER ---
  const handleAiAsk = async () => {
    if (!auth.currentUser) {
      Alert.alert("Not logged in", "You must be logged in to use AI Coach.");
      setIsAiLoading(false);
      return;
    }
    setIsAiLoading(true);
    setCoachMessage("");
    try {
      const advice = await AIConsultant.getCoachAdvice(history, exercise, unit);
      if (advice) {
        setWeight(advice.suggestedWeight.toString());
        setReps(advice.suggestedReps.toString());
        setCoachMessage(advice.message);
      } else {
        Alert.alert(
          "AI Connection Failed",
          "Could not reach Vertex AI. Please check your billing status in Google Cloud Console.",
        );
      }
    } catch (error) {
      console.error("AI Component Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveSet = async () => {
    const newSet: HistoryItem = {
      id: Date.now().toString(),
      exercise,
      weight: parseFloat(weight) || 0,
      reps: parseInt(reps) || 0,
      unit,
      date: new Date().toLocaleDateString(),
      oneRepMax: FitnessEngine.calculate1RM(
        parseFloat(weight) || 0,
        parseInt(reps) || 0,
      ),
    };
    const updated = [newSet, ...history];
    setHistory(updated);
    await AsyncStorage.setItem("gym_history", JSON.stringify(updated));
    setCoachMessage(""); // Clear message after logging
    Keyboard.dismiss();
    Alert.alert("Logged", `${exercise} set saved!`);
  };

  // --- Restore Sliding Bar Functionality ---
  const addExercise = () => {
    if (Platform.OS === "web") {
      const name = window.prompt(`New ${activeCategory} Motion\nName:`);
      if (name) {
        const newMap = { ...exerciseMap };
        newMap[activeCategory] = [...newMap[activeCategory], name];
        setExerciseMap(newMap);
        setExercise(name);
        localStorage.setItem("gym_exercise_map", JSON.stringify(newMap));
      }
    } else {
      Alert.prompt(`New ${activeCategory} Motion`, "Name:", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: async (name?: string) => {
            if (name) {
              const newMap = { ...exerciseMap };
              newMap[activeCategory] = [...newMap[activeCategory], name];
              setExerciseMap(newMap);
              setExercise(name);
              await AsyncStorage.setItem(
                "gym_exercise_map",
                JSON.stringify(newMap),
              );
            }
          },
        },
      ]);
    }
  };

  const confirmDeleteExercise = (exName: string) => {
    Alert.alert("Remove Exercise", `Delete "${exName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const newMap = { ...exerciseMap };
          newMap[activeCategory] = newMap[activeCategory].filter(
            (e) => e !== exName,
          );
          setExerciseMap(newMap);
          setExercise(newMap[activeCategory][0] || "");
          await AsyncStorage.setItem(
            "gym_exercise_map",
            JSON.stringify(newMap),
          );
        },
      },
    ]);
  };

  const deleteHistoryItem = (id: string) => {
    Alert.alert("Delete Log", "Remove this set?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const updated = history.filter((item) => item.id !== id);
          setHistory(updated);
          await AsyncStorage.setItem("gym_history", JSON.stringify(updated));
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      Alert.alert("Error logging out", String(e));
    }
  };

  const weightNum = parseFloat(weight) || 0;
  const repsNum = parseInt(reps) || 0;
  const current1RM = FitnessEngine.calculate1RM(weightNum, repsNum);
  const currentPlates = FitnessEngine.getPlateStack(weightNum, unit === "kg");

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* -- ACCOUNT MANAGEMENT BUTTONS -- */}
          {auth.currentUser ? (
            <View
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
                marginBottom: 10,
              }}
            >
              {auth.currentUser.isAnonymous && (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#FFF",
                    padding: 12,
                    borderRadius: 8,
                    marginRight: 8, // spacing between buttons
                  }}
                  // Route to LoginScreen in link (upgrade) mode
                  onPress={() =>
                    router.push({
                      pathname: "/LoginScreen",
                      params: { linkAnon: "1" },
                    })
                  }
                >
                  <Text style={{ color: "#000", fontWeight: "bold" }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{
                  backgroundColor: "#FFF",
                  padding: 12,
                  borderRadius: 8,
                }}
                onPress={handleLogout}
              >
                <Text style={{ color: "#000", fontWeight: "bold" }}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Header Row */}
          <View style={styles.headerRow}>
            <Text style={styles.header}>GYMLIFT</Text>
            <View style={styles.unitPill}>
              <TouchableOpacity
                onPress={() => setUnit("lbs")}
                style={[
                  styles.pillBtn,
                  unit === "lbs" ? styles.pillActive : styles.pillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    unit === "lbs" && styles.pillTextActive,
                  ]}
                >
                  LBS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUnit("kg")}
                style={[
                  styles.pillBtn,
                  unit === "kg" ? styles.pillActive : styles.pillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    unit === "kg" && styles.pillTextActive,
                  ]}
                >
                  KG
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* View Selector */}
          <View style={styles.viewSelector}>
            <TouchableOpacity
              onPress={() => setView("calc")}
              style={[styles.viewBtn, view === "calc" && styles.viewBtnActive]}
            >
              <Text
                style={[
                  styles.viewText,
                  view === "calc" && styles.viewTextActive,
                ]}
              >
                CALC
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setView("history")}
              style={[
                styles.viewBtn,
                view === "history" && styles.viewBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.viewText,
                  view === "history" && styles.viewTextActive,
                ]}
              >
                HISTORY
              </Text>
            </TouchableOpacity>
          </View>

          {/* CATEGORY ROW */}
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  setActiveCategory(cat);
                  setExercise(exerciseMap[cat][0]);
                }}
                style={[
                  styles.catBtn,
                  activeCategory === cat && styles.catBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.catText,
                    activeCategory === cat && styles.catTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SLIDING BAR CONTAINER */}
          <View style={styles.slidingBarContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {exerciseMap[activeCategory]?.map((ex) => (
                <TouchableOpacity
                  key={ex}
                  onPress={() => setExercise(ex)}
                  onLongPress={() => confirmDeleteExercise(ex)}
                  style={[styles.tab, exercise === ex && styles.tabActive]}
                >
                  <Text
                    style={[
                      styles.tabText,
                      exercise === ex && styles.tabTextActive,
                    ]}
                  >
                    {ex}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={addExercise} style={styles.addTabBtn}>
                <Text style={styles.addTabText}>+ ADD</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Main content (Calculator or History) */}
          {view === "calc" ? (
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
              {/* --- MODULAR AI SECTION --- */}
              <CoachSection
                isLoading={isAiLoading}
                message={coachMessage}
                onAsk={handleAiAsk}
              />

              {/* Core Calculator Card */}
              <View style={styles.calcCard}>
                <View style={styles.inputRow}>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>WEIGHT</Text>
                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>REPS</Text>
                    <TextInput
                      style={styles.input}
                      value={reps}
                      onChangeText={setReps}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.resultRow}>
                  <View>
                    <Text style={styles.resLabel}>EST. 1RM</Text>
                    <Text style={styles.resValue}>
                      {current1RM} <Text style={styles.unitSub}>{unit}</Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.resLabel}>PLATES / SIDE</Text>
                    <Text style={styles.plateList}>
                      {currentPlates.join(", ") || "BAR"}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.logBtn} onPress={saveSet}>
                <Text style={styles.logBtnText}>
                  LOG {exercise.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          ) : (
            <FlatList
              data={history.filter((item) => item.exercise === exercise)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View>
                    <Text style={styles.historyDate}>{item.date}</Text>
                    <Text style={styles.historyText}>
                      {item.weight}
                      {item.unit} x {item.reps}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.historyMax}>{item.oneRepMax} MAX</Text>
                    <TouchableOpacity
                      onPress={() => deleteHistoryItem(item.id)}
                      style={styles.delBtn}
                    >
                      <Text style={styles.delBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
