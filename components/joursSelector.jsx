import { Ionicons } from "@expo/vector-icons";
import { useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import lightColors from "../themes/colors";

const AnimatedTouchable = ({ children, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={0.8}
        style={styles.animatedBtn}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function JoursSelector({
  jours,
  selectedJour,
  setSelectedJour,
  setModalType,
  setModalVisible,
  setEditModalDate,
  setAddModalDate,
  setActionTarget,
  setDateModalVisible,
  handleAddJour,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Sélectionner un jour</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setAddModalDate("");
            setActionTarget("add");
            setDateModalVisible(true);
            handleAddJour();
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.addBtnText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysRow}
      >
        {jours.map((jour) => {
          const isActive = selectedJour?.id === jour.id;
          return (
            <View
              key={jour.id}
              style={[
                styles.dayItem,
                {
                  backgroundColor: isActive
                    ? lightColors.primary
                    : lightColors.border,
                  borderColor: isActive
                    ? lightColors.primary
                    : lightColors.border,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => setSelectedJour(jour)}
                style={styles.dayBtn}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isActive ? "#fff" : lightColors.text },
                  ]}
                >
                  {jour.date}
                </Text>
              </TouchableOpacity>

              {isActive && (
                <View style={styles.actionRow}>
                  <AnimatedTouchable
                    onPress={() => {
                      setModalType("edit");
                      setEditModalDate(jour.date);
                      setModalVisible(true);
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={lightColors.primary}
                    />
                  </AnimatedTouchable>
                  <AnimatedTouchable
                    onPress={() => {
                      setModalType("delete");
                      setModalVisible(true);
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                  </AnimatedTouchable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  headerText: {
    color: lightColors.textSecondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: lightColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  daysRow: {
    flexDirection: "row",
    marginTop: 6,
    marginBottom: 8,
  },
  dayItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 2,
    backgroundColor: lightColors.border,
  },
  dayBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 4,
  },
  animatedBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 6,
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
