import React, { useEffect, useState } from "react";
import type { UserDTO } from "../models/users/UserDTO";
import { UserAPI } from "../api/users/UserAPI";
import { useAuth } from "../hooks/useAuthHook";
import { useNavigate } from "react-router-dom";

const userAPI = new UserAPI();

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [token, user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const fetchedUsers = await userAPI.getAllUsers(token!);
      setUsers(fetchedUsers);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await userAPI.deleteUser(token!, userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to delete user");
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      const updatedUser = await userAPI.updateUserRole(token!, userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
      setEditingUserId(null);
      setSelectedRole("");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading users...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
        background: "var(--win11-bg)",
      }}
    >
      <div
        style={{
          width: "90vw",
          maxWidth: "1000px",
          padding: "32px 28px",
          borderRadius: "16px",
          background: "var(--win11-card-bg)",
          border: "1px solid var(--win11-divider)",
          boxShadow: "var(--win11-shadow-medium)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "var(--win11-text-primary)",
            textAlign: "center",
          }}
        >
          Manage Users
        </h1>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              background: "rgba(220, 38, 38, 0.2)",
              border: "1px solid rgba(220, 38, 38, 0.5)",
              borderRadius: "8px",
              color: "#fca5a5",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            overflowX: "auto",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            border: "1px solid var(--win11-divider)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderBottom: "1px solid var(--win11-divider)",
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "var(--win11-text-primary)",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "var(--win11-text-primary)",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "var(--win11-text-primary)",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "var(--win11-text-primary)",
                  }}
                >
                  Role
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "var(--win11-text-primary)",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr
                  key={userItem.id}
                  style={{
                    borderBottom: "1px solid var(--win11-divider)",
                    background: "rgba(255, 255, 255, 0.02)",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.06)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.02)")
                  }
                >
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--win11-text-primary)",
                    }}
                  >
                    {userItem.id}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--win11-text-primary)",
                    }}
                  >
                    {userItem.name} {userItem.lastName}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--win11-text-primary)",
                    }}
                  >
                    {userItem.email}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "var(--win11-text-primary)",
                    }}
                  >
                    {editingUserId === userItem.id ? (
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid var(--win11-divider)",
                          borderRadius: "4px",
                          background: "rgba(255, 255, 255, 0.05)",
                          color: "var(--win11-text-primary)",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select role...</option>
                        <option value="USER">USER</option>
                        <option value="MANAGER">MANAGER</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          padding: "4px 8px",
                          background: "rgba(96, 205, 255, 0.2)",
                          color: "var(--win11-accent)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        {userItem.role}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {editingUserId === userItem.id ? (
                      <>
                        <button
                          onClick={() =>
                            handleChangeRole(userItem.id, selectedRole)
                          }
                          style={{
                            padding: "6px 12px",
                            background: "rgba(34, 197, 94, 0.8)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(34, 197, 94, 1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(34, 197, 94, 0.8)")
                          }
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingUserId(null)}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(107, 114, 128, 0.8)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(107, 114, 128, 1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(107, 114, 128, 0.8)")
                          }
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingUserId(userItem.id);
                            setSelectedRole(userItem.role);
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(96, 205, 255, 0.8)",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(96, 205, 255, 1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(96, 205, 255, 0.8)")
                          }
                        >
                          Edit Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          style={{
                            padding: "6px 12px",
                            background: "rgba(239, 68, 68, 0.8)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(239, 68, 68, 1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(239, 68, 68, 0.8)")
                          }
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && !error && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "var(--win11-text-tertiary)",
            }}
          >
            No users found
          </div>
        )}
      </div>
    </div>
  );
};
