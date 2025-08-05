import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import lightColors from "../themes/colors";

export default function TabsRow({ activeTab, setActiveTab }) {
  const tabs = [
    { label: "Texte", icon: "document-text-outline" },
    { label: "Images", icon: "images-outline" },
    { label: "Audios", icon: "mic-outline" },
  ];
  return (
    <View style={{ marginHorizontal: 20 }}>
      <Text style={styles.label}>Contenu du jour</Text>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            onPress={() => setActiveTab(tab.label)}
            style={[
              styles.tabBtn,
              activeTab === tab.label && styles.tabBtnActive,
            ]}
            activeOpacity={0.85}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={
                activeTab === tab.label
                  ? lightColors.primary
                  : lightColors.textSecondary
              }
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.label && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: lightColors.textSecondary,
    fontWeight: "500",
    marginBottom: 6,
    marginLeft: 2,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: lightColors.border,
    borderRadius: 16,
    padding: 3,
    marginBottom: 18,
    justifyContent: "space-between",
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  tabBtnActive: {
    backgroundColor: "#fff",
    shadowColor: lightColors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: lightColors.textSecondary,
    fontWeight: "500",
  },
  tabTextActive: {
    color: lightColors.primary,
    fontWeight: "bold",
  },
});
