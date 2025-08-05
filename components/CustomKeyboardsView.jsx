import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
const ios = Platform.OS === "ios";

export default function CustomKeyboardsView({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={ios ? "padding" : "height"}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
      }}
    >
      <ScrollView style={{ flex: 1, width: "100%" }} bounces={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
