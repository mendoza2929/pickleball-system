import api from "@/lib/api";


// =====================================================
// GET PROFILE
// =====================================================

export const getMyProfile = async () => {

  const response =
    await api.get(
      "/users/profile"
    );

  return response.data.data;
};


// =====================================================
// UPDATE PROFILE
// =====================================================

export const updateMyProfile = async (
  data: {
    first_name: string;
    last_name: string;
    phone?: string;
  }
) => {

  const response =
    await api.put(
      "/users/profile",
      data
    );

  return response.data.data;
};


// =====================================================
// CHANGE PASSWORD
// =====================================================

export const changeMyPassword = async (
  data: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }
) => {

  const response =
    await api.put(
      "/users/password",
      data
    );

  return response.data;
};