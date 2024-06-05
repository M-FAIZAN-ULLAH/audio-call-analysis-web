import axiosClient from "./axiosClient";

// Login Signup

export const Register = async (username, email) => {
  try {
    const response = await axiosClient.post("/register", { username, email });

    return response.data; // Return the response data from the backend
  } catch (error) {
    console.error("Error registering:", error);
    throw error; // Re-throw the error for handling in the register module
  }
};

export const LoginUser = async ({ email, password }) => {
  try {
    const res = await axiosClient.post("/login", { email, password });
    return res;
  } catch (err) {
    console.error("Error Login:", err);
    throw err; // Re-throw the error for handling in the register module
  }
};

// Analysis

export const Analysis = async (url) => {
  try {
    const res = await axiosClient.post("/analysis", { url });
    return res.data;
  } catch (err) {
    console.error("Error Login:", err);
    throw err; // Re-throw the error for handling in the register module
  }
};
