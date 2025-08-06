import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AudiosSection from "../../components/audiosSection";
import CustomHeader from "../../components/customHeader";
import HeaderRapport from "../../components/headerRapport";
import ImagesSection from "../../components/imagesSection";
import JoursSelector from "../../components/joursSelector";
import TabsRow from "../../components/tabsRow";
import TexteSection from "../../components/texteSection";
import { supabase } from "../../src/lib/supabase";
import lightColors from "../../themes/colors";

export default function RapportDetails() {
  const router = useRouter();
  const { id, titre, dateDebut, dateFin, lieu, finish } =
    useLocalSearchParams();

  const [jours, setJours] = useState([]);
  const [selectedJour, setSelectedJour] = useState(null);
  const [activeTab, setActiveTab] = useState("Texte");
  const [texte, setTexte] = useState("");
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [refreshAudiosTrigger, setRefreshAudiosTrigger] = useState(0);

  // Ajout d'une ref pour le ScrollView
  const scrollRef = useRef();

  // Ajout d'une ref pour le TextInput
  const texteInputRef = useRef();

  useEffect(() => {
    fetchJours();
  }, []);
  useEffect(() => {
    if (selectedJour) {
      fetchImages();
    }
  }, [selectedJour]);

  const fetchJours = async () => {
    const { data, error } = await supabase
      .from("rapportJours")
      .select("*")
      .eq("rapport", id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Erreur fetch jours:", error);
      return;
    }

    setJours(data);
    if (data.length > 0) {
      setSelectedJour(data[0]);
      setTexte(data[0].texte || "");
    }
  };

  const handleAddJour = async (date) => {
    if (!date) return;

    const { data, error } = await supabase
      .from("rapportJours")
      .insert([{ date: date, rapport: id }])
      .select();

    if (error) {
      console.log("Erreur création:", error);
    } else {
      await fetchJours();
      if (data && data.length > 0) {
        setSelectedJour(data[0]);
        setTexte(data[0].texte || "");
      }
      //setModalVisible(false);
      setDate("");
    }
  };

  const handleUpdateJour = async (newDate) => {
    if (!newDate || !selectedJour) return;

    const { data, error } = await supabase
      .from("rapportJours")
      .update({ date: newDate })
      .eq("id", selectedJour.id)
      .select();

    if (error) {
      console.log("Erreur update:", error);
    } else {
      await fetchJours();
      if (data && data.length > 0) {
        setSelectedJour(data[0]);
      }
      setModalVisible(false);
    }
  };

  const handleDeleteJour = async () => {
    if (!selectedJour) return;

    const { error } = await supabase
      .from("rapportJours")
      .delete()
      .eq("id", selectedJour.id);

    if (error) {
      console.log("Erreur suppression:", error);
    } else {
      await fetchJours();
      if (jours.length > 1) {
        setSelectedJour(jours[0]);
        setTexte(jours[0].texte || "");
      } else {
        setSelectedJour(null);
        setTexte("");
      }
      setModalVisible(false);
    }
  };

  const handleTexteChange = (newText) => {
    setTexte(newText);
    setIsModified(newText !== (selectedJour?.texte || ""));
  };

  const updateJourTexte = async () => {
    if (!selectedJour) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("rapportJours")
      .update({ texte: texte })
      .eq("id", selectedJour.id);

    if (error) {
      console.error("Erreur update texte:", error);
      setIsSaving(false);
      return;
    }

    setJours((prev) =>
      prev.map((j) => (j.id === selectedJour.id ? { ...j, texte: texte } : j))
    );
    setSelectedJour((prev) => ({ ...prev, texte: texte }));
    setIsModified(false);
    setIsSaving(false);
  };

  const fetchImages = async () => {
    if (!selectedJour) return;

    const { data, error } = await supabase
      .from("jour_images")
      .select("*")
      .eq("jour", selectedJour.id)
      .order("id", { ascending: false });

    if (error) {
      console.log("Erreur fetch images:", error);
      return;
    }

    setImages(data || []);
  };

  // --------------------------------
  // 📸 Fonction pour FAB upload rapide
  // --------------------------------
  const pickAndUploadImages = async () => {
    if (!selectedJour) {
      Alert.alert(
        "Aucun jour sélectionné",
        "Veuillez sélectionner un jour d'abord."
      );
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Accès à la galerie est nécessaire");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (result.canceled) return;

    const assets = result.assets || [];

    // Limite max 7 images
    if (assets.length > 7) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez ajouter que 7 images maximum."
      );
      return;
    }

    try {
      const uploadPromises = assets.map(async (asset) => {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const buffer = decode(base64);
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("jour-images")
          .upload(fileName, buffer, {
            contentType: "image/jpeg",
          });

        if (uploadError) {
          console.log("Erreur upload:", uploadError);
          return;
        }

        const publicUrl = supabase.storage
          .from("jour-images")
          .getPublicUrl(fileName).data.publicUrl;

        const { error: insertError } = await supabase
          .from("jour_images")
          .insert({ url: publicUrl, jour: selectedJour.id });

        if (insertError) {
          console.log("Erreur insert DB:", insertError);
        }
      });

      await Promise.all(uploadPromises);
      fetchImages();
    } catch (e) {
      console.log("Exception complète:", e);
      Alert.alert("Erreur", JSON.stringify(e));
    }
  };

  // --------------------------------
  // 🎤 Fonction pour enregistrer un audio
  // --------------------------------

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission requise", "Tu dois autoriser le micro !");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.log("Erreur start recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      await uploadAudio(uri);
    } catch (error) {
      console.log("Erreur stop recording:", error);
    }
  };

  const uploadAudio = async (uri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileName = `${Date.now()}.m4a`;

      const { error: uploadError } = await supabase.storage
        .from("jour-audios")
        .upload(fileName, decode(base64), {
          contentType: "audio/m4a",
        });

      if (uploadError) {
        console.log("Upload error:", uploadError);
        Alert.alert("Erreur", "L'audio n'a pas pu être uploadé.");
        return;
      }

      const publicUrl = supabase.storage
        .from("jour-audios")
        .getPublicUrl(fileName).data.publicUrl;

      const { error: insertError } = await supabase
        .from("jour_audios")
        .insert({ url: publicUrl, jour: selectedJour.id });

      if (insertError) {
        console.log("Insert error:", insertError);
        Alert.alert("Erreur", "Impossible d'enregistrer l'audio en base.");
      } else {
        setRefreshAudiosTrigger(Math.random());
      }
    } catch (error) {
      console.log("Erreur globale upload:", error);
      Alert.alert("Erreur", "Une erreur est survenue.");
    }
  };

  // Fonction pour scroll automatiquement au TextInput quand il est focus
  const handleFocusTexte = () => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: lightColors.background }}>
      <StatusBar
        backgroundColor={lightColors.primary}
        barStyle="light-content"
      />
      <CustomHeader title="Détails du rapport" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20} // espace supplémentaire
        keyboardOpeningTime={0}
        showsVerticalScrollIndicator={false}
      >
        <HeaderRapport
          navigation={router}
          id={id}
          titre={titre}
          lieu={lieu}
          dateDebut={dateDebut}
          dateFin={dateFin}
          finish={finish}
        />

        <JoursSelector
          jours={jours}
          selectedJour={selectedJour}
          setSelectedJour={(jour) => {
            setSelectedJour(jour);
            setTexte(jour.texte || "");
            setIsModified(false);
          }}
          handleAddJour={handleAddJour}
          handleUpdateJour={handleUpdateJour}
          handleDeleteJour={handleDeleteJour}
        />

        <TabsRow activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "Texte" && (
          <TexteSection
            texte={texte}
            handleTexteChange={handleTexteChange}
            isModified={isModified}
            isSaving={isSaving}
            updateJourTexte={updateJourTexte}
            inputRef={texteInputRef}
            onFocus={handleFocusTexte}
          />
        )}
        {activeTab === "Images" && (
          <ImagesSection
            images={images}
            fetchImages={fetchImages}
            selectedJour={selectedJour}
          />
        )}
        {activeTab === "Audios" && (
          <AudiosSection
            selectedJour={selectedJour}
            refreshTrigger={refreshAudiosTrigger}
          />
        )}
        {/* </ScrollView> */}
      </KeyboardAwareScrollView>
      {/* Modal image plein écran */}
      <Modal
        visible={!!selectedImage}
        transparent
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedImage(null)}>
          <View style={styles.fullImageOverlay}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* FAB pour images */}
      {activeTab === "Images" && (
        <View style={styles.fabWrapper}>
          <TouchableOpacity style={styles.fab} onPress={pickAndUploadImages}>
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      {/* FAB pour audios */}
      {activeTab === "Audios" && (
        <View style={styles.fabWrapper}>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            style={[
              styles.fab,
              {
                backgroundColor: isRecording ? "#ff6b6b" : lightColors.primary,
              },
            ]}
          >
            <Ionicons
              name={isRecording ? "stop-circle-outline" : "mic-outline"}
              size={28}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    //paddingHorizontal: 20,
    paddingBottom: 100,
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "92%",
    height: "80%",
    borderRadius: 18,
    backgroundColor: "#fff",
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
  fabWrapper: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: lightColors.primary,
    elevation: 4,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  datePicker: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: "#FFCCCB",
    alignItems: "center",
  },
  saveButton: {
    marginTop: 18,
    padding: 10,
    borderRadius: 8,
    backgroundColor: lightColors.background,
    alignItems: "center",
    width: "50%",
  },
});
