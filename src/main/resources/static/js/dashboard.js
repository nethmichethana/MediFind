// ============================================================
// BACKEND CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:8080";

// ============================================================
// HTML ESCAPING UTILITY
// ============================================================

function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = "success") {
    const existingToast = document.querySelector(".medifind-toast");
    if (existingToast && existingToast.parentNode) {
        existingToast.parentNode.removeChild(existingToast);
    }

    const toast = document.createElement("div");
    toast.className = "medifind-toast animate-fade";

    toast.style.position = "fixed";
    toast.style.bottom = "2rem";
    toast.style.left = "2rem";
    toast.style.padding = "0.75rem 1.5rem";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "10000";
    toast.style.fontWeight = "600";
    toast.style.fontSize = "0.9rem";
    toast.style.boxShadow = "0 8px 30px rgba(0,0,0,0.4)";
    toast.style.transition = "opacity 0.4s ease";

    if (type === "success") {
        toast.style.background = "#10b981";
        toast.style.color = "white";
    } else if (type === "danger") {
        toast.style.background = "#f43f5e";
        toast.style.color = "white";
    } else if (type === "warning") {
        toast.style.background = "#f59e0b";
        toast.style.color = "white";
    } else {
        toast.style.background = "#1e293b";
        toast.style.color = "white";
    }

    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 400);
    }, 3200);
}

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
        const response = await fetch(API_BASE_URL + endpoint, options);

        const contentType = response.headers.get("content-type");
        let data;

        if (contentType && contentType.includes("application/json")) {
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

        if (!response.ok) {
            return {
                success: false,
                httpStatus: response.status,
                status: (typeof data === "object" && data?.status !== undefined) ? data.status : response.status,
                body: null,
                message: (typeof data === "object" && (data?.message || data?.error))
                    ? (data.message || data.error)
                    : `Server returned HTTP ${response.status}`
            };
        }

        const applicationStatus = (typeof data === "object" && data?.status !== undefined) ? data.status : 0;
        const responseBody = (typeof data === "object" && data?.body !== undefined) ? data.body : data;
        const responseMessage = (typeof data === "object" && data?.message) ? data.message : "Operation Successful";

        return {
            success: true,
            httpStatus: response.status,
            status: applicationStatus,
            body: responseBody,
            message: responseMessage
        };

    } catch (error) {
        console.error("API Network Error:", error);
        return {
            success: false,
            httpStatus: 0,
            status: null,
            body: null,
            message: "Cannot connect to server. Ensure Spring Boot is running on port 8080."
        };
    }
}

// ============================================================
// MEDICINE CATEGORY - GET ALL
// ============================================================

async function loadDashboardCategories() {
    try {
        const response = await apiFetch("/v1/medicine-categories", "GET");

        console.log("Dashboard Categories API Response:", response);

        if (!response || !response.success) {
            console.error("Failed to load medicine categories:", response?.message);
            showToast(response?.message || "Cannot load medicine categories.", "danger");
            return [];
        }

        let categories = response.body;

        if (!Array.isArray(categories)) {
            if (categories && Array.isArray(categories.content)) {
                categories = categories.content;
            } else {
                categories = [];
            }
        }

        console.log("Categories from Backend:", categories);
        return categories;

    } catch (error) {
        console.error("Error loading dashboard categories:", error);
        showToast("Error loading medicine categories.", "danger");
        return [];
    }
}

// ============================================================
// RENDER MEDICINE CATEGORY TABLE
// ============================================================

function renderCategoryTable(categories) {
    const head = document.getElementById("workspace-table-head");
    const body = document.getElementById("workspace-table-body");
    const panelTitle = document.getElementById("table-panel-title");

    if (!head || !body) {
        console.error("Category table elements not found.");
        return;
    }

    if (panelTitle) {
        panelTitle.textContent = "Medicine Category Definitions";
    }

    head.innerHTML = `
        <tr>
            <th style="width: 80px;">ID</th>
            <th>Category Name</th>
            <th>Description</th>
            <th style="width: 170px; text-align: right;">Actions</th>
        </tr>
    `;

    body.innerHTML = "";

    if (!Array.isArray(categories) || categories.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding: 2.5rem; color:var(--text-muted);">
                    <div style="margin-bottom: 0.5rem; font-size: 1.1rem; font-weight: 500;">No categories found</div>
                    <div style="font-size: 0.85rem;">Click "Add Category" above to create your first therapeutic classification.</div>
                </td>
            </tr>
        `;
        return;
    }

    categories.forEach(category => {
        const row = document.createElement("tr");

        const catName = category.name || "";
        const catDesc = category.description || "";
        const safeName = escapeHtml(catName);
        const safeDesc = escapeHtml(catDesc);
        // For inline JS string attribute, escape single quotes and backslashes
        const jsName = catName.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
        const jsDesc = catDesc.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

        row.innerHTML = `
            <td>#${category.id}</td>
            <td><strong>${safeName}</strong></td>
            <td style="color: var(--text-secondary);">${safeDesc || "<em>No description provided</em>"}</td>
            <td style="text-align: right;">
                <button
                    class="btn btn-secondary"
                    style="padding:0.3rem 0.65rem; font-size:0.75rem; margin-right: 6px;"
                    onclick="editCategory(${category.id}, '${jsName}', '${jsDesc}')">
                    Edit
                </button>
                <button
                    class="btn btn-secondary"
                    style="padding:0.3rem 0.65rem; font-size:0.75rem; color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.3);"
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
    const statsContainer = document.getElementById("workspace-stats");
    if (!statsContainer) return;

    const total = Array.isArray(categories) ? categories.length : 0;

    statsContainer.innerHTML = `
        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">Total Categories</span>
                <div class="stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                </div>
            </div>
            <div class="stat-val">${total}</div>
            <span class="stat-desc">Therapeutic classifications loaded from database</span>
        </div>
    `;
}

// ============================================================
// MODAL CONTROLS
// ============================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "flex";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

function openCategoryModal(id = null, name = "", description = "") {
    const title = document.getElementById("category-modal-title");
    const idInput = document.getElementById("category-edit-id");
    const nameInput = document.getElementById("category-name");
    const descInput = document.getElementById("category-desc");

    if (id) {
        if (title) title.textContent = "Edit Medicine Category";
        if (idInput) idInput.value = id;
        if (nameInput) nameInput.value = name;
        if (descInput) descInput.value = description;
    } else {
        if (title) title.textContent = "Create Medicine Category";
        if (idInput) idInput.value = "";
        if (nameInput) nameInput.value = "";
        if (descInput) descInput.value = "";
    }

    openModal("category-modal");
}

function editCategory(id, name, description) {
    openCategoryModal(id, name, description);
}

// ============================================================
// CATEGORY CRUD OPERATIONS
// ============================================================

async function saveCategory() {
    const idInput = document.getElementById("category-edit-id");
    const nameInput = document.getElementById("category-name");
    const descInput = document.getElementById("category-desc");

    if (!nameInput) return;

    const name = nameInput.value.trim();
    const description = descInput ? descInput.value.trim() : "";

    if (!name) {
        showToast("Category name is required.", "warning");
        nameInput.focus();
        return;
    }

    const editId = idInput ? idInput.value.trim() : "";
    const isEdit = Boolean(editId);

    const payload = {
        name: name,
        description: description
    };

    const endpoint = isEdit ? `/v1/medicine-categories/${editId}` : "/v1/medicine-categories";
    const method = isEdit ? "PUT" : "POST";

    showToast(isEdit ? "Updating category..." : "Creating category...", "info");

    try {
        const response = await apiFetch(endpoint, method, payload);

        if (!response || !response.success) {
            showToast(response?.message || "Failed to save category.", "danger");
            return;
        }

        showToast(isEdit ? "Category updated successfully!" : "Category created successfully!", "success");
        closeModal("category-modal");

        // Reload data to reflect changes
        const categories = await loadDashboardCategories();
        renderCategoryTable(categories);
        renderCategoryStats(categories);

    } catch (error) {
        console.error("Error saving category:", error);
        showToast("Error saving category.", "danger");
    }
}

async function deleteCategory(id) {
    if (!confirm(`Are you sure you want to delete category #${id}?`)) {
        return;
    }

    showToast("Deleting category...", "info");

    try {
        const response = await apiFetch(`/v1/medicine-categories/${id}`, "DELETE");

        if (!response || !response.success) {
            showToast(response?.message || "Failed to delete category.", "danger");
            return;
        }

        showToast("Category deleted successfully!", "success");

        // Reload data
        const categories = await loadDashboardCategories();
        renderCategoryTable(categories);
        renderCategoryStats(categories);

    } catch (error) {
        console.error("Error deleting category:", error);
        showToast("Error deleting category.", "danger");
    }
}

// ============================================================
// LOAD WORKSPACE TAB
// ============================================================

async function loadWorkspaceTab(tabId) {
    const wTitle = document.getElementById("workspace-title");
    const wDesc = document.getElementById("workspace-desc");
    const wActions = document.getElementById("workspace-actions");
    const wStats = document.getElementById("workspace-stats");
    const tHead = document.getElementById("workspace-table-head");
    const tBody = document.getElementById("workspace-table-body");
    const tTitle = document.getElementById("table-panel-title");

    if (!wTitle || !wDesc || !wActions) {
        console.error("Workspace elements not found.");
        return;
    }

    wActions.innerHTML = "";

    // MEDICINE CATEGORIES
    if (tabId === "categories") {
        wTitle.textContent = "Medicine Categories";
        wDesc.textContent = "Define therapeutic classifications for the medicine database template.";

        wActions.innerHTML = `
            <button class="btn btn-primary" onclick="openCategoryModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Category
            </button>
        `;

        const categories = await loadDashboardCategories();
        renderCategoryTable(categories);
        renderCategoryStats(categories);
        return;
    }

    // PLACEHOLDERS FOR OTHER TABS
    if (tabId === "pharmacies") {
        wTitle.textContent = "Registered Pharmacies";
        wDesc.textContent = "Manage affiliated corporate pharmacy accounts.";
        if (tTitle) tTitle.textContent = "Pharmacy Corporate Records";
        if (wStats) wStats.innerHTML = "";
        if (tHead) tHead.innerHTML = `<tr><th>ID</th><th>Pharmacy Name</th><th>Reg No</th><th>Contact Phone</th></tr>`;
        if (tBody) tBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted);">Select Medicine Categories in sidebar to manage categories.</td></tr>`;
        return;
    }

    if (tabId === "branches") {
        wTitle.textContent = "Branch Outlets";
        wDesc.textContent = "Configure branch locations and operating contacts.";
        if (tTitle) tTitle.textContent = "Branch Records";
        if (wStats) wStats.innerHTML = "";
        if (tHead) tHead.innerHTML = `<tr><th>ID</th><th>Branch Name</th><th>City</th><th>Phone</th></tr>`;
        if (tBody) tBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted);">Branch management module.</td></tr>`;
        return;
    }

    if (tabId === "reservations") {
        wTitle.textContent = "Prescription Reservations";
        wDesc.textContent = "Process and verify client pharmacy reservations.";
        if (tTitle) tTitle.textContent = "Pending & Active Reservations";
        if (wStats) wStats.innerHTML = "";
        if (tHead) tHead.innerHTML = `<tr><th>ID</th><th>Client</th><th>Items</th><th>Status</th></tr>`;
        if (tBody) tBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:2rem; color:var(--text-muted);">Reservation management module.</td></tr>`;
        return;
    }

    console.log("Workspace tab selected:", tabId);
}

// ============================================================
// SIDEBAR & ROLE SWITCHER
// ============================================================

function selectSidebarTab(elem, tabId) {
    document.querySelectorAll(".sidebar-item").forEach(item => {
        item.classList.remove("active");
    });

    if (elem) {
        elem.classList.add("active");
    }

    loadWorkspaceTab(tabId);
}

function switchRole(role) {
    // Update role tab buttons
    document.querySelectorAll(".role-tab").forEach(tab => {
        if (tab.getAttribute("data-role") === role) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    const sidebarTitle = document.getElementById("sidebar-role-title");
    const sidebarDesc = document.getElementById("sidebar-role-desc");
    const activeUserStatus = document.getElementById("active-user-status");
    const menuList = document.getElementById("sidebar-menu-list");

    if (!menuList) return;

    menuList.innerHTML = "";

    if (role === "ADMIN") {
        if (sidebarTitle) sidebarTitle.textContent = "System Admin";
        if (sidebarDesc) sidebarDesc.textContent = "Main platform controls";
        if (activeUserStatus) activeUserStatus.textContent = "Logged in: System Admin";

        menuList.innerHTML = `
            <li class="sidebar-item active" onclick="selectSidebarTab(this, 'categories')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Medicine Categories
            </li>
            <li class="sidebar-item" onclick="selectSidebarTab(this, 'pharmacies')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
                Pharmacies
            </li>
        `;
        loadWorkspaceTab("categories");

    } else if (role === "PHARMACY_ADMIN") {
        if (sidebarTitle) sidebarTitle.textContent = "Pharmacy Admin";
        if (sidebarDesc) sidebarDesc.textContent = "Branch operations";
        if (activeUserStatus) activeUserStatus.textContent = "Logged in: Branch Admin";

        menuList.innerHTML = `
            <li class="sidebar-item active" onclick="selectSidebarTab(this, 'branches')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.25A2.25 2.25 0 010 18.75V5.25A2.25 2.25 0 012.25 3h15a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0117.25 21h-3.75z" />
                </svg>
                Branches
            </li>
        `;
        loadWorkspaceTab("branches");

    } else if (role === "PHARMACY_STAFF") {
        if (sidebarTitle) sidebarTitle.textContent = "Dispensing Staff";
        if (sidebarDesc) sidebarDesc.textContent = "Prescriptions & pickups";
        if (activeUserStatus) activeUserStatus.textContent = "Logged in: Staff";

        menuList.innerHTML = `
            <li class="sidebar-item active" onclick="selectSidebarTab(this, 'reservations')">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                Reservations
            </li>
        `;
        loadWorkspaceTab("reservations");
    }
}

// ============================================================
// INITIALIZATION ON PAGE LOAD
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("MediFind Management Console initialized.");
    // Default to ADMIN view which loads medicine categories
    switchRole("ADMIN");
});