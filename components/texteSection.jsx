import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import lightColors from "../themes/colors";

export default function TexteSection({
  texte,
  handleTexteChange,
  isModified,
  isSaving,
  updateJourTexte,
  inputRef,
  onFocus,
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.avoiding}
      keyboardVerticalOffset={80}
    >
      <View style={styles.wrapper}>
        <Text style={styles.title}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={lightColors.primary}
          />{" "}
          Compte rendu de la journée
        </Text>
        <TextInput
          ref={inputRef}
          value={texte}
          onChangeText={handleTexteChange}
          multiline
          style={styles.input}
          placeholder="Écrivez votre résumé..."
          placeholderTextColor={lightColors.textSecondary}
          textAlignVertical="top"
          onFocus={onFocus}
        />

        <View style={{ marginTop: 12 }}>
          {isModified && !isSaving && (
            <TouchableOpacity
              onPress={updateJourTexte}
              style={styles.saveBtn}
              activeOpacity={0.85}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
              />
              <Text style={styles.saveBtnText}>Enregistrer</Text>
            </TouchableOpacity>
          )}

          {isSaving && (
            <View style={styles.savedBox}>
              <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
              <Text style={styles.savedText}>Enregistré</Text>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoiding: {
    flex: 1,
  },
  wrapper: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: lightColors.text,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 14,
    padding: 12,
    minHeight: 90,
    fontSize: 15,
    color: lightColors.text,
    backgroundColor: "#f8f8f8",
    textAlignVertical: "top",
  },
  saveBtn: {
    flexDirection: "row",
    backgroundColor: lightColors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
  savedBox: {
    flexDirection: "row",
    backgroundColor: "#4ade80",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  savedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
});
