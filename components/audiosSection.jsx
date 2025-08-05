import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AudioCard from "../components/audioCard";
import { supabase } from "../src/lib/supabase";
import lightColors from "../themes/colors";

export default function AudiosSection({ selectedJour, refreshTrigger }) {
  const [audios, setAudios] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedJour) {
      fetchAudios();
    }
  }, [selectedJour, refreshTrigger]);

  const fetchAudios = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("jour_audios")
      .select("*")
      .eq("jour", selectedJour.id)
      .order("id", { ascending: false });

    if (error) {
      console.log("Erreur fetch audios:", error);
    } else {
      setAudios(data || []);
    }

    setLoading(false);
  };

  const deleteAudio = async (item) => {
    setLoading(true);
    try {
      const fileName = item.url.split("/").pop().split("?")[0];
      const { error: removeError } = await supabase.storage
        .from("jour-audios")
        .remove([fileName]);
      if (removeError) {
        // Optionally show error
      }

      const { error: deleteError } = await supabase
        .from("jour_audios")
        .delete()
        .eq("id", item.id);

      if (!deleteError) {
        fetchAudios();
      }
    } catch (error) {
      console.log("Erreur suppression audio:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Audios associés</Text>

      {loading && (
        <ActivityIndicator
          size="large"
          color={lightColors.primary}
          style={{ marginTop: 10 }}
        />
      )}

      {audios.length === 0 && !loading && (
        <Text style={styles.emptyText}>Aucun audio pour ce jour.</Text>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {audios.map((item, index) => (
          <AudioCard
            key={item.id}
            audioUri={item.url}
            title={`Enregistrement ${index + 1}`}
            onDelete={() => deleteAudio(item)}
            style={styles.audioCard}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 10,
    color: lightColors.text,
  },
  emptyText: {
    color: lightColors.textSecondary,
    textAlign: "center",
    marginVertical: 18,
    fontSize: 15,
  },
  audioCard: {
    marginBottom: 14,
  },
});
