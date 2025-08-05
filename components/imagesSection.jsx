import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ImageCard from "../components/imageCard";
import { supabase } from "../src/lib/supabase";
import lightColors from "../themes/colors";

const screenWidth = Dimensions.get("window").width;

export default function ImagesSection({ selectedJour, fetchImages, images }) {
  const [loading, setLoading] = useState(false);

  const deleteImage = async (item) => {
    setLoading(true);
    const fileName = item.url.split("/").pop().split("?")[0];

    const { error: removeError } = await supabase.storage
      .from("jour-images")
      .remove([fileName]);

    if (removeError) {
      console.log("Erreur suppression storage:", removeError);
    }

    const { error: deleteError } = await supabase
      .from("jour_images")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      console.log("Erreur suppression DB:", deleteError);
    }

    await fetchImages();
    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Images associées</Text>

      {loading && (
        <ActivityIndicator
          size="large"
          color={lightColors.primary}
          style={{ marginVertical: 20 }}
        />
      )}

      {images.length === 0 && !loading && (
        <Text style={styles.emptyText}>Aucune image pour ce jour.</Text>
      )}

      <FlatList
        data={images}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 10 }}
        renderItem={({ item }) => (
          <ImageCard
            imageUrl={item.url}
            onDelete={() => deleteImage(item)}
            style={{
              width: (screenWidth - 56) / 2,
              height: 160,
              borderRadius: 14,
              marginBottom: 16,
              marginRight: 12,
            }}
          />
        )}
      />
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
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
});
