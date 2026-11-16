import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081/api";

const emptyForm = {
  shipName: "",
  imoNumber: "",
  flagCountry: "",
  shipType: "Cargo",
  latitude: "",
  longitude: "",
  speed: "",
  status: "Normal",
};

function App() {
  // =====================================================
  // PAGE / DATA
  // =====================================================

  const [page, setPage] = useState("lookup");

  const [ships, setShips] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // SHIP SEARCH / FILTER
  // =====================================================

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // =====================================================
  // SELECTED SHIP
  // =====================================================

  const [selectedShip, setSelectedShip] = useState(null);

  // =====================================================
  // IMO LOOKUP
  // =====================================================

  const [imoSearch, setImoSearch] = useState("");
  const [lookupShip, setLookupShip] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");

  // =====================================================
  // LOAD SHIPS
  // =====================================================

  const loadShips = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/ships`);

      if (!response.ok) {
        throw new Error("Failed to load ships");
      }

      const data = await response.json();

      setShips(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect to ShipGuard backend. Make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ALERTS
  // =====================================================

  const loadAlerts = async () => {
    try {
      setAlertsLoading(true);

      const response = await fetch(`${API_BASE}/alerts`);

      if (!response.ok) {
        throw new Error("Failed to load alerts");
      }

      const data = await response.json();

      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadShips();
    loadAlerts();
  }, []);

  // =====================================================
  // IMO SEARCH
  // =====================================================

  const searchVesselByImo = async (event) => {
    event.preventDefault();

    const imo = imoSearch.trim();

    if (!imo) {
      setLookupError("Please enter an IMO number.");
      setLookupShip(null);
      return;
    }

    try {
      setLookupLoading(true);
      setLookupError("");
      setLookupShip(null);

      const response = await fetch(
        `${API_BASE}/ships/imo/${encodeURIComponent(imo)}`
      );

      if (response.status === 404) {
        setLookupError(
          `No vessel found with IMO number ${imo}.`
        );
        return;
      }

      if (!response.ok) {
        throw new Error("Vessel search failed");
      }

      const data = await response.json();

      setLookupShip(data);
    } catch (err) {
      console.error(err);

      setLookupError(
        "Unable to search vessel. Please make sure the ShipGuard backend is running."
      );
    } finally {
      setLookupLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalShips = ships.length;

  const lowRisk = ships.filter(
    (ship) => ship.riskLevel === "LOW"
  ).length;

  const mediumRisk = ships.filter(
    (ship) => ship.riskLevel === "MEDIUM"
  ).length;

  const highRisk = ships.filter(
    (ship) => ship.riskLevel === "HIGH"
  ).length;

  const criticalRisk = ships.filter(
    (ship) => ship.riskLevel === "CRITICAL"
  ).length;

  // =====================================================
  // FILTERED SHIPS
  // =====================================================

  const filteredShips = useMemo(() => {
    const text = search.toLowerCase().trim();

    return ships.filter((ship) => {
      const matchesSearch =
        !text ||
        ship.shipName?.toLowerCase().includes(text) ||
        ship.imoNumber?.toLowerCase().includes(text) ||
        ship.flagCountry?.toLowerCase().includes(text);

      const matchesRisk =
        riskFilter === "ALL" ||
        ship.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [ships, search, riskFilter]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const changePage = (newPage) => {
    setPage(newPage);

    setSelectedShip(null);

    setFormMessage("");
    setFormError("");

    setLookupError("");
  };

  // =====================================================
  // FORM HANDLER
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // ADD FORM
  // =====================================================

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormMessage("");
    setFormError("");
    setPage("add");
  };

  // =====================================================
  // EDIT FORM
  // =====================================================

  const openEditForm = (ship) => {
    setEditingId(ship.id);

    setForm({
      shipName: ship.shipName || "",
      imoNumber: ship.imoNumber || "",
      flagCountry: ship.flagCountry || "",
      shipType: ship.shipType || "Cargo",
      latitude: ship.latitude ?? "",
      longitude: ship.longitude ?? "",
      speed: ship.speed ?? "",
      status: ship.status || "Normal",
    });

    setFormMessage("");
    setFormError("");
    setPage("add");
  };

  // =====================================================
  // SAVE SHIP
  // =====================================================

  const saveShip = async (event) => {
    event.preventDefault();

    setSaving(true);
    setFormMessage("");
    setFormError("");

    try {
      const payload = {
        shipName: form.shipName,
        imoNumber: form.imoNumber,
        flagCountry: form.flagCountry,
        shipType: form.shipType,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        speed: Number(form.speed),
        status: form.status,
      };

      const url = editingId
        ? `${API_BASE}/ships/${editingId}`
        : `${API_BASE}/ships`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save vessel");
      }

      const result = await response.json();

      setFormMessage(
        editingId
          ? `Vessel updated successfully. Risk: ${result.riskLevel} (${result.riskScore})`
          : `Vessel registered successfully. Risk: ${result.riskLevel} (${result.riskScore})`
      );

      setEditingId(null);
      setForm(emptyForm);

      await loadShips();
      await loadAlerts();
    } catch (err) {
      console.error(err);

      setFormError(
        "Unable to save vessel. Check the entered values and make sure the backend is running."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE SHIP
  // =====================================================

  const deleteShip = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vessel?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/ships/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      setSelectedShip(null);
      setLookupShip(null);

      await loadShips();
      await loadAlerts();
    } catch (err) {
      console.error(err);

      window.alert("Unable to delete vessel.");
    }
  };

  // =====================================================
  // ANALYZE RISK
  // =====================================================

  const analyzeRisk = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE}/ships/${id}/analyze`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Risk analysis failed");
      }

      const updatedShip = await response.json();

      setSelectedShip(updatedShip);

      if (
        lookupShip &&
        lookupShip.id === updatedShip.id
      ) {
        setLookupShip(updatedShip);
      }

      await loadShips();
      await loadAlerts();
    } catch (err) {
      console.error(err);

      window.alert(
        "Unable to recalculate vessel risk."
      );
    }
  };

  // =====================================================
  // RISK CLASS
  // =====================================================

  const riskClass = (risk) => {
    return risk ? risk.toLowerCase() : "";
  };

  // =====================================================
  // RISK FACTORS
  // This mirrors the current backend rule logic so the
  // user can understand why a risk level was produced.
  // =====================================================

  const getRiskFactors = (ship) => {
    if (!ship) {
      return [];
    }

    const factors = [];

    if (Number(ship.speed) > 30) {
      factors.push({
        title: "High Speed",
        detail: "Speed is above 30 knots.",
        score: "+40",
        type: "critical",
      });
    } else if (Number(ship.speed) > 20) {
      factors.push({
        title: "Elevated Speed",
        detail: "Speed is above 20 knots.",
        score: "+20",
        type: "medium",
      });
    }

    if (
      ship.status &&
      ship.status.toLowerCase() === "suspicious"
    ) {
      factors.push({
        title: "Suspicious Status",
        detail: "The vessel is marked as suspicious.",
        score: "+40",
        type: "critical",
      });
    }

    if (
      Number(ship.latitude) === 0 &&
      Number(ship.longitude) === 0
    ) {
      factors.push({
        title: "Unavailable Location",
        detail: "Latitude and longitude are both 0.",
        score: "+20",
        type: "high",
      });
    }

    if (factors.length === 0) {
      factors.push({
        title: "No Elevated Factors",
        detail: "No elevated rule-based risk factor detected.",
        score: "0",
        type: "low",
      });
    }

    return factors;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="loading-screen">

        <div className="loading-card">

          <div className="loading-ship">
            🚢
          </div>

          <h1>SHIPGUARD</h1>

          <p>
            Connecting to maritime monitoring system...
          </p>

          <div className="loader"></div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN APP
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            🚢
          </div>

          <div>
            <h2>SHIPGUARD</h2>
            <small>Maritime Security</small>
          </div>

        </div>

        <nav className="navigation">

          <button
            className={`nav-item ${
              page === "lookup" ? "active" : ""
            }`}
            onClick={() => changePage("lookup")}
          >
            <span>🔎</span>
            <span>Vessel Lookup</span>
          </button>

          <button
            className={`nav-item ${
              page === "dashboard" ? "active" : ""
            }`}
            onClick={() => changePage("dashboard")}
          >
            <span>📊</span>
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${
              page === "ships" ? "active" : ""
            }`}
            onClick={() => changePage("ships")}
          >
            <span>🚢</span>
            <span>Ships</span>
          </button>

          <button
            className={`nav-item ${
              page === "add" ? "active" : ""
            }`}
            onClick={openAddForm}
          >
            <span>➕</span>
            <span>Add Ship</span>
          </button>

          <button
            className={`nav-item ${
              page === "alerts" ? "active" : ""
            }`}
            onClick={() => {
              changePage("alerts");
              loadAlerts();
            }}
          >
            <span>⚠️</span>
            <span>Alerts</span>

            {criticalRisk > 0 && (
              <span className="nav-badge">
                {criticalRisk}
              </span>
            )}
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>
            System Online
          </div>

          <small className="system-version">
            ShipGuard v1.0
          </small>

        </div>

      </aside>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <div className="topbar-title">

              <h1>
                {page === "lookup" &&
                  "Vessel Identification"}

                {page === "dashboard" &&
                  "Operations Dashboard"}

                {page === "ships" &&
                  "Vessel Fleet"}

                {page === "add" &&
                  (editingId
                    ? "Update Vessel"
                    : "Register Vessel")}

                {page === "alerts" &&
                  "Alert Center"}
              </h1>

              <span className="live-pill">
                <span></span>
                LIVE
              </span>

            </div>

            <p>
              Smart Ship Identity & Risk Monitoring System
            </p>

          </div>

          <div className="profile">

            <div className="profile-icon">
              👤
            </div>

            <div>
              <strong>Administrator</strong>
              <small>System Manager</small>
            </div>

          </div>

        </header>

        <section className="content">

          {/* GLOBAL ERROR */}

          {error && (
            <div className="error-box global-error">
              ⚠️ {error}
            </div>
          )}

          {/* =================================================
              VESSEL LOOKUP
          ================================================= */}

          {page === "lookup" && (
            <>
              <div className="lookup-hero">

                <div className="lookup-hero-content">

                  <div className="hero-icon">
                    🚢
                  </div>

                  <div>

                    <span className="section-label">
                      VESSEL IDENTIFICATION
                    </span>

                    <h2>
                      Find a vessel by IMO number
                    </h2>

                    <p>
                      Enter the vessel's IMO number to retrieve
                      its identity, operational information and
                      current risk assessment.
                    </p>

                  </div>

                </div>

                <div className="hero-mini-stats">

                  <div>
                    <strong>{totalShips}</strong>
                    <span>Vessels</span>
                  </div>

                  <div>
                    <strong>{alerts.length}</strong>
                    <span>Alerts</span>
                  </div>

                  <div>
                    <strong>{criticalRisk}</strong>
                    <span>Critical</span>
                  </div>

                </div>

              </div>

              <section className="panel lookup-panel">

                <div className="lookup-search-heading">

                  <div className="search-title-icon">
                    🔎
                  </div>

                  <div>
                    <h3>Search Vessel</h3>

                    <p>
                      Use the registered IMO number to
                      identify a vessel.
                    </p>
                  </div>

                </div>

                <form
                  className="imo-search-form"
                  onSubmit={searchVesselByImo}
                >

                  <div className="imo-input-wrapper">

                    <span>
                      IMO
                    </span>

                    <input
                      type="text"
                      value={imoSearch}
                      onChange={(event) =>
                        setImoSearch(event.target.value)
                      }
                      placeholder="Example: IMO2000001"
                      autoComplete="off"
                    />

                  </div>

                  <button
                    type="submit"
                    className="primary-btn search-btn"
                    disabled={lookupLoading}
                  >
                    {lookupLoading ? (
                      <>
                        <span className="button-spinner"></span>
                        Searching...
                      </>
                    ) : (
                      <>
                        Search Vessel
                        <span>→</span>
                      </>
                    )}
                  </button>

                </form>

                {lookupError && (
                  <div className="lookup-error">
                    <span>⚠</span>
                    <div>
                      <strong>Vessel not found</strong>
                      <p>{lookupError}</p>
                    </div>
                  </div>
                )}

              </section>

              {/* =================================================
                  SEARCH RESULT
              ================================================= */}

              {lookupShip && (
                <section className="vessel-result-wrap">

                  <div className="result-top-line">

                    <div>
                      <span className="section-label">
                        SEARCH RESULT
                      </span>

                      <h3>
                        Vessel information
                      </h3>
                    </div>

                    <button
                      className="ghost-btn"
                      onClick={() => {
                        setLookupShip(null);
                        setLookupError("");
                        setImoSearch("");
                      }}
                    >
                      Clear
                    </button>

                  </div>

                  <section className="panel vessel-result">

                    {/* VESSEL HEADER */}

                    <div className="vessel-result-header">

                      <div className="vessel-avatar">
                        🚢
                      </div>

                      <div className="vessel-title">

                        <div className="title-row">

                          <h2>
                            {lookupShip.shipName}
                          </h2>

                          <span
                            className={`status ${
                              lookupShip.status?.toLowerCase() ===
                              "suspicious"
                                ? "suspicious"
                                : "normal"
                            }`}
                          >
                            {lookupShip.status}
                          </span>

                        </div>

                        <p>
                          IMO {lookupShip.imoNumber}
                          <span>•</span>
                          {lookupShip.flagCountry}
                          <span>•</span>
                          {lookupShip.shipType}
                        </p>

                      </div>

                      <div className="header-risk">

                        <span>Current Risk</span>

                        <span
                          className={`risk large ${riskClass(
                            lookupShip.riskLevel
                          )}`}
                        >
                          {lookupShip.riskLevel}
                        </span>

                      </div>

                    </div>

                    {/* RISK HERO */}

                    <div className="risk-dashboard">

                      <div className="risk-score-block">

                        <span>
                          Risk Score
                        </span>

                        <div className="score-number">
                          {lookupShip.riskScore}
                          <small>/100</small>
                        </div>

                        <p>
                          Rule-based vessel risk assessment
                        </p>

                      </div>

                      <div className="risk-meter-block">

                        <div className="risk-meter-track">

                          <div
                            className={`risk-meter-fill ${riskClass(
                              lookupShip.riskLevel
                            )}`}
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(
                                    lookupShip.riskScore
                                  ) || 0,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          ></div>

                        </div>

                        <div className="meter-labels">
                          <span>LOW</span>
                          <span>MEDIUM</span>
                          <span>HIGH</span>
                          <span>CRITICAL</span>
                        </div>

                      </div>

                      <div className="risk-status-message">

                        {lookupShip.riskLevel ===
                          "LOW" && (
                          <>
                            <span>✓</span>
                            <div>
                              <strong>
                                Normal risk
                              </strong>
                              <small>
                                No immediate action required.
                              </small>
                            </div>
                          </>
                        )}

                        {lookupShip.riskLevel ===
                          "MEDIUM" && (
                          <>
                            <span>!</span>
                            <div>
                              <strong>
                                Moderate attention
                              </strong>
                              <small>
                                Continue monitoring this vessel.
                              </small>
                            </div>
                          </>
                        )}

                        {lookupShip.riskLevel ===
                          "HIGH" && (
                          <>
                            <span>⚠</span>
                            <div>
                              <strong>
                                High risk detected
                              </strong>
                              <small>
                                This vessel requires attention.
                              </small>
                            </div>
                          </>
                        )}

                        {lookupShip.riskLevel ===
                          "CRITICAL" && (
                          <>
                            <span>🚨</span>
                            <div>
                              <strong>
                                Critical risk detected
                              </strong>
                              <small>
                                Immediate attention is required.
                              </small>
                            </div>
                          </>
                        )}

                      </div>

                    </div>

                    {/* ALERT */}

                    {(lookupShip.riskLevel ===
                      "HIGH" ||
                      lookupShip.riskLevel ===
                        "CRITICAL") && (
                      <div
                        className={`critical-banner ${riskClass(
                          lookupShip.riskLevel
                        )}`}
                      >

                        <div className="banner-icon">
                          {lookupShip.riskLevel ===
                          "CRITICAL"
                            ? "🚨"
                            : "⚠️"}
                        </div>

                        <div>

                          <strong>
                            {lookupShip.riskLevel} Risk Alert
                          </strong>

                          <p>
                            ShipGuard has identified
                            elevated risk conditions for
                            this vessel.
                          </p>

                        </div>

                        <button
                          onClick={() => {
                            changePage("alerts");
                            loadAlerts();
                          }}
                        >
                          Open Alerts
                        </button>

                      </div>
                    )}

                    {/* INFORMATION GRID */}

                    <div className="result-section-title">
                      Vessel Information
                    </div>

                    <div className="details-grid">

                      <Detail
                        label="IMO Number"
                        value={lookupShip.imoNumber}
                        icon="🆔"
                      />

                      <Detail
                        label="Ship Name"
                        value={lookupShip.shipName}
                        icon="🚢"
                      />

                      <Detail
                        label="Flag Country"
                        value={lookupShip.flagCountry}
                        icon="🏳️"
                      />

                      <Detail
                        label="Ship Type"
                        value={lookupShip.shipType}
                        icon="⚓"
                      />

                      <Detail
                        label="Latitude"
                        value={lookupShip.latitude}
                        icon="📍"
                      />

                      <Detail
                        label="Longitude"
                        value={lookupShip.longitude}
                        icon="📍"
                      />

                      <Detail
                        label="Speed"
                        value={`${lookupShip.speed} knots`}
                        icon="💨"
                      />

                      <Detail
                        label="Status"
                        value={lookupShip.status}
                        icon="◉"
                      />

                    </div>

                    {/* RISK FACTORS */}

                    <div className="result-section-title factors-title">
                      Risk Analysis Factors
                    </div>

                    <div className="risk-factors">

                      {getRiskFactors(
                        lookupShip
                      ).map(
                        (factor, index) => (
                          <div
                            className={`factor-card ${factor.type}`}
                            key={`${factor.title}-${index}`}
                          >

                            <div className="factor-icon">
                              {factor.type ===
                              "critical"
                                ? "!"
                                : factor.type ===
                                    "high"
                                ? "⚠"
                                : factor.type ===
                                    "medium"
                                ? "•"
                                : "✓"}
                            </div>

                            <div className="factor-content">

                              <strong>
                                {factor.title}
                              </strong>

                              <span>
                                {factor.detail}
                              </span>

                            </div>

                            <div className="factor-score">
                              {factor.score}
                            </div>

                          </div>
                        )
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="result-actions">

                      <button
                        className="secondary-btn"
                        onClick={() => {
                          setLookupShip(null);
                          setLookupError("");
                          setImoSearch("");
                        }}
                      >
                        New Search
                      </button>

                      <button
                        className="primary-btn"
                        onClick={() =>
                          analyzeRisk(lookupShip.id)
                        }
                      >
                        ↻ Recalculate Risk
                      </button>

                    </div>

                  </section>

                </section>
              )}
            </>
          )}

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {page === "dashboard" && (
            <>

              <div className="dashboard-hero">

                <div>

                  <span className="section-label">
                    OPERATIONS CENTER
                  </span>

                  <h2>
                    Maritime Risk Overview
                  </h2>

                  <p>
                    Monitor your fleet and identify elevated
                    vessel risk conditions.
                  </p>

                </div>

                <div className="dashboard-hero-icon">
                  🌊
                </div>

              </div>

              <div className="stats">

                <StatCard
                  icon="🚢"
                  title="Total Ships"
                  value={totalShips}
                  text="Registered vessels"
                  type="blue"
                />

                <StatCard
                  icon="✓"
                  title="Low Risk"
                  value={lowRisk}
                  text="Normal vessels"
                  type="green"
                />

                <StatCard
                  icon="!"
                  title="Medium Risk"
                  value={mediumRisk}
                  text="Monitor vessels"
                  type="yellow"
                />

                <StatCard
                  icon="⚠"
                  title="High Risk"
                  value={highRisk}
                  text="Needs attention"
                  type="orange"
                />

                <StatCard
                  icon="🚨"
                  title="Critical"
                  value={criticalRisk}
                  text="Immediate action"
                  type="red"
                />

              </div>

              <div className="dashboard-grid">

                <section className="panel">

                  <div className="panel-header">

                    <div>
                      <h3>
                        Recent Fleet Activity
                      </h3>

                      <p>
                        Latest registered vessels
                      </p>
                    </div>

                    <button
                      className="view-btn"
                      onClick={() =>
                        changePage("ships")
                      }
                    >
                      View Fleet →
                    </button>

                  </div>

                  <div className="table-container">

                    <table>

                      <thead>

                        <tr>
                          <th>Vessel</th>
                          <th>IMO</th>
                          <th>Type</th>
                          <th>Speed</th>
                          <th>Status</th>
                          <th>Risk</th>
                        </tr>

                      </thead>

                      <tbody>

                        {ships
                          .slice(0, 8)
                          .map((ship) => (
                            <tr key={ship.id}>

                              <td>

                                <div className="ship-name">

                                  <div className="ship-icon">
                                    🚢
                                  </div>

                                  <strong>
                                    {ship.shipName}
                                  </strong>

                                </div>

                              </td>

                              <td>
                                {ship.imoNumber}
                              </td>

                              <td>
                                {ship.shipType}
                              </td>

                              <td>
                                {ship.speed} knots
                              </td>

                              <td>

                                <span
                                  className={`status ${
                                    ship.status?.toLowerCase() ===
                                    "suspicious"
                                      ? "suspicious"
                                      : "normal"
                                  }`}
                                >
                                  {ship.status}
                                </span>

                              </td>

                              <td>

                                <span
                                  className={`risk ${riskClass(
                                    ship.riskLevel
                                  )}`}
                                >
                                  {ship.riskLevel}
                                </span>

                              </td>

                            </tr>
                          ))}

                      </tbody>

                    </table>

                  </div>

                </section>

                <section className="panel risk-panel">

                  <div className="panel-header">

                    <div>
                      <h3>Fleet Risk Distribution</h3>
                      <p>Current risk levels</p>
                    </div>

                  </div>

                  <RiskBar
                    label="Low Risk"
                    value={lowRisk}
                    total={totalShips}
                    className="green"
                  />

                  <RiskBar
                    label="Medium Risk"
                    value={mediumRisk}
                    total={totalShips}
                    className="yellow"
                  />

                  <RiskBar
                    label="High Risk"
                    value={highRisk}
                    total={totalShips}
                    className="orange"
                  />

                  <RiskBar
                    label="Critical"
                    value={criticalRisk}
                    total={totalShips}
                    className="red"
                  />

                </section>

              </div>

              {criticalRisk > 0 && (
                <div className="dashboard-alert">

                  <div className="dashboard-alert-icon">
                    🚨
                  </div>

                  <div>

                    <strong>
                      Critical vessels require attention
                    </strong>

                    <p>
                      {criticalRisk} vessel
                      {criticalRisk > 1 ? "s are" : " is"}{" "}
                      currently classified as CRITICAL.
                    </p>

                  </div>

                  <button
                    onClick={() => {
                      changePage("alerts");
                      loadAlerts();
                    }}
                  >
                    Review Alerts
                  </button>

                </div>
              )}

            </>
          )}

          {/* =================================================
              SHIPS
          ================================================= */}

          {page === "ships" && (
            <>

              <div className="page-intro">

                <div>

                  <span className="section-label">
                    FLEET MANAGEMENT
                  </span>

                  <h2>
                    Vessel Fleet
                  </h2>

                  <p>
                    Search, review and manage registered
                    vessels.
                  </p>

                </div>

                <button
                  className="primary-btn"
                  onClick={openAddForm}
                >
                  + Register Vessel
                </button>

              </div>

              <div className="filter-panel">

                <div className="search-box">

                  <span>🔍</span>

                  <input
                    type="text"
                    placeholder="Search vessel, IMO or country..."
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />

                </div>

                <select
                  value={riskFilter}
                  onChange={(event) =>
                    setRiskFilter(event.target.value)
                  }
                >
                  <option value="ALL">
                    All Risk Levels
                  </option>

                  <option value="LOW">
                    Low Risk
                  </option>

                  <option value="MEDIUM">
                    Medium Risk
                  </option>

                  <option value="HIGH">
                    High Risk
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>
                </select>

              </div>

              <div className="results-info">
                Showing{" "}
                <strong>{filteredShips.length}</strong>{" "}
                of{" "}
                <strong>{totalShips}</strong>{" "}
                vessels
              </div>

              <section className="panel full-panel">

                <div className="table-container">

                  <table className="ships-table">

                    <thead>

                      <tr>
                        <th>Vessel</th>
                        <th>IMO</th>
                        <th>Flag</th>
                        <th>Type</th>
                        <th>Speed</th>
                        <th>Status</th>
                        <th>Score</th>
                        <th>Risk</th>
                        <th>Actions</th>
                      </tr>

                    </thead>

                    <tbody>

                      {filteredShips.map((ship) => (
                        <tr key={ship.id}>

                          <td>

                            <div className="ship-name">

                              <div className="ship-icon">
                                🚢
                              </div>

                              <strong>
                                {ship.shipName}
                              </strong>

                            </div>

                          </td>

                          <td>
                            {ship.imoNumber}
                          </td>

                          <td>
                            {ship.flagCountry}
                          </td>

                          <td>
                            {ship.shipType}
                          </td>

                          <td>
                            {ship.speed} knots
                          </td>

                          <td>

                            <span
                              className={`status ${
                                ship.status?.toLowerCase() ===
                                "suspicious"
                                  ? "suspicious"
                                  : "normal"
                              }`}
                            >
                              {ship.status}
                            </span>

                          </td>

                          <td>

                            <strong>
                              {ship.riskScore}
                            </strong>

                            <span className="score-small">
                              /100
                            </span>

                          </td>

                          <td>

                            <span
                              className={`risk ${riskClass(
                                ship.riskLevel
                              )}`}
                            >
                              {ship.riskLevel}
                            </span>

                          </td>

                          <td>

                            <div className="action-buttons">

                              <button
                                className="small-btn view"
                                onClick={() =>
                                  setSelectedShip(ship)
                                }
                              >
                                View
                              </button>

                              <button
                                className="small-btn edit"
                                onClick={() =>
                                  openEditForm(ship)
                                }
                              >
                                Edit
                              </button>

                              <button
                                className="small-btn delete"
                                onClick={() =>
                                  deleteShip(ship.id)
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      ))}

                      {filteredShips.length === 0 && (
                        <tr>

                          <td
                            colSpan="9"
                            className="empty-cell"
                          >
                            No vessels match your search.
                          </td>

                        </tr>
                      )}

                    </tbody>

                  </table>

                </div>

              </section>

            </>
          )}

          {/* =================================================
              ADD / EDIT
          ================================================= */}

          {page === "add" && (
            <div className="form-layout">

              <section className="form-card">

                <div className="form-header">

                  <div className="form-icon">
                    🚢
                  </div>

                  <div>

                    <span className="section-label">
                      VESSEL MANAGEMENT
                    </span>

                    <h2>
                      {editingId
                        ? "Update Vessel"
                        : "Register New Vessel"}
                    </h2>

                    <p>
                      Save vessel information and allow
                      ShipGuard to calculate its risk.
                    </p>

                  </div>

                </div>

                {formMessage && (
                  <div className="success-box">
                    ✓ {formMessage}
                  </div>
                )}

                {formError && (
                  <div className="error-box">
                    ⚠️ {formError}
                  </div>
                )}

                <form onSubmit={saveShip}>

                  <div className="form-section-title">
                    Vessel Identity
                  </div>

                  <div className="form-grid">

                    <InputField
                      label="Ship Name"
                      name="shipName"
                      value={form.shipName}
                      onChange={handleChange}
                      placeholder="e.g. Ocean Explorer"
                    />

                    <InputField
                      label="IMO Number"
                      name="imoNumber"
                      value={form.imoNumber}
                      onChange={handleChange}
                      placeholder="e.g. IMO1234567"
                    />

                    <InputField
                      label="Flag Country"
                      name="flagCountry"
                      value={form.flagCountry}
                      onChange={handleChange}
                      placeholder="e.g. India"
                    />

                    <div className="input-group">
                      <label>Ship Type</label>

                      <select
                        name="shipType"
                        value={form.shipType}
                        onChange={handleChange}
                      >
                        <option value="Cargo">
                          Cargo
                        </option>

                        <option value="Container">
                          Container
                        </option>

                        <option value="Tanker">
                          Tanker
                        </option>

                        <option value="Bulk Carrier">
                          Bulk Carrier
                        </option>

                        <option value="Passenger">
                          Passenger
                        </option>
                      </select>
                    </div>

                  </div>

                  <div className="form-section-title">
                    Navigation & Operational Data
                  </div>

                  <div className="form-grid">

                    <InputField
                      label="Latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="e.g. 12.9716"
                    />

                    <InputField
                      label="Longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="e.g. 77.5946"
                    />

                    <InputField
                      label="Speed (knots)"
                      name="speed"
                      type="number"
                      step="any"
                      min="0"
                      value={form.speed}
                      onChange={handleChange}
                      placeholder="e.g. 20"
                    />

                    <div className="input-group">
                      <label>Operational Status</label>

                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="Normal">
                          Normal
                        </option>

                        <option value="Suspicious">
                          Suspicious
                        </option>
                      </select>
                    </div>

                  </div>

                  <div className="risk-info">

                    <span>🛡️</span>

                    <div>

                      <strong>
                        Automatic Risk Analysis
                      </strong>

                      <p>
                        ShipGuard evaluates speed, operational
                        status and location using the backend
                        rule-based RiskService.
                      </p>

                    </div>

                  </div>

                  <div className="form-actions">

                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() =>
                        changePage("ships")
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={saving}
                    >
                      {saving
                        ? "Saving..."
                        : editingId
                        ? "Update Vessel"
                        : "Register Vessel"}
                    </button>

                  </div>

                </form>

              </section>

            </div>
          )}

          {/* =================================================
              ALERTS
          ================================================= */}

          {page === "alerts" && (
            <>

              <div className="page-intro">

                <div>

                  <span className="section-label">
                    SECURITY MONITORING
                  </span>

                  <h2>
                    Alert Center
                  </h2>

                  <p>
                    Risk events generated by ShipGuard.
                  </p>

                </div>

                <div className="alert-summary">

                  <strong>
                    {alerts.length}
                  </strong>

                  <span>
                    Total Alerts
                  </span>

                </div>

              </div>

              <section className="alerts-grid">

                {alertsLoading ? (
                  <div className="empty-alert">
                    <div className="empty-alert-icon">
                      ⏳
                    </div>

                    <h3>
                      Loading alerts
                    </h3>

                    <p>
                      Retrieving risk events from the backend.
                    </p>
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="empty-alert">

                    <div className="empty-alert-icon safe">
                      ✓
                    </div>

                    <h3>
                      No alerts
                    </h3>

                    <p>
                      ShipGuard currently has no alert
                      events returned by the backend.
                    </p>

                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      className={`alert-card ${riskClass(
                        alert.riskLevel
                      )}`}
                      key={alert.id}
                    >

                      <div className="alert-card-icon">
                        ⚠
                      </div>

                      <div className="alert-card-content">

                        <div className="alert-card-top">

                          <div>

                            <span className="section-label">
                              RISK EVENT
                            </span>

                            <h3>
                              {alert.alertType ||
                                "Risk Alert"}
                            </h3>

                          </div>

                          <span
                            className={`risk ${riskClass(
                              alert.riskLevel
                            )}`}
                          >
                            {alert.riskLevel}
                          </span>

                        </div>

                        <p>
                          {alert.alertMessage}
                        </p>

                        {alert.ship && (
                          <div className="alert-ship">
                            🚢{" "}
                            <strong>
                              {alert.ship.shipName}
                            </strong>
                            <span>
                              {alert.ship.imoNumber}
                            </span>
                          </div>
                        )}

                        {alert.createdAt && (
                          <small>
                            {new Date(
                              alert.createdAt
                            ).toLocaleString()}
                          </small>
                        )}

                      </div>

                    </div>
                  ))
                )}

              </section>

            </>
          )}

        </section>

      </main>

      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedShip && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedShip(null)
          }
        >

          <div
            className="ship-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="modal-close"
              onClick={() =>
                setSelectedShip(null)
              }
            >
              ×
            </button>

            <div className="modal-header">

              <div className="modal-ship-icon">
                🚢
              </div>

              <div>

                <span className="section-label">
                  VESSEL DETAILS
                </span>

                <h2>
                  {selectedShip.shipName}
                </h2>

                <p>
                  IMO {selectedShip.imoNumber}
                </p>

              </div>

            </div>

            <div className="modal-risk">

              <div>

                <span>Risk Score</span>

                <strong>
                  {selectedShip.riskScore}
                  <small>/100</small>
                </strong>

              </div>

              <span
                className={`risk large ${riskClass(
                  selectedShip.riskLevel
                )}`}
              >
                {selectedShip.riskLevel}
              </span>

            </div>

            <div className="details-grid">

              <Detail
                label="Flag Country"
                value={selectedShip.flagCountry}
                icon="🏳️"
              />

              <Detail
                label="Ship Type"
                value={selectedShip.shipType}
                icon="⚓"
              />

              <Detail
                label="Speed"
                value={`${selectedShip.speed} knots`}
                icon="💨"
              />

              <Detail
                label="Status"
                value={selectedShip.status}
                icon="◉"
              />

              <Detail
                label="Latitude"
                value={selectedShip.latitude}
                icon="📍"
              />

              <Detail
                label="Longitude"
                value={selectedShip.longitude}
                icon="📍"
              />

            </div>

            <div className="modal-footer">

              <button
                className="secondary-btn"
                onClick={() =>
                  setSelectedShip(null)
                }
              >
                Close
              </button>

              <button
                className="primary-btn"
                onClick={() =>
                  analyzeRisk(selectedShip.id)
                }
              >
                ↻ Recalculate Risk
              </button>

              <button
                className="danger-btn"
                onClick={() =>
                  deleteShip(selectedShip.id)
                }
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
  text,
  type,
}) {
  return (
    <div className="stat-card">

      <div className={`stat-icon ${type}`}>
        {icon}
      </div>

      <div>

        <span>{title}</span>

        <h2>{value}</h2>

        <small>{text}</small>

      </div>

    </div>
  );
}

// =====================================================
// RISK BAR
// =====================================================

function RiskBar({
  label,
  value,
  total,
  className,
}) {
  const percentage =
    total > 0
      ? Math.min((value / total) * 100, 100)
      : 0;

  return (
    <div className="risk-item">

      <div className="risk-label">

        <span>{label}</span>

        <strong>{value}</strong>

      </div>

      <div className="progress">

        <div
          className={`progress-${className}`}
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

    </div>
  );
}

// =====================================================
// DETAIL
// =====================================================

function Detail({
  label,
  value,
  icon,
}) {
  return (
    <div className="detail-item">

      <div className="detail-icon">
        {icon}
      </div>

      <div>

        <span>{label}</span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

// =====================================================
// INPUT FIELD
// =====================================================

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
}) {
  return (
    <div className="input-group">

      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        required
      />

    </div>
  );
}

export default App;