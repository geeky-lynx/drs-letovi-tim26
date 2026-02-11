import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FlightsAPI } from "../api/flights/FlightsAPI";
import { AirlinesAPI } from "../api/airlines/AirlinesAPI";
import { AirlineDTO } from "../models/flights/AirlineDTO";
import { CreateFlightDTO } from "../models/flights/FlightDTO";
import { useAuth } from "../hooks/useAuthHook";

const flightsAPI = new FlightsAPI();
const airlinesAPI = new AirlinesAPI();

export const FlightCreationPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [airlines, setAirlines] = useState<AirlineDTO[]>([]);
  const [loadingAirlines, setLoadingAirlines] = useState(true);
  const [formData, setFormData] = useState<CreateFlightDTO>({
    name: "",
    airline_id: 0,
    distance_km: 0,
    duration_minutes: 0,
    departure_time: "",
    departure_airport: "",
    arrival_airport: "",
    ticket_price: 0,
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchAirlines = async () => {
      try {
        const data = await airlinesAPI.getAllAirlines();
        setAirlines(data);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load airlines");
      } finally {
        setLoadingAirlines(false);
      }
    };
    fetchAirlines();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "airline_id" ||
        name === "distance_km" ||
        name === "duration_minutes" ||
        name === "ticket_price"
          ? Number(value)
          : value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Flight name is required");
      return;
    }
    if (formData.airline_id === 0) {
      setError("Please select an airline");
      return;
    }
    if (formData.distance_km <= 0) {
      setError("Distance must be greater than 0");
      return;
    }
    if (formData.duration_minutes <= 0) {
      setError("Duration must be greater than 0");
      return;
    }
    if (!formData.departure_time) {
      setError("Departure time is required");
      return;
    }
    if (!formData.departure_airport.trim()) {
      setError("Departure airport is required");
      return;
    }
    if (!formData.arrival_airport.trim()) {
      setError("Arrival airport is required");
      return;
    }
    if (formData.ticket_price <= 0) {
      setError("Ticket price must be greater than 0");
      return;
    }

    try {
      setCreating(true);
      const departureDateTime = new Date(formData.departure_time)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      const flightData: CreateFlightDTO = {
        ...formData,
        departure_time: departureDateTime,
      };

      await flightsAPI.createFlight(token!, flightData);
      setSuccess("Flight created successfully!");
      setTimeout(() => {
        navigate("/flights");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create flight");
    } finally {
      setCreating(false);
    }
  };

  if (loadingAirlines) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--win11-bg)",
        }}
      >
        Loading airlines...
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
          width: "600px",
          maxWidth: "92vw",
          padding: "32px 28px",
          borderRadius: "16px",
          background: "var(--win11-card-bg)",
          border: "1px solid var(--win11-divider)",
          boxShadow: "var(--win11-shadow-medium)",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "600",
            marginBottom: "24px",
            textAlign: "center",
            color: "var(--win11-text-primary)",
          }}
        >
          Create New Flight
        </h1>

        {error && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "8px",
              color: "#22c55e",
              textAlign: "center",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              columnGap: "20px",
              rowGap: "18px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Flight Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., AA123"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Airline
              </label>
              <select
                name="airline_id"
                value={formData.airline_id}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              >
                <option value={0}>Select an airline...</option>
                {airlines.map((airline) => (
                  <option key={airline.id} value={airline.id}>
                    {airline.name} ({airline.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Departure Airport
              </label>
              <input
                type="text"
                name="departure_airport"
                value={formData.departure_airport}
                onChange={handleInputChange}
                placeholder="e.g., JFK"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Arrival Airport
              </label>
              <input
                type="text"
                name="arrival_airport"
                value={formData.arrival_airport}
                onChange={handleInputChange}
                placeholder="e.g., LAX"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Distance (km)
              </label>
              <input
                type="number"
                name="distance_km"
                value={formData.distance_km || ""}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration_minutes"
                value={formData.duration_minutes || ""}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Departure Time
              </label>
              <input
                type="datetime-local"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  marginBottom: "6px",
                  color: "var(--win11-text-primary)",
                }}
              >
                Ticket Price ($)
              </label>
              <input
                type="number"
                name="ticket_price"
                value={formData.ticket_price || ""}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid var(--win11-divider)",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "var(--win11-text-primary)",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: "28px", display: "flex", gap: "12px" }}>
            <button
              type="submit"
              disabled={creating}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: creating
                  ? "rgba(96, 205, 255, 0.5)"
                  : "rgba(96, 205, 255, 0.8)",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: creating ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!creating)
                  e.currentTarget.style.background = "rgba(96, 205, 255, 1)";
              }}
              onMouseLeave={(e) => {
                if (!creating)
                  e.currentTarget.style.background = "rgba(96, 205, 255, 0.8)";
              }}
            >
              {creating ? "Creating..." : "Create Flight"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/flights")}
              disabled={creating}
              style={{
                flex: 1,
                padding: "12px 24px",
                background: "rgba(107, 114, 128, 0.8)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: creating ? "not-allowed" : "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!creating)
                  e.currentTarget.style.background = "rgba(107, 114, 128, 1)";
              }}
              onMouseLeave={(e) => {
                if (!creating)
                  e.currentTarget.style.background = "rgba(107, 114, 128, 0.8)";
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
