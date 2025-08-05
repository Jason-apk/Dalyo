import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../../components/customHeader";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../src/lib/supabase";
import lightColors from "../../themes/colors";

export default function ProfilePage() {
  const { setAuth, user } = useAuth();
  const router = useRouter();

  // Protection anti-crash si user === null
  useEffect(() => {
    if (!user) {
      router.replace("/welcome");
    }
  }, [user]);

  useEffect(() => {
    if (user?.avatar) {
      setProfilAvatar({ uri: user.avatar });
    } else {
      setProfilAvatar(require("../../assets/images/avatar.webp"));
    }
  }, [user?.avatar]);

  const { totalRapports, rapportsEnCours, rapportsTermines } =
    useLocalSearchParams();

  const [modalVisible, setModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [profilAvatar, setProfilAvatar] = useState();
  const [loading, setLoading] = useState(false);
  const nom = user.nom;
  const filiere = user.filiere;
  const email = user.email;

  async function handleChangeAvatar() {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission requise", "Autorisez l'accès à la galerie !");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        allowsEditing: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const buffer = decode(base64);
      const fileName = `${Date.now()}_${user.id}.jpg`;

      const { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("avatar")
        .eq("id", user.id)
        .single();

      if (fetchError) throw fetchError;

      const oldAvatarUrl = userData?.avatar;
      const oldPath = oldAvatarUrl?.split(
        "/storage/v1/object/public/avatars/"
      )[1];

      if (oldPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("users")
        .update({ avatar: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfilAvatar({ uri: publicUrl });

      Alert.alert("Succès", "Avatar mis à jour !");
    } catch (e) {
      console.log("Erreur changement avatar :", e);
      Alert.alert("Erreur", e.message || "Impossible de changer l'avatar.");
    }
  }

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Erreur", "Tous les champs sont requis.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit faire au moins 6 caractères."
      );
      return;
    }

    try {
      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });

      if (loginError) {
        Alert.alert("Erreur", "Mot de passe actuel incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert("Succès", "Mot de passe mis à jour !");
      setModalVisible(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (e) {
      console.log("Erreur mot de passe :", e);
      Alert.alert(
        "Erreur",
        e.message || "Impossible de changer le mot de passe."
      );
    }
  };

  const onLogout = async () => {
    setLoading(true);
    router.replace("/welcome");
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Erreur de déconnexion", error.message);
      setLoading(false);
      return;
    }
    return (setAuth(null), setLoading(false));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6495ED" />
      </View>
    );
  }

  if (!user) return null; // ou return un écran vide ou un loader
  return (
    <>
      <CustomHeader title="Mon Profil" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarWrapper}>
          <Image source={profilAvatar} style={styles.avatar} />
          <TouchableOpacity
            onPress={handleChangeAvatar}
            style={styles.cameraIcon}
          >
            <Ionicons name="camera" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{nom}</Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.field}>{filiere}</Text>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color={lightColors.primary}
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.statNumber}>{totalRapports}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="checkmark-done-outline"
              size={22}
              color="#4ade80"
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.statNumber}>{rapportsTermines}</Text>
            <Text style={styles.statLabel}>Terminés</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons
              name="time-outline"
              size={22}
              color="#fbbf24"
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.statNumber}>{rapportsEnCours}</Text>
            <Text style={styles.statLabel}>En cours</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.rowButton}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={lightColors.primary}
          />
          <Text style={styles.rowText}>À propos</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={lightColors.border}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rowButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color={lightColors.primary}
          />
          <Text style={styles.rowText}>Changer le mot de passe</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={lightColors.border}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* Modal changer mot de passe */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Changer le mot de passe</Text>

              <TextInput
                placeholder="Ancien mot de passe"
                placeholderTextColor={lightColors.textSecondary}
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Nouveau mot de passe"
                placeholderTextColor={lightColors.textSecondary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />
              <TextInput
                placeholder="Confirmer le nouveau"
                placeholderTextColor={lightColors.textSecondary}
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={handleChangePassword}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Valider</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: "center",
    backgroundColor: lightColors.background,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: lightColors.primary,
    backgroundColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: lightColors.primary,
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
    color: lightColors.text,
  },
  field: {
    fontSize: 16,
    color: lightColors.textSecondary,
    marginBottom: 20,
  },
  email: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    width: "100%",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: lightColors.card,
    paddingVertical: 18,
    marginHorizontal: 5,
    borderRadius: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    gap: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: lightColors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: lightColors.textSecondary,
    marginTop: 2,
  },
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: lightColors.card,
    padding: 15,
    borderRadius: 12,
    width: "100%",
    marginBottom: 15,
    elevation: 1,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  rowText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: lightColors.text,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    width: "100%",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#ff6b6b",
    elevation: 2,
    shadowColor: "#ff6b6b",
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 22,
    width: "90%",
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
  input: {
    color: lightColors.text,
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: lightColors.card,
  },

  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: lightColors.primary,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelText: {
    color: "#555",
    textAlign: "center",
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
