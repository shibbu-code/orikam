import axios from "axios";

const api = axios.create({
  baseURL: "https://orikam-2.onrender.com/api",
});

export default api;