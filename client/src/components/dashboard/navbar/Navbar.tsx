import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IUserAPI } from "../../../api/users/IUserAPI";
import { useAuth } from "../../../hooks/useAuthHook";
import { UserDTO } from "../../../models/users/UserDTO";

type DashboardNavbarProps = {
  userAPI: IUserAPI;
};

export const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ userAPI }) => {
  const { user: authUser, logout, token } = useAuth();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const serverBase = import.meta.env.VITE_GATEWAY_URL.replace(/\/api\/v1$/, "");

  const resolveImageUrl = (url: string) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `${serverBase}${url}`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (authUser?.id) {
        try {
          const userData = await userAPI.getUserById(token ?? "", authUser.id);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUser();
  }, [authUser, userAPI, token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="titlebar" style={{ height: "60px", borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", position: "sticky", top: 0, zIndex: 1000, backgroundColor: "var(--win11-bg-primary)" }}>
      {/* Navigation Links */}
      <div className="flex items-center gap-4">

        {/* Dashboard
        <button
          onClick={() => navigate("/dashboard")}
          className="btn btn-ghost"
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          Dashboard
        </button> */}

        <button
          onClick={() => navigate("/flights")}
          className="btn btn-ghost"
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          Flights
        </button>
        {authUser?.role !== "ADMIN" && (
        <button
          onClick={() => navigate("/my-flights")}
          className="btn btn-ghost"
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          My Flights
        </button>
        )}
        {authUser?.role !== "ADMIN" && (
        <button
          onClick={() => navigate("/profile")}
          className="btn btn-ghost"
          style={{ padding: "8px 16px", fontSize: "13px" }}
        >
          My Profile
        </button>
        )}
        {authUser?.role === "ADMIN" && (
          <button
            onClick={() => navigate("/admin/users")}
            className="btn btn-ghost"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Manage Users
          </button>
        )}
        {authUser?.role === "MANAGER" && (
          <button
            onClick={() => navigate("/create-flight")}
            className="btn btn-ghost"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Create Flight
          </button>
        )}
      </div>

      {/* Profil */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="spinner" style={{ width: "20px", height: "20px", borderWidth: "2px" }}></div>
        ) : user ? (
          <>
            {/* PFP */}
            {user.profileImage ? (
              <img
                src={resolveImageUrl(user.profileImage)}
                alt={user.name}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--win11-divider)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--win11-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#000",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* User*/}
            <div className="flex flex-col" style={{ gap: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--win11-text-primary)" }}>
                {user.email}
              </span>
              <span style={{ fontSize: "11px", color: "var(--win11-text-tertiary)" }}>
                {user.role}
              </span>
            </div>

            {/* Logout */}
            <button className="btn btn-ghost" onClick={handleLogout} style={{ padding: "8px 16px" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 2v2H3v8h3v2H2V2h4zm4 3l4 3-4 3V9H6V7h4V5z"/>
              </svg>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};