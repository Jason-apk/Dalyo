import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { AppState } from "react-native";
import "react-native-url-polyfill/auto";
import { supabaseAnonKey, supabaseUrl } from "../../constants/index";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// import { createClient, processLock } from "@supabase/supabase-js";
// import { supabaseAnonKey, supabaseUrl } from "../../constants/index";

// // Détection de la plateforme
// const isWeb = typeof window !== "undefined";

// // Storage adapté selon la plateforme
// let storage;
// if (isWeb) {
//   // Sur le web, utiliser localStorage natif
//   storage = window.localStorage;
// } else {
//   // Sur mobile natif, utiliser AsyncStorage
//   // Import dynamique pour éviter l’erreur sur le web
//   const AsyncStorage =
//     require("@react-native-async-storage/async-storage").default;
//   storage = AsyncStorage;
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: isWeb, // true sur web, false sur natif
//     lock: processLock,
//   },
// });

// // Gestion du refresh automatique de session (mobile natif uniquement)
// if (!isWeb) {
//   const { AppState } = require("react-native");
//   AppState.addEventListener("change", (state) => {
//     if (state === "active") {
//       supabase.auth.startAutoRefresh();
//     } else {
//       supabase.auth.stopAutoRefresh();
//     }
//   });
// }
