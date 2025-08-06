import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  handleAddJour,
  handleDeleteJour,
  handleUpdateJour,
}) {
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [showEditPicker, setShowEditPicker] = useState(false);
  const [addDate, setAddDate] = useState(new Date());
  const [editDate, setEditDate] = useState(selectedJour?.date || new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");

  const showAddDatePicker = () => {
    setShowAddPicker(true);
  };
  const showEditDatePicker = () => {
    setShowEditPicker(true);
  };

  const handleAddNewJour = (event, selectedDate) => {
    const currentDate = selectedDate || addDate;
    setShowAddPicker(false);
    setAddDate(currentDate.toISOString().split("T")[0]);
    try {
      handleAddJour(currentDate.toISOString().split("T")[0]);
    } catch (error) {
      console.log("Error adding jour:", error);
    }
  };
  const handleEditJour = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShowEditPicker(false);
    //setCurrDate(currentDate.toISOString().split("T")[0]);
    setEditDate(currentDate.toISOString().split("T")[0]);
    console.log("Edit date:", currentDate.toISOString().split("T")[0]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Sélectionner un jour</Text>
        <TouchableOpacity style={styles.addBtn} onPress={showAddDatePicker}>
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
                      setEditDate(jour.date);
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

      {/* Modal  edit / delete jour */}
      <Modal
        visible={modalVisible}
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === "edit" && (
              <>
                <Text style={styles.label}>Modifier ce jour</Text>
                <View style={styles.dateField}>
                  <TextInput
                    value={editDate}
                    placeholder="modifier la date"
                    placeholderTextColor={lightColors.textSecondary}
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    editable={false}
                  />
                  <TouchableOpacity
                    onPress={showEditDatePicker}
                    style={styles.iconBtn}
                  >
                    <Ionicons
                      name="calendar"
                      size={22}
                      color={lightColors.primary}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[
                      styles.modalBtn,
                      { backgroundColor: lightColors.border },
                    ]}
                  >
                    <Text style={styles.modalBtnTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleUpdateJour(editDate);
                      setModalVisible(false);
                    }}
                    style={[
                      styles.modalBtn,
                      { backgroundColor: lightColors.primary },
                    ]}
                  >
                    <Text style={styles.modalBtnText}>Modifier</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalType === "delete" && selectedJour && (
              <>
                <Text style={[styles.modalTitle, { color: "#ff6b6b" }]}>
                  Supprimer le jour
                </Text>
                <Text style={styles.modalDeleteText}>
                  Êtes-vous sûr de vouloir supprimer le jour{" "}
                  <Text style={{ fontWeight: "bold", color: lightColors.text }}>
                    {selectedJour.date}
                  </Text>
                  ?
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[
                      styles.modalBtn,
                      { backgroundColor: lightColors.border },
                    ]}
                  >
                    <Text style={styles.modalBtnTextCancel}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleDeleteJour();
                      setModalVisible(false);
                    }}
                    style={[styles.modalBtn, { backgroundColor: "#ff6b6b" }]}
                  >
                    <Text style={styles.modalBtnText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {showAddPicker && (
        <DateTimePicker
          value={addDate}
          mode="date"
          locale="fr"
          display="default"
          dateFormat="dayofweek day month"
          onChange={handleAddNewJour}
        />
      )}
      {showEditPicker && (
        <DateTimePicker
          value={new Date(editDate)}
          mode="date"
          locale="fr"
          display="default"
          dateFormat="dayofweek day month"
          onChange={handleEditJour}
        />
      )}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 22,
    width: "100%",
    maxWidth: 400,
    elevation: 3,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: lightColors.text,
    textAlign: "center",
  },
  modalDeleteText: {
    textAlign: "center",
    marginBottom: 18,
    color: lightColors.textSecondary,
    fontSize: 15,
  },
  input: {
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
    fontSize: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 2,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBtnTextCancel: {
    color: lightColors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  label: {
    fontWeight: "bold",
    color: lightColors.text,
    marginBottom: 6,
    fontSize: 15,
    marginLeft: 2,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
});
