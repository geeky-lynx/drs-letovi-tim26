import React, { useEffect, useState } from "react";
import { FlightsAPI } from "../api/flights/FlightsAPI";
import { FlightDTO } from "../models/flights/FlightDTO";

const flightsAPI = new FlightsAPI();

const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

const calculateTimeRemaining = (departureTime: string, durationMinutes: number): string => {
  const departure = new Date(departureTime);
  const landing = new Date(departure.getTime() + durationMinutes * 60000);
  const now = new Date();
  const remaining = landing.getTime() - now.getTime();

  if (remaining <= 0) return "Landed";

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
};

type FlightTab = "upcoming" | "ongoing" | "past";

const FlightsPage: React.FC = () => {
  const [flights, setFlights] = useState<FlightDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FlightTab>("upcoming");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let mounted = true;
    const fetchFlights = async () => {
      try {
        const data = await flightsAPI.getAllFlights();
        if (mounted) setFlights(data || []);
      } catch (err: any) {
        if (mounted) setError(err?.message || "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFlights();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const categorizeFlights = () => {
    const now = currentTime;
    const upcoming: FlightDTO[] = [];
    const ongoing: FlightDTO[] = [];
    const past: FlightDTO[] = [];

    flights.forEach((flight) => {
      const departure = new Date(flight.departure_time);
      const landing = new Date(departure.getTime() + flight.duration_minutes * 60000);

      if (now < departure) {
        upcoming.push(flight);
      } else if (now >= departure && now < landing) {
        ongoing.push(flight);
      } else {
        past.push(flight);
      }
    });

    return { upcoming, ongoing, past };
  };

  const { upcoming, ongoing, past } = categorizeFlights();
  const displayFlights = activeTab === "upcoming" ? upcoming : activeTab === "ongoing" ? ongoing : past;

  if (loading) {
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
        Loading flights...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--win11-bg)",
          color: "#ef4444",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        background: "var(--win11-bg)",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "600",
            marginBottom: "32px",
            color: "var(--win11-text-primary)",
          }}
        >
          Flights
        </h1>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "24px",
            borderBottom: "1px solid var(--win11-divider)",
          }}
        >
          <button
            onClick={() => setActiveTab("upcoming")}
            style={{
              padding: "12px 24px",
              background: activeTab === "upcoming" ? "rgba(96, 205, 255, 0.15)" : "transparent",
              color: activeTab === "upcoming" ? "var(--win11-accent)" : "var(--win11-text-secondary)",
              border: "none",
              borderBottom: activeTab === "upcoming" ? "2px solid var(--win11-accent)" : "2px solid transparent",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("ongoing")}
            style={{
              padding: "12px 24px",
              background: activeTab === "ongoing" ? "rgba(96, 205, 255, 0.15)" : "transparent",
              color: activeTab === "ongoing" ? "var(--win11-accent)" : "var(--win11-text-secondary)",
              border: "none",
              borderBottom: activeTab === "ongoing" ? "2px solid var(--win11-accent)" : "2px solid transparent",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Ongoing ({ongoing.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            style={{
              padding: "12px 24px",
              background: activeTab === "past" ? "rgba(96, 205, 255, 0.15)" : "transparent",
              color: activeTab === "past" ? "var(--win11-accent)" : "var(--win11-text-secondary)",
              border: "none",
              borderBottom: activeTab === "past" ? "2px solid var(--win11-accent)" : "2px solid transparent",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Past ({past.length})
          </button>
        </div>

        <div
          style={{
            background: "var(--win11-card-bg)",
            border: "1px solid var(--win11-divider)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "var(--win11-shadow-medium)",
          }}
        >
          {displayFlights.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "var(--win11-text-secondary)",
              }}
            >
              No {activeTab} flights available.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>ID</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Name</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Airline</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>From</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>To</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Departure</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Duration</th>
                    {activeTab === "ongoing" && (
                      <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Time Remaining</th>
                    )}
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Distance</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Price</th>
                    <th style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "var(--win11-text-secondary)" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayFlights.map((f) => (
                    <tr
                      key={f.id}
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)")}
                    >
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{f.id}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px", fontWeight: "500" }}>{f.name}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{f.airline_name}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{f.departure_airport}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{f.arrival_airport}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{fmtDate(f.departure_time)}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{f.duration_minutes} min</td>
                      {activeTab === "ongoing" && (
                        <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-accent)", fontSize: "14px", fontWeight: "600" }}>
                          {calculateTimeRemaining(f.departure_time, f.duration_minutes)}
                        </td>
                      )}
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>{f.distance_km} km</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", color: "var(--win11-text-primary)", fontSize: "14px" }}>${f.ticket_price.toFixed(2)}</td>
                      <td style={{ border: "1px solid var(--win11-divider)", padding: "12px 16px", fontSize: "14px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              f.status === "APPROVED"
                                ? "rgba(34, 197, 94, 0.15)"
                                : f.status === "PENDING"
                                ? "rgba(234, 179, 8, 0.15)"
                                : f.status === "REJECTED"
                                ? "rgba(239, 68, 68, 0.15)"
                                : "rgba(107, 114, 128, 0.15)",
                            color:
                              f.status === "APPROVED"
                                ? "#22c55e"
                                : f.status === "PENDING"
                                ? "#eab308"
                                : f.status === "REJECTED"
                                ? "#ef4444"
                                : "#9ca3af",
                          }}
                        >
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightsPage;
