import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-modern-datepicker";
import { supabase } from "../src/lib/supabase";
import lightColors from "../themes/colors";

export default function RapportCards({
  rapports,
  setRapports,
  filter,
  rapportImage,
  // fetchRapports,
  userId,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [expandedCard, setExpandedCard] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState(null);

  const [editTitre, setEditTitre] = useState("");
  const [editLieu, setEditLieu] = useState("");
  const [editDebutDate, setEditDebutDate] = useState("");
  const [editFinDate, setEditFinDate] = useState("");
  const [dateTarget, setDateTarget] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Format date pour affichage
  const formatDateFr = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-"))
      return "Choisir une date";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return "Choisir une date";
    return `${day}/${month}/${year}`;
  };

  const fetchRapports = async (userId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from("rapports")
      .select()
      .eq("creator_Id", userId);

    if (error) {
      console.error("Erreur fetch rapports:", error);
    } else {
      console.log("Rapports reçus:", data);
      setRapports(data);
    }

    setLoading(false);
  };

  const filteredRapports =
    filter === "ongoing"
      ? rapports.filter((r) => !r.finish)
      : rapports.filter((r) => r.finish);

  const openEditModal = (rapport) => {
    setSelectedRapport(rapport);
    setEditTitre(rapport.titre);
    setEditLieu(rapport.lieu);
    setEditDebutDate(rapport.dateDebut);
    setEditFinDate(rapport.dateFin);
    setEditModalVisible(true);
  };

  const updateRapport = async () => {
    const { error } = await supabase
      .from("rapports")
      .update({
        titre: editTitre,
        lieu: editLieu,
        dateDebut: editDebutDate,
        dateFin: editFinDate,
      })
      .eq("id", selectedRapport.id);

    if (error) {
      console.error(error);
    } else {
      // Refresh local state
      fetchRapports(userId);
    }
    setEditModalVisible(false);
    setExpandedCard(null);
  };

  const toggleFinishRapport = async () => {
    const { error } = await supabase
      .from("rapports")
      .update({ finish: !selectedRapport.finish })
      .eq("id", selectedRapport.id);

    if (error) {
      console.error(error);
    } else {
      fetchRapports(userId);
    }
    setConfirmModalVisible(false);
    setExpandedCard(null);
  };

  const deleteRapport = async () => {
    const { error } = await supabase
      .from("rapports")
      .delete()
      .eq("id", selectedRapport.id);

    if (error) {
      console.error(error);
    } else {
      fetchRapports(userId);
    }
    setDeleteModalVisible(false);
    setExpandedCard(null);
  };

  return (
    <>
      {filteredRapports.map((item) => (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/details",
              params: {
                id: item.id.toString(),
                titre: item.titre,
                lieu: item.lieu,
                dateDebut: item.dateDebut,
                dateFin: item.dateFin,
                finish: item.finish.toString(),
              },
            });
          }}
          key={item.id}
          className="bg-white rounded-2xl mx-5 mb-5 shadow-md overflow-hidden"
        >
          <Image
            source={rapportImage}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="p-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-[#1F1F1F]">
                {item.titre}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setExpandedCard(expandedCard === item.id ? null : item.id)
                }
              >
                <Ionicons
                  name="ellipsis-horizontal"
                  size={22}
                  color="#7A7A7A"
                />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-[#7A7A7A] mt-1">{item.lieu}</Text>
            <Text className="text-xs text-[#7A7A7A] mt-1">
              {item.dateDebut} - {item.dateFin}
            </Text>

            {expandedCard === item.id && (
              <View className="mt-3">
                <TouchableOpacity
                  className="py-2 rounded-md mb-2 items-center bg-[#FFF7E0]"
                  onPress={() => openEditModal(item)}
                >
                  <Text className="font-semibold text-[#F2C94C]">Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`py-2 rounded-md mb-2 items-center ${
                    item.finish ? "bg-[#E3F0FF]" : "bg-[#E0FFE6]"
                  }`}
                  onPress={() => {
                    setSelectedRapport(item);
                    setConfirmModalVisible(true);
                  }}
                >
                  <Text
                    className={`font-semibold ${
                      item.finish ? "text-[#2D9CDB]" : "text-[#27AE60]"
                    }`}
                  >
                    {item.finish ? "Mettre en cours" : "Terminer"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-2 rounded-md items-center bg-[#FFE0E0]"
                  onPress={() => {
                    setSelectedRapport(item);
                    setDeleteModalVisible(true);
                  }}
                >
                  <Text className="font-semibold text-[#EB5757]">
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}

      {/* Modal Modifier */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-xl w-4/5">
            <Text className="text-lg font-bold text-center mb-3">
              Modifier le rapport
            </Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-2"
              value={editTitre}
              onChangeText={setEditTitre}
              placeholder="Titre"
            />
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-2"
              value={editLieu}
              onChangeText={setEditLieu}
              placeholder="Lieu"
            />
            <Text style={styles.label}>Date de début</Text>

            <View style={styles.dateField}>
              <TextInput
                className="border border-gray-300 rounded-md p-2 mb-2"
                value={editDebutDate}
                placeholder="Date début (YYYY-MM-DD)"
                editable={false}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity
                onPress={() => {
                  setDateTarget("debut");
                  setModalVisible(true);
                }}
                style={styles.iconBtn}
              >
                <Ionicons
                  name="calendar"
                  size={22}
                  color={lightColors.primary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Date de fin</Text>

            <View style={styles.dateField}>
              <TextInput
                className="border border-gray-300 rounded-md p-2 mb-2"
                value={editFinDate}
                placeholder="Date fin (YYYY-MM-DD)"
                editable={false}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity
                onPress={() => {
                  setDateTarget("fin");
                  setModalVisible(true);
                }}
                style={styles.iconBtn}
              >
                <Ionicons
                  name="calendar"
                  size={22}
                  color={lightColors.primary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-[#6495ED] p-3 rounded-md mb-2"
              onPress={updateRapport}
            >
              <Text className="text-white font-bold text-center">
                Enregistrer
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text className="text-center text-gray-500">Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Sélection Date */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            <DatePicker
              isGregorian
              mode="calendar"
              onDateChange={(date) => {
                if (dateTarget === "debut") {
                  setEditDebutDate(date);
                } else if (dateTarget === "fin") {
                  setEditFinDate(date);
                }
                setModalVisible(false);
              }}
              options={{
                backgroundColor: "#fff",
                mainColor: lightColors.primary,
              }}
              locale="fr"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: lightColors.primary, fontWeight: "bold" }}>
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmation état */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-xl w-4/5 items-center">
            <Text className="text-lg font-bold mb-2">
              {selectedRapport?.finish
                ? "Reprendre le rapport ?"
                : "Terminer le rapport ?"}
            </Text>
            <Text className="mb-4">{selectedRapport?.titre}</Text>
            <View className="flex-row w-full mt-2">
              <TouchableOpacity
                className="flex-1 bg-green-100 p-3 rounded-md mr-1"
                onPress={toggleFinishRapport}
              >
                <Text className="text-green-600 font-bold text-center">
                  Confirmer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-md ml-1"
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text className="text-gray-600 font-bold text-center">
                  Annuler
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmation suppression */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-xl w-4/5 items-center">
            <Text className="text-lg font-bold mb-2">
              Supprimer ce rapport ?
            </Text>
            <Text className="mb-4">{selectedRapport?.titre}</Text>
            <View className="flex-row w-full mt-2">
              <TouchableOpacity
                className="flex-1 bg-red-100 p-3 rounded-md mr-1"
                onPress={deleteRapport}
              >
                <Text className="text-red-600 font-bold text-center">
                  Supprimer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-md ml-1"
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text className="text-gray-600 font-bold text-center">
                  Annuler
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
  modalWrapper: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 18,
    padding: 10,
    borderRadius: 8,
    backgroundColor: lightColors.background,
    alignItems: "center",
    width: "100%",
  },
});
