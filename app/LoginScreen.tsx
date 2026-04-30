import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../utils/firebaseConfig";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validation Logic
  const isValidEmail =
    email.includes("@") && email.toLowerCase().includes(".com");
  const isValidPassword = password.length >= 8;

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    if (Platform.OS === "web") {
      setLoading(true);
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log("Google Login Success:", result.user.email);
        router.replace("/");
      } catch (error: any) {
        setErrorMsg("Google Sign-In failed. Please try again.");
        console.error("Google Error:", error.code);
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Notice", "Google Sign-In is currently enabled for Web.");
    }
  };

  const handleSignUp = async () => {
    setErrorMsg(null);
    if (!isValidEmail) {
      setErrorMsg("Email must contain '@' and '.com'");
      return;
    }
    if (!isValidPassword) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (error: any) {
      setErrorMsg(
        error.code === "auth/email-already-in-use"
          ? "Email already exists."
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (error: any) {
      setErrorMsg("Incorrect email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GYMLIFT</Text>
      <Text style={styles.subtitle}>AI Gym Coach</Text>

      <View style={styles.formBox}>
        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {isSignUpMode && (
          <View style={styles.instructionBox}>
            <Text
              style={[
                styles.instructionText,
                email.length > 0 && !isValidEmail && { color: "#FF3B30" },
              ]}
            >
              • Must include '@' and '.com'
            </Text>
            <Text
              style={[
                styles.instructionText,
                password.length > 0 && !isValidPassword && { color: "#FF3B30" },
              ]}
            >
              • Password at least 8 characters
            </Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errorMsg) setErrorMsg(null);
          }}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errorMsg) setErrorMsg(null);
          }}
          secureTextEntry
        />

        <TouchableOpacity
          style={[
            styles.mainBtn,
            isSignUpMode && { backgroundColor: "#00FF00" },
          ]}
          onPress={isSignUpMode ? handleSignUp : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.mainBtnText}>
              {isSignUpMode ? "CREATE ACCOUNT" : "SIGN IN"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsSignUpMode(!isSignUpMode);
            setErrorMsg(null);
          }}
        >
          <Text style={styles.toggleText}>
            {isSignUpMode
              ? "Already have an account? Sign In"
              : "New to GymLift? Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </View>

        {/* GOOGLE SIGN IN BUTTON */}
        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Image
            source={require("../assets/google_logo.png")}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={styles.googleBtnText}>Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { color: "#FFF", fontSize: 36, fontWeight: "900", marginBottom: 5 },
  subtitle: { color: "#00FF00", fontSize: 14, marginBottom: 40 },
  formBox: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  errorContainer: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  instructionBox: { marginBottom: 15 },
  instructionText: { color: "#888", fontSize: 12, marginBottom: 4 },
  input: {
    backgroundColor: "#222",
    color: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  mainBtn: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 5,
  },
  mainBtnText: { color: "#000", fontWeight: "900", fontSize: 14 },
  toggleText: {
    color: "#00FF00",
    textAlign: "center",
    marginTop: 15,
    fontSize: 14,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: "#333" },
  dividerText: {
    color: "#666",
    paddingHorizontal: 10,
    fontSize: 10,
    fontWeight: "700",
  },
  googleBtn: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleBtnText: { color: "#000", fontWeight: "700", fontSize: 14 },
});
