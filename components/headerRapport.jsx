import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import lightColors from "../themes/colors";

export default function HeaderRapport({
  id,
  titre,
  dateDebut,
  dateFin,
  lieu,
  finish,
}) {
  console.log("finish", finish);

  return (
    <View style={styles.wrapper}>
      <View style={styles.infoBox}>
        <Text style={styles.title}>{titre}</Text>
        <View style={styles.row}>
          <Ionicons
            name="location-outline"
            size={16}
            color={lightColors.primary}
          />
          <Text style={styles.location}>{lieu}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={lightColors.primary}
          />
          <Text style={styles.date}>
            {dateDebut} {dateFin ? `→ ${dateFin}` : ""}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons
            name={finish == "true" ? "checkmark-circle" : "time-outline"}
            size={16}
            color={finish == "true" ? "#4ade80" : "#fbbf24"}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.status,
              { color: finish == "true" ? "#4ade80" : "#fbbf24" },
            ]}
          >
            {finish == "true" ? "Terminé" : "En cours"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: lightColors.card,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  infoBox: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: lightColors.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  location: {
    fontSize: 15,
    color: lightColors.textSecondary,
    marginLeft: 6,
  },
  date: {
    fontSize: 15,
    color: lightColors.textSecondary,
    marginLeft: 6,
  },
  status: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
});
