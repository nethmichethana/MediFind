const API_BASE_URL = "http://localhost:8080";

// ============================================================
// API FETCH HELPER
// ============================================================

async function apiFetch(endpoint, method = "GET", body = null) {

    const token = localStorage.getItem("medifind_token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const options = {
        method: method,
        headers: headers
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    try {

        const response = await fetch(
            API_BASE_URL + endpoint,
            options
        );

        const contentType =
            response.headers.get("content-type");

        let data;

        if (
            contentType &&
            contentType.includes("application/json")
        ) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log("API Response:", {
            endpoint,
            method,
            httpStatus: response.status,
            data
        });

        return {
            httpStatus: response.status,
            ...(
                typeof data === "object" && data !== null
                    ? data
                    : { body: data }
            )
        };

    } catch (error) {

        console.error("API Error:", error);

        throw error;
    }
}

// ============================================================
// MEDICINE CATEGORY - GET ALL
// ============================================================

async function loadDashboardCategories() {

    try {

        const response = await apiFetch(
            "/v1/medicine-categories",
            "GET"
        );

        console.log(
            "Dashboard Categories API Response:",
            response
        );

        if (
            !response ||
            response.status !== 200
        ) {

            console.error(
                "Failed to load medicine categories."
            );

            showToast(
                "Cannot load medicine categories.",
                "danger"
            );

            return [];
        }

        const categories =
            response.body || [];

        console.log(
            "Categories from Backend:",
            categories
        );

        return categories;

    } catch (error) {

        console.error(
            "Error loading dashboard categories:",
            error
        );

        showToast(
            "Error loading medicine categories.",
            "danger"
        );

        return [];
    }
}

// ============================================================
// RENDER MEDICINE CATEGORY TABLE
// ============================================================

function renderCategoryTable(categories) {

    const head =
        document.getElementById(
            "workspace-table-head"
        );

    const body =
        document.getElementById(
            "workspace-table-body"
        );

    const panelTitle =
        document.getElementById(
            "table-panel-title"
        );

    if (!head || !body) {
        console.error(
            "Category table elements not found."
        );
        return;
    }

    if (panelTitle) {
        panelTitle.textContent =
            "Medicine Category Definitions";
    }

    head.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Description</th>
            <th>Actions</th>
        </tr>
    `;

    body.innerHTML = "";

    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td colspan="4"
                    style="text-align:center; color:var(--text-muted);">
                    No categories found.
                </td>
            </tr>
        `;

        return;
    }

    categories.forEach(category => {

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${category.id}</td>

            <td>
                <strong>
                    ${category.name || ""}
                </strong>
            </td>

            <td>
                ${category.description || ""}
            </td>

            <td>

                <button
                    class="btn btn-secondary"
                    style="padding:0.25rem 0.5rem; font-size:0.75rem;"
                    onclick="editCategory(${category.id})">
                    Edit
                </button>

                <button
                    class="btn btn-danger"
                    style="padding:0.25rem 0.5rem; font-size:0.75rem;"
                    onclick="deleteCategory(${category.id})">
                    Delete
                </button>

            </td>
        `;

        body.appendChild(row);
    });
}
// ============================================================
// CATEGORY STATISTICS
// ============================================================

function renderCategoryStats(categories) {

    const statsContainer =
        document.getElementById("workspace-stats");

    if (!statsContainer) {
        return;
    }

    const total =
        Array.isArray(categories)
            ? categories.length
            : 0;

    statsContainer.innerHTML = `
        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">
                <span class="stat-title">
                    Total Categories
                </span>
            </div>

            <div class="stat-val">
                ${total}
            </div>

            <span class="stat-desc">
                Categories loaded from database
            </span>

        </div>
    `;
}

// ============================================================
// LOAD WORKSPACE TAB
// ============================================================

async function loadWorkspaceTab(tabId) {

    const wTitle =
        document.getElementById(
            "workspace-title"
        );

    const wDesc =
        document.getElementById(
            "workspace-desc"
        );

    const wActions =
        document.getElementById(
            "workspace-actions"
        );

    if (!wTitle || !wDesc || !wActions) {
        console.error(
            "Workspace elements not found."
        );
        return;
    }

    wActions.innerHTML = "";

    // ========================================================
    // MEDICINE CATEGORIES
    // ========================================================

    if (tabId === "categories") {

        wTitle.textContent =
            "Medicine Categories";

        wDesc.textContent =
            "Define therapeutic classifications for the medicine database template.";

        wActions.innerHTML = `
            <button
                class="btn btn-primary"
                onclick="openCategoryModal()">
                Add Category
            </button>
        `;

        const categories =
            await loadDashboardCategories();

        renderCategoryTable(
            categories
        );

        renderCategoryStats(
            categories
        );

        return;
    }

    // ========================================================
    // OTHER TABS
    // ========================================================

    console.log(
        "Workspace tab selected:",
        tabId
    );
}