import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
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
  const { linkAnon } = useLocalSearchParams<{ linkAnon?: string }>();
  const router = useRouter();
  // If anonymous account is being linked/upgraded to a real account
  const isLinkAnon = !!linkAnon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Anonymous login handler
  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
      router.replace("/"); // Go to main app after anonymous login
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      Alert.alert("Anonymous Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS === "web") {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.replace("/"); // Go to the main app after login
      } catch (error: any) {
        Alert.alert("Google Sign-In Error", error.message ?? "Unknown error.");
      }
    } else {
      Alert.alert(
        "Not Available",
        "Google sign-in is only supported on web for this version.",
      );
      // For native, you’d want to use expo-auth-session and link accounts etc.
    }
  };

  // Real Login handler (+ specific error messages)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (error: any) {
      let message = "Unknown error";
      if (error.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        message = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/too-many-requests") {
        message = "Too many failed attempts, try again later.";
      } else {
        message = error.message || JSON.stringify(error);
      }
      Alert.alert("Login Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Anonymous: Link/upgrade to an email account
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
      router.replace("/");
    } catch (error: any) {
      let message = "Unknown error";
      if (error.code === "auth/email-already-in-use") {
        message = "Email is already in use.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else {
        message = error.message || JSON.stringify(error);
      }
      Alert.alert("Link Error", message);
    } finally {
      setLoading(false);
    }
  };

  // Optionally: allow sign up when upgrading from anonymous
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created! Signed in.");
      router.replace("/");
    } catch (error: any) {
      let message = "Unknown error";
      if (error.code === "auth/email-already-in-use") {
        message = "Email is already in use.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (error.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      } else {
        message = error.message || JSON.stringify(error);
      }
      Alert.alert("Sign Up Error", message);
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
        {/* Show Quick Start always if NOT upgrading from anonymous */}
        {!isLinkAnon && (
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

        {/* Show inputs for both normal login and link upgrade */}
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

        {/* Show only SIGN IN for normal; LINK ACCOUNT (and SIGN UP) for upgrade */}
        <TouchableOpacity
          style={styles.mainBtn}
          onPress={
            isLinkAnon && auth.currentUser?.isAnonymous
              ? handleLinkAccount
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
                : "SIGN IN"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#666" />
          ) : (
            <Image
              source={require("../assets/google_logo.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        {/* (Optional) Show sign up when linking, as a fallback */}
        {isLinkAnon && (
          <TouchableOpacity
            style={[
              styles.mainBtn,
              { backgroundColor: "#00FF00", marginTop: 10 },
            ]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={[styles.mainBtnText, { color: "#000" }]}>
              Register New Account
            </Text>
          </TouchableOpacity>
        )}

        {/* Show Skip for now if upgrading, else nothing */}
        {isLinkAnon && (
          <TouchableOpacity onPress={() => router.replace("/")}>
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
  googleBtn: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
});
