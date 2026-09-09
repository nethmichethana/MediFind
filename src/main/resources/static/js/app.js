// ============================================================
// BACKEND CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:8080";

function escapeHtml(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// APPLICATION STATE
// ============================================================

let appState = {
    selectedCategory: "ALL",
    selectedCategoryId: null,
    medicines: [],
    categories: [],
    cart: [],
    currentUser: null
};


// ============================================================
// API FETCH HELPER
// ============================================================

async function apiFetch(endpoint, method = "GET", body = null) {

    const token = localStorage.getItem("medifind_token");

    const headers = {
        "Content-Type": "application/json"
    };

    // Add JWT token when available
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const options = {
        method: method,
        headers: headers
    };

    // Add request body
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


        // ----------------------------------------------------
        // Backend Error
        // ----------------------------------------------------

        if (!response.ok) {

            console.error(
                "API Error:",
                response.status,
                data
            );

            return {
                success: false,
                httpStatus: response.status,
                status: data?.status ?? null,
                body: null,
                message:
                    data?.message ||
                    data?.error ||
                    "Request failed."
            };
        }


        // ----------------------------------------------------
        // Backend Success
        // ----------------------------------------------------

        return {
            success: true,
            httpStatus: response.status,
            status: data?.status ?? null,
            body: data?.body ?? data,
            message:
                data?.message ||
                "Operation successful."
        };

    } catch (error) {

        console.error(
            "Backend connection error:",
            error
        );

        return {
            success: false,
            httpStatus: 0,
            status: null,
            body: null,
            message:
                "Cannot connect to backend. Make sure Spring Boot is running on port 8080."
        };
    }
}

// ============================================================
// LOAD PHARMACY BRANCHES FOR RESERVATION
// ============================================================

async function loadReservationBranches() {

    const branchSelect =
        document.getElementById("reservation-branch");

    if (!branchSelect) {
        console.error(
            "Reservation branch dropdown not found."
        );
        return;
    }

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

        // Clear existing options
        branchSelect.innerHTML =
            `<option value="">Select Pharmacy Branch</option>`;


        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load pharmacy branches:",
                response?.message
            );

            return;
        }


        const branches =
            response.body || [];


        if (branches.length === 0) {

            branchSelect.innerHTML =
                `<option value="">
                    No pharmacy branches available
                </option>`;

            console.warn(
                "No pharmacy branches found in database."
            );

            return;
        }


        branches.forEach(branch => {

            const option =
                document.createElement("option");

            option.value =
                branch.id;

            option.textContent =
                `${branch.name} - ${branch.city}`;

            branchSelect.appendChild(option);

        });


        console.log(
            "Pharmacy branches loaded:",
            branches
        );

    } catch (error) {

        console.error(
            "Error loading pharmacy branches:",
            error
        );

    }
}


// ============================================================
// MODAL CONTROLS & NAVIGATION
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

function showSection(sectionName) {
    const catalogSec = document.getElementById("catalog-section");
    const resSec = document.getElementById("reservations-section");
    const loginSec = document.getElementById("login-section");

    if (catalogSec) catalogSec.style.display = "none";
    if (resSec) resSec.style.display = "none";
    if (loginSec) loginSec.style.display = "none";

    if (sectionName === "catalog") {
        if (catalogSec) catalogSec.style.display = "block";
    } else if (sectionName === "reservations") {
        if (resSec) resSec.style.display = "block";
    } else if (sectionName === "login") {
        if (loginSec) loginSec.style.display = "block";
    } else if (sectionName === "signup") {
        openModal("signup-modal");
        if (catalogSec) catalogSec.style.display = "block";
    }

    document.querySelectorAll(".nav-links .nav-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("onclick") && link.getAttribute("onclick").includes(sectionName)) {
            link.classList.add("active");
        }
    });
}

function updateAuthUI() {
    const userDisplay = document.getElementById("user-display");
    const authButtons = document.getElementById("auth-buttons");
    const userGreeting = document.getElementById("user-greeting");
    const navDashboardLink = document.getElementById("nav-dashboard-link");

    const user = appState.currentUser;

    if (user && user.email) {
        if (userDisplay) userDisplay.style.display = "flex";
        if (authButtons) authButtons.style.display = "none";
        if (userGreeting) {
            userGreeting.textContent = `Welcome, ${user.name || user.email}`;
        }

        const role = (user.role || "").toUpperCase();
        if (navDashboardLink) {
            if (role === "ADMIN" || role === "PHARMACY_ADMIN" || role === "PHARMACY_STAFF") {
                navDashboardLink.style.display = "inline-block";
            } else {
                navDashboardLink.style.display = "none";
            }
        }
    } else {
        if (userDisplay) userDisplay.style.display = "none";
        if (authButtons) authButtons.style.display = "flex";
        if (navDashboardLink) navDashboardLink.style.display = "none";
    }
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
    if (event.target && event.target.classList && event.target.classList.contains("modal-backdrop")) {
        event.target.style.display = "none";
    }
});


// ============================================================
// LOGIN
// ============================================================


// Login modal
async function handleLogin() {

    await performLogin(
        "login-email",
        "login-password",
        true
    );
}


// Login page
async function handlePageLogin() {

    await performLogin(
        "page-login-email",
        "page-login-password",
        false
    );
}


// Common login function
async function performLogin(
    emailId,
    passwordId,
    isModal = false
) {

    const emailInput =
        document.getElementById(emailId);

    const passwordInput =
        document.getElementById(passwordId);


    // --------------------------------------------------------
    // Check form fields
    // --------------------------------------------------------

    if (!emailInput || !passwordInput) {

        showToast(
            "Login form fields not found.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Get values
    // --------------------------------------------------------

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value.trim();


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!email || !password) {

        showToast(
            "Please enter your email and password.",
            "danger"
        );

        return;
    }


    // Basic email validation
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        showToast(
            "Please enter a valid email address.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Login Request
    // --------------------------------------------------------

    const loginRequest = {

        email: email,

        password: password
    };


    console.log(
        "Login Request:",
        {
            email: email
        }
    );


    showToast(
        "Signing in...",
        "info"
    );


    // --------------------------------------------------------
    // AJAX -> Spring Boot
    // --------------------------------------------------------

    const response = await apiFetch(
        "/v1/auth/login",
        "POST",
        loginRequest
    );


    console.log(
        "Login Response:",
        response
    );


    // --------------------------------------------------------
    // Login Failed
    // --------------------------------------------------------

    if (!response.success) {

        showToast(
            response.message ||
            "Invalid email or password.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Login Response Body
    // --------------------------------------------------------

    const loginData =
        response.body;


    if (!loginData) {

        showToast(
            "Invalid response received from server.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Get JWT Token
    // --------------------------------------------------------

    const token =
        loginData.token;


    if (!token) {

        console.error(
            "Login response does not contain token:",
            loginData
        );

        showToast(
            "Login successful, but JWT token was not received.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Create Session User
    // --------------------------------------------------------

    const user = {

        id: loginData.userId,

        name: loginData.name,

        email: loginData.email,

        role: loginData.role
    };


    // --------------------------------------------------------
    // Save JWT
    // --------------------------------------------------------

    localStorage.setItem(
        "medifind_token",
        token
    );


    // --------------------------------------------------------
    // Save User Session
    // --------------------------------------------------------

    localStorage.setItem(
        "medifind_session",
        JSON.stringify(user)
    );


    // Update application state
    appState.currentUser = user;
    updateAuthUI();


    console.log(
        "Logged-in User:",
        user
    );


    // --------------------------------------------------------
    // Close Login Modal
    // --------------------------------------------------------

    if (isModal) {

        if (typeof closeModal === "function") {

            closeModal("login-modal");

        } else {

            const modal =
                document.getElementById("login-modal");

            if (modal) {
                modal.style.display = "none";
            }
        }
    }


    // --------------------------------------------------------
    // Login Success
    // --------------------------------------------------------

    showToast(
        `Welcome back, ${user.name || user.email}!`,
        "success"
    );


    // --------------------------------------------------------
    // Role-based Navigation
    // --------------------------------------------------------

    const role =
        (user.role || "").toUpperCase();


    if (
        role === "ADMIN" ||
        role === "PHARMACY_ADMIN" ||
        role === "PHARMACY_STAFF"
    ) {

        // Internal dashboard
        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 700);

    } else {

        // Customer
        setTimeout(() => {

            if (
                typeof showSection === "function"
            ) {

                showSection("catalog");

            }

        }, 700);
    }
}


// ============================================================
// SIGNUP
// ============================================================

async function handleSignup() {

    const nameInput =
        document.getElementById("signup-name");

    const emailInput =
        document.getElementById("signup-email");

    const phoneInput =
        document.getElementById("signup-phone");

    const passwordInput =
        document.getElementById("signup-password");


    // --------------------------------------------------------
    // Check form fields
    // --------------------------------------------------------

    if (
        !nameInput ||
        !emailInput ||
        !phoneInput ||
        !passwordInput
    ) {

        showToast(
            "Signup form fields not found.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Get values
    // --------------------------------------------------------

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const password =
        passwordInput.value.trim();


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (
        !name ||
        !email ||
        !phone ||
        !password
    ) {

        showToast(
            "Please fill in all registration fields.",
            "danger"
        );

        return;
    }


    // Email validation
    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {

        showToast(
            "Please enter a valid email address.",
            "danger"
        );

        return;
    }


    // Password validation
    if (password.length < 6) {

        showToast(
            "Password must contain at least 6 characters.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Find CUSTOMER Role
    // --------------------------------------------------------

    showToast(
        "Checking customer role...",
        "info"
    );


    const rolesResponse =
        await apiFetch(
            "/v1/roles",
            "GET"
        );


    console.log(
        "Roles Response:",
        rolesResponse
    );


    if (!rolesResponse.success) {

        showToast(
            rolesResponse.message ||
            "Cannot load roles from backend.",
            "danger"
        );

        return;
    }


    const roles =
        rolesResponse.body;


    if (!Array.isArray(roles)) {

        console.error(
            "Invalid roles response:",
            roles
        );

        showToast(
            "Invalid roles response from backend.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Find CUSTOMER role
    // --------------------------------------------------------

    let customerRole =
        roles.find(role => {

            const roleName =
                role.roleName ||
                role.name;

            return (
                roleName &&
                roleName.toUpperCase() === "CUSTOMER"
            );
        });


    if (!customerRole) {

        console.log(
            "CUSTOMER role not found in database. Auto-creating CUSTOMER role..."
        );

        const createRoleRes = await apiFetch("/v1/roles", "POST", {
            roleName: "CUSTOMER"
        });

        if (createRoleRes.success) {
            const recheck = await apiFetch("/v1/roles", "GET");
            if (recheck.success && Array.isArray(recheck.body)) {
                customerRole = recheck.body.find(r => (r.roleName || r.name)?.toUpperCase() === "CUSTOMER");
            }
        }
    }


    if (!customerRole) {

        console.error(
            "CUSTOMER role not found:",
            roles
        );

        showToast(
            "CUSTOMER role was not found in database.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Create User Request
    // --------------------------------------------------------

    const userRequest = {

        name: name,

        email: email,

        password: password,

        phone: phone,

        status: "ACTIVE",

        roleId: customerRole.id
    };


    console.log(
        "Signup Request:",
        {
            name: name,
            email: email,
            phone: phone,
            status: "ACTIVE",
            roleId: customerRole.id
        }
    );


    // --------------------------------------------------------
    // Send Signup Request
    // --------------------------------------------------------

    showToast(
        "Creating your account...",
        "info"
    );


    const response =
        await apiFetch(
            "/v1/users",
            "POST",
            userRequest
        );


    console.log(
        "Signup Response:",
        response
    );


    // --------------------------------------------------------
    // Signup Failed
    // --------------------------------------------------------

    if (!response.success) {

        showToast(
            response.message ||
            "Unable to create account.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Signup Success
    // --------------------------------------------------------

    console.log(
        "Created User:",
        response.body
    );


    showToast(
        "Account created successfully! Please sign in.",
        "success"
    );


    // --------------------------------------------------------
    // Clear Signup Form
    // --------------------------------------------------------

    nameInput.value = "";

    emailInput.value = "";

    phoneInput.value = "";

    passwordInput.value = "";


    // --------------------------------------------------------
    // Close Signup Modal
    // --------------------------------------------------------

    if (
        typeof closeModal === "function"
    ) {

        closeModal("signup-modal");

    } else {

        const signupModal =
            document.getElementById("signup-modal");

        if (signupModal) {
            signupModal.style.display = "none";
        }
    }


    // --------------------------------------------------------
    // Open Login Modal
    // --------------------------------------------------------

    setTimeout(() => {

        if (
            typeof openModal === "function"
        ) {

            openModal("login-modal");

        } else {

            const loginModal =
                document.getElementById("login-modal");

            if (loginModal) {
                loginModal.style.display = "flex";
            }
        }


        // Put registered email into login field
        const loginEmail =
            document.getElementById("login-email");

        if (loginEmail) {

            loginEmail.value =
                email;
        }

    }, 500);
}


// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {

    localStorage.removeItem(
        "medifind_token"
    );

    localStorage.removeItem(
        "medifind_session"
    );

    appState.currentUser = null;
    updateAuthUI();


    showToast(
        "Logged out successfully.",
        "info"
    );


    setTimeout(() => {

        window.location.href =
            "index.html";

    }, 500);
}


// ============================================================
// LOAD SAVED SESSION
// ============================================================

function loadSavedSession() {

    const savedSession =
        localStorage.getItem(
            "medifind_session"
        );


    if (!savedSession) {

        appState.currentUser = null;
        updateAuthUI();

        return;
    }


    try {

        appState.currentUser =
            JSON.parse(savedSession);

        console.log(
            "Saved session loaded:",
            appState.currentUser
        );
        updateAuthUI();

    } catch (error) {

        console.error(
            "Invalid saved session:",
            error
        );

        localStorage.removeItem(
            "medifind_session"
        );

        appState.currentUser = null;
        updateAuthUI();
    }
}


// ============================================================
// TOAST
// ============================================================

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.createElement("div");


    toast.style.position =
        "fixed";

    toast.style.bottom =
        "2rem";

    toast.style.left =
        "2rem";

    toast.style.padding =
        "0.75rem 1.5rem";

    toast.style.borderRadius =
        "8px";

    toast.style.zIndex =
        "10000";

    toast.style.fontWeight =
        "600";

    toast.style.boxShadow =
        "0 8px 30px rgba(0,0,0,0.5)";

    toast.style.transition =
        "opacity 0.4s";


    if (type === "success") {

        toast.style.background =
            "var(--accent-emerald, #10b981)";

        toast.style.color =
            "white";

    } else if (type === "danger") {

        toast.style.background =
            "var(--accent-rose, #f43f5e)";

        toast.style.color =
            "white";

    } else if (type === "warning") {

        toast.style.background =
            "var(--accent-amber, #f59e0b)";

        toast.style.color =
            "white";

    } else {

        toast.style.background =
            "#1e293b";

        toast.style.color =
            "white";
    }


    toast.textContent =
        message;


    document.body.appendChild(
        toast
    );


    setTimeout(() => {

        toast.style.opacity =
            "0";


        setTimeout(() => {

            if (toast.parentNode) {

                toast.parentNode.removeChild(
                    toast
                );
            }

        }, 400);

    }, 3000);
}


// ============================================================
// MEDICINE CATEGORIES (CATALOG VIEW)
// ============================================================

async function loadCatalogCategories() {
    const container = document.getElementById("category-tabs");
    if (!container) return;

    try {
        const response = await apiFetch("/v1/medicine-categories", "GET");

        if (response && response.success && Array.isArray(response.body)) {
            appState.categories = response.body;
            container.innerHTML = `<button class="tab-btn active" onclick="selectCategory('ALL', this)">All Categories</button>`;
            response.body.forEach(cat => {
                const btn = document.createElement("button");
                btn.className = "tab-btn";
                btn.textContent = cat.name;
                btn.onclick = function () {selectCategory(cat.id, this);
                };
                container.appendChild(btn);
            });
        }
    } catch (error) {
        console.error("Error loading catalog categories:", error);
    }
}

// ============================================================
// CATEGORY SELECTION
// ============================================================
function selectCategory(categoryName, buttonElement) {

    // Save selected category name
    appState.selectedCategory = categoryName;

    // ALL category
    if (categoryName === "ALL") {

        appState.selectedCategoryId = null;

    } else {

        // Find category ID using category name
        const selectedCategory =
            appState.categories.find(category =>
                String(category.name).toLowerCase() ===
                String(categoryName).toLowerCase()
            );

        appState.selectedCategoryId =
            selectedCategory
                ? selectedCategory.id
                : null;
    }

    // Update active button
    const categoryTabs =
        document.getElementById("category-tabs");

    if (categoryTabs) {

        categoryTabs
            .querySelectorAll(".tab-btn")
            .forEach(button => {
                button.classList.remove("active");
            });

        if (buttonElement) {
            buttonElement.classList.add("active");
        }
    }

    // Filter medicines
    filterMedicines();
}
// ============================================================
// LOAD MEDICINES FROM BACKEND
// ============================================================

async function loadMedicines() {
    try {

        const response =
            await apiFetch(
                "/v1/medicines",
                "GET"
            );

        console.log(
            "Medicines API Response:",
            response
        );

        if (!response || !response.success) {

            console.error(
                "Failed to load medicines:",
                response?.message
            );

            return;
        }

        let medicines = response.body;

        if (!Array.isArray(medicines)) {
            medicines = [];
        }

        appState.medicines = medicines;

        console.log(
            "Medicines loaded:",
            medicines
        );

        filterMedicines();

    } catch (error) {

        console.error(
            "Error loading medicines:",
            error
        );
    }
}

function filterMedicines() {

    const searchInput =
        document.getElementById("catalog-search");

    const searchText =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    const selectedCategoryId =
        appState.selectedCategoryId;

    let filteredMedicines =
        Array.isArray(appState.medicines)
            ? [...appState.medicines]
            : [];

    // CATEGORY FILTER
    if (selectedCategoryId !== null) {

        filteredMedicines =
            filteredMedicines.filter(medicine => {

                return Number(medicine.categoryId) ===
                    Number(selectedCategoryId);

            });
    }

    // SEARCH FILTER
    if (searchText) {

        filteredMedicines =
            filteredMedicines.filter(medicine => {

                return (
                    (medicine.name || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (medicine.genericName || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (medicine.brandName || "")
                        .toLowerCase()
                        .includes(searchText)

                    ||

                    (medicine.description || "")
                        .toLowerCase()
                        .includes(searchText)
                );

            });
    }

    console.log(
        "Filtered medicines:",
        filteredMedicines
    );

    renderMedicineCatalog(
        filteredMedicines
    );
}

function renderMedicineCatalog(medicines) {

    const grid =
        document.getElementById("medicine-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    if (
        !Array.isArray(medicines) ||
        medicines.length === 0
    ) {

        grid.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                color: var(--text-muted);
            ">
                <h3>No medicines found</h3>
                <p>
                    There are no medicines available
                    in this category.
                </p>
            </div>
        `;

        return;
    }

    medicines.forEach(medicine => {

        const category =
            appState.categories.find(
                c =>
                    Number(c.id) ===
                    Number(medicine.categoryId)
            );

        const categoryName =
            category
                ? category.name
                : "Other";

        const card =
            document.createElement("div");

        card.className =
            "medicine-card animate-fade";

        card.innerHTML = `
            <div class="med-category">
               ${escapeHtml(categoryName)}
            </div>

            <h3>
                ${escapeHtml(
            medicine.name || ""
        )}
            </h3>

            <p style="
                color:var(--text-secondary);
                font-size:0.85rem;
            ">
                ${escapeHtml(
            medicine.genericName || ""
        )}
            </p>

            <div style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
                margin-top:10px;
            ">

                <span class="badge badge-info">
                    ${escapeHtml(
            medicine.strength || ""
        )}
                </span>

                <span class="badge badge-info">
                    ${escapeHtml(
            medicine.dosageForm || ""
        )}
                </span>

                ${
            medicine.prescriptionRequired
                ? `
                            <span class="badge badge-danger">
                                Prescription Required
                            </span>
                          `
                : ""
        }
                
             <button
                class="btn btn-primary"
                onclick="addToCart(${medicine.id})"
                style="width:100%; margin-top:15px;">
                Reserve
            </button>

            </div>`;


        grid.appendChild(card);
    });
}


// ============================================================
// APPLICATION INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "MediFind application initialized."
        );

        // ----------------------------------------------------
        // Load saved login session
        // ----------------------------------------------------

        loadSavedSession();

        // ----------------------------------------------------
        // Load medicine categories from backend
        // ----------------------------------------------------

        await loadCatalogCategories();

        // ----------------------------------------------------
        // Load medicines from backend
        // ----------------------------------------------------

        await loadMedicines();

        console.log(
            "Customer medicines loaded:",
            appState.medicines
        );

    }
);

function addToCart(medicineId) {

    if (!appState.currentUser) {
        showToast("Please login first.", "warning");
        return;
    }

    const medicine = appState.medicines.find(
        m => Number(m.id) === Number(medicineId)
    );

    if (!medicine) {
        showToast("Medicine not found.", "danger");
        return;
    }

    // Check whether medicine already exists
    const existingItem = appState.cart.find(
        item => Number(item.medicineId) === Number(medicine.id)
    );

    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        appState.cart.push({
            medicineId: Number(medicine.id),
            name: medicine.name,
            quantity: 1,
            unitPrice: Number(
                medicine.price ||
                medicine.unitPrice ||
                0
            )
        });
    }

    // IMPORTANT
    updateCartBadge();
    renderReservationCart();

    showToast(
        `${medicine.name} added to reservation.`,
        "success"
    );

    // Open actual cart drawer
    toggleDrawer("cart-drawer");
}



function updateCartBadge() {

    const badge =
        document.getElementById("cart-badge-count");

    if (!badge) return;

    const totalItems =
        appState.cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

    badge.textContent = totalItems;
}


function openReservationModal() {

    if (
        !Array.isArray(appState.cart) ||
        appState.cart.length === 0
    ) {
        showToast(
            "Please select a medicine first.",
            "warning"
        );
        return;
    }


    renderReservationCart();
    updateCartBadge();
    loadReservationBranches();

    openModal("reservation-modal");
}

function renderReservationCart() {

    const cartContainer = document.getElementById("cart-items-container");
    const totalItemsElement = document.getElementById("cart-total-qty");

    if (!cartContainer) {
        console.warn(
            "reservation-cart-items element not found."
        );
        return;
    }

    cartContainer.innerHTML = "";

    if (
        !Array.isArray(appState.cart) ||
        appState.cart.length === 0
    ) {

        cartContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:2rem;
                color:var(--text-muted);
            ">
                <p>No medicines added yet.</p>
            </div>
        `;

        if (totalItemsElement) {
            totalItemsElement.textContent = "0 Items";
        }

        return;
    }

    let totalQuantity = 0;

    appState.cart.forEach((item, index) => {

        const quantity =
            Number(item.quantity || 1);

        totalQuantity += quantity;

        const itemElement =
            document.createElement("div");

        itemElement.className =
            "reservation-cart-item";

        itemElement.style.cssText = `
            display:flex;
            justify-content:space-between;
            align-items:center;
            gap:12px;
            padding:12px;
            margin-bottom:10px;
            border:1px solid var(--glass-border);
            border-radius:10px;
        `;

        itemElement.innerHTML = `

            <div style="flex:1;">

                <strong>
                    ${escapeHtml(item.name)}
                </strong>

                <div style="
                    color:var(--text-secondary);
                    font-size:0.85rem;
                    margin-top:4px;
                ">
                    Quantity: ${quantity}
                </div>

            </div>

            <div style="
                display:flex;
                align-items:center;
                gap:6px;
            ">

                <button
                    class="btn btn-secondary"
                    onclick="decreaseCartItem(${index})">
                    −
                </button>

                <span>
                    ${quantity}
                </span>

                <button
                    class="btn btn-secondary"
                    onclick="increaseCartItem(${index})">
                    +
                </button>

                <button
                    class="btn btn-danger"
                    onclick="removeFromCart(${index})">
                    ×
                </button>

            </div>
        `;

        cartContainer.appendChild(itemElement);
    });

    if (totalItemsElement) {
        totalItemsElement.textContent =
            `${totalQuantity} Items`;
    }
}


function increaseCartItem(index) {

    if (!appState.cart[index]) return;

    appState.cart[index].quantity += 1;

    updateCartBadge();
    renderReservationCart();
}

function decreaseCartItem(index) {

    if (!appState.cart[index]) return;

    appState.cart[index].quantity -= 1;

    if (appState.cart[index].quantity <= 0) {
        appState.cart.splice(index, 1);
    }

    updateCartBadge();
    renderReservationCart();
}

function removeFromCart(index) {

    if (!appState.cart[index]) return;

    appState.cart.splice(index, 1);

    updateCartBadge();
    renderReservationCart();

    showToast(
        "Medicine removed from reservation cart.",
        "info"
    );
}

function toggleDrawer(id) {

    // First try the exact ID
    let drawer = document.getElementById(id);

    // If not found, try ID + "-backdrop"
    if (!drawer) {
        drawer = document.getElementById(id + "-backdrop");
    }

    if (!drawer) {
        console.error("Drawer not found:", id);
        return;
    }

    const currentDisplay =
        window.getComputedStyle(drawer).display;

    drawer.style.display =
        currentDisplay === "flex"
            ? "none"
            : "flex";
}

function closeDrawer(id) {

    const drawer = document.getElementById(id);

    if (!drawer) {
        console.error("Drawer not found:", id);
        return;
    }

    drawer.style.display = "none";
}

async function submitReservation() {

    // --------------------------------------------------------
    // Get reservation form elements safely
    // --------------------------------------------------------

    const pickupDateInput = document.getElementById("reservation-pickup-date");
    const notesInput = document.getElementById("checkout-notes");
    const pickupInput = pickupDateInput || document.getElementById("checkout-pickup");
    const notesField = notesInput || document.getElementById("special-instructions");

    // --------------------------------------------------------
    // Validate required pickup date field
    // --------------------------------------------------------

    if (!pickupInput) {

        console.error(
            "Reservation error: Pickup date input element not found."
        );

        showToast(
            "Pickup date field could not be found.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Read values safely
    // --------------------------------------------------------

    const pickupDate =
        pickupInput.value
            ? pickupInput.value.trim()
            : "";

    const notes =
        notesField && notesField.value
            ? notesField.value.trim()
            : "";


    // --------------------------------------------------------
    // Validate cart
    // --------------------------------------------------------

    if (!appState.cart || appState.cart.length === 0) {

        showToast(
            "Your reservation cart is empty.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Validate logged-in user
    // --------------------------------------------------------

    const currentUser =
        appState.currentUser ||
        JSON.parse(
            localStorage.getItem("medifind_session") || "null"
        );

    if (!currentUser) {

        showToast(
            "Please sign in before confirming your reservation.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Validate pickup date
    // --------------------------------------------------------

    if (!pickupDate) {

        showToast(
            "Please select a pickup date and time.",
            "danger"
        );

        return;
    }

// --------------------------------------------------------
// Get selected pharmacy branch
// --------------------------------------------------------

    const branchSelect = document.getElementById("reservation-branch");
    const branchId = branchSelect ? branchSelect.value : null;


// --------------------------------------------------------
// Validate pharmacy branch
// --------------------------------------------------------

    if (!branchId) {
        console.error("Reservation error: Pharmacy branch not selected.");
        showToast("Please select a pharmacy branch.", "danger");

        return;
    }
    // --------------------------------------------------------
    // Create reservation request
    // --------------------------------------------------------

    const reservationRequest = {
        reservationDate: new Date().toISOString(),
        pickupDate: new Date(pickupDate).toISOString(),
        status: "PENDING",
        notes: notes,
        userId: currentUser.userId || currentUser.id,
        pharmacyBranchId: Number(branchId)
    };
    console.log("Reservation Request:", reservationRequest);

    // --------------------------------------------------------
    // Create Reservation
    // --------------------------------------------------------

    const reservationResponse =
        await apiFetch(
            "/v1/reservations",
            "POST",
            reservationRequest
        );


    if (
        !reservationResponse ||
        !reservationResponse.success ||
        reservationResponse.httpStatus !== 200
    ) {

        console.error(
            "Reservation API Error:",
            reservationResponse
        );

        showToast(
            reservationResponse?.message ||
            "Failed to create reservation.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Reservation created
    // --------------------------------------------------------

    const reservation =
        reservationResponse.body;


    if (!reservation || !reservation.id) {

        console.error(
            "Invalid reservation response:",
            reservation
        );

        showToast(
            "Reservation was not created correctly.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Create Reservation Items
    // --------------------------------------------------------

    for (const cartItem of appState.cart) {

        const itemRequest = {

            quantity:
                Number(cartItem.quantity || 1),

            unitPrice:
                Number(
                    cartItem.unitPrice ||
                    cartItem.price ||
                    0
                ),

            reservationId:
            reservation.id,

            medicineId:
                Number(
                    cartItem.medicineId ||
                    cartItem.id
                )
        };


        console.log(
            "Reservation Item Request:",
            itemRequest
        );


        const itemResponse =
            await apiFetch(
                "/v1/reservation-items",
                "POST",
                itemRequest
            );

        if (
            !itemResponse ||
            !itemResponse.success ||
            itemResponse.httpStatus !== 200
        ) {

            console.error(
                "Reservation Item API Error:",
                itemResponse
            );

            showToast(
                "Reservation created, but a reservation item could not be saved.",
                "danger"
            );

            return;
        }
    }


    // --------------------------------------------------------
    // Clear cart
    // --------------------------------------------------------

    appState.cart = [];

    localStorage.setItem(
        "medifind_cart",
        JSON.stringify([])
    );


    // --------------------------------------------------------
    // Update cart UI
    // --------------------------------------------------------

    if (typeof updateCartUI === "function") {
        updateCartUI();
    }

    if (typeof renderCart === "function") {
        renderCart();
    }


    // --------------------------------------------------------
    // Close reservation drawer/modal
    // --------------------------------------------------------

    if (typeof closeModal === "function") {

        closeModal("reservation-modal");
    }

    if (typeof toggleDrawer === "function") {

        toggleDrawer("reservation-cart");
    }


    // --------------------------------------------------------
    // Show success
    // --------------------------------------------------------

    showToast(
        "Reservation confirmed successfully.",
        "success"
    );


    // --------------------------------------------------------
    // Receipt
    // --------------------------------------------------------

    const receiptRef =
        document.getElementById("receipt-ref");

    if (receiptRef) {
        receiptRef.textContent =
            "RES-" + reservation.id;
    }

    const receiptPickup =
        document.getElementById("receipt-pickup");

    if (receiptPickup) {
        receiptPickup.textContent =
            new Date(pickupDate).toLocaleString();
    }

    const receiptModal =
        document.getElementById("reservation-receipt-modal");

    if (receiptModal) {
        receiptModal.style.display = "flex";
    }
}
async function loadCustomerReservations() {

    if (!appState.currentUser) return;

    const response =
        await apiFetch("/reservations", "GET");

    if (!response.success) return;

    const reservations =
        Array.isArray(response.body)
            ? response.body.filter(
                r =>
                    Number(r.userId) ===
                    Number(appState.currentUser.id)
            )
            : [];

    console.log("My reservations:", reservations);
}

document.addEventListener("DOMContentLoaded", function () {

    loadReservationBranches();

});