import { supabase } from "../src/lib/supabase";

export const getUserData = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { sucess: false, msg: error.message };
    }
    return { sucess: true, data };
  } catch (error) {
    console.log("got error :", error);
    return { sucess: false, msg: error.message };
  }
};
