import { Image, Text, TouchableOpacity, View } from "react-native";
export default function HomeHead({
  avatar,
  router,
  totalRapports,
  rapportsTermines,
  rapportsEnCours,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 38,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: "#E7F0FD",
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        elevation: 2,
        shadowColor: "#6495ED",
        shadowOpacity: 0.07,
        shadowRadius: 6,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#6495ED",
          letterSpacing: 1,
        }}
      >
        Dalyo
      </Text>
      <TouchableOpacity
        onPress={() => {
          router.push({
            pathname: "/profile",
            params: {
              totalRapports: totalRapports,
              rapportsTermines: rapportsTermines,
              rapportsEnCours: rapportsEnCours,
            },
          });
        }}
        style={{
          borderRadius: 16,
          backgroundColor: "#fff",
          padding: 4,
          elevation: 2,
          shadowColor: "#6495ED",
          shadowOpacity: 0.08,
          shadowRadius: 4,
        }}
      >
        <Image
          source={avatar}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: "#6495ED",
          }}
        />
      </TouchableOpacity>
    </View>
  );
}
