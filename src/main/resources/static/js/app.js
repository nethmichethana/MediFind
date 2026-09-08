// ============================================================
// BACKEND CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:8080";


// ============================================================
// APPLICATION STATE
// ============================================================

let appState = {
    selectedCategory: "ALL",
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
            container.innerHTML = `<button class="tab-btn active" onclick="selectCategory('ALL', this)">All Categories</button>`;
            response.body.forEach(cat => {
                const btn = document.createElement("button");
                btn.className = "tab-btn";
                btn.textContent = cat.name;
                btn.onclick = function () {
                    selectCategory(cat.id, this);
                };
                container.appendChild(btn);
            });
        }
    } catch (error) {
        console.error("Error loading catalog categories:", error);
    }
}

function selectCategory(categoryId, tabElement) {
    if (tabElement) {
        document.querySelectorAll("#category-tabs .tab-btn").forEach(btn => {
            btn.classList.remove("active");
        });
        tabElement.classList.add("active");
    }
    console.log("Selected category ID:", categoryId);
}



// ============================================================
// LOAD MEDICINES FROM BACKEND
// ============================================================

async function loadMedicinesFromBackend() {

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


        if (
            !response ||
            !response.success
        ) {

            console.error(
                "Failed to load medicines:",
                response
            );

            showToast(
                response?.message ||
                "Unable to load medicines.",
                "danger"
            );

            return [];
        }


        let medicines =
            response.body || [];


        if (!Array.isArray(medicines)) {

            if (
                medicines &&
                Array.isArray(
                    medicines.content
                )
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
            "Unable to load medicines.",
            "danger"
        );

        return [];
    }
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

        const medicines =
            await loadMedicinesFromBackend();

        // Save medicines into application state
        appState.medicines =
            medicines;

        console.log(
            "Customer medicines loaded:",
            appState.medicines
        );

        // ----------------------------------------------------
        // Render medicines on Customer page
        // ----------------------------------------------------

        if (
            typeof renderMedicineCatalog === "function"
        ) {

            renderMedicineCatalog();

        } else if (
            typeof filterMedicines === "function"
        ) {

            filterMedicines();

        }

    }
);