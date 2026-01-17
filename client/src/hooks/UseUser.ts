import { api } from "../helpers/Api";
import { UserRole } from "../enums/UserRole";

export const useUsers = () => {
  const getAllUsers = async () => {
    const res = await api.get("/users");
    return res.data;
  };

  const deleteUser = async (id: string) => {
    await api.delete(`/users/${id}`);
  };

  const changeRole = async (id: string, role: UserRole) => {
    await api.put(`/users/${id}/role`, { role });
  };

  return {
    getAllUsers,
    deleteUser,
    changeRole,
  };
};