
// --- Seed Database Schema ---
const DEFAULT_CATEGORIES = [
    { id: 1, name: "Antibiotics", description: "Medicines used to treat bacterial infections." },
    { id: 2, name: "Analgesics", description: "Pain relief medications." },
    { id: 3, name: "Cardiovascular", description: "Heart and blood pressure regulation." },
    { id: 4, name: "Diabetic", description: "Blood sugar control therapies." },
    { id: 5, name: "Respiratory", description: "Inhalers and asthma support drugs." }
];

const DEFAULT_MEDICINES = [
    {
        id: 1,
        name: "Amoxicillin 500mg",
        genericName: "Amoxicillin Trihydrate",
        brandName: "Amoxil",
        dosageForm: "Capsule",
        strength: "500mg",
        description: "Broad-spectrum penicillin antibiotic used to treat bacterial infections such as pneumonia, tonsillitis, and ear infections.",
        categoryId: 1,
        prescriptionRequired: true,
        active: true
    },
    {
        id: 2,
        name: "Panadol 500mg",
        genericName: "Paracetamol",
        brandName: "Panadol",
        dosageForm: "Tablet",
        strength: "500mg",
        description: "Common analgesic and antipyretic drug. Relieves mild-to-moderate pain, headaches, muscle aches, and fever.",
        categoryId: 2,
        prescriptionRequired: false,
        active: true
    },
    {
        id: 3,
        name: "Metformin XR 1000mg",
        genericName: "Metformin Hydrochloride",
        brandName: "Glucophage XR",
        dosageForm: "Extended-Release Tablet",
        strength: "1000mg",
        description: "Oral anti-diabetic drug specifically formulated to control blood glucose levels in Type 2 Diabetes Mellitus.",
        categoryId: 4,
        prescriptionRequired: true,
        active: true
    },
    {
        id: 4,
        name: "Lipitor 20mg",
        genericName: "Atorvastatin Calcium",
        brandName: "Lipitor",
        dosageForm: "Tablet",
        strength: "20mg",
        description: "HMG-CoA reductase inhibitor (statin) used to lower blood cholesterol levels and prevent cardiovascular disease risks.",
        categoryId: 3,
        prescriptionRequired: true,
        active: true
    },
    {
        id: 5,
        name: "Ventolin Inhaler",
        genericName: "Albuterol Sulfate",
        brandName: "Ventolin",
        dosageForm: "Inhaler",
        strength: "100mcg/dose",
        description: "Fast-acting bronchodilator. Relax muscles in airways to increase airflow, relieving acute asthma attacks or exercise-induced bronchospasm.",
        categoryId: 5,
        prescriptionRequired: true,
        active: true
    },
    {
        id: 6,
        name: "Nurofen 200mg",
        genericName: "Ibuprofen",
        brandName: "Nurofen",
        dosageForm: "Tablet",
        strength: "200mg",
        description: "Non-steroidal anti-inflammatory drug (NSAID) designed to alleviate inflammatory aches, backache, dental pain, and arthritis.",
        categoryId: 2,
        prescriptionRequired: false,
        active: true
    }
];

const DEFAULT_PHARMACY = {
    id: 1,
    name: "MediFind Super Pharmacy",
    registrationNumber: "PH-99238-SL",
    phone: "0112345678",
    email: "corporate@medifind.com",
    address: "75 Health Plaza Boulevard",
    city: "Colombo"
};

const DEFAULT_BRANCHES = [
    { id: 1, name: "Colombo Town Center Branch", address: "12 Union Place, Colombo 02", city: "Colombo", phone: "0119876541", email: "towncenter@medifind.com", active: true, latitude: 6.9271, longitude: 79.8612 },
    { id: 2, name: "Kandy Central Square Branch", address: "44 Dalada Veediya, Kandy", city: "Kandy", phone: "0819876542", email: "kandysquare@medifind.com", active: true, latitude: 7.2906, longitude: 80.6337 },
    { id: 3, name: "Galle Fort Coastline Branch", address: "55 Church Street, Galle", city: "Galle", phone: "0919876543", email: "gallefort@medifind.com", active: true, latitude: 6.0331, longitude: 80.2170 }
];

const DEFAULT_BATCHES = [
    { id: 1, batchNumber: "BAT-AMX-001", quantity: 500, expiryDate: "2027-12-31", manufactureDate: "2025-12-01", unitPrice: 45.0, medicineId: 1 },
    { id: 2, batchNumber: "BAT-PAN-002", quantity: 2000, expiryDate: "2028-06-30", manufactureDate: "2026-01-10", unitPrice: 5.0, medicineId: 2 },
    { id: 3, batchNumber: "BAT-MET-003", quantity: 800, expiryDate: "2026-04-15", manufactureDate: "2024-04-15", unitPrice: 28.0, medicineId: 3 }, // Approaching expiry
    { id: 4, batchNumber: "BAT-LIP-004", quantity: 600, expiryDate: "2027-10-10", manufactureDate: "2025-10-10", unitPrice: 85.0, medicineId: 4 },
    { id: 5, batchNumber: "BAT-VEN-005", quantity: 150, expiryDate: "2027-02-28", manufactureDate: "2025-02-28", unitPrice: 420.0, medicineId: 5 },
    { id: 6, batchNumber: "BAT-NUR-006", quantity: 900, expiryDate: "2028-01-15", manufactureDate: "2026-01-15", unitPrice: 15.0, medicineId: 6 }
];

const DEFAULT_INVENTORY = [
    // Branch 1 (Colombo) Stock levels
    { id: 1, branchId: 1, batchId: 1, quantity: 220, reorderLevel: 50, lastUpdated: "2026-08-14T10:00:00" },
    { id: 2, branchId: 1, batchId: 2, quantity: 950, reorderLevel: 200, lastUpdated: "2026-08-14T10:00:00" },
    { id: 3, branchId: 1, batchId: 3, quantity: 12, reorderLevel: 30, lastUpdated: "2026-08-14T10:00:00" }, // Low Stock!
    { id: 4, branchId: 1, batchId: 4, quantity: 110, reorderLevel: 25, lastUpdated: "2026-08-14T10:00:00" },
    { id: 5, branchId: 1, batchId: 5, quantity: 45, reorderLevel: 10, lastUpdated: "2026-08-14T10:00:00" },
    
    // Branch 2 (Kandy) Stock levels
    { id: 6, branchId: 2, batchId: 1, quantity: 140, reorderLevel: 50, lastUpdated: "2026-08-14T11:00:00" },
    { id: 7, branchId: 2, batchId: 2, quantity: 600, reorderLevel: 200, lastUpdated: "2026-08-14T11:00:00" },
    { id: 8, branchId: 2, batchId: 3, quantity: 180, reorderLevel: 30, lastUpdated: "2026-08-14T11:00:00" },
    { id: 9, branchId: 2, batchId: 5, quantity: 0, reorderLevel: 10, lastUpdated: "2026-08-14T11:00:00" }, // Out of stock

    // Branch 3 (Galle) Stock levels
    { id: 10, branchId: 3, batchId: 2, quantity: 450, reorderLevel: 100, lastUpdated: "2026-08-14T12:00:00" },
    { id: 11, branchId: 3, batchId: 4, quantity: 18, reorderLevel: 20, lastUpdated: "2026-08-14T12:00:00" } // Low Stock
];

const DEFAULT_USERS = [
    { id: 1, name: "System Admin", email: "admin@medifind.com", password: "password123", role: "ADMIN", status: "ACTIVE" },
    { id: 2, name: "Nipuna Owner", email: "owner@medifind.com", password: "password123", role: "PHARMACY_ADMIN", status: "ACTIVE" },
    { id: 3, name: "Colombo Staff A", email: "staff@medifind.com", password: "password123", role: "PHARMACY_STAFF", status: "ACTIVE", branchId: 1 },
    { id: 4, name: "John Customer", email: "customer@medifind.com", password: "password123", role: "CUSTOMER", status: "ACTIVE" }
];

const DEFAULT_RESERVATIONS = [
    {
        id: 1,
        reservationDate: "2026-08-14T09:30:00",
        pickupDate: "2026-08-15T10:00:00",
        status: "PENDING",
        notes: "I will bring my medical prescription slip at pickup.",
        userId: 4,
        branchId: 1,
        items: [
            { id: 1, medicineId: 1, quantity: 20, unitPrice: 45.0, batchNumber: "BAT-AMX-001" }
        ]
    }
];

const DEFAULT_AUDITS = [
    { id: 1, timestamp: "2026-08-14T09:00:00", user: "system", action: "DATABASE_INITIALIZATION", details: "Seeded initial pharmacy products, user credentials and branch maps." }
];

const DEFAULT_NOTIFICATIONS = [
    { id: 1, type: "LOW_STOCK", message: "Colombo Town Center Branch is low on Metformin XR (12 capsules left).", timestamp: "2026-08-14T09:45:00", isRead: false },
    { id: 2, type: "EXPIRY_WARNING", message: "Batch BAT-MET-003 is expiring on 2026-04-15 (less than 9 months).", timestamp: "2026-08-14T09:50:00", isRead: false }
];

// Database initialisation
function initDatabase() {
    if (!localStorage.getItem("medifind_initialized")) {
        localStorage.setItem("medifind_categories", JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem("medifind_medicines", JSON.stringify(DEFAULT_MEDICINES));
        localStorage.setItem("medifind_pharmacy", JSON.stringify(DEFAULT_PHARMACY));
        localStorage.setItem("medifind_branches", JSON.stringify(DEFAULT_BRANCHES));
        localStorage.setItem("medifind_batches", JSON.stringify(DEFAULT_BATCHES));
        localStorage.setItem("medifind_inventory", JSON.stringify(DEFAULT_INVENTORY));
        localStorage.setItem("medifind_users", JSON.stringify(DEFAULT_USERS));
        localStorage.setItem("medifind_reservations", JSON.stringify(DEFAULT_RESERVATIONS));
        localStorage.setItem("medifind_audits", JSON.stringify(DEFAULT_AUDITS));
        localStorage.setItem("medifind_notifications", JSON.stringify(DEFAULT_NOTIFICATIONS));
        localStorage.setItem("medifind_initialized", "true");
    }
}
// ============================================================
// BACKEND API CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:8080";


// ============================================================
// API FETCH HELPER
// ============================================================

async function apiFetch(endpoint, method = "GET", body = null) {

    const token = localStorage.getItem("medifind_token");

    const headers = {
        "Content-Type": "application/json"
    };

    // JWT token exists නම් Authorization header එක add කරනවා
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

        // Response එක JSON ද කියලා බලනවා
        const contentType = response.headers.get("content-type");

        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        /*
         * CommonResponse structure:
         *
         * {
         *     status: 200,
         *     body: {...},
         *     message: "Success"
         * }
         */

        if (!response.ok) {

            console.error(
                "API Error:",
                response.status,
                data
            );

            return {
                status: response.status,
                body: null,
                message:
                    data?.message ||
                    data?.error ||
                    "Request failed"
            };
        }

        return {
            status: response.status,
            body: data?.body ?? data,
            message: data?.message || "Success"
        };

    } catch (error) {

        console.error("Backend connection error:", error);

        return {
            status: 0,
            body: null,
            message:
                "Cannot connect to backend. Make sure Spring Boot is running on port 8080."
        };
    }
}


// ============================================================
// AUTHENTICATION OPERATIONS
// ============================================================


// ------------------------------------------------------------
// Login button inside Login Modal
// ------------------------------------------------------------

async function handleLogin() {

    await performLogin(
        "login-email",
        "login-password",
        true
    );
}


// ------------------------------------------------------------
// Login page section
// ------------------------------------------------------------

async function handlePageLogin() {

    await performLogin(
        "page-login-email",
        "page-login-password",
        false
    );
}


// ------------------------------------------------------------
// Common Login Function
// ------------------------------------------------------------

async function performLogin(
    emailId,
    passwordId,
    isModal
) {

    const emailInput =
        document.getElementById(emailId);

    const passwordInput =
        document.getElementById(passwordId);

    if (!emailInput || !passwordInput) {

        showToast(
            "Login form fields not found.",
            "danger"
        );

        return;
    }

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value.trim();


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!email || !password) {

        showToast(
            "Please enter email and password.",
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


    showToast(
        "Signing in...",
        "info"
    );


    const response = await apiFetch(
        "/v1/auth/login",
        "POST",
        loginRequest
    );


    // --------------------------------------------------------
    // Login Failed
    // --------------------------------------------------------

    if (!response || response.status !== 200) {

        showToast(
            response?.message ||
            "Invalid email or password.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Login Response
    // --------------------------------------------------------

    const loginData = response.body;


    if (!loginData) {

        showToast(
            "Invalid response received from server.",
            "danger"
        );

        return;
    }


    /*
     * Expected LoginResDTO:
     *
     * {
     *     token: "...",
     *     userId: 1,
     *     name: "Admin",
     *     email: "admin@medifind.com",
     *     role: "ADMIN"
     * }
     */


    const token = loginData.token;


    if (!token) {

        showToast(
            "Login successful but JWT token was not received.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Save JWT
    // --------------------------------------------------------

    localStorage.setItem(
        "medifind_token",
        token
    );


    // --------------------------------------------------------
    // Create frontend session object
    // --------------------------------------------------------

    const user = {

        id: loginData.userId,

        name: loginData.name,

        email: loginData.email,

        role: loginData.role
    };


    appState.currentUser = user;


    localStorage.setItem(
        "medifind_session",
        JSON.stringify(user)
    );


    // --------------------------------------------------------
    // Close modal
    // --------------------------------------------------------

    if (isModal) {

        closeModal("login-modal");
    }


    // --------------------------------------------------------
    // Update UI
    // --------------------------------------------------------

    updateUserHeader();


    showToast(
        `Welcome back, ${user.name || user.email}!`,
        "success"
    );


    // --------------------------------------------------------
    // Role-based navigation
    // --------------------------------------------------------

    const role = user.role
        ? user.role.toUpperCase()
        : "";


    if (
        role === "ADMIN" ||
        role === "PHARMACY_ADMIN" ||
        role === "PHARMACY_STAFF"
    ) {

        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 800);

    } else {

        // CUSTOMER

        showSection("catalog");

        renderCustomerReservations();
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


    // --------------------------------------------------------
    // Basic email validation
    // --------------------------------------------------------

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
    // Customer Role
    // --------------------------------------------------------

    /*
     * IMPORTANT:
     *
     * UserReqDTO requires:
     *
     * name
     * email
     * password
     * phone
     * status
     * roleId
     *
     * Customer role ID එක database එකෙන් dynamically
     * find කරනවා.
     */


    showToast(
        "Checking customer role...",
        "info"
    );


    const rolesResponse = await apiFetch(
        "/v1/roles",
        "GET"
    );


    if (
        !rolesResponse ||
        rolesResponse.status !== 200
    ) {

        showToast(
            "Cannot load roles from backend.",
            "danger"
        );

        return;
    }


    const roles = rolesResponse.body;


    if (!Array.isArray(roles)) {

        showToast(
            "Invalid roles response from backend.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Find CUSTOMER role
    // --------------------------------------------------------

    const customerRole =
        roles.find(role => {

            const roleName =
                role.roleName ||
                role.name;

            return roleName &&
                roleName.toUpperCase() === "CUSTOMER";
        });


    if (!customerRole) {

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
            ...userRequest,
            password: "********"
        }
    );


    // --------------------------------------------------------
    // Send request to backend
    // --------------------------------------------------------

    showToast(
        "Creating your account...",
        "info"
    );


    const response = await apiFetch(
        "/v1/users",
        "POST",
        userRequest
    );


    // --------------------------------------------------------
    // Signup failed
    // --------------------------------------------------------

    if (
        !response ||
        response.status !== 200
    ) {

        showToast(
            response?.message ||
            "Unable to create account.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Signup successful
    // --------------------------------------------------------

    const createdUser =
        response.body;


    console.log(
        "Created User:",
        createdUser
    );


    showToast(
        "Account created successfully! Please sign in.",
        "success"
    );


    // --------------------------------------------------------
    // Clear signup form
    // --------------------------------------------------------

    nameInput.value = "";

    emailInput.value = "";

    phoneInput.value = "";

    passwordInput.value = "";


    // --------------------------------------------------------
    // Close signup modal
    // --------------------------------------------------------

    closeModal("signup-modal");


    // --------------------------------------------------------
    // Open login modal
    // --------------------------------------------------------

    setTimeout(() => {

        openModal("login-modal");

        const loginEmail =
            document.getElementById("login-email");

        if (loginEmail) {

            loginEmail.value = email;
        }

        const loginPassword =
            document.getElementById("login-password");

        if (loginPassword) {

            loginPassword.value = "";
        }

    }, 500);
}


// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {

    // Remove frontend user session

    appState.currentUser = null;

    appState.cart = [];


    // Remove JWT

    localStorage.removeItem(
        "medifind_token"
    );


    // Remove user session

    localStorage.removeItem(
        "medifind_session"
    );


    updateUserHeader();

    updateCartDisplay();


    showSection(
        "catalog"
    );


    showToast(
        "Logged out successfully.",
        "info"
    );
}


// ============================================================
// USER HEADER
// ============================================================

function updateUserHeader() {

    const userDisplay =
        document.getElementById("user-display");

    const authButtons =
        document.getElementById("auth-buttons");

    const greeting =
        document.getElementById("user-greeting");

    const dashLink =
        document.getElementById("nav-dashboard-link");


    if (appState.currentUser) {

        const user =
            appState.currentUser;


        if (greeting) {

            greeting.textContent =
                `Hello, ${user.name} (${(user.role || "")
                    .replaceAll("_", " ")})`;
        }


        if (userDisplay) {

            userDisplay.style.display =
                "flex";
        }


        if (authButtons) {

            authButtons.style.display =
                "none";
        }


        const role =
            (user.role || "").toUpperCase();


        if (
            role === "ADMIN" ||
            role === "PHARMACY_ADMIN" ||
            role === "PHARMACY_STAFF"
        ) {

            if (dashLink) {

                dashLink.style.display =
                    "inline-block";
            }

        } else {

            if (dashLink) {

                dashLink.style.display =
                    "none";
            }
        }

    } else {

        if (userDisplay) {

            userDisplay.style.display =
                "none";
        }


        if (authButtons) {

            authButtons.style.display =
                "flex";
        }


        if (dashLink) {

            dashLink.style.display =
                "none";
        }
    }
}

// --- AI Chatbot Panel Controller ---
function toggleAiChat() {
    const win = document.getElementById("ai-chat-window");
    if (!win) return;
    win.style.display = win.style.display === "flex" ? "none" : "flex";
}

function sendSuggestedChat(text) {
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
        chatInput.value = text;
        sendChatMessage();
    }
}

function sendChatMessage() {
    const input = document.getElementById("chat-input");
    const container = document.getElementById("chat-messages");
    if (!input || !container) return;

    const query = input.value.trim();
    if (!query) return;

    // Append user message
    const userMsg = document.createElement("div");
    userMsg.className = "chat-msg msg-user animate-fade";
    userMsg.textContent = query;
    container.appendChild(userMsg);
    
    input.value = "";
    container.scrollTop = container.scrollHeight;

    // Simulate Spring AI loading state
    const botLoadingMsg = document.createElement("div");
    botLoadingMsg.className = "chat-msg msg-bot animate-fade";
    botLoadingMsg.innerHTML = `<span style="display:inline-flex; gap:4px; align-items:center;">Thinking... <svg style="animation: rotateLoader 1s linear infinite; width:12px; height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg></span>`;
    container.appendChild(botLoadingMsg);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
        container.removeChild(botLoadingMsg);
        
        let responseText = "";
        const lower = query.toLowerCase();

        if (lower.includes("amoxicillin")) {
            responseText = `**Amoxicillin** is a broad-spectrum penicillin antibiotic used to eradicate bacterial infections (otitis media, respiratory tracts, etc.).\n\n* **Dosage Guidance:** Standard adult dose is 250mg - 500mg every 8 hours, or 500mg - 875mg every 12 hours depending on severity.\n* **Precautions:** Do not take if you have a known penicillin allergy. Finish the entire course even if symptoms resolve to prevent antibiotic resistance.`;
        } else if (lower.includes("brand") || lower.includes("generic")) {
            responseText = `In healthcare, **Generic medicines** contain the identical active pharmaceutical ingredients (APIs) and provide the exact therapeutic bioequivalence as **Brand-name medicines**, but are usually sold at a significantly lower cost.\n\nFor example, *Panadol* is the brand-name for the generic drug *Paracetamol*. Both satisfy identical safety and purity regulations.`;
        } else if (lower.includes("metformin")) {
            responseText = `**Metformin** is first-line pharmacotherapy for Type 2 Diabetes.\n\n* **Common Interactions:** Alcohol (increases lactic acidosis hazard), contrast dyes (requires temporary stoppage), and cimetidine.\n* **Side effects:** Mild gastrointestinal discomfort (nausea, cramping) is common during initiation. Extended-Release (XR) formulas lower these symptoms.`;
        } else if (lower.includes("panadol") || lower.includes("paracetamol")) {
            responseText = `**Paracetamol (Panadol)** is a safe analgesic (pain reducer) and antipyretic (fever reducer) if used correctly.\n\n* **Maximum Limit:** Standard adult ceiling is **4000mg (8 tablets of 500mg) per 24 hours** to prevent severe hepatotoxicity (liver damage). Avoid combination cold medicines containing paracetamol to prevent accidental overdose.`;
        } else if (lower.includes("inhaler") || lower.includes("ventolin") || lower.includes("asthma")) {
            responseText = `**Ventolin (Albuterol Inhaler)** is a short-acting beta-2 agonist (SABA) designed to resolve acute respiratory constriction.\n\n* **Usage:** Inhale 1 to 2 puffs during sudden shortness of breath or wheezing. If you rely on this rescue inhaler more than twice a week, speak to your physician about introducing a long-term controller inhaler (corticosteroid).`;
        } else {
            responseText = `I've analyzed your query regarding **"${query}"** in our pharmacy database. To provide targeted clinical advice, could you confirm if you are asking about:\n\n1. Proper dosage guidelines?\n2. Drug-drug interactions with current treatments?\n3. Lower-cost generic substitutes?\n\n*Reminder: Always confirm with your physician or pharmacist prior to altering drug therapies.*`;
        }

        // Format basic markdown style bolding
        responseText = responseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        responseText = responseText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        responseText = responseText.replace(/\n/g, '<br>');

        const botMsg = document.createElement("div");
        botMsg.className = "chat-msg msg-bot animate-fade";
        botMsg.innerHTML = responseText;
        container.appendChild(botMsg);
        container.scrollTop = container.scrollHeight;
    }, 1200);
}

// --- Drawers / Modal Controls ---
function openDrawer(id) {
    document.getElementById(id).style.display = "flex";
}
function closeDrawer(id) {
    document.getElementById(id).style.display = "none";
}
function toggleDrawer(id) {
    const drawer = document.getElementById(id + "-backdrop");
    if (!drawer) return;
    drawer.style.display = drawer.style.display === "flex" ? "none" : "flex";
}

function openModal(id) {
    document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// Toast System (Dynamic toast indicators)
function showToast(message, type = "success") {
    let toast = document.createElement("div");
    toast.style.position = "fixed";
    toast.style.bottom = "2rem";
    toast.style.left = "2rem";
    toast.style.padding = "0.75rem 1.5rem";
    toast.style.borderRadius = "var(--radius-sm)";
    toast.style.zIndex = "10000";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "8px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 8px 30px rgba(0,0,0,0.5)";
    toast.style.animation = "fadeIn 0.2s ease-out";
    
    if (type === "success") {
        toast.style.background = "var(--accent-emerald)";
        toast.style.color = "white";
    } else if (type === "danger") {
        toast.style.background = "var(--accent-rose)";
        toast.style.color = "white";
    } else if (type === "warning") {
        toast.style.background = "var(--accent-amber)";
        toast.style.color = "var(--text-dark)";
    } else {
        toast.style.background = "var(--bg-slate-800)";
        toast.style.color = "var(--text-primary)";
        toast.style.border = "1px solid var(--glass-border)";
    }

    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.4s";
        setTimeout(() => document.body.removeChild(toast), 400);
    }, 3000);
}
