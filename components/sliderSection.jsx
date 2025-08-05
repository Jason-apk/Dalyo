import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import lightColors from "../themes/colors";

const screenWidth = Dimensions.get("window").width;

export default function SliderSection({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Changement automatique toutes les 3s avec fondu
  useEffect(() => {
    if (!images || images.length === 0) return;
    const interval = setInterval(() => {
      // Démarre le fondu
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        const nextIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(nextIndex);
        // Ramène l'opacité à 1 pour la nouvelle image
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, images, fadeAnim]);

  return (
    <View style={{ marginTop: 10, alignItems: "center" }}>
      <View style={styles.imageWrapper}>
        <Animated.Image
          source={images[currentIndex]}
          style={[styles.image, { opacity: fadeAnim }]}
          resizeMode="cover"
        />
        {/* Dots en overlay */}
        <View style={styles.dotsOverlay}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                currentIndex === idx ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: screenWidth,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: screenWidth * 0.92,
    height: 180,
    borderRadius: 18,
  },
  dotsOverlay: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: lightColors.card,
  },
  dotActive: {
    backgroundColor: lightColors.primary,
  },
  dotInactive: {
    backgroundColor: lightColors.border,
  },
});
