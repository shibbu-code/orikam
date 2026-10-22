import api from "./api";

export const getAdminDashboard = () => {
  return api.get("api/admin/dashboard");
};