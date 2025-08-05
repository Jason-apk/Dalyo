import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CustomHeader = ({ title = "Titre" }) => {
  const router = useRouter();

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>{title}</Text>

      {/* Placeholder pour équilibrer l’espace */}
      <View style={{ width: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: "#D3D3D3", // gris clair
    borderRadius: 8,
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F1F1F", // noir
  },
});

export default CustomHeader;
