import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/lib/supabase";
import lightColors from "../../themes/colors";

export default function SignUpScreen() {
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    const name = nameRef.current.trim();
    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();
    const filiere = "AFB";

    if (!name || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom: name,
          email: email,
          filiere: filiere,
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      router.replace("/sign-in");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.avoiding}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <StatusBar
        backgroundColor={lightColors.primary}
        barStyle="light-content"
      />
      <View style={styles.container}>
        <View style={styles.logoBox}>
          <MaterialCommunityIcons
            name="book-variant"
            size={70}
            color={lightColors.primary}
          />
        </View>
        <Text style={styles.title}>Créer un compte</Text>

        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          placeholderTextColor={lightColors.textSecondary}
          autoCapitalize="words"
          onChangeText={(text) => (nameRef.current = text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Adresse email"
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
          onPress={onRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Déjà inscrit ?</Text>
          <Link href="/sign-in">
            <Text style={styles.link}> Se connecter</Text>
          </Link>
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
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    color: lightColors.primary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f5f7fa",
    color: lightColors.text,
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    width: "100%",
    fontSize: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  button: {
    backgroundColor: lightColors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  },
});
