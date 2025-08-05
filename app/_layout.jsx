import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import "../global.css";
import { getUserData } from "../services/userService";
import { supabase } from "../src/lib/supabase";

export default function Layout() {
  return (
    <AuthProvider>
      <InnerLayout />
    </AuthProvider>
  );
}

function InnerLayout() {
  const { user, setAuth, setUserData, isLoading, setIsLoading } = useAuth();
  const [userInfos, setUserInfos] = useState([]);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setAuth(session.user);
          await updateUserData(session.user);
        } else {
          setAuth(null);
        }
        setIsLoading(false); // ⛔ attendre que tout soit fini avant d'afficher
      }
    );

    return () => {
      authListener.subscription.unsubscribe(); // nettoyage
    };
  }, []);

  const updateUserData = async (user) => {
    const response = await getUserData(user.id);
    if (response.sucess) {
      setUserData(response.data);
      setUserInfos(response.data);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)" || segments[0] === undefined;

    if (!user && !inAuthGroup) {
      router.replace("/welcome");
    } else if (user && inAuthGroup) {
      router.replace("/(home)");
    }
  }, [user, segments, isLoading]);

  return <Slot screenOptions={{ headerShown: false }} />;
}

// import { Stack, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { AuthProvider, useAuth } from "../contexts/AuthContext";
// import "../global.css";
// import { getUserData } from "../services/userService";
// import { supabase } from "../src/lib/supabase";

// // ✅ RENDS le layout qui INCLUT le AuthProvider
// export default function Layout() {
//   return (
//     <AuthProvider>
//       <InnerLayout />
//     </AuthProvider>
//   );
// }

// function InnerLayout() {
//   const { setAuth, setUserData } = useAuth();
//   const [userInfos, setUserInfos] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     supabase.auth.onAuthStateChange((_event, session) => {
//       console.log("session user : ", session?.user?.id);
//       if (session) {
//         setAuth(session?.user);
//         updateUserData(session?.user);

//         router.push({
//           pathname: "/(home)",
//           params: {
//             userId: session?.user?.id,
//             user: JSON.stringify(session?.user),
//             userinfosLog: userInfos,
//           },
//         });
//       } else {
//         setAuth(null);
//         router.replace("/welcome");
//       }
//     });
//   }, []);

//   const updateUserData = async (user) => {
//     let response = await getUserData(user?.id);
//     console.log("got user data", response);
//     if (response.sucess) {
//       setUserData(response.data);
//       setUserInfos(response.data);
//       console.log("notre user layout", userInfos);
//     }
//   };

//   return <Stack screenOptions={{ headerShown: false }} />;
// }
