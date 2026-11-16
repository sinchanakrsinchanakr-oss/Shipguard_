const API_BASE = "/api";

/* =========================
   LOAD DASHBOARD
========================= */

async function loadDashboard() {

    try {

        const response = await fetch(`${API_BASE}/ships`);

        if (!response.ok) {
            throw new Error("Unable to load ships");
        }

        const ships = await response.json();

        const totalShips = ships.length;

        const lowRisk = ships.filter(
            ship => ship.riskLevel === "LOW"
        ).length;

        const highRisk = ships.filter(
            ship => ship.riskLevel === "HIGH"
        ).length;

        const criticalRisk = ships.filter(
            ship => ship.riskLevel === "CRITICAL"
        ).length;

        const totalElement =
            document.getElementById("totalShips");

        const lowElement =
            document.getElementById("lowRisk");

        const highElement =
            document.getElementById("highRisk");

        const criticalElement =
            document.getElementById("criticalRisk");

        if (totalElement)
            totalElement.textContent = totalShips;

        if (lowElement)
            lowElement.textContent = lowRisk;

        if (highElement)
            highElement.textContent = highRisk;

        if (criticalElement)
            criticalElement.textContent = criticalRisk;

        displayDashboardShips(ships);

    } catch (error) {

        console.error(error);

    }
}


/* =========================
   DASHBOARD SHIPS
========================= */

function displayDashboardShips(ships) {

    const table =
        document.getElementById("shipTable");

    if (!table) {
        return;
    }

    table.innerHTML = "";

    ships.slice(0, 10).forEach(ship => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${ship.id ?? "-"}</td>

            <td>${ship.shipName ?? "-"}</td>

            <td>${ship.imoNumber ?? "-"}</td>

            <td>${ship.shipType ?? "-"}</td>

            <td>${ship.speed ?? 0} knots</td>

            <td class="${getStatusClass(ship.status)}">
                ${ship.status ?? "-"}
            </td>

            <td class="${getRiskClass(ship.riskLevel)}">
                ${ship.riskLevel ?? "LOW"}
            </td>

        `;

        table.appendChild(row);

    });
}


/* =========================
   LOAD ALL SHIPS
========================= */

async function loadShips() {

    const table =
        document.getElementById("allShips");

    if (!table) {
        return;
    }

    try {

        const response =
            await fetch(`${API_BASE}/ships`);

        const ships =
            await response.json();

        table.innerHTML = "";

        ships.forEach(ship => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${ship.id ?? "-"}</td>

                <td>
                    <strong>
                        ${ship.shipName ?? "-"}
                    </strong>
                </td>

                <td>${ship.imoNumber ?? "-"}</td>

                <td>${ship.flagCountry ?? "-"}</td>

                <td>${ship.shipType ?? "-"}</td>

                <td>
                    ${ship.latitude ?? 0},
                    ${ship.longitude ?? 0}
                </td>

                <td>
                    ${ship.speed ?? 0} knots
                </td>

                <td class="${getStatusClass(ship.status)}">
                    ${ship.status ?? "-"}
                </td>

                <td>
                    ${ship.riskScore ?? 0}
                </td>

                <td class="${getRiskClass(ship.riskLevel)}">
                    ${ship.riskLevel ?? "-"}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteShip(${ship.id})">

                        Delete

                    </button>

                </td>

            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="11"
                    class="text-center text-danger">

                    Unable to connect to ShipGuard backend.

                </td>
            </tr>
        `;

    }
}


/* =========================
   ADD SHIP
========================= */

const shipForm =
    document.getElementById("shipForm");

if (shipForm) {

    shipForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const ship = {

            shipName:
                document.getElementById("shipName").value,

            imoNumber:
                document.getElementById("imoNumber").value,

            flagCountry:
                document.getElementById("flagCountry").value,

            shipType:
                document.getElementById("shipType").value,

            latitude:
                parseFloat(
                    document.getElementById("latitude").value
                ),

            longitude:
                parseFloat(
                    document.getElementById("longitude").value
                ),

            speed:
                parseFloat(
                    document.getElementById("speed").value
                ),

            status:
                document.getElementById("status").value

        };

        try {

            const response = await fetch(
                `${API_BASE}/ships`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(ship)
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Failed to register ship"
                );

            }

            const result =
                await response.json();

            const message =
                document.getElementById("message");

            message.innerHTML = `

                <div class="alert alert-success">

                    Ship registered successfully!

                    <br>

                    Risk Score:
                    <strong>
                        ${result.riskScore}
                    </strong>

                    <br>

                    Risk Level:
                    <strong>
                        ${result.riskLevel}
                    </strong>

                </div>

            `;

            shipForm.reset();

        } catch (error) {

            console.error(error);

            document.getElementById("message").innerHTML = `

                <div class="alert alert-danger">

                    Unable to register ship.
                    Please make sure the backend is running.

                </div>

            `;

        }

    });

}


/* =========================
   DELETE SHIP
========================= */

async function deleteShip(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this ship?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/ships/${id}`,
                {
                    method: "DELETE"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to delete ship"
            );

        }

        alert("Ship deleted successfully.");

        loadShips();

    } catch (error) {

        console.error(error);

        alert("Unable to delete ship.");

    }

}


/* =========================
   LOAD ALERTS
========================= */

async function loadAlerts() {

    const table =
        document.getElementById("alertsTable");

    if (!table) {
        return;
    }

    try {

        const response =
            await fetch(`${API_BASE}/alerts`);

        const alerts =
            await response.json();

        table.innerHTML = "";

        if (alerts.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="6"
                        class="text-center">

                        No alerts available.

                    </td>

                </tr>

            `;

            return;
        }

        alerts.forEach(alert => {

            const row =
                document.createElement("tr");

            row.className = "alert-row";

            const shipName =
                alert.ship
                    ? alert.ship.shipName
                    : "Unknown";

            row.innerHTML = `

                <td>${alert.id ?? "-"}</td>

                <td>
                    ${alert.alertMessage ?? "-"}
                </td>

                <td>
                    ${alert.alertType ?? "-"}
                </td>

                <td class="${getRiskClass(alert.riskLevel)}">
                    ${alert.riskLevel ?? "-"}
                </td>

                <td>
                    ${shipName}
                </td>

                <td>
                    ${formatDate(alert.createdAt)}
                </td>

            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        table.innerHTML = `

            <tr>

                <td colspan="6"
                    class="text-center text-danger">

                    Unable to load alerts.

                </td>

            </tr>

        `;

    }

}


/* =========================
   RISK CLASS
========================= */

function getRiskClass(riskLevel) {

    switch (riskLevel) {

        case "LOW":
            return "risk-low";

        case "MEDIUM":
            return "risk-medium";

        case "HIGH":
            return "risk-high";

        case "CRITICAL":
            return "risk-critical";

        default:
            return "";

    }

}


/* =========================
   STATUS CLASS
========================= */

function getStatusClass(status) {

    if (!status) {
        return "";
    }

    if (status.toLowerCase() === "suspicious") {
        return "status-suspicious";
    }

    return "status-normal";

}


/* =========================
   DATE FORMAT
========================= */

function formatDate(date) {

    if (!date) {
        return "-";
    }

    return new Date(date).toLocaleString();

}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadDashboard();
        loadShips();
        loadAlerts();

    }
);