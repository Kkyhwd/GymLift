// app/LoginScreen.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../utils/firebaseConfig";

export default function LoginScreen() {
  const { linkAnon } = useLocalSearchParams<{ linkAnon?: string }>();
  const router = useRouter();
  const isLinkAnon = !!linkAnon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Anonymous login handler
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      console.log("Anonymous login...");
      await signInAnonymously(auth);
      console.log("Anonymous login success!");
      router.replace("/"); // Go to main app after anonymous login
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.log("Anonymous login error:", message);
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Sign Up handler
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      console.log("Sign up...");
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Sign up success!");
      router.replace("/"); // Go to main app after signup
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.log("Sign up error:", message);
      Alert.alert("Sign Up Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      console.log("Login with email...");
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Login success!");
      router.replace("/"); // Go to main app after login
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.log("Login error:", message);
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Anonymous LINK-to-email handler
  const handleLinkAccount = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(auth.currentUser!, credential);
      Alert.alert("Success", "Your anonymous account is now upgraded!");
      router.replace("/"); // Go to main app after account linking
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      console.log("Link error:", message);
      Alert.alert("Link Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GYMLIFT</Text>
      <Text style={styles.subtitle}>
        {isLinkAnon ? "Upgrade Your Account" : "AI Gym Coach"}
      </Text>

      <View style={styles.formBox}>
        {!isSignUp && !isLinkAnon && (
          <>
            <TouchableOpacity
              style={styles.anonBtn}
              onPress={handleAnonymousLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.anonBtnText}>QUICK START (Anonymous)</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.divider}>OR</Text>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          editable={!loading}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={styles.mainBtn}
          onPress={
            isLinkAnon && auth.currentUser?.isAnonymous
              ? handleLinkAccount
              : isSignUp
                ? handleSignUp
                : handleLogin
          }
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.mainBtnText}>
              {isLinkAnon && auth.currentUser?.isAnonymous
                ? "Link Account"
                : isSignUp
                  ? "SIGN UP"
                  : "LOGIN"}
            </Text>
          )}
        </TouchableOpacity>

        {!isLinkAnon && (
          <TouchableOpacity onPress={() => setIsSignUp((prev) => !prev)}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? "Already have an account? Login"
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        )}
        {isLinkAnon && (
          <TouchableOpacity
            onPress={() => {
              router.replace("/"); // Go back to main
            }}
          >
            <Text style={[styles.toggleText, { color: "#aaa" }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
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
  title: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 5,
  },
  subtitle: {
    color: "#00FF00",
    fontSize: 14,
    marginBottom: 40,
  },
  formBox: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: "#222",
  },
  anonBtn: {
    backgroundColor: "#00FF00",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  anonBtnText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 14,
  },
  divider: {
    color: "#444",
    textAlign: "center",
    marginVertical: 15,
    fontWeight: "600",
  },
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
    marginTop: 15,
  },
  mainBtnText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 14,
  },
  toggleText: {
    color: "#00FF00",
    textAlign: "center",
    marginTop: 15,
    fontSize: 12,
    fontWeight: "600",
  },
});
