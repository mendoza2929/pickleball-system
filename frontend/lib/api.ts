import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


/**
 * Attach access token to authenticated requests.
 */
api.interceptors.request.use(
  (config) => {

    if (typeof window !== "undefined") {

      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


export default api;