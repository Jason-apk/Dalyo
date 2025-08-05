import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import lightColors from "../themes/colors";

export default function AudioCard({ audioUri, onDelete, title, style }) {
  const sound = useRef(new Audio.Sound());
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        await sound.current.loadAsync({ uri: audioUri }, {}, false);
        const status = await sound.current.getStatusAsync();
        if (status.isLoaded) setDurationMillis(status.durationMillis || 1);

        sound.current.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPositionMillis(status.positionMillis);
            setDurationMillis(status.durationMillis || 1);
            setIsPlaying(status.isPlaying);
          }
        });
      } catch (e) {
        console.error("Erreur chargement audio:", e);
      }
    })();

    return () => {
      sound.current.unloadAsync();
    };
  }, [audioUri]);

  const onPlayPause = async () => {
    try {
      const status = await sound.current.getStatusAsync();
      if (status.isPlaying) {
        await sound.current.pauseAsync();
      } else {
        await sound.current.playAsync();
      }
    } catch (e) {
      console.error("Erreur play/pause:", e);
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const confirmDelete = () => {
    Alert.alert(
      "Supprimer l'audio",
      "Voulez-vous vraiment supprimer cet audio ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: onDelete },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.card, style]}>
      <TouchableOpacity
        onPress={onPlayPause}
        style={styles.playButton}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={28}
          color={lightColors.primary}
          style={styles.playIcon}
        />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.timer}>
          {formatTime(positionMillis)} / {formatTime(durationMillis)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={confirmDelete}
        style={styles.deleteButton}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={24} color="#ff5555" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: lightColors.card,
    padding: 14,
    borderRadius: 14,
    marginVertical: 8,
    shadowColor: lightColors.primary,
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  playButton: {
    marginRight: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 24,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    marginLeft: 2,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 2,
  },
  title: {
    color: lightColors.text,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  timer: {
    color: lightColors.textSecondary,
    fontSize: 14,
  },
  deleteButton: {
    marginLeft: 15,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
});
