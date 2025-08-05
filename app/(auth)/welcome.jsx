import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import lightColors from "../../themes/colors";

const Welcome = () => {
  const router = useRouter();
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const logoStyle = {
    transform: [
      {
        scale: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
    ],
    opacity: logoAnim,
    marginBottom: 24,
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={lightColors.primary}
        barStyle="light-content"
      />
      <Animated.View style={logoStyle}>
        <MaterialCommunityIcons
          name="book-variant"
          size={120}
          color={lightColors.primary}
        />
      </Animated.View>
      <Text style={styles.title}>Bienvenue</Text>
      <Text style={styles.subtitle}>Explorez votre assistant personnel.</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/sign-in")}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => router.push("/sign-up")}
        >
          <Text style={[styles.buttonText, styles.outlineText]}>
            Créer un compte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 34,
    color: lightColors.primary,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: lightColors.textSecondary,
    textAlign: "center",
    marginBottom: 38,
  },
  buttonGroup: {
    width: "100%",
    marginTop: 10,
  },
  button: {
    backgroundColor: lightColors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: lightColors.primary,
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 2,
  },
  outlineButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: lightColors.primary,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  outlineText: {
    color: lightColors.primary,
  },
});
