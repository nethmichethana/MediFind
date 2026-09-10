// ============================================================
// BACKEND CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:8080";

// ============================================================
// HTML ESCAPING UTILITY
// ============================================================

function escapeHtml(str) {

    if (str === null || str === undefined) {
        return "";
    }

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

    // Remove existing toast
    $(".medifind-toast").remove();


    // Create toast using jQuery
    const $toast = $("<div>", {
        class: "medifind-toast animate-fade"
    });


    // Common toast styles
    $toast.css({
        position: "fixed",
        bottom: "2rem",
        left: "2rem",
        padding: "0.75rem 1.5rem",
        borderRadius: "8px",
        zIndex: "10000",
        fontWeight: "600",
        fontSize: "0.9rem",
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        transition: "opacity 0.4s ease"
    });


    // Toast type styles
    if (type === "success") {

        $toast.css({
            background: "#10b981",
            color: "white"
        });

    } else if (type === "danger") {

        $toast.css({
            background: "#f43f5e",
            color: "white"
        });

    } else if (type === "warning") {

        $toast.css({
            background: "#f59e0b",
            color: "white"
        });

    } else {

        $toast.css({
            background: "#1e293b",
            color: "white"
        });
    }


    // Set message
    $toast.text(message);


    // Add toast to body
    $("body").append($toast);


    // Fade out after 3.2 seconds
    setTimeout(function () {

        $toast.css("opacity", "0");


        // Remove after fade animation
        setTimeout(function () {

            $toast.remove();

        }, 400);

    }, 3200);
}
// ============================================================
// API AJAX HELPER - jQuery
// ============================================================

function apiFetch(endpoint, method = "GET", body = null) {

    const token = localStorage.getItem("medifind_token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const ajaxOptions = {
        url: API_BASE_URL + endpoint,
        type: method,
        headers: headers,
        dataType: "json"
    };

    // Request body
    if (body !== null) {
        ajaxOptions.data = JSON.stringify(body);
    }

    return new Promise(function (resolve) {

        $.ajax(ajaxOptions)

            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------
            .done(function (data, textStatus, jqXHR) {

                console.log("API Response:", {
                    endpoint: endpoint,
                    method: method,
                    httpStatus: jqXHR.status,
                    data: data
                });

                const applicationStatus =
                    (
                        typeof data === "object" &&
                        data !== null &&
                        data.status !== undefined
                    )
                        ? data.status
                        : 0;

                const responseBody =
                    (
                        typeof data === "object" &&
                        data !== null &&
                        data.body !== undefined
                    )
                        ? data.body
                        : data;

                const responseMessage =
                    (
                        typeof data === "object" &&
                        data !== null &&
                        data.message
                    )
                        ? data.message
                        : "Operation Successful";

                resolve({
                    success: true,
                    httpStatus: jqXHR.status,
                    status: applicationStatus,
                    body: responseBody,
                    message: responseMessage
                });
            })

            // ------------------------------------------------
            // ERROR
            // ------------------------------------------------
            .fail(function (jqXHR, textStatus, errorThrown) {

                console.error("API Error:", {
                    endpoint: endpoint,
                    method: method,
                    httpStatus: jqXHR.status,
                    textStatus: textStatus,
                    errorThrown: errorThrown,
                    response: jqXHR.responseText
                });

                let data = jqXHR.responseJSON;

                // If response is not JSON
                if (!data) {
                    data = jqXHR.responseText;
                }

                resolve({
                    success: false,
                    httpStatus: jqXHR.status || 0,

                    status:
                        (
                            typeof data === "object" &&
                            data !== null &&
                            data.status !== undefined
                        )
                            ? data.status
                            : (jqXHR.status || 0),

                    body: null,

                    message:
                        (
                            typeof data === "object" &&
                            data !== null &&
                            (data.message || data.error)
                        )
                            ? (data.message || data.error)
                            : `Server returned HTTP ${jqXHR.status || 0}`
                });
            });
    });
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


        if (!response) {

            showToast(
                "Cannot load medicine categories.",
                "danger"
            );

            return [];
        }


        /*
         * CommonResponse:
         *
         * {
         *     status: 0,
         *     body: [...],
         *     message: "Operation successful"
         * }
         */

        if (response.status !== 0) {

            console.error(
                "Category API error:",
                response.message
            );


            showToast(
                response.message ||
                "Cannot load medicine categories.",
                "danger"
            );


            return [];
        }


        let categories = response.body;


        /*
         * Safety check.
         *
         * If backend returns:
         *
         * body: [...]
         *
         * use it directly.
         *
         * If backend later returns:
         *
         * body: {
         *     content: [...]
         * }
         *
         * handle that too.
         */

        if (!Array.isArray(categories)) {

            if (
                categories &&
                Array.isArray(categories.content)
            ) {

                categories = categories.content;

            } else {

                categories = [];

            }

        }


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

    const $head =
        $("#workspace-table-head");

    const $body =
        $("#workspace-table-body");

    const $panelTitle =
        $("#table-panel-title");


    if (
        $head.length === 0 ||
        $body.length === 0
    ) {

        console.error(
            "Category table elements not found."
        );

        return;

    }


    // --------------------------------------------------------
    // PANEL TITLE
    // --------------------------------------------------------

    if ($panelTitle.length > 0) {

        $panelTitle.text(
            "Medicine Category Definitions"
        );

    }


    // --------------------------------------------------------
    // TABLE HEADER
    // --------------------------------------------------------

    $head.html(`

        <tr>

            <th style="width: 80px;">
                ID
            </th>

            <th>
                Category Name
            </th>

            <th>
                Description
            </th>

            <th style="
                width: 170px;
                text-align: right;
            ">
                Actions
            </th>

        </tr>

    `);


    // --------------------------------------------------------
    // CLEAR OLD DATA
    // --------------------------------------------------------

    $body.empty();


    // --------------------------------------------------------
    // EMPTY STATE
    // --------------------------------------------------------

    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {

        $body.html(`

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >

                    <div style="
                        margin-bottom:0.5rem;
                        font-size:1.1rem;
                        font-weight:500;
                    ">
                        No categories found
                    </div>

                    <div style="
                        font-size:0.85rem;
                    ">
                        Click "Add Category" above to create
                        your first therapeutic classification.
                    </div>

                </td>

            </tr>

        `);

        return;

    }


    // --------------------------------------------------------
    // RENDER EACH CATEGORY
    // --------------------------------------------------------

    $.each(
        categories,
        function (index, category) {


            const id =
                category.id;


            const name =
                category.name || "";


            const description =
                category.description || "";


            const safeName =
                escapeHtml(name);


            const safeDescription =
                escapeHtml(description);


            /*
             * Instead of putting category name/description
             * directly into inline JavaScript, store them
             * in data attributes.
             *
             * This avoids:
             *
             * openCategoryModal is not defined
             * quote escaping problems
             * apostrophe problems
             */

            const $row = $("<tr>");


            // ------------------------------------------------
            // ID
            // ------------------------------------------------

            $row.append(`

                <td>
                    #${id}
                </td>

            `);


            // ------------------------------------------------
            // NAME
            // ------------------------------------------------

            $row.append(`

                <td>
                    <strong>
                        ${safeName}
                    </strong>
                </td>

            `);


            // ------------------------------------------------
            // DESCRIPTION
            // ------------------------------------------------

            $row.append(`

                <td style="
                    color:var(--text-secondary);
                ">

                    ${
                safeDescription ||
                "<em>No description provided</em>"
            }

                </td>

            `);


            // ------------------------------------------------
            // ACTIONS
            // ------------------------------------------------

            const $actions =
                $("<td>")
                    .css({
                        "text-align": "right"
                    });


            // ------------------------------------------------
            // EDIT BUTTON
            // ------------------------------------------------

            const $editButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Edit"

                });


            $editButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                marginRight: "6px"

            });


            /*
             * jQuery click event.
             *
             * No inline onclick.
             */

            $editButton.on(
                "click",
                function () {

                    editCategory(
                        id,
                        name,
                        description
                    );

                }
            );


            // ------------------------------------------------
            // DELETE BUTTON
            // ------------------------------------------------

            const $deleteButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Delete"

                });


            $deleteButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                color: "var(--accent-rose)",

                borderColor:
                    "rgba(244, 63, 94, 0.3)"

            });


            $deleteButton.on(
                "click",
                function () {

                    deleteCategory(id);

                }
            );


            // ------------------------------------------------
            // ADD BUTTONS
            // ------------------------------------------------

            $actions
                .append($editButton)
                .append($deleteButton);


            $row.append($actions);


            // ------------------------------------------------
            // ADD ROW TO TABLE
            // ------------------------------------------------

            $body.append($row);

        }
    );

}


// ============================================================
// CATEGORY STATISTICS
// ============================================================

function renderCategoryStats(categories) {

    const $statsContainer =
        $("#workspace-stats");


    if ($statsContainer.length === 0) {

        return;

    }


    const total =
        Array.isArray(categories)
            ? categories.length
            : 0;


    $statsContainer.html(`

        <div class="glass-card stat-card animate-fade">

            <div class="stat-header">

                <span class="stat-title">
                    Total Categories
                </span>


                <div class="stat-icon">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
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
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />

                    </svg>

                </div>

            </div>


            <div class="stat-val">
                ${total}
            </div>


            <span class="stat-desc">
                Therapeutic classifications loaded
                from database
            </span>

        </div>

    `);

}


// ============================================================
// MODAL CONTROLS
// ============================================================

function openModal(modalId) {

    const $modal =
        $("#" + modalId);


    if ($modal.length === 0) {

        console.error(
            "Modal not found:",
            modalId
        );

        return;

    }


    $modal.css(
        "display",
        "flex"
    );

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal(modalId) {

    const $modal =
        $("#" + modalId);


    if ($modal.length === 0) {

        return;

    }


    $modal.css(
        "display",
        "none"
    );

}


// ============================================================
// OPEN CATEGORY MODAL
// ============================================================

function openCategoryModal(
    id = null,
    name = "",
    description = ""
) {

    const $title =
        $("#category-modal-title");


    const $idInput =
        $("#category-edit-id");


    const $nameInput =
        $("#category-name");


    const $descInput =
        $("#category-desc");


    if (
        $title.length === 0 ||
        $idInput.length === 0 ||
        $nameInput.length === 0 ||
        $descInput.length === 0
    ) {

        console.error(
            "Category modal elements not found."
        );

        return;

    }


    // --------------------------------------------------------
    // EDIT
    // --------------------------------------------------------

    if (
        id !== null &&
        id !== undefined &&
        id !== ""
    ) {

        $title.text(
            "Edit Medicine Category"
        );


        $idInput.val(id);


        $nameInput.val(name);


        $descInput.val(description);

    }


        // --------------------------------------------------------
        // CREATE
    // --------------------------------------------------------

    else {

        $title.text(
            "Create Medicine Category"
        );


        $idInput.val("");


        $nameInput.val("");


        $descInput.val("");

    }


    openModal(
        "category-modal"
    );

}


// ============================================================
// EDIT CATEGORY
// ============================================================

function editCategory(
    id,
    name,
    description
) {

    console.log(
        "Edit Category:",
        {
            id: id,
            name: name,
            description: description
        }
    );


    openCategoryModal(
        id,
        name,
        description
    );

}


// ============================================================
// SAVE CATEGORY
// CREATE + UPDATE
// ============================================================

async function saveCategory() {

    const $idInput =
        $("#category-edit-id");


    const $nameInput =
        $("#category-name");


    const $descInput =
        $("#category-desc");


    if ($nameInput.length === 0) {

        console.error(
            "Category name input not found."
        );

        return;

    }


    // --------------------------------------------------------
    // GET FORM VALUES
    // --------------------------------------------------------

    const name =
        $.trim(
            $nameInput.val() || ""
        );


    const description =
        $descInput.length > 0
            ? $.trim(
                $descInput.val() || ""
            )
            : "";


    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {

        showToast(
            "Category name is required.",
            "warning"
        );


        $nameInput.trigger(
            "focus"
        );


        return;

    }


    // --------------------------------------------------------
    // GET EDIT ID
    // --------------------------------------------------------

    const editId =
        $idInput.length > 0
            ? $.trim(
                $idInput.val() || ""
            )
            : "";


    const isEdit =
        editId !== "";


    // --------------------------------------------------------
    // REQUEST PAYLOAD
    // --------------------------------------------------------

    const payload = {

        name: name,

        description: description

    };


    // --------------------------------------------------------
    // ENDPOINT
    // --------------------------------------------------------

    const endpoint =
        isEdit
            ? `/v1/medicine-categories/${editId}`
            : "/v1/medicine-categories";


    const method =
        isEdit
            ? "PUT"
            : "POST";


    console.log(
        "Saving Category:",
        {
            method: method,
            endpoint: endpoint,
            payload: payload
        }
    );


    showToast(
        isEdit
            ? "Updating category..."
            : "Creating category...",
        "info"
    );


    // --------------------------------------------------------
    // AJAX REQUEST
    // --------------------------------------------------------

    try {

        const response =
            await apiFetch(
                endpoint,
                method,
                payload
            );


        console.log(
            "Save Category Response:",
            response
        );


        // ----------------------------------------------------
        // BACKEND COMMON RESPONSE
        // ----------------------------------------------------

        if (
            !response ||
            response.status !== 0
        ) {

            showToast(
                response?.message ||
                "Failed to save category.",
                "danger"
            );


            return;

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        showToast(
            isEdit
                ? "Category updated successfully!"
                : "Category created successfully!",
            "success"
        );


        // ----------------------------------------------------
        // CLOSE MODAL
        // ----------------------------------------------------

        closeModal(
            "category-modal"
        );


        // ----------------------------------------------------
        // RELOAD BACKEND DATA
        // ----------------------------------------------------

        const categories =
            await loadDashboardCategories();


        renderCategoryTable(
            categories
        );


        renderCategoryStats(
            categories
        );


    } catch (error) {

        console.error(
            "Error saving category:",
            error
        );


        /*
         * jQuery AJAX error response
         */

        let message =
            "Error saving category.";


        if (
            error &&
            error.responseJSON &&
            error.responseJSON.message
        ) {

            message =
                error.responseJSON.message;

        }


        showToast(
            message,
            "danger"
        );

    }

}


// ============================================================
// DELETE CATEGORY
// ============================================================

async function deleteCategory(id) {

    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {

        console.error(
            "Category ID is missing."
        );

        return;

    }


    const confirmed =
        confirm(
            `Are you sure you want to delete category #${id}?`
        );


    if (!confirmed) {

        return;

    }


    showToast(
        "Deleting category...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/medicine-categories/${id}`,
                "DELETE"
            );


        console.log(
            "Delete Category Response:",
            response
        );


        // ----------------------------------------------------
        // CHECK BACKEND RESPONSE
        // ----------------------------------------------------

        if (
            !response ||
            response.status !== 0
        ) {

            showToast(
                response?.message ||
                "Failed to delete category.",
                "danger"
            );


            return;

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        showToast(
            "Category deleted successfully!",
            "success"
        );


        // ----------------------------------------------------
        // RELOAD DATABASE DATA
        // ----------------------------------------------------

        const categories =
            await loadDashboardCategories();


        renderCategoryTable(
            categories
        );


        renderCategoryStats(
            categories
        );


    } catch (error) {

        console.error(
            "Error deleting category:",
            error
        );


        let message =
            "Error deleting category.";


        if (
            error &&
            error.responseJSON &&
            error.responseJSON.message
        ) {

            message =
                error.responseJSON.message;

        }


        showToast(
            message,
            "danger"
        );

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

    const $head =
        $("#workspace-table-head");

    const $body =
        $("#workspace-table-body");

    const $panelTitle =
        $("#table-panel-title");


    if (
        $head.length === 0 ||
        $body.length === 0
    ) {

        console.error(
            "Medicine table elements not found."
        );

        return;

    }


    // --------------------------------------------------------
    // PANEL TITLE
    // --------------------------------------------------------

    if ($panelTitle.length > 0) {

        $panelTitle.text(
            "Medicine Catalog"
        );

    }


    // --------------------------------------------------------
    // TABLE HEADER
    // --------------------------------------------------------

    $head.html(`

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

    `);


    // --------------------------------------------------------
    // CLEAR OLD DATA
    // --------------------------------------------------------

    $body.empty();


    // --------------------------------------------------------
    // EMPTY STATE
    // --------------------------------------------------------

    if (
        !Array.isArray(medicines) ||
        medicines.length === 0
    ) {

        $body.html(`

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

        `);

        return;

    }


    // --------------------------------------------------------
    // RENDER EACH MEDICINE
    // --------------------------------------------------------

    $.each(
        medicines,
        function (index, medicine) {

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


            const $row = $("<tr>");


            // ------------------------------------------------
            // ID
            // ------------------------------------------------

            $row.append(`

                <td>
                    #${escapeHtml(medicine.id)}
                </td>

            `);


            // ------------------------------------------------
            // NAME
            // ------------------------------------------------

            $row.append(`

                <td>
                    <strong>
                        ${escapeHtml(medicine.name)}
                    </strong>
                </td>

            `);


            // ------------------------------------------------
            // GENERIC NAME
            // ------------------------------------------------

            $row.append(`

                <td>
                    ${escapeHtml(medicine.genericName || "")}
                </td>

            `);


            // ------------------------------------------------
            // BRAND
            // ------------------------------------------------

            $row.append(`

                <td>
                    ${escapeHtml(medicine.brandName || "")}
                </td>

            `);


            // ------------------------------------------------
            // FORM
            // ------------------------------------------------

            $row.append(`

                <td>
                    ${escapeHtml(medicine.dosageForm || "")}
                </td>

            `);


            // ------------------------------------------------
            // STRENGTH
            // ------------------------------------------------

            $row.append(`

                <td>
                    ${escapeHtml(medicine.strength || "")}
                </td>

            `);


            // ------------------------------------------------
            // CATEGORY
            // ------------------------------------------------

            $row.append(`

                <td>
                    ${escapeHtml(categoryName)}
                </td>

            `);


            // ------------------------------------------------
            // PRESCRIPTION
            // ------------------------------------------------

            $row.append(`

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

            `);


            // ------------------------------------------------
            // STATUS
            // ------------------------------------------------

            $row.append(`

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

            `);


            // ------------------------------------------------
            // ACTIONS
            // ------------------------------------------------

            const $actions =
                $("<td>")
                    .css({
                        "text-align": "right"
                    });


            // ------------------------------------------------
            // EDIT BUTTON
            // ------------------------------------------------

            const $editButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Edit"

                });


            $editButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                marginRight: "6px"

            });


            /*
             * jQuery click event.
             *
             * No inline onclick.
             */

            $editButton.on(
                "click",
                function () {

                    editMedicine(
                        medicine.id
                    );

                }
            );


            // ------------------------------------------------
            // DELETE BUTTON
            // ------------------------------------------------

            const $deleteButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Delete"

                });


            $deleteButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                color: "var(--accent-rose)",

                borderColor:
                    "rgba(244, 63, 94, 0.3)"

            });


            $deleteButton.on(
                "click",
                function () {

                    deleteMedicine(
                        medicine.id
                    );

                }
            );


            // ------------------------------------------------
            // ADD BUTTONS
            // ------------------------------------------------

            $actions
                .append($editButton)
                .append($deleteButton);


            $row.append($actions);


            // ------------------------------------------------
            // ADD ROW TO TABLE
            // ------------------------------------------------

            $body.append($row);

        }
    );

}

// ============================================================
// MEDICINE STATISTICS
// ============================================================

function renderMedicineStats(medicines) {

    const $statsContainer =
        $("#workspace-stats");


    if ($statsContainer.length === 0) {

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

    $statsContainer.html(`

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
    `);
}

async function openMedicineModal(medicine = null) {

    const $title =
        $("#medicine-modal-title");

    const $idInput =
        $("#medicine-edit-id");

    const $nameInput =
        $("#medicine-name");

    const $genericInput =
        $("#medicine-generic-name");

    const $brandInput =
        $("#medicine-brand-name");

    const $dosageInput =
        $("#medicine-dosage-form");

    const $strengthInput =
        $("#medicine-strength");

    const $categoryInput =
        $("#medicine-category-id");

    const $descriptionInput =
        $("#medicine-description");

    const $prescriptionInput =
        $("#medicine-prescription-required");

    const $activeInput =
        $("#medicine-active");


    // ---------------------------------------------------------
    // CHECK FORM ELEMENTS
    // ---------------------------------------------------------

    if (
        $title.length === 0 ||
        $idInput.length === 0 ||
        $nameInput.length === 0 ||
        $genericInput.length === 0 ||
        $brandInput.length === 0 ||
        $dosageInput.length === 0 ||
        $strengthInput.length === 0 ||
        $categoryInput.length === 0 ||
        $descriptionInput.length === 0 ||
        $prescriptionInput.length === 0 ||
        $activeInput.length === 0
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


    $categoryInput.html(`
        <option value="">
            Select category
        </option>
    `);


    $.each(
        categories,
        function (index, category) {

            $categoryInput.append(
                $("<option>", {
                    value: category.id,
                    text: category.name
                })
            );

        }
    );


    // ---------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------

    if (!medicine) {

        $title.text(
            "Create Medicine"
        );

        $idInput.val("");

        $nameInput.val("");

        $genericInput.val("");

        $brandInput.val("");

        $dosageInput.val("");

        $strengthInput.val("");

        $categoryInput.val("");

        $descriptionInput.val("");

        $prescriptionInput.val("false");

        $activeInput.val("true");


        openModal("medicine-modal");

        return;
    }


    // ---------------------------------------------------------
    // EDIT
    // ---------------------------------------------------------

    $title.text(
        "Edit Medicine"
    );

    $idInput.val(
        medicine.id ?? ""
    );

    $nameInput.val(
        medicine.name ?? ""
    );

    $genericInput.val(
        medicine.genericName ?? ""
    );

    $brandInput.val(
        medicine.brandName ?? ""
    );

    $dosageInput.val(
        medicine.dosageForm ?? ""
    );

    $strengthInput.val(
        medicine.strength ?? ""
    );

    $categoryInput.val(
        medicine.categoryId ?? ""
    );

    $descriptionInput.val(
        medicine.description ?? ""
    );

    $prescriptionInput.val(
        String(
            medicine.prescriptionRequired ?? false
        )
    );

    $activeInput.val(
        String(
            medicine.active ?? true
        )
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

    const $idInput =
        $("#medicine-edit-id");

    const $nameInput =
        $("#medicine-name");

    const $genericInput =
        $("#medicine-generic-name");

    const $brandInput =
        $("#medicine-brand-name");

    const $dosageInput =
        $("#medicine-dosage-form");

    const $strengthInput =
        $("#medicine-strength");

    const $categoryInput =
        $("#medicine-category-id");

    const $descriptionInput =
        $("#medicine-description");

    const $prescriptionInput =
        $("#medicine-prescription-required");

    const $activeInput =
        $("#medicine-active");


    // ---------------------------------------------------------
    // Check required elements
    // ---------------------------------------------------------

    if (
        $nameInput.length === 0 ||
        $genericInput.length === 0 ||
        $brandInput.length === 0 ||
        $dosageInput.length === 0 ||
        $strengthInput.length === 0 ||
        $categoryInput.length === 0 ||
        $descriptionInput.length === 0 ||
        $prescriptionInput.length === 0 ||
        $activeInput.length === 0
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
        ($nameInput.val() || "").trim();

    const genericName =
        ($genericInput.val() || "").trim();

    const brandName =
        ($brandInput.val() || "").trim();

    const dosageForm =
        ($dosageInput.val() || "").trim();

    const strength =
        ($strengthInput.val() || "").trim();

    const categoryId =
        ($categoryInput.val() || "").trim();

    const description =
        ($descriptionInput.val() || "").trim();


    const prescriptionRequired =
        $prescriptionInput.val() === "true";

    const active =
        $activeInput.val() === "true";


    // ---------------------------------------------------------
    // Validation
    // ---------------------------------------------------------

    if (!name) {

        showToast(
            "Medicine name is required.",
            "warning"
        );

        $nameInput.focus();

        return;
    }


    if (!genericName) {

        showToast(
            "Generic name is required.",
            "warning"
        );

        $genericInput.focus();

        return;
    }


    if (!brandName) {

        showToast(
            "Brand name is required.",
            "warning"
        );

        $brandInput.focus();

        return;
    }


    if (!dosageForm) {

        showToast(
            "Dosage form is required.",
            "warning"
        );

        $dosageInput.focus();

        return;
    }


    if (!strength) {

        showToast(
            "Strength is required.",
            "warning"
        );

        $strengthInput.focus();

        return;
    }


    if (!categoryId) {

        showToast(
            "Please select a medicine category.",
            "warning"
        );

        $categoryInput.focus();

        return;
    }


    // ---------------------------------------------------------
    // Detect CREATE / UPDATE
    // ---------------------------------------------------------

    const editId =
        $idInput.length > 0
            ? ($idInput.val() || "").trim()
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
// LOAD WORKSPACE TAB
// ============================================================

// ============================================================
// INVENTORY - GET ALL FROM BACKEND
// ============================================================

async function loadDashboardInventory() {

    try {

        const response =
            await apiFetch(
                "/v1/inventories",
                "GET"
            );

        console.log(
            "Dashboard Inventory API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load inventory:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load inventory.",
                "danger"
            );

            return [];
        }

        let inventory =
            response.body;

        if (!Array.isArray(inventory)) {

            if (
                inventory &&
                Array.isArray(inventory.content)
            ) {

                inventory =
                    inventory.content;

            } else {

                inventory = [];
            }
        }

        console.log(
            "Inventory from Backend:",
            inventory
        );

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

// ============================================================
// INVENTORY - RENDER TABLE
// ============================================================

function renderInventoryTable(inventory) {

    const $head =
        $("#workspace-table-head");

    const $body =
        $("#workspace-table-body");

    const $panelTitle =
        $("#table-panel-title");


    if (
        $head.length === 0 ||
        $body.length === 0
    ) {

        console.error(
            "Inventory table elements not found."
        );

        return;

    }


    if ($panelTitle.length > 0) {

        $panelTitle.text(
            "Stock Inventory"
        );

    }


    $head.html(`

        <tr>
            <th style="width:60px;">ID</th>
            <th>Medicine / Batch Item</th>
            <th>Current Quantity</th>
            <th>Reorder Threshold</th>
            <th>Status</th>
            <th style="width:170px; text-align:right;">
                Actions
            </th>
        </tr>

    `);


    $body.empty();


    if (
        !Array.isArray(inventory) ||
        inventory.length === 0
    ) {

        $body.html(`

            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    <div style="
                        margin-bottom:0.5rem;
                        font-size:1.1rem;
                        font-weight:500;
                    ">
                        No inventory records found
                    </div>

                    <div style="font-size:0.85rem;">
                        Inventory records are created
                        automatically when a medicine
                        batch is registered.
                    </div>
                </td>
            </tr>

        `);

        return;

    }


    $.each(
        inventory,
        function (index, item) {

            const medicineName =
                item.medicineName ||
                (item.medicine && item.medicine.name) ||
                "Unknown";

            const quantity =
                Number(item.quantity ?? 0);

            const reorderThreshold =
                Number(item.reorderThreshold ?? 0);

            const lowStock =
                quantity <= reorderThreshold;


            const $row = $("<tr>");


            $row.append(`
                <td>
                    #${escapeHtml(item.id)}
                </td>
            `);


            $row.append(`
                <td>
                    <strong>
                        ${escapeHtml(medicineName)}
                    </strong>
                </td>
            `);


            $row.append(`
                <td>
                    ${quantity}
                </td>
            `);


            $row.append(`
                <td>
                    ${reorderThreshold}
                </td>
            `);


            $row.append(`
                <td>
                    <span
                        class="badge ${
                lowStock
                    ? "badge-danger"
                    : "badge-success"
            }"
                    >
                        ${
                lowStock
                    ? "Low Stock"
                    : "In Stock"
            }
                    </span>
                </td>
            `);


            const $actions =
                $("<td>")
                    .css({
                        "text-align": "right"
                    });


            const $editButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Edit"

                });


            $editButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                marginRight: "6px"

            });


            $editButton.on(
                "click",
                function () {

                    editInventory(
                        item.id,
                        medicineName,
                        quantity,
                        reorderThreshold
                    );

                }
            );


            const $deleteButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Delete"

                });


            $deleteButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                color: "var(--accent-rose)",

                borderColor:
                    "rgba(244, 63, 94, 0.3)"

            });


            $deleteButton.on(
                "click",
                function () {

                    deleteInventory(
                        item.id
                    );

                }
            );


            $actions
                .append($editButton)
                .append($deleteButton);

            $row.append($actions);


            $body.append($row);

        }
    );

}

// ============================================================
// INVENTORY STATISTICS
// ============================================================

function renderInventoryStats(inventory) {

    const $statsContainer =
        $("#workspace-stats");


    if ($statsContainer.length === 0) {

        return;

    }


    const list =
        Array.isArray(inventory)
            ? inventory
            : [];

    const total =
        list.length;

    const lowStockCount =
        list.filter(
            item =>
                Number(item.quantity ?? 0) <=
                Number(item.reorderThreshold ?? 0)
        ).length;

    const totalUnits =
        list.reduce(
            (sum, item) =>
                sum + Number(item.quantity ?? 0),
            0
        );


    $statsContainer.html(`

        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">
                    Tracked Items
                </span>
                <div class="stat-icon">📦</div>
            </div>
            <div class="stat-val">${total}</div>
            <span class="stat-desc">
                Inventory records in the system
            </span>
        </div>

        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">
                    Low Stock Alerts
                </span>
                <div class="stat-icon">⚠️</div>
            </div>
            <div class="stat-val">${lowStockCount}</div>
            <span class="stat-desc">
                Items at or below reorder threshold
            </span>
        </div>

        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">
                    Total Units
                </span>
                <div class="stat-icon">🔢</div>
            </div>
            <div class="stat-val">${totalUnits}</div>
            <span class="stat-desc">
                Physical units across all items
            </span>
        </div>

    `);

}

// ============================================================
// INVENTORY - OPEN EDIT MODAL
// ============================================================

function editInventory(id, medicineName, quantity, reorderThreshold) {

    const $idInput =
        $("#inventory-edit-id");

    const $nameInput =
        $("#inventory-med-name");

    const $qtyInput =
        $("#inventory-qty");

    const $reorderInput =
        $("#inventory-reorder");


    if (
        $idInput.length === 0 ||
        $nameInput.length === 0 ||
        $qtyInput.length === 0 ||
        $reorderInput.length === 0
    ) {

        console.error(
            "Inventory modal elements are missing from dashboard.html"
        );

        showToast(
            "Inventory form could not be opened.",
            "danger"
        );

        return;
    }


    $idInput.val(id ?? "");

    $nameInput.val(medicineName ?? "");

    $qtyInput.val(quantity ?? 0);

    $reorderInput.val(reorderThreshold ?? 0);


    openModal("inventory-modal");
}

// ============================================================
// INVENTORY - SAVE (UPDATE STOCK)
// ============================================================

async function saveInventory() {

    const $idInput =
        $("#inventory-edit-id");

    const $qtyInput =
        $("#inventory-qty");

    const $reorderInput =
        $("#inventory-reorder");


    if (
        $idInput.length === 0 ||
        $qtyInput.length === 0 ||
        $reorderInput.length === 0
    ) {

        console.error(
            "Inventory form elements not found."
        );

        showToast(
            "Inventory form fields not found.",
            "danger"
        );

        return;
    }


    const id =
        ($idInput.val() || "").trim();

    const quantity =
        Number($qtyInput.val());

    const reorderThreshold =
        Number($reorderInput.val());


    if (!id) {

        showToast(
            "No inventory item selected.",
            "danger"
        );

        return;
    }


    if (
        isNaN(quantity) ||
        quantity < 0
    ) {

        showToast(
            "Please enter a valid quantity.",
            "warning"
        );

        $qtyInput.focus();

        return;
    }


    if (
        isNaN(reorderThreshold) ||
        reorderThreshold < 0
    ) {

        showToast(
            "Please enter a valid reorder threshold.",
            "warning"
        );

        $reorderInput.focus();

        return;
    }


    const payload = {

        quantity: quantity,

        reorderThreshold: reorderThreshold

    };


    showToast(
        "Updating stock...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/inventories/${id}`,
                "PUT",
                payload
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to update stock.",
                "danger"
            );

            return;
        }


        showToast(
            "Stock updated successfully!",
            "success"
        );


        closeModal(
            "inventory-modal"
        );


        await loadWorkspaceTab(
            "inventory"
        );


    } catch (error) {

        console.error(
            "Error updating stock:",
            error
        );

        showToast(
            "Error updating stock.",
            "danger"
        );
    }
}

// ============================================================
// INVENTORY - DELETE
// ============================================================

async function deleteInventory(id) {

    if (
        !confirm(
            `Are you sure you want to delete inventory record #${id}?`
        )
    ) {

        return;
    }


    showToast(
        "Deleting inventory record...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/inventories/${id}`,
                "DELETE"
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to delete inventory record.",
                "danger"
            );

            return;
        }


        showToast(
            "Inventory record deleted successfully!",
            "success"
        );


        await loadWorkspaceTab(
            "inventory"
        );


    } catch (error) {

        console.error(
            "Error deleting inventory record:",
            error
        );

        showToast(
            "Error deleting inventory record.",
            "danger"
        );
    }
}

// ============================================================
// NOTIFICATIONS - GET ALL FROM BACKEND
// ============================================================

async function loadDashboardNotifications() {

    try {

        const response =
            await apiFetch(
                "/v1/notifications",
                "GET"
            );

        console.log(
            "Dashboard Notifications API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load notifications:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load notifications.",
                "danger"
            );

            return [];
        }

        let notifications =
            response.body;

        if (!Array.isArray(notifications)) {

            if (
                notifications &&
                Array.isArray(notifications.content)
            ) {

                notifications =
                    notifications.content;

            } else {

                notifications = [];
            }
        }

        console.log(
            "Notifications from Backend:",
            notifications
        );

        return notifications;

    } catch (error) {

        console.error(
            "Error loading notifications:",
            error
        );

        showToast(
            "Error loading notifications.",
            "danger"
        );

        return [];
    }
}

// ============================================================
// NOTIFICATIONS - RENDER TABLE
// ============================================================

function renderNotificationTable(notifications) {

    const $head =
        $("#workspace-table-head");

    const $body =
        $("#workspace-table-body");

    const $panelTitle =
        $("#table-panel-title");


    if (
        $head.length === 0 ||
        $body.length === 0
    ) {

        console.error(
            "Notification table elements not found."
        );

        return;

    }


    if ($panelTitle.length > 0) {

        $panelTitle.text(
            "System Notifications"
        );

    }


    $head.html(`

        <tr>
            <th style="width:60px;">ID</th>
            <th>Title</th>
            <th>Message</th>
            <th>Type</th>
            <th>Audience</th>
            <th style="width:110px; text-align:right;">
                Actions
            </th>
        </tr>

    `);


    $body.empty();


    if (
        !Array.isArray(notifications) ||
        notifications.length === 0
    ) {

        $body.html(`

            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    <div style="
                        margin-bottom:0.5rem;
                        font-size:1.1rem;
                        font-weight:500;
                    ">
                        No notifications found
                    </div>

                    <div style="font-size:0.85rem;">
                        Click "Send Notification" above to
                        broadcast your first message.
                    </div>
                </td>
            </tr>

        `);

        return;

    }


    $.each(
        notifications,
        function (index, notification) {

            const badgeClass =
                notification.type === "ALERT"
                    ? "badge-danger"
                    : notification.type === "WARNING"
                        ? "badge-warning"
                        : "badge-success";


            const $row = $("<tr>");


            $row.append(`
                <td>
                    #${escapeHtml(notification.id)}
                </td>
            `);


            $row.append(`
                <td>
                    <strong>
                        ${escapeHtml(notification.title)}
                    </strong>
                </td>
            `);


            $row.append(`
                <td style="color:var(--text-secondary);">
                    ${escapeHtml(
                (notification.message || "").length > 60
                    ? notification.message.slice(0, 60) + "..."
                    : (notification.message || "")
            )}
                </td>
            `);


            $row.append(`
                <td>
                    <span class="badge ${badgeClass}">
                        ${escapeHtml(notification.type || "INFO")}
                    </span>
                </td>
            `);


            $row.append(`
                <td>
                    ${escapeHtml(notification.audience || "ALL")}
                </td>
            `);


            const $actions =
                $("<td>")
                    .css({
                        "text-align": "right"
                    });


            const $deleteButton =
                $("<button>", {

                    type: "button",

                    class: "btn btn-secondary",

                    text: "Delete"

                });


            $deleteButton.css({

                padding: "0.3rem 0.65rem",

                fontSize: "0.75rem",

                color: "var(--accent-rose)",

                borderColor:
                    "rgba(244, 63, 94, 0.3)"

            });


            $deleteButton.on(
                "click",
                function () {

                    deleteNotification(
                        notification.id
                    );

                }
            );


            $actions.append($deleteButton);

            $row.append($actions);


            $body.append($row);

        }
    );

}

// ============================================================
// NOTIFICATION STATISTICS
// ============================================================

function renderNotificationStats(notifications) {

    const $statsContainer =
        $("#workspace-stats");


    if ($statsContainer.length === 0) {

        return;

    }


    const list =
        Array.isArray(notifications)
            ? notifications
            : [];

    const total =
        list.length;

    const alerts =
        list.filter(
            notification => notification.type === "ALERT"
        ).length;

    const warnings =
        list.filter(
            notification => notification.type === "WARNING"
        ).length;


    $statsContainer.html(`

        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">
                    Total Notifications
                </span>
                <div class="stat-icon">🔔</div>
            </div>
            <div class="stat-val">${total}</div>
            <span class="stat-desc">
                Broadcasts sent from the console
            </span>
        </div>

        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">
                    Alerts
                </span>
                <div class="stat-icon">🚨</div>
            </div>
            <div class="stat-val">${alerts}</div>
            <span class="stat-desc">
                Critical alerts requiring attention
            </span>
        </div>

        <div class="glass-card stat-card animate-fade">
            <div class="stat-header">
                <span class="stat-title">
                    Warnings
                </span>
                <div class="stat-icon">⚠️</div>
            </div>
            <div class="stat-val">${warnings}</div>
            <span class="stat-desc">
                Warnings sent to users
            </span>
        </div>

    `);

}

// ============================================================
// NOTIFICATION - OPEN MODAL
// ============================================================

function openNotificationModal() {

    const $title =
        $("#notification-modal-title");

    const $idInput =
        $("#notification-edit-id");

    const $titleInput =
        $("#notification-title");

    const $messageInput =
        $("#notification-message");

    const $typeInput =
        $("#notification-type");

    const $audienceInput =
        $("#notification-audience");


    if (
        $title.length === 0 ||
        $idInput.length === 0 ||
        $titleInput.length === 0 ||
        $messageInput.length === 0 ||
        $typeInput.length === 0 ||
        $audienceInput.length === 0
    ) {

        console.error(
            "Notification modal elements are missing from dashboard.html"
        );

        showToast(
            "Notification form could not be opened.",
            "danger"
        );

        return;
    }


    $title.text(
        "Send Notification"
    );

    $idInput.val("");

    $titleInput.val("");

    $messageInput.val("");

    $typeInput.val("INFO");

    $audienceInput.val("ALL");


    openModal("notification-modal");
}

// ============================================================
// NOTIFICATION - SAVE (SEND)
// ============================================================

async function saveNotification() {

    const $titleInput =
        $("#notification-title");

    const $messageInput =
        $("#notification-message");

    const $typeInput =
        $("#notification-type");

    const $audienceInput =
        $("#notification-audience");


    if (
        $titleInput.length === 0 ||
        $messageInput.length === 0 ||
        $typeInput.length === 0 ||
        $audienceInput.length === 0
    ) {

        console.error(
            "Notification form elements not found."
        );

        showToast(
            "Notification form fields not found.",
            "danger"
        );

        return;
    }


    const title =
        ($titleInput.val() || "").trim();

    const message =
        ($messageInput.val() || "").trim();

    const type =
        $typeInput.val();

    const audience =
        $audienceInput.val();


    if (!title) {

        showToast(
            "Notification title is required.",
            "warning"
        );

        $titleInput.focus();

        return;
    }


    if (!message) {

        showToast(
            "Notification message is required.",
            "warning"
        );

        $messageInput.focus();

        return;
    }


    const payload = {

        title: title,

        message: message,

        type: type,

        audience: audience

    };


    showToast(
        "Sending notification...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                "/v1/notifications",
                "POST",
                payload
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to send notification.",
                "danger"
            );

            return;
        }


        showToast(
            "Notification sent successfully!",
            "success"
        );


        closeModal(
            "notification-modal"
        );


        await loadWorkspaceTab(
            "notifications"
        );


    } catch (error) {

        console.error(
            "Error sending notification:",
            error
        );

        showToast(
            "Error sending notification.",
            "danger"
        );
    }
}

// ============================================================
// NOTIFICATION - DELETE
// ============================================================

async function deleteNotification(id) {

    if (
        !confirm(
            `Are you sure you want to delete notification #${id}?`
        )
    ) {

        return;
    }


    showToast(
        "Deleting notification...",
        "info"
    );


    try {

        const response =
            await apiFetch(
                `/v1/notifications/${id}`,
                "DELETE"
            );


        if (
            !response ||
            !response.success
        ) {

            showToast(
                response?.message ||
                "Failed to delete notification.",
                "danger"
            );

            return;
        }


        showToast(
            "Notification deleted successfully!",
            "success"
        );


        await loadWorkspaceTab(
            "notifications"
        );


    } catch (error) {

        console.error(
            "Error deleting notification:",
            error
        );

        showToast(
            "Error deleting notification.",
            "danger"
        );
    }
}

// ============================================================
// REPORTS - GET SUMMARY FROM BACKEND
// ============================================================
//
// NOTE: Unlike the other entities, the backend Reports API
// (GET /v1/reports) is a single read-only endpoint that
// returns one summary object (Map<String,Object>) — there is
// no create, update, or delete, and no list of saved report
// records. So this section is a read-only analytics view,
// not a CRUD table.
// ============================================================

async function loadDashboardReports() {

    try {

        const response =
            await apiFetch(
                "/v1/reports",
                "GET"
            );

        console.log(
            "Dashboard Reports API Response:",
            response
        );

        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load reports:",
                response?.message
            );

            showToast(
                response?.message ||
                "Cannot load reports.",
                "danger"
            );

            return {};
        }

        const report =
            response.body;

        console.log(
            "Report Summary from Backend:",
            report
        );

        return (
            report &&
            typeof report === "object"
        )
            ? report
            : {};

    } catch (error) {

        console.error(
            "Error loading reports:",
            error
        );

        showToast(
            "Error loading reports.",
            "danger"
        );

        return {};
    }
}

// ============================================================
// REPORTS - RENDER SUMMARY TABLE
// ============================================================
//
// The backend returns an arbitrary key/value summary object,
// so instead of a fixed set of columns we render every
// key/value pair the backend sends back as a metric row.
// ============================================================

function renderReportTable(report) {

    const $head =
        $("#workspace-table-head");

    const $body =
        $("#workspace-table-body");

    const $panelTitle =
        $("#table-panel-title");


    if (
        $head.length === 0 ||
        $body.length === 0
    ) {

        console.error(
            "Report table elements not found."
        );

        return;

    }


    if ($panelTitle.length > 0) {

        $panelTitle.text(
            "Report Metrics"
        );

    }


    $head.html(`

        <tr>
            <th>Metric</th>
            <th>Value</th>
        </tr>

    `);


    $body.empty();


    const entries =
        (report && typeof report === "object")
            ? Object.entries(report)
            : [];


    if (entries.length === 0) {

        $body.html(`

            <tr>
                <td
                    colspan="2"
                    style="
                        text-align:center;
                        padding:2.5rem;
                        color:var(--text-muted);
                    "
                >
                    <div style="
                        margin-bottom:0.5rem;
                        font-size:1.1rem;
                        font-weight:500;
                    ">
                        No report data available
                    </div>

                    <div style="font-size:0.85rem;">
                        The backend did not return any
                        report metrics.
                    </div>
                </td>
            </tr>

        `);

        return;

    }


    $.each(
        entries,
        function (index, entry) {

            const key = entry[0];
            const value = entry[1];

            const $row = $("<tr>");


            $row.append(`
                <td>
                    <strong>
                        ${escapeHtml(formatReportKey(key))}
                    </strong>
                </td>
            `);


            $row.append(`
                <td>
                    ${escapeHtml(formatReportValue(value))}
                </td>
            `);


            $body.append($row);

        }
    );

}

// ============================================================
// REPORT KEY / VALUE FORMATTING HELPERS
// ============================================================

function formatReportKey(key) {

    if (!key) {
        return "";
    }

    // Convert camelCase / snake_case keys into readable labels
    const spaced =
        String(key)
            .replace(/_/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2");

    return (
        spaced.charAt(0).toUpperCase() +
        spaced.slice(1)
    );
}

function formatReportValue(value) {

    if (value === null || value === undefined) {
        return "-";
    }

    if (
        typeof value === "object"
    ) {

        try {

            return JSON.stringify(value);

        } catch (error) {

            return String(value);
        }
    }

    return String(value);
}

// ============================================================
// REPORT STATISTICS
// ============================================================
//
// Shows up to the first 3 numeric metrics from the summary
// as highlight cards. Falls back gracefully if the backend
// sends fewer than 3 numeric fields.
// ============================================================

function renderReportStats(report) {

    const $statsContainer =
        $("#workspace-stats");


    if ($statsContainer.length === 0) {

        return;

    }


    const entries =
        (report && typeof report === "object")
            ? Object.entries(report)
            : [];

    const numericEntries =
        entries.filter(
            entry =>
                typeof entry[1] === "number"
        );

    const highlightEntries =
        numericEntries.slice(0, 3);


    if (highlightEntries.length === 0) {

        $statsContainer.html(`

            <div class="glass-card stat-card animate-fade">
                <div class="stat-header">
                    <span class="stat-title">
                        Report Metrics
                    </span>
                    <div class="stat-icon">📊</div>
                </div>
                <div class="stat-val">${entries.length}</div>
                <span class="stat-desc">
                    Fields returned by the backend
                </span>
            </div>

        `);

        return;

    }


    let html = "";

    $.each(
        highlightEntries,
        function (index, entry) {

            html += `
                <div class="glass-card stat-card animate-fade">
                    <div class="stat-header">
                        <span class="stat-title">
                            ${escapeHtml(formatReportKey(entry[0]))}
                        </span>
                        <div class="stat-icon">📊</div>
                    </div>
                    <div class="stat-val">${escapeHtml(String(entry[1]))}</div>
                    <span class="stat-desc">
                        From the live report summary
                    </span>
                </div>
            `;

        }
    );


    $statsContainer.html(html);

}

async function loadWorkspaceTab(tabId) {

    const $wTitle =
        $("#workspace-title");

    const $wDesc =
        $("#workspace-desc");

    const $wActions =
        $("#workspace-actions");


    if (
        $wTitle.length === 0 ||
        $wDesc.length === 0 ||
        $wActions.length === 0
    ) {

        console.error(
            "Workspace elements not found."
        );

        return;

    }


    // --------------------------------------------------------
    // CLEAR ACTIONS
    // --------------------------------------------------------

    $wActions.empty();


    // ========================================================
    // MEDICINE CATEGORIES
    // ========================================================

    if (tabId === "categories") {

        $wTitle.text(
            "Medicine Categories"
        );


        $wDesc.text(
            "Define therapeutic classifications for the medicine database template."
        );


        $wActions.html(`

            <button
                type="button"
                id="add-category-btn"
                class="btn btn-primary"
            >

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2.5"
                >

                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                    />

                </svg>

                Add Category

            </button>

        `);


        /*
         * IMPORTANT:
         *
         * No inline onclick.
         *
         * jQuery event binding.
         */

        $("#add-category-btn").on(
            "click",
            function () {

                openCategoryModal();

            }
        );


        // ----------------------------------------------------
        // LOAD FROM BACKEND
        // ----------------------------------------------------

        const categories =
            await loadDashboardCategories();


        // ----------------------------------------------------
        // RENDER TABLE
        // ----------------------------------------------------

        renderCategoryTable(
            categories
        );


        // ----------------------------------------------------
        // RENDER STATS
        // ----------------------------------------------------

        renderCategoryStats(
            categories
        );


        return;

    }


    // ========================================================
    // MEDICINES
    // ========================================================

    if (tabId === "medicines") {

        $wTitle.text(
            "Medicine Catalog"
        );


        $wDesc.text(
            "Manage medicines stored in the MediFind database."
        );


        $wActions.html(`

            <button
                type="button"
                id="add-medicine-btn"
                class="btn btn-primary"
            >
                + Add Medicine
            </button>

        `);


        $("#add-medicine-btn").on(
            "click",
            function () {

                openMedicineModal();

            }
        );


        const medicines =
            await loadDashboardMedicines();


        const categories =
            await loadDashboardCategories();


        renderMedicineTable(
            medicines,
            categories
        );


        renderMedicineStats(
            medicines
        );


        return;

    }


    // ========================================================
    // PHARMACIES
    // ========================================================

    if (tabId === "pharmacies") {

        $wTitle.text(
            "Registered Pharmacies"
        );


        $wDesc.text(
            "Manage affiliated corporate pharmacy accounts."
        );


        $wActions.html(`

            <button
                type="button"
                id="register-pharmacy-btn"
                class="btn btn-primary"
            >
                + Register Pharmacy
            </button>

        `);


        $("#register-pharmacy-btn").on(
            "click",
            function () {

                openPharmacyModal();

            }
        );


        const pharmacies =
            await loadDashboardPharmacies();


        const owners =
            await loadPharmacyOwners();


        renderPharmacyTable(
            pharmacies,
            owners
        );


        renderPharmacyStats(
            pharmacies
        );


        return;

    }


    // ========================================================
    // PHARMACY BRANCHES
    // ========================================================

    if (tabId === "branches") {

        $wTitle.text(
            "Pharmacy Branches"
        );


        $wDesc.text(
            "Manage pharmacy branch outlets and their operational status."
        );


        $wActions.html(`

            <button
                type="button"
                id="register-branch-btn"
                class="btn btn-primary"
            >
                Register Pharmacy Branch
            </button>

        `);


        $("#register-branch-btn").on(
            "click",
            function () {

                openBranchModal();

            }
        );


        const branches =
            await loadDashboardBranches();


        renderBranchTable(
            branches
        );


        renderBranchStats(
            branches
        );


        return;

    }


    // ========================================================
    // RESERVATIONS
    // ========================================================

    if (tabId === "reservations") {

        $wTitle.text(
            "Prescription Reservations"
        );


        $wDesc.text(
            "Process and verify client pharmacy reservations."
        );


        const reservations =
            await loadDashboardReservations();


        renderReservationStats(
            reservations
        );


        renderReservationTable(
            reservations
        );


        return;

    }


    // ========================================================
    // INVENTORY
    // ========================================================

    if (tabId === "inventory") {

        $wTitle.text(
            "Stock Inventory"
        );


        $wDesc.text(
            "Monitor stock levels and reorder thresholds across the catalog."
        );


        const inventory =
            await loadDashboardInventory();


        renderInventoryTable(
            inventory
        );


        renderInventoryStats(
            inventory
        );


        return;

    }


    // ========================================================
    // NOTIFICATIONS
    // ========================================================

    if (tabId === "notifications") {

        $wTitle.text(
            "System Notifications"
        );


        $wDesc.text(
            "Broadcast alerts and messages to platform users."
        );


        $wActions.html(`

            <button
                type="button"
                id="send-notification-btn"
                class="btn btn-primary"
            >
                + Send Notification
            </button>

        `);


        $("#send-notification-btn").on(
            "click",
            function () {

                openNotificationModal();

            }
        );


        const notifications =
            await loadDashboardNotifications();


        renderNotificationTable(
            notifications
        );


        renderNotificationStats(
            notifications
        );


        return;

    }


    // ========================================================
    // REPORTS
    // ========================================================

    if (tabId === "reports") {

        $wTitle.text(
            "Report Summary"
        );


        $wDesc.text(
            "Live analytics summary returned by the reports API."
        );


        // No create/edit/delete actions here — the backend
        // Reports API (GET /v1/reports) is a single read-only
        // summary endpoint.


        const report =
            await loadDashboardReports();


        renderReportTable(
            report
        );


        renderReportStats(
            report
        );


        return;

    }


    // ========================================================
    // DEFAULT
    // ========================================================

    console.log(
        "Workspace tab selected:",
        tabId
    );

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
        notifications: "Notifications",
        reports: "Reports",
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

            <li class="sidebar-item" onclick="selectSidebarTab(this, 'inventory')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
             Inventory
             </li>

            <li class="sidebar-item" onclick="selectSidebarTab(this, 'notifications')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
             Notifications
             </li>

            <li class="sidebar-item" onclick="selectSidebarTab(this, 'reports')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
             Reports
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


// ============================================================
// GLOBAL EXPORTS
// ============================================================
// Required so inline onclick="..." attributes in the HTML
// (e.g. onclick="closeModal('category-modal')",
// onclick="saveCategory()") can find these functions on
// window. Without this, buttons bound via inline onclick
// silently fail with "X is not defined" if this script is
// ever loaded as type="module" or otherwise scoped.
// ============================================================

// Modal controls
window.openModal = openModal;
window.closeModal = closeModal;

// Medicine Categories
window.openCategoryModal = openCategoryModal;
window.editCategory = editCategory;
window.saveCategory = saveCategory;
window.deleteCategory = deleteCategory;

// Medicines
window.openMedicineModal = openMedicineModal;
window.editMedicine = editMedicine;
window.saveMedicine = saveMedicine;
window.deleteMedicine = deleteMedicine;

// Pharmacies
window.openPharmacyModal = openPharmacyModal;
window.savePharmacy = savePharmacy;
window.editPharmacy = editPharmacy;
window.deletePharmacy = deletePharmacy;

// Pharmacy Branches
window.openBranchModal = openBranchModal;
window.saveBranch = saveBranch;
window.editBranch = editBranch;
window.deleteBranch = deleteBranch;

// Reservations
window.processReservation = processReservation;
window.saveReservationStatus = saveReservationStatus;
window.deleteReservation = deleteReservation;

// Inventory
window.editInventory = editInventory;
window.saveInventory = saveInventory;
window.deleteInventory = deleteInventory;

// Notifications
window.openNotificationModal = openNotificationModal;
window.saveNotification = saveNotification;
window.deleteNotification = deleteNotification;

// Reports
// (read-only summary — no create/update/delete on the backend)

// Sidebar & role switching
window.selectSidebarTab = selectSidebarTab;
window.switchRole = switchRole;

