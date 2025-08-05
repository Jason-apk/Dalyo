import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import lightColors from "../../themes/colors";

export default function LoginScreen() {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Handle the submission of the sign-in form

  const onLogin = async () => {
    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();

    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      router.replace("/(home)");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.avoiding}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="book-variant"
            size={60}
            color={lightColors.primary}
          />
          <Text style={styles.appName}>Dalyo</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Connexion</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={lightColors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={(text) => (emailRef.current = text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor={lightColors.textSecondary}
            secureTextEntry
            onChangeText={(text) => (passwordRef.current = text)}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={onLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={lightColors.buttonText} />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas de compte ?</Text>
          <TouchableOpacity onPress={() => router.replace("/sign-up")}>
            <Text style={styles.link}> M'inscrire</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoiding: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  appName: {
    marginLeft: 10,
    fontSize: 32,
    fontWeight: "bold",
    color: lightColors.primary,
    letterSpacing: 1,
  },
  form: {
    width: "100%",
    backgroundColor: lightColors.card,
    borderRadius: 15,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: lightColors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f7fa",
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    color: lightColors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: lightColors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: lightColors.buttonText,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: {
    color: lightColors.textSecondary,
    fontSize: 15,
  },
  link: {
    color: lightColors.primary,
    fontWeight: "bold",
    fontSize: 15,
  },
});
