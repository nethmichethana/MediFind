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
// MEDICINE - GET ALL
// ============================================================

async function loadDashboardMedicines() {

    try {

        const response =
            await apiFetch(
                "/v1/medicines",
                "GET"
            );

        console.log(
            "Dashboard Medicines API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load medicines:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load medicines.",
                "danger"
            );

            return [];
        }

        let medicines =
            response.body;

        if (!Array.isArray(medicines)) {

            if (
                medicines &&
                Array.isArray(medicines.content)
            ) {

                medicines =
                    medicines.content;

            } else {

                medicines = [];
            }
        }

        console.log(
            "Medicines from Backend:",
            medicines
        );

        return medicines;

    } catch (error) {

        console.error(
            "Error loading medicines:",
            error
        );

        showToast(
            "Error loading medicines.",
            "danger"
        );

        return [];
    }
}

// ============================================================
// RENDER MEDICINE TABLE
// ============================================================

function renderMedicineTable(medicines, categories = []) {

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
            "Medicine table elements not found."
        );

        return;
    }

    if (panelTitle) {

        panelTitle.textContent =
            "Medicine Catalog";
    }

    head.innerHTML = `
        <tr>
            <th style="width:60px;">ID</th>
            <th>Medicine Name</th>
            <th>Generic Name</th>
            <th>Brand</th>
            <th>Form</th>
            <th>Strength</th>
            <th>Category</th>
            <th>Prescription</th>
            <th>Status</th>
            <th style="width:170px; text-align:right;">
                Actions
            </th>
        </tr>
    `;

    body.innerHTML = "";

    if (
        !Array.isArray(medicines) ||
        medicines.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    <div
                        style="
                            margin-bottom:0.5rem;
                            font-size:1.1rem;
                            font-weight:500;
                        "
                    >
                        No medicines found
                    </div>

                    <div
                        style="font-size:0.85rem;"
                    >
                        Click "Add Medicine" to create
                        your first medicine.
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    medicines.forEach(medicine => {

        const row =
            document.createElement("tr");

        const category =
            categories.find(
                category =>
                    Number(category.id) ===
                    Number(medicine.categoryId)
            );

        const categoryName =
            category
                ? category.name
                : "Unknown";

        const prescription =
            medicine.prescriptionRequired
                ? "Required"
                : "Not Required";

        const status =
            medicine.active
                ? "Active"
                : "Inactive";

        row.innerHTML = `
            <td>
                #${escapeHtml(medicine.id)}
            </td>

            <td>
                <strong>
                    ${escapeHtml(medicine.name)}
                </strong>
            </td>

            <td>
                ${escapeHtml(
            medicine.genericName || ""
        )}
            </td>

            <td>
                ${escapeHtml(
            medicine.brandName || ""
        )}
            </td>

            <td>
                ${escapeHtml(
            medicine.dosageForm || ""
        )}
            </td>

            <td>
                ${escapeHtml(
            medicine.strength || ""
        )}
            </td>

            <td>
                ${escapeHtml(categoryName)}
            </td>

            <td>
                <span
                    class="badge ${
            medicine.prescriptionRequired
                ? "badge-danger"
                : "badge-success"
        }"
                >
                    ${prescription}
                </span>
            </td>

            <td>
                <span
                    class="badge ${
            medicine.active
                ? "badge-success"
                : "badge-danger"
        }"
                >
                    ${status}
                </span>
            </td>

            <td style="text-align:right;">

                <button
                    class="btn btn-secondary"
                    style="
                        padding:0.3rem 0.65rem;
                        font-size:0.75rem;
                        margin-right:6px;
                    "
                    onclick="
                        editMedicine(${medicine.id})
                    "
                >
                    Edit
                </button>

                <button
                    class="btn btn-secondary"
                    style="
                        padding:0.3rem 0.65rem;
                        font-size:0.75rem;
                        color:var(--accent-rose);
                        border-color:
                        rgba(244,63,94,0.3);
                    "
                    onclick="
                        deleteMedicine(${medicine.id})
                    "
                >
                    Delete
                </button>

            </td>
        `;

        body.appendChild(row);
    });
}

// ============================================================
// MEDICINE STATISTICS
// ============================================================

function renderMedicineStats(medicines) {

    const statsContainer =
        document.getElementById(
            "workspace-stats"
        );

    if (!statsContainer) {
        return;
    }

    const list =
        Array.isArray(medicines)
            ? medicines
            : [];

    const total =
        list.length;

    const active =
        list.filter(
            medicine => medicine.active === true
        ).length;

    const prescription =
        list.filter(
            medicine =>
                medicine.prescriptionRequired === true
        ).length;

    statsContainer.innerHTML = `

        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Total Medicines
                </span>

                <div class="stat-icon">
                    💊
                </div>

            </div>

            <div class="stat-val">
                ${total}
            </div>

            <span class="stat-desc">
                Medicines loaded from database
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Active Medicines
                </span>

                <div class="stat-icon">
                    ✓
                </div>

            </div>

            <div class="stat-val">
                ${active}
            </div>

            <span class="stat-desc">
                Currently active catalog items
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Prescription Medicines
                </span>

                <div class="stat-icon">
                    Rx
                </div>

            </div>

            <div class="stat-val">
                ${prescription}
            </div>

            <span class="stat-desc">
                Medicines requiring prescription
            </span>

        </div>
    `;
}
async function openMedicineModal(medicine = null) {

    const title =
        document.getElementById("medicine-modal-title");

    const idInput =
        document.getElementById("medicine-edit-id");

    const nameInput =
        document.getElementById("medicine-name");

    const genericInput =
        document.getElementById("medicine-generic-name");

    const brandInput =
        document.getElementById("medicine-brand-name");

    const dosageInput =
        document.getElementById("medicine-dosage-form");

    const strengthInput =
        document.getElementById("medicine-strength");

    const categoryInput =
        document.getElementById("medicine-category-id");

    const descriptionInput =
        document.getElementById("medicine-description");

    const prescriptionInput =
        document.getElementById(
            "medicine-prescription-required"
        );

    const activeInput =
        document.getElementById("medicine-active");


    // ---------------------------------------------------------
    // CHECK FORM ELEMENTS
    // ---------------------------------------------------------

    if (
        !title ||
        !idInput ||
        !nameInput ||
        !genericInput ||
        !brandInput ||
        !dosageInput ||
        !strengthInput ||
        !categoryInput ||
        !descriptionInput ||
        !prescriptionInput ||
        !activeInput
    ) {

        console.error(
            "Medicine modal elements are missing from dashboard.html"
        );

        showToast(
            "Medicine form could not be opened.",
            "danger"
        );

        return;
    }


    // ---------------------------------------------------------
    // LOAD CATEGORIES
    // ---------------------------------------------------------

    const categories =
        await loadDashboardCategories();


    categoryInput.innerHTML = `
        <option value="">
            Select category
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name;

        categoryInput.appendChild(option);

    });


    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------

    if (!medicine) {

        title.textContent =
            "Create Medicine";

        idInput.value = "";

        nameInput.value = "";

        genericInput.value = "";

        brandInput.value = "";

        dosageInput.value = "";

        strengthInput.value = "";

        categoryInput.value = "";

        descriptionInput.value = "";

        prescriptionInput.value = "false";

        activeInput.value = "true";


        openModal("medicine-modal");

        return;
    }


    // ---------------------------------------------------------
    // EDIT
    // ---------------------------------------------------------

    title.textContent =
        "Edit Medicine";

    idInput.value =
        medicine.id ?? "";

    nameInput.value =
        medicine.name ?? "";

    genericInput.value =
        medicine.genericName ?? "";

    brandInput.value =
        medicine.brandName ?? "";

    dosageInput.value =
        medicine.dosageForm ?? "";

    strengthInput.value =
        medicine.strength ?? "";

    categoryInput.value =
        medicine.categoryId ?? "";

    descriptionInput.value =
        medicine.description ?? "";

    prescriptionInput.value =
        String(
            medicine.prescriptionRequired ?? false
        );

    activeInput.value =
        String(
            medicine.active ?? true
        );


    openModal("medicine-modal");
}

// ============================================================
// MEDICINE - EDIT
// ============================================================

async function editMedicine(id) {

    showToast(
        "Loading medicine...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/medicines/${id}`,
                "GET"
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Cannot load medicine.",
                "danger"
            );

            return;
        }


        const medicine =
            response.body;


        if (!medicine) {

            showToast(
                "Medicine not found.",
                "danger"
            );

            return;
        }


        await openMedicineModal(
            medicine
        );

    } catch (error) {

        console.error(
            "Error loading medicine:",
            error
        );

        showToast(
            "Error loading medicine.",
            "danger"
        );
    }
}

// ============================================================
// MEDICINE - SAVE (CREATE + UPDATE)
// ============================================================

async function saveMedicine() {

    // ---------------------------------------------------------
    // Get form elements
    // ---------------------------------------------------------

    const idInput =
        document.getElementById(
            "medicine-edit-id"
        );

    const nameInput =
        document.getElementById(
            "medicine-name"
        );

    const genericInput =
        document.getElementById(
            "medicine-generic-name"
        );

    const brandInput =
        document.getElementById(
            "medicine-brand-name"
        );

    const dosageInput =
        document.getElementById(
            "medicine-dosage-form"
        );

    const strengthInput =
        document.getElementById(
            "medicine-strength"
        );

    const categoryInput =
        document.getElementById(
            "medicine-category-id"
        );

    const descriptionInput =
        document.getElementById(
            "medicine-description"
        );

    const prescriptionInput =
        document.getElementById(
            "medicine-prescription-required"
        );

    const activeInput =
        document.getElementById(
            "medicine-active"
        );


    // ---------------------------------------------------------
    // Check required elements
    // ---------------------------------------------------------

    if (
        !nameInput ||
        !genericInput ||
        !brandInput ||
        !dosageInput ||
        !strengthInput ||
        !categoryInput ||
        !descriptionInput ||
        !prescriptionInput ||
        !activeInput
    ) {

        console.error(
            "Medicine form elements not found."
        );

        showToast(
            "Medicine form fields not found.",
            "danger"
        );

        return;
    }


    // ---------------------------------------------------------
    // Read values
    // ---------------------------------------------------------

    const name =
        nameInput.value.trim();

    const genericName =
        genericInput.value.trim();

    const brandName =
        brandInput.value.trim();

    const dosageForm =
        dosageInput.value.trim();

    const strength =
        strengthInput.value.trim();

    const categoryId =
        categoryInput.value.trim();

    const description =
        descriptionInput.value.trim();


    const prescriptionRequired =
        prescriptionInput.value === "true";

    const active =
        activeInput.value === "true";


    // ---------------------------------------------------------
    // Validation
    // ---------------------------------------------------------

    if (!name) {

        showToast(
            "Medicine name is required.",
            "warning"
        );

        nameInput.focus();

        return;
    }


    if (!genericName) {

        showToast(
            "Generic name is required.",
            "warning"
        );

        genericInput.focus();

        return;
    }


    if (!brandName) {

        showToast(
            "Brand name is required.",
            "warning"
        );

        brandInput.focus();

        return;
    }


    if (!dosageForm) {

        showToast(
            "Dosage form is required.",
            "warning"
        );

        dosageInput.focus();

        return;
    }


    if (!strength) {

        showToast(
            "Strength is required.",
            "warning"
        );

        strengthInput.focus();

        return;
    }


    if (!categoryId) {

        showToast(
            "Please select a medicine category.",
            "warning"
        );

        categoryInput.focus();

        return;
    }


    // ---------------------------------------------------------
    // Detect CREATE / UPDATE
    // ---------------------------------------------------------

    const editId =
        idInput
            ? idInput.value.trim()
            : "";

    const isEdit =
        Boolean(editId);


    // ---------------------------------------------------------
    // Request payload
    // ---------------------------------------------------------

    const payload = {

        name: name,

        genericName: genericName,

        brandName: brandName,

        dosageForm: dosageForm,

        strength: strength,

        description: description,

        categoryId: Number(categoryId),

        prescriptionRequired:
        prescriptionRequired,

        active:
        active
    };


    console.log(
        "Medicine Save Payload:",
        payload
    );


    // ---------------------------------------------------------
    // API endpoint + method
    // ---------------------------------------------------------

    const endpoint =
        isEdit
            ? `/v1/medicines/${editId}`
            : "/v1/medicines";

    const method =
        isEdit
            ? "PUT"
            : "POST";


    // ---------------------------------------------------------
    // Loading message
    // ---------------------------------------------------------

    showToast(
        isEdit
            ? "Updating medicine..."
            : "Creating medicine...",
        "info"
    );


    // ---------------------------------------------------------
    // Send request
    // ---------------------------------------------------------

    try {

        const response =
            await apiFetch(
                endpoint,
                method,
                payload
            );


        console.log(
            "Medicine Save API Response:",
            response
        );


        // -----------------------------------------------------
        // Check API response
        // -----------------------------------------------------

        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                (
                    isEdit
                        ? "Failed to update medicine."
                        : "Failed to create medicine."
                ),
                "danger"
            );

            return;
        }


        // -----------------------------------------------------
        // Success message
        // -----------------------------------------------------

        showToast(
            isEdit
                ? "Medicine updated successfully!"
                : "Medicine created successfully!",
            "success"
        );


        // -----------------------------------------------------
        // Close modal
        // -----------------------------------------------------

        closeModal(
            "medicine-modal"
        );


        // -----------------------------------------------------
        // Reload medicine table from backend
        // -----------------------------------------------------

        await loadWorkspaceTab(
            "medicines"
        );


    } catch (error) {

        console.error(
            "Error saving medicine:",
            error
        );


        showToast(
            isEdit
                ? "Error updating medicine."
                : "Error creating medicine.",
            "danger"
        );
    }
}

// ============================================================
// MEDICINE - DELETE
// ============================================================

async function deleteMedicine(id) {

    if (
        !confirm(
            `Are you sure you want to delete medicine #${id}?`
        )
    ) {

        return;
    }


    showToast(
        "Deleting medicine...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/medicines/${id}`,
                "DELETE"
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to delete medicine.",
                "danger"
            );

            return;
        }


        showToast(
            "Medicine deleted successfully!",
            "success"
        );


        await loadWorkspaceTab(
            "medicines"
        );


    } catch (error) {

        console.error(
            "Error deleting medicine:",
            error
        );

        showToast(
            "Error deleting medicine.",
            "danger"
        );
    }
}

// ============================================================
// PHARMACY - GET ALL FROM BACKEND
// ============================================================

async function loadDashboardPharmacies() {

    try {

        const response =
            await apiFetch(
                "/v1/pharmacies",
                "GET"
            );

        console.log(
            "Dashboard Pharmacies API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load pharmacies:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load pharmacies.",
                "danger"
            );

            return [];
        }

        let pharmacies =
            response.body;

        if (!Array.isArray(pharmacies)) {

            if (
                pharmacies &&
                Array.isArray(pharmacies.content)
            ) {

                pharmacies =
                    pharmacies.content;

            } else {

                pharmacies = [];
            }
        }

        console.log(
            "Pharmacies from Backend:",
            pharmacies
        );

        return pharmacies;

    } catch (error) {

        console.error(
            "Error loading pharmacies:",
            error
        );

        showToast(
            "Error loading pharmacies.",
            "danger"
        );

        return [];
    }
}

// ============================================================
// RENDER PHARMACY TABLE
// ============================================================

function renderPharmacyTable(pharmacies) {

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
            "Pharmacy table elements not found."
        );

        return;
    }

    if (panelTitle) {

        panelTitle.textContent =
            "Registered Pharmacy Entities";
    }

    head.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Corporate Name</th>
            <th>Reg Code</th>
            <th>Phone</th>
            <th>HQ Email</th>
            <th>Address</th>
            <th>City</th>
        </tr>
    `;

    body.innerHTML = "";

    if (
        !Array.isArray(pharmacies) ||
        pharmacies.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    No pharmacies found.
                </td>
            </tr>
        `;

        return;
    }

    pharmacies.forEach(pharmacy => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${pharmacy.id ?? "-"}</td>

            <td>
                <strong>
                    ${pharmacy.name ?? "-"}
                </strong>
            </td>

            <td>
                ${pharmacy.registrationNumber ?? "-"}
            </td>

            <td>
                ${pharmacy.phone ?? "-"}
            </td>

            <td>
                ${pharmacy.email ?? "-"}
            </td>

            <td>
                ${pharmacy.address ?? "-"}
            </td>

            <td>
                ${pharmacy.city ?? "-"}
            </td>
        `;

        body.appendChild(tr);
    });
}
// ============================================================
// PHARMACY STATISTICS
// ============================================================

function renderPharmacyStats(
    pharmacies = []
) {

    const statsContainer =
        document.getElementById(
            "workspace-stats"
        );

    if (!statsContainer) {
        return;
    }

    const total =
        Array.isArray(pharmacies)
            ? pharmacies.length
            : 0;

    statsContainer.innerHTML = `
        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Total Pharmacies
                </span>

                <div class="stat-icon">
                    PH
                </div>

            </div>

            <div class="stat-val">
                ${total}
            </div>

            <span class="stat-desc">
                Pharmacy organizations loaded from database
            </span>

        </div>
    `;
}

// ============================================================
// PHARMACY OWNERS
// ============================================================

async function loadPharmacyOwners() {

    try {

        const response =
            await apiFetch(
                "/v1/users",
                "GET"
            );

        console.log(
            "Pharmacy Owners API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load users:",
                response?.message
            );

            return [];
        }

        let users =
            response.body;

        if (!Array.isArray(users)) {

            if (
                users &&
                Array.isArray(users.content)
            ) {

                users =
                    users.content;

            } else {

                users = [];
            }
        }

        return users.filter(
            user =>
                String(
                    user.role ||
                    user.roleName ||
                    ""
                ).toUpperCase() ===
                "PHARMACY_ADMIN"
        );

    } catch (error) {

        console.error(
            "Error loading pharmacy owners:",
            error
        );

        return [];
    }
}

// ============================================================
// OPEN PHARMACY MODAL
// ============================================================

async function openPharmacyModal() {

    const ownerDrop =
        document.getElementById(
            "pharmacy-owner"
        );

    if (!ownerDrop) {

        console.error(
            "pharmacy-owner element not found."
        );

        return;
    }

    ownerDrop.innerHTML = `
        <option value="">
            Loading pharmacy owners...
        </option>
    `;

    const owners =
        await loadPharmacyOwners();

    ownerDrop.innerHTML = `
        <option value="">
            Select Pharmacy Owner
        </option>
    `;

    owners.forEach(owner => {

        const option =
            document.createElement("option");

        option.value =
            owner.id;

        option.textContent =
            `${owner.name} (${owner.email})`;

        ownerDrop.appendChild(option);
    });

    if (owners.length === 0) {

        ownerDrop.innerHTML = `
            <option value="">
                No Pharmacy Admin users found
            </option>
        `;
    }

    openModal(
        "pharmacy-modal"
    );
}

// ============================================================
// SAVE PHARMACY
// ============================================================

async function savePharmacy() {

    const nameInput =
        document.getElementById(
            "pharmacy-name"
        );

    const regInput =
        document.getElementById(
            "pharmacy-reg"
        );

    const phoneInput =
        document.getElementById(
            "pharmacy-phone"
        );

    const emailInput =
        document.getElementById(
            "pharmacy-email"
        );

    const ownerInput =
        document.getElementById(
            "pharmacy-owner"
        );

    const editInput =
        document.getElementById(
            "pharmacy-edit-id"
        );

    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const registrationNumber =
        regInput
            ? regInput.value.trim()
            : "";

    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";

    const email =
        emailInput
            ? emailInput.value.trim()
            : "";

    const ownerId =
        ownerInput
            ? ownerInput.value
            : "";

    const editId =
        editInput
            ? editInput.value.trim()
            : "";

    if (!name) {

        showToast(
            "Pharmacy name is required.",
            "warning"
        );

        return;
    }

    const payload = {

        name: name,

        registrationNumber:
        registrationNumber,

        phone: phone,

        email: email,

        ownerId:
            ownerId
                ? Number(ownerId)
                : null
    };

    const isEdit =
        Boolean(editId);

    const endpoint =
        isEdit
            ? `/v1/pharmacies/${editId}`
            : "/v1/pharmacies";

    const method =
        isEdit
            ? "PUT"
            : "POST";

    showToast(
        isEdit
            ? "Updating pharmacy..."
            : "Registering pharmacy...",
        "info"
    );

    try {

        const response =
            await apiFetch(
                endpoint,
                method,
                payload
            );

        console.log(
            "Save Pharmacy Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to save pharmacy.",
                "danger"
            );

            return;
        }

        showToast(
            isEdit
                ? "Pharmacy updated successfully!"
                : "Pharmacy registered successfully!",
            "success"
        );

        closeModal(
            "pharmacy-modal"
        );

        await loadWorkspaceTab(
            "pharmacies"
        );

    } catch (error) {

        console.error(
            "Error saving pharmacy:",
            error
        );

        showToast(
            "Error saving pharmacy.",
            "danger"
        );
    }
}

// ============================================================
// EDIT PHARMACY
// ============================================================

async function editPharmacy(id) {

    showToast(
        "Loading pharmacy...",
        "info"
    );

    try {

        const response =
            await apiFetch(
                `/v1/pharmacies/${id}`,
                "GET"
            );

        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Cannot load pharmacy.",
                "danger"
            );

            return;
        }

        const pharmacy =
            response.body;

        if (!pharmacy) {

            showToast(
                "Pharmacy not found.",
                "danger"
            );

            return;
        }

        await openPharmacyModal();

        document.getElementById(
            "pharmacy-edit-id"
        ).value =
            pharmacy.id;

        document.getElementById(
            "pharmacy-name"
        ).value =
            pharmacy.name || "";

        document.getElementById(
            "pharmacy-reg"
        ).value =
            pharmacy.registrationNumber || "";

        document.getElementById(
            "pharmacy-phone"
        ).value =
            pharmacy.phone || "";

        document.getElementById(
            "pharmacy-email"
        ).value =
            pharmacy.email || "";

        document.getElementById(
            "pharmacy-owner"
        ).value =
            pharmacy.ownerId || "";

        const title =
            document.getElementById(
                "pharmacy-modal-title"
            );

        if (title) {

            title.textContent =
                "Edit Pharmacy";
        }

    } catch (error) {

        console.error(
            "Error loading pharmacy:",
            error
        );

        showToast(
            "Error loading pharmacy.",
            "danger"
        );
    }
}

// ============================================================
// DELETE PHARMACY
// ============================================================

async function deletePharmacy(id) {

    if (
        !confirm(
            `Are you sure you want to delete pharmacy #${id}?`
        )
    ) {

        return;
    }

    showToast(
        "Deleting pharmacy...",
        "info"
    );

    try {

        const response =
            await apiFetch(
                `/v1/pharmacies/${id}`,
                "DELETE"
            );

        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to delete pharmacy.",
                "danger"
            );

            return;
        }

        showToast(
            "Pharmacy deleted successfully!",
            "success"
        );

        await loadWorkspaceTab(
            "pharmacies"
        );

    } catch (error) {

        console.error(
            "Error deleting pharmacy:",
            error
        );

        showToast(
            "Error deleting pharmacy.",
            "danger"
        );
    }
}


// ============================================================
// PHARMACY BRANCH - GET ALL
// ============================================================

async function loadDashboardBranches() {

    try {

        const response =
            await apiFetch(
                "/v1/pharmacy-branches",
                "GET"
            );

        console.log(
            "Pharmacy Branches API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load pharmacy branches:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load pharmacy branches.",
                "danger"
            );

            return [];
        }

        let branches =
            response.body;

        if (!Array.isArray(branches)) {

            if (
                branches &&
                Array.isArray(branches.content)
            ) {

                branches =
                    branches.content;

            } else {

                branches = [];
            }
        }

        console.log(
            "Branches from Backend:",
            branches
        );

        return branches;

    } catch (error) {

        console.error(
            "Error loading pharmacy branches:",
            error
        );

        showToast(
            "Error loading pharmacy branches.",
            "danger"
        );

        return [];
    }
}


// ============================================================
// PHARMACY BRANCH - RENDER TABLE
// ============================================================

function renderBranchTable(branches) {

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
            "Branch table elements not found."
        );

        return;
    }

    if (panelTitle) {

        panelTitle.textContent =
            "Pharmacy Branch Outlets";
    }

    head.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Branch Name</th>
            <th>Address</th>
            <th>City</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Pharmacy ID</th>
            <th>Active Status</th>
            <th style="text-align:right;">
                Actions
            </th>
        </tr>
    `;

    body.innerHTML = "";

    if (
        !Array.isArray(branches) ||
        branches.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    <div
                        style="
                            margin-bottom:0.5rem;
                            font-size:1.1rem;
                            font-weight:500;
                        "
                    >
                        No branches registered
                    </div>

                    <div
                        style="font-size:0.85rem;"
                    >
                        Click "Register Pharmacy Branch"
                        to create a branch.
                    </div>
                </td>
            </tr>
        `;

        return;
    }

    branches.forEach(branch => {

        const row =
            document.createElement("tr");

        const branchName =
            escapeHtml(branch.name || "");

        const address =
            escapeHtml(branch.address || "");

        const city =
            escapeHtml(branch.city || "");

        const phone =
            escapeHtml(branch.phone || "");

        const email =
            escapeHtml(branch.email || "");

        const pharmacyId =
            branch.pharmacyId ?? "-";

        const active =
            branch.active === true;

        row.innerHTML = `
            <td>#${branch.id}</td>

            <td>
                <strong>
                    ${branchName}
                </strong>
            </td>

            <td>
                ${address || "-"}
            </td>

            <td>
                ${city || "-"}
            </td>

            <td>
                ${phone || "-"}
            </td>

            <td>
                ${email || "-"}
            </td>

            <td>
                ${pharmacyId}
            </td>

            <td>
                <span
                    class="badge ${
            active
                ? "badge-success"
                : "badge-danger"
        }"
                >
                    ${
            active
                ? "Active"
                : "Inactive"
        }
                </span>
            </td>

            <td style="text-align:right;">

                <button
                    class="btn btn-secondary"
                    style="
                        padding:0.3rem 0.65rem;
                        font-size:0.75rem;
                        margin-right:6px;
                    "
                    onclick="editBranch(${branch.id})"
                >
                    Edit
                </button>

                <button
                    class="btn btn-secondary"
                    style="
                        padding:0.3rem 0.65rem;
                        font-size:0.75rem;
                        color:var(--accent-rose);
                        border-color:rgba(244,63,94,0.3);
                    "
                    onclick="deleteBranch(${branch.id})"
                >
                    Delete
                </button>

            </td>
        `;

        body.appendChild(row);
    });
}


// ============================================================
// PHARMACY BRANCH - STATISTICS
// ============================================================

function renderBranchStats(branches) {

    const statsContainer =
        document.getElementById(
            "workspace-stats"
        );

    if (!statsContainer) {
        return;
    }

    const list =
        Array.isArray(branches)
            ? branches
            : [];

    const total =
        list.length;

    const active =
        list.filter(
            branch =>
                branch.active === true
        ).length;

    const inactive =
        total - active;

    statsContainer.innerHTML = `

        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Total Branches
                </span>

                <div class="stat-icon">

                    <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M12 10h.01M15 10h.01"
                        />
                    </svg>

                </div>

            </div>

            <div class="stat-val">
                ${total}
            </div>

            <span class="stat-desc">
                Branch outlets loaded from database
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Active Branches
                </span>

                <div class="stat-icon">

                    <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>

                </div>

            </div>

            <div class="stat-val">
                ${active}
            </div>

            <span class="stat-desc">
                Currently active outlets
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Inactive Branches
                </span>

                <div class="stat-icon">

                    <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                        />
                    </svg>

                </div>

            </div>

            <div class="stat-val">
                ${inactive}
            </div>

            <span class="stat-desc">
                Inactive or suspended outlets
            </span>

        </div>

    `;
}


// ============================================================
// OPEN PHARMACY BRANCH MODAL
// ============================================================

function openBranchModal() {

    const editId =
        document.getElementById(
            "branch-edit-id"
        );

    const name =
        document.getElementById(
            "branch-name"
        );

    const address =
        document.getElementById(
            "branch-address"
        );

    const city =
        document.getElementById(
            "branch-city"
        );

    const phone =
        document.getElementById(
            "branch-phone"
        );

    const email =
        document.getElementById(
            "branch-email"
        );

    const title =
        document.getElementById(
            "branch-modal-title"
        );


    if (editId) {
        editId.value = "";
    }

    if (name) {
        name.value = "";
    }

    if (address) {
        address.value = "";
    }

    if (city) {
        city.value = "";
    }

    if (phone) {
        phone.value = "";
    }

    if (email) {
        email.value = "";
    }

    if (title) {

        title.textContent =
            "Register Pharmacy Branch";
    }


    // Default pharmacy ID.
    // Change this according to the pharmacy
    // currently managed by the logged-in user.

    const pharmacyId =
        document.getElementById(
            "branch-pharmacy-id"
        );

    if (pharmacyId) {

        pharmacyId.value =
            sessionUser.pharmacyId ||
            sessionUser.pharmacyID ||
            "";
    }


    openModal(
        "branch-modal"
    );
}


// ============================================================
// CREATE / UPDATE PHARMACY BRANCH
// ============================================================

async function saveBranch() {

    const nameInput =
        document.getElementById(
            "branch-name"
        );

    const addressInput =
        document.getElementById(
            "branch-address"
        );

    const cityInput =
        document.getElementById(
            "branch-city"
        );

    const phoneInput =
        document.getElementById(
            "branch-phone"
        );

    const emailInput =
        document.getElementById(
            "branch-email"
        );

    const editIdInput =
        document.getElementById(
            "branch-edit-id"
        );

    const pharmacyIdInput =
        document.getElementById(
            "branch-pharmacy-id"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const address =
        addressInput
            ? addressInput.value.trim()
            : "";

    const city =
        cityInput
            ? cityInput.value.trim()
            : "";

    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";

    const email =
        emailInput
            ? emailInput.value.trim()
            : "";

    const editId =
        editIdInput
            ? editIdInput.value.trim()
            : "";

    const pharmacyId =
        pharmacyIdInput
            ? pharmacyIdInput.value.trim()
            : "";


    if (!name) {

        showToast(
            "Branch name is required.",
            "warning"
        );

        return;
    }


    if (!city) {

        showToast(
            "Branch city is required.",
            "warning"
        );

        return;
    }


    /*
     * PharmacyBranchReqDTO:
     *
     * name
     * address
     * city
     * phone
     * email
     * latitude
     * longitude
     * active
     * pharmacyId
     */

    const payload = {

        name: name,

        address: address,

        city: city,

        phone: phone,

        email: email,

        latitude: 6.9000,

        longitude: 79.8000,

        active: true,

        pharmacyId:
            pharmacyId
                ? Number(pharmacyId)
                : null
    };


    const isEdit =
        Boolean(editId);


    /*
     * CREATE
     * POST /v1/pharmacy-branches
     *
     * UPDATE
     * PUT /v1/pharmacy-branches/{id}
     */

    const endpoint =
        isEdit
            ? `/v1/pharmacy-branches/${editId}`
            : "/v1/pharmacy-branches";

    const method =
        isEdit
            ? "PUT"
            : "POST";


    if (
        !isEdit &&
        !pharmacyId
    ) {

        showToast(
            "Pharmacy ID is required.",
            "warning"
        );

        return;
    }


    showToast(
        isEdit
            ? "Updating pharmacy branch..."
            : "Creating pharmacy branch...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                endpoint,
                method,
                payload
            );


        console.log(
            "Save Branch Response:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to save pharmacy branch.",
                "danger"
            );

            return;
        }


        showToast(
            isEdit
                ? "Pharmacy branch updated successfully!"
                : "Pharmacy branch created successfully!",
            "success"
        );


        closeModal(
            "branch-modal"
        );


        // Reload directly from MySQL

        const branches =
            await loadDashboardBranches();


        renderBranchTable(
            branches
        );


        renderBranchStats(
            branches
        );


    } catch (error) {

        console.error(
            "Error saving pharmacy branch:",
            error
        );

        showToast(
            "Error saving pharmacy branch.",
            "danger"
        );
    }
}


// ============================================================
// EDIT PHARMACY BRANCH
// ============================================================

async function editBranch(id) {

    showToast(
        "Loading branch...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/pharmacy-branches/${id}`,
                "GET"
            );


        console.log(
            "Get Branch Response:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Cannot load branch.",
                "danger"
            );

            return;
        }


        const branch =
            response.body;


        if (!branch) {

            showToast(
                "Branch not found.",
                "danger"
            );

            return;
        }


        const editIdInput =
            document.getElementById(
                "branch-edit-id"
            );

        const nameInput =
            document.getElementById(
                "branch-name"
            );

        const addressInput =
            document.getElementById(
                "branch-address"
            );

        const cityInput =
            document.getElementById(
                "branch-city"
            );

        const phoneInput =
            document.getElementById(
                "branch-phone"
            );

        const emailInput =
            document.getElementById(
                "branch-email"
            );

        const pharmacyIdInput =
            document.getElementById(
                "branch-pharmacy-id"
            );

        const title =
            document.getElementById(
                "branch-modal-title"
            );


        if (editIdInput) {

            editIdInput.value =
                branch.id;
        }

        if (nameInput) {

            nameInput.value =
                branch.name || "";
        }

        if (addressInput) {

            addressInput.value =
                branch.address || "";
        }

        if (cityInput) {

            cityInput.value =
                branch.city || "";
        }

        if (phoneInput) {

            phoneInput.value =
                branch.phone || "";
        }

        if (emailInput) {

            emailInput.value =
                branch.email || "";
        }

        if (pharmacyIdInput) {

            pharmacyIdInput.value =
                branch.pharmacyId || "";
        }

        if (title) {

            title.textContent =
                "Modify Pharmacy Branch";
        }


        openModal(
            "branch-modal"
        );


    } catch (error) {

        console.error(
            "Error loading branch:",
            error
        );

        showToast(
            "Error loading branch.",
            "danger"
        );
    }
}


// ============================================================
// DELETE PHARMACY BRANCH
// ============================================================

async function deleteBranch(id) {

    if (
        !confirm(
            `Are you sure you want to delete pharmacy branch #${id}?`
        )
    ) {

        return;
    }


    showToast(
        "Deleting pharmacy branch...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/pharmacy-branches/${id}`,
                "DELETE"
            );


        console.log(
            "Delete Branch Response:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to delete branch.",
                "danger"
            );

            return;
        }


        showToast(
            "Pharmacy branch deleted successfully!",
            "success"
        );


        // Reload directly from MySQL

        const branches =
            await loadDashboardBranches();


        renderBranchTable(
            branches
        );


        renderBranchStats(
            branches
        );


    } catch (error) {

        console.error(
            "Error deleting pharmacy branch:",
            error
        );

        showToast(
            "Error deleting pharmacy branch.",
            "danger"
        );
    }
}

// ============================================================
// RESERVATION - GET ALL
// ============================================================

async function loadDashboardReservations() {

    try {

        const response = await apiFetch(
            "/v1/reservations",
            "GET"
        );

        console.log(
            "Dashboard Reservations API Response:",
            response
        );

        if (!response || !response.success) {

            console.error(
                "Failed to load reservations:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load reservations.",
                "danger"
            );

            return [];
        }

        let reservations = response.body;

        if (!Array.isArray(reservations)) {

            if (
                reservations &&
                Array.isArray(reservations.content)
            ) {

                reservations = reservations.content;

            } else {

                reservations = [];
            }
        }

        console.log(
            "Reservations from Backend:",
            reservations
        );

        return reservations;

    } catch (error) {

        console.error(
            "Error loading reservations:",
            error
        );

        showToast(
            "Error loading reservations.",
            "danger"
        );

        return [];
    }
}


// ============================================================
// LOAD RESERVATION BY ID
// ============================================================

async function loadReservationById(id) {

    try {

        const response = await apiFetch(
            `/v1/reservations/${id}`,
            "GET"
        );

        console.log(
            "Reservation By ID API Response:",
            response
        );

        if (!response || !response.success) {

            showToast(
                response?.message ||
                "Cannot load reservation.",
                "danger"
            );

            return null;
        }

        return response.body;

    } catch (error) {

        console.error(
            "Error loading reservation:",
            error
        );

        showToast(
            "Error loading reservation.",
            "danger"
        );

        return null;
    }
}


// ============================================================
// RENDER RESERVATION TABLE
// ============================================================

function renderReservationTable(reservations) {

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
            "Reservation table elements not found."
        );

        return;
    }

    if (panelTitle) {
        panelTitle.textContent =
            "Pending & Active Reservations";
    }

    head.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Branch</th>
            <th>Reservation Date</th>
            <th>Pickup Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th style="text-align:right;">Actions</th>
        </tr>
    `;

    body.innerHTML = "";

    if (
        !Array.isArray(reservations) ||
        reservations.length === 0
    ) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    <div
                        style="
                            margin-bottom:0.5rem;
                            font-size:1.1rem;
                            font-weight:500;
                        "
                    >
                        No reservations found
                    </div>

                    <div style="font-size:0.85rem;">
                        Reservations created by customers
                        will appear here.
                    </div>
                </td>
            </tr>
        `;

        return;
    }


    reservations.forEach(reservation => {

        const row =
            document.createElement("tr");

        const reservationDate =
            reservation.reservationDate
                ? formatReservationDate(
                    reservation.reservationDate
                )
                : "N/A";

        const pickupDate =
            reservation.pickupDate
                ? formatReservationDate(
                    reservation.pickupDate
                )
                : "N/A";

        const status =
            reservation.status || "PENDING";

        const notes =
            reservation.notes || "-";

        row.innerHTML = `
            <td>
                <strong>
                    #${reservation.id}
                </strong>
            </td>

            <td>
                User #${reservation.userId ?? "N/A"}
            </td>

            <td>
                Branch #${reservation.pharmacyBranchId ?? "N/A"}
            </td>

            <td>
                ${escapeHtml(reservationDate)}
            </td>

            <td>
                ${escapeHtml(pickupDate)}
            </td>

            <td>
                <span class="reservation-status ${getReservationStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <span
                    style="
                        color:var(--text-secondary);
                    "
                >
                    ${escapeHtml(notes)}
                </span>
            </td>

            <td style="text-align:right;">

                <button
                    class="btn btn-secondary"
                    style="
                        padding:0.3rem 0.65rem;
                        font-size:0.75rem;
                    "
                    onclick="processReservation(${reservation.id})"
                >
                    Process
                </button>

            </td>
        `;

        body.appendChild(row);
    });
}


// ============================================================
// RESERVATION DATE FORMATTER
// ============================================================

function formatReservationDate(dateValue) {

    if (!dateValue) {
        return "N/A";
    }

    try {

        const date =
            new Date(dateValue);

        if (isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return String(dateValue);
    }
}


// ============================================================
// RESERVATION STATUS STYLE
// ============================================================

function getReservationStatusClass(status) {

    switch (status) {

        case "PENDING":
            return "status-pending";

        case "PREPARED":
            return "status-prepared";

        case "COMPLETED":
            return "status-completed";

        case "CANCELLED":
            return "status-cancelled";

        default:
            return "status-pending";
    }
}


// ============================================================
// RESERVATION STATISTICS
// ============================================================

function renderReservationStats(reservations) {

    const statsContainer =
        document.getElementById(
            "workspace-stats"
        );

    if (!statsContainer) {
        return;
    }

    const list =
        Array.isArray(reservations)
            ? reservations
            : [];

    const total =
        list.length;

    const pending =
        list.filter(
            r => r.status === "PENDING"
        ).length;

    const prepared =
        list.filter(
            r => r.status === "PREPARED"
        ).length;

    const completed =
        list.filter(
            r => r.status === "COMPLETED"
        ).length;

    const cancelled =
        list.filter(
            r => r.status === "CANCELLED"
        ).length;


    statsContainer.innerHTML = `

        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">
                <span class="stat-title">
                    Total Reservations
                </span>
            </div>

            <div class="stat-val">
                ${total}
            </div>

            <span class="stat-desc">
                Reservations from backend
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">
                <span class="stat-title">
                    Pending
                </span>
            </div>

            <div class="stat-val">
                ${pending}
            </div>

            <span class="stat-desc">
                Awaiting verification
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">
                <span class="stat-title">
                    Prepared
                </span>
            </div>

            <div class="stat-val">
                ${prepared}
            </div>

            <span class="stat-desc">
                Ready for pickup
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">
                <span class="stat-title">
                    Completed
                </span>
            </div>

            <div class="stat-val">
                ${completed}
            </div>

            <span class="stat-desc">
                Successfully completed
            </span>

        </div>


        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">
                <span class="stat-title">
                    Cancelled
                </span>
            </div>

            <div class="stat-val">
                ${cancelled}
            </div>

            <span class="stat-desc">
                Cancelled reservations
            </span>

        </div>

    `;
}


// ============================================================
// PROCESS RESERVATION
// ============================================================

async function processReservation(resId) {

    const reservation =
        await loadReservationById(resId);

    if (!reservation) {
        return;
    }

    document.getElementById(
        "process-res-id"
    ).value = reservation.id;


    document.getElementById(
        "process-res-user"
    ).textContent =
        `User #${reservation.userId ?? "N/A"}`;


    document.getElementById(
        "process-res-items"
    ).textContent =
        "Reservation items are managed through ReservationItem API";


    document.getElementById(
        "process-res-notes"
    ).textContent =
        reservation.notes || "None";


    document.getElementById(
        "process-status"
    ).value =
        reservation.status || "PENDING";


    const feedback =
        document.getElementById(
            "process-feedback"
        );

    if (feedback) {
        feedback.value = "";
    }

    openModal(
        "reservation-process-modal"
    );
}


// ============================================================
// UPDATE RESERVATION STATUS
// ============================================================

async function saveReservationStatus() {

    const id =
        document.getElementById(
            "process-res-id"
        ).value;

    const status =
        document.getElementById(
            "process-status"
        ).value;


    if (!id) {

        showToast(
            "Reservation ID not found.",
            "danger"
        );

        return;
    }

    const existingReservation =
        await loadReservationById(id);

    if (!existingReservation) {
        return;
    }


    const payload = {

        reservationDate:
        existingReservation.reservationDate,

        pickupDate:
        existingReservation.pickupDate,

        status:
        status,

        notes:
            existingReservation.notes || "",

        userId:
        existingReservation.userId,

        pharmacyBranchId:
        existingReservation.pharmacyBranchId
    };


    showToast(
        "Updating reservation status...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/reservations/${id}`,
                "PUT",
                payload
            );


        console.log(
            "Update Reservation API Response:",
            response
        );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to update reservation.",
                "danger"
            );

            return;
        }


        closeModal(
            "reservation-process-modal"
        );


        showToast(
            "Reservation status updated successfully!",
            "success"
        );


        /*
         * Reload directly from MySQL/backend.
         */

        await loadWorkspaceTab(
            "reservations"
        );

    } catch (error) {

        console.error(
            "Error updating reservation:",
            error
        );

        showToast(
            "Error updating reservation.",
            "danger"
        );
    }
}


// ============================================================
// DELETE RESERVATION
// ============================================================

async function deleteReservation(id) {

    if (
        !confirm(
            `Are you sure you want to delete reservation #${id}?`
        )
    ) {
        return;
    }


    showToast(
        "Deleting reservation...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/reservations/${id}`,
                "DELETE"
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to delete reservation.",
                "danger"
            );

            return;
        }


        showToast(
            "Reservation deleted successfully!",
            "success"
        );


        await loadWorkspaceTab(
            "reservations"
        );


    } catch (error) {

        console.error(
            "Error deleting reservation:",
            error
        );

        showToast(
            "Error deleting reservation.",
            "danger"
        );
    }
}

// ============================================================
// INVENTORY - GET ALL
// ============================================================

async function loadDashboardInventory() {

    try {

        const response =
            await apiFetch("/v1/inventories", "GET");

        console.log(
            "Dashboard Inventory API Response:",
            response
        );

        if (!response || !response.success) {

            showToast(
                response?.message ||
                "Cannot load inventory.",
                "danger"
            );

            return [];
        }

        let inventory = response.body;

        if (!Array.isArray(inventory)) {

            if (
                inventory &&
                Array.isArray(inventory.content)
            ) {
                inventory = inventory.content;
            } else {
                inventory = [];
            }
        }

        return inventory;

    } catch (error) {

        console.error(
            "Error loading inventory:",
            error
        );

        showToast(
            "Error loading inventory.",
            "danger"
        );

        return [];
    }
}

async function loadInventoryRelatedData() {

    const [branchesResponse, batchesResponse] =
        await Promise.all([
            apiFetch("/v1/pharmacy-branches", "GET"),
            apiFetch("/v1/medicine-batches", "GET")
        ]);

    let branches =
        branchesResponse?.body || [];

    let batches =
        batchesResponse?.body || [];

    if (!Array.isArray(branches)) {
        branches = branches.content || [];
    }

    if (!Array.isArray(batches)) {
        batches = batches.content || [];
    }

    return {
        branches,
        batches
    };
}

async function renderInventoryTable() {

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

    panelTitle.textContent =
        "Branch Stock Allocation Sheets";

    head.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Branch</th>
            <th>Medicine / Batch</th>
            <th>Available Qty</th>
            <th>Reorder Level</th>
            <th>Last Updated</th>
            <th>Status</th>
            <th>Actions</th>
        </tr>
    `;

    body.innerHTML = `
        <tr>
            <td colspan="8"
                style="text-align:center; padding:2rem;">
                Loading inventory...
            </td>
        </tr>
    `;

    const inventory =
        await loadDashboardInventory();

    const related =
        await loadInventoryRelatedData();

    const branches =
        related.branches;

    const batches =
        related.batches;

    if (inventory.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;
                           color:var(--text-muted);">
                    No inventory records found.
                </td>
            </tr>
        `;

        return;
    }

    body.innerHTML = "";

    inventory.forEach(inv => {

        const branch =
            branches.find(
                b => b.id == inv.pharmacyBranchId
            );

        const batch =
            batches.find(
                b => b.id == inv.medicineBatchId
            );

        const branchName =
            branch?.name ||
            "Unknown Branch";

        const batchName =
            batch?.batchNumber ||
            "Unknown Batch";

        const isLow =
            inv.quantity <= inv.reorderLevel;

        const statusBadge =
            isLow
                ? `<span class="badge badge-danger">
                       LOW STOCK
                   </span>`
                : `<span class="badge badge-success">
                       OK STOCK
                   </span>`;

        const tr =
            document.createElement("tr");

        tr.innerHTML = `
            <td>${inv.id}</td>

            <td>
                <strong>${branchName}</strong>
            </td>

            <td>
                <strong>
                    ${batchName}
                </strong>
            </td>

            <td>
                ${inv.quantity} Units
            </td>

            <td>
                ${inv.reorderLevel} Units
            </td>

            <td>
                <small>
                    ${inv.lastUpdated
            ? new Date(
                inv.lastUpdated
            ).toLocaleString()
            : "N/A"}
                </small>
            </td>

            <td>
                ${statusBadge}
            </td>

            <td>

                <button
                    class="btn btn-secondary"
                    style="padding:0.25rem 0.5rem;
                           font-size:0.75rem;"
                    onclick="editInventory(${inv.id})">
                    Edit
                </button>

                <button
                    class="btn btn-danger"
                    style="padding:0.25rem 0.5rem;
                           font-size:0.75rem;"
                    onclick="deleteInventory(${inv.id})">
                    Delete
                </button>

            </td>
        `;

        body.appendChild(tr);
    });
}

const requestBody = {

    pharmacyBranchId:
        Number(
            document.getElementById(
                "inventory-branch"
            ).value
        ),

    medicineBatchId:
        Number(
            document.getElementById(
                "inventory-batch"
            ).value
        ),

    quantity:
        Number(
            document.getElementById(
                "inventory-qty"
            ).value
        ),

    reorderLevel:
        Number(
            document.getElementById(
                "inventory-reorder"
            ).value
        )
};

const response =
    await apiFetch(
        "/v1/inventories",
        "POST",
        requestBody
    );












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

// ============================================================
// MEDICINES
// ============================================================

    if (tabId === "medicines") {
        wTitle.textContent = "Medicine Catalog";
        wDesc.textContent = "Manage medicines stored in the MediFind database.";
        wActions.innerHTML = `
        <button class="btn btn-primary"    onclick="openMedicineModal()">+ Add Medicine</button>
    `;
        const medicines = await loadDashboardMedicines();
        const categories = await loadDashboardCategories();
        renderMedicineTable(
            medicines,
            categories
        );
        renderMedicineStats(
            medicines
        );
        return;
    }

// ============================================================
// PHARMACIES
// ============================================================

    if (tabId === "pharmacies") {
        wTitle.textContent = "Registered Pharmacies";
        wDesc.textContent = "Manage affiliated corporate pharmacy accounts.";
        wActions.innerHTML = `
        <button  class="btn btn-primary" onclick="openPharmacyModal()" >
            + Register Pharmacy
        </button>
    `;

        const pharmacies = await loadDashboardPharmacies();
        const owners = await loadPharmacyOwners();

        renderPharmacyTable(pharmacies, owners);
        renderPharmacyStats(pharmacies);
        return;
    }

 if (tabId === "branches") {
    wTitle.textContent = "Pharmacy Branches";
    wDesc.textContent = "Manage pharmacy branch outlets and their operational status.";
    wActions.innerHTML = ` <button  class="btn btn-primary" onclick="openBranchModal()">
         Register Pharmacy Branch
        </button>
    `;
        loadDashboardBranches().then(branches => {
        renderBranchTable(branches);
        renderBranchStats(branches);

       }
     );
    }

    if (tabId === "reservations") {
        wTitle.textContent = "Prescription Reservations";
        wDesc.textContent = "Process and verify client pharmacy reservations.";
        const reservations = await loadDashboardReservations();
        renderReservationStats(reservations);
        renderReservationTable(reservations);
        return;
    }

    if (tabId === "inventory") {
        wTitle.textContent = "Inventory Stock & Alerts";
        wDesc.textContent = "Manage stock quantities, warning levels, and identify low stock levels.";
        wActions.innerHTML = `<button class="btn btn-primary" onclick="openInventoryModal()">
            Update Stock
        </button>
    `;

        // Inventory data will be loaded from backend here
        const inventory = await loadDashboardInventory();

        renderInventoryTable(inventory);
        renderInventoryStats(inventory);

        return;
    }

    console.log("Workspace tab selected:", tabId);
}

// ============================================================
// TAB FRIENDLY NAMES
// ============================================================

function getTabFriendlyName(tabId) {
    const names = {
        categories: "Medicine Categories",
        medicines: "Medicines",
        pharmacies: "Pharmacies",
        branches: "Branches",
        inventory: "Inventory",
        reservations: "Reservations",

    };

    return names[tabId] || tabId;
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
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75V11.25a9 9 0 00-9-9z" />
            </svg>
             Medicine Categories
            </li>

            <li class="sidebar-item" onclick="selectSidebarTab(this, 'medicines')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" 
            />
            </svg>
           Medicines
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
             <li class="sidebar-item" onclick="selectSidebarTab(this, 'inventory')">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round"   stroke-linejoin="round" d="M3 7h18M3 7l2 14h14l2-14M8 7V5a4 4 0 018 0v2" />
               </svg>
                Inventory
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

