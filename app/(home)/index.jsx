import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import HomeHead from "../../components/homehead";
import RapportCards from "../../components/rapportCards";
import SliderSection from "../../components/sliderSection";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import lightColors from "../../themes/colors";

// Images
const slider1 = require("../../assets/images/slider1.jpg");
const slider2 = require("../../assets/images/slider2.jpg");
const slider3 = require("../../assets/images/slider3.jpg");
const rapportImage = require("../../assets/images/rap_img.jpg");

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id;
  console.log("userId", userId);

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("ongoing");
  const [fabModalVisible, setFabModalVisible] = useState(false);
  const [datepickModal, setDatepickModal] = useState(false);
  const [dateTarget, setDateTarget] = useState(null);
  const [titre, setTitre] = useState("");
  const [lieu, setLieu] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const sliderImages = [slider1, slider2, slider3];

  useEffect(() => {
    fetchRapports(userId);
  }, [userId]);

  useEffect(() => {
    fetchRapports(user?.id);
  }, []);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarUrl({ uri: user.avatar });
    } else {
      setAvatarUrl(require("../../assets/images/avatar.webp"));
    }
  }, [user?.avatar]);

  const openDatePicker = () => {
    setDatepickModal(true);
  };

  const handleSetDates = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setDatepickModal(false);
    if (dateTarget === "debut") {
      setDateDebut(currentDate.toISOString().split("T")[0]);
    } else if (dateTarget === "fin") {
      setDateFin(currentDate.toISOString().split("T")[0]);
    }
  };

  const fetchRapports = async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rapports")
      .select()
      .eq("creator_Id", userId);
    if (error) {
      console.log("error fetcing rapports", error.message);
      Alert.alert(
        "Erreur",
        "Impossible de charger vos rapports.Veiller réessayer!!"
      );
    }
    setRapports(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTitre("");
    setLieu("");
    setDateDebut("");
    setDateFin("");
  };

  const handleSubmit = async () => {
    if (!titre || !lieu || !dateDebut) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      const { data: rapport, error: rapportError } = await supabase
        .from("rapports")
        .insert([
          {
            titre,
            lieu,
            dateDebut,
            dateFin: dateFin || null,
            finish: false,
            creator_Id: userId,
          },
        ])
        .select()
        .single();

      if (rapportError) throw rapportError;

      await supabase
        .from("rapportJours")
        .insert([{ date: dateDebut, texte: null, rapport: rapport.id }]);

      Alert.alert("Succès", "Rapport créé !");
      resetForm();
      setFabModalVisible(false);
      fetchRapports(userId);
    } catch (e) {
      Alert.alert("Erreur", e.message);
    }
  };

  // Format date pour affichage
  const formatDateFr = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string" || !dateStr.includes("-"))
      return "Choisir une date";
    const [year, month, day] = dateStr.split("-");
    if (!year || !month || !day) return "Choisir une date";
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: lightColors.background }}>
      <StatusBar
        backgroundColor={lightColors.primary}
        barStyle="light-content"
      />

      <HomeHead
        avatar={avatarUrl}
        router={router}
        totalRapports={rapports.length}
        rapportsTermines={rapports.filter((r) => r.finish).length}
        rapportsEnCours={rapports.filter((r) => !r.finish).length}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <SliderSection images={sliderImages} />

        <Text style={styles.pageTitle}>Mes Rapports</Text>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "ongoing"
                ? styles.filterBtnActive
                : styles.filterBtnInactive,
            ]}
            onPress={() => setFilter("ongoing")}
          >
            <Ionicons
              name="time-outline"
              size={18}
              color={filter === "ongoing" ? "#fff" : lightColors.icon}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterText,
                filter === "ongoing"
                  ? styles.filterTextActive
                  : styles.filterTextInactive,
              ]}
            >
              En cours
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === "finished"
                ? styles.filterBtnActive
                : styles.filterBtnInactive,
            ]}
            onPress={() => setFilter("finished")}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={filter === "finished" ? "#fff" : lightColors.icon}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterText,
                filter === "finished"
                  ? styles.filterTextActive
                  : styles.filterTextInactive,
              ]}
            >
              Terminés
            </Text>
          </TouchableOpacity>
        </View>

        <RapportCards
          rapports={rapports}
          setRapports={setRapports}
          filter={filter}
          rapportImage={rapportImage}
          fetchRapports={fetchRapports}
          userId={userId}
        />
      </ScrollView>

      <TouchableOpacity
        onPress={() => setFabModalVisible(true)}
        style={styles.fabBtn}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal Ajout Rapport */}

      <Modal
        onRequestClose={() => setFabModalVisible(false)}
        visible={fabModalVisible}
        animationType="slide"
        transparent
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View style={styles.overlay}>
            <View style={styles.modal}>
              <KeyboardAwareScrollView
                enableOnAndroid
                keyboardShouldPersistTaps="handled"
                extraScrollHeight={20}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.title}>
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={lightColors.primary}
                  />{" "}
                  Nouveau Rapport
                </Text>

                {/* Champ Titre */}
                <View style={styles.inputRow}>
                  <Ionicons
                    name="text-outline"
                    size={20}
                    color={lightColors.icon}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Titre"
                    placeholderTextColor={lightColors.textSecondary}
                    value={titre}
                    onChangeText={setTitre}
                    style={styles.input}
                  />
                </View>

                {/* Champ Lieu */}
                <View style={styles.inputRow}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={lightColors.icon}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Lieu"
                    placeholderTextColor={lightColors.textSecondary}
                    value={lieu}
                    onChangeText={setLieu}
                    style={styles.input}
                  />
                </View>

                {/* Date début */}
                <Text style={styles.label}>Date de début</Text>
                <View style={styles.dateField}>
                  <TextInput
                    value={dateDebut}
                    placeholder="Choisir une date"
                    placeholderTextColor={lightColors.textSecondary}
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    editable={false}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setDateTarget("debut");
                      openDatePicker();
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

                {/* Date fin */}
                <Text style={[styles.label, { marginTop: 12 }]}>
                  Date de fin (optionnelle)
                </Text>
                <View style={styles.dateField}>
                  <TextInput
                    value={dateFin}
                    placeholder="Choisir une date"
                    placeholderTextColor={lightColors.textSecondary}
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    editable={false}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setDateTarget("fin");
                      openDatePicker();
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

                {/* Bouton Créer */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.buttonText}>Créer</Text>
                </TouchableOpacity>

                {/* Bouton Annuler */}
                <TouchableOpacity
                  onPress={() => {
                    setFabModalVisible(false);
                    resetForm();
                  }}
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close-outline"
                    size={18}
                    color={lightColors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.cancel}>Annuler</Text>
                </TouchableOpacity>
              </KeyboardAwareScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Sélection Date */}
      {datepickModal && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          locale="fr"
          display="default"
          dateFormat="dayofweek day month"
          onChange={handleSetDates}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: lightColors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  filterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    justifyContent: "center",
    gap: 6,
  },
  filterBtnActive: {
    backgroundColor: lightColors.primary,
  },
  filterBtnInactive: {
    backgroundColor: lightColors.border,
  },
  filterText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  filterTextActive: {
    color: "#fff",
  },
  filterTextInactive: {
    color: lightColors.textSecondary,
  },
  fabBtn: {
    position: "absolute",
    right: 20,
    bottom: 24,
    backgroundColor: lightColors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: lightColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    color: lightColors.text,
    textAlign: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: lightColors.text,
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
  button: {
    backgroundColor: lightColors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    marginTop: 18,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 4,
  },
  cancel: {
    color: lightColors.textSecondary,
    fontSize: 15,
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
