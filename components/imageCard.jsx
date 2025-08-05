import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ImageCard({ imageUrl, onDelete }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="mr-3 relative">
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={{ uri: imageUrl }} className="w-36 h-36 rounded-lg" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onDelete}
        className="absolute top-2 right-2 bg-red-500 p-1 rounded-full"
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
            }}
            maximumZoomScale={4}
            minimumZoomScale={1}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{ width: width * 0.9, height: height * 0.8 }}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
