// ============================================================
// BACKEND CONFIGURATION
// ============================================================

const API_BASE_URL = "http://localhost:8080";


// ============================================================
// APPLICATION STATE
// ============================================================

let appState = {
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

    const customerRole =
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

        return;
    }


    try {

        appState.currentUser =
            JSON.parse(savedSession);

        console.log(
            "Saved session loaded:",
            appState.currentUser
        );

    } catch (error) {

        console.error(
            "Invalid saved session:",
            error
        );

        localStorage.removeItem(
            "medifind_session"
        );

        appState.currentUser = null;
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
// APPLICATION INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "MediFind application initialized."
        );

        loadSavedSession();

    }
);