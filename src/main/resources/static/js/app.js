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
// API AJAX HELPER - jQuery
// ============================================================

function apiFetch(
    endpoint,
    method = "GET",
    body = null
) {

    const token = localStorage.getItem("medifind_token");
    const headers = {"Content-Type": "application/json"};

    // Add JWT token when available
    if (token) {

        headers["Authorization"] =
            "Bearer " + token;
    }

    const options = {

        url:
            API_BASE_URL + endpoint,

        type:
        method,

        headers:
        headers,

        dataType:
            "json"
    };

    // Add request body
    if (body !== null) {

        options.data =
            JSON.stringify(body);
    }

    return $.ajax(options)

        // ----------------------------------------------------
        // Backend Success
        // ----------------------------------------------------

        .then(function (
            data,
            textStatus,
            jqXHR
        ) {

            return {

                success: true,

                httpStatus:
                jqXHR.status,

                status:
                    data?.status ?? null,

                body:
                    data?.body ?? data,

                message:
                    data?.message ||
                    "Operation successful."
            };

        })

        // ----------------------------------------------------
        // Backend Error
        // ----------------------------------------------------

        .catch(function (jqXHR) {

            let data =
                jqXHR.responseJSON;

            if (!data) {

                data =
                    jqXHR.responseText;
            }

            console.error(
                "API Error:",
                jqXHR.status,
                data
            );

            return {

                success: false,

                httpStatus:
                    jqXHR.status || 0,

                status:
                    data?.status ?? null,

                body:
                    null,

                message:
                    data?.message ||
                    data?.error ||
                    "Request failed."
            };
        });
}

// ============================================================
// LOAD PHARMACY BRANCHES FOR RESERVATION
// ============================================================

async function loadReservationBranches() {

    const $branchSelect = $("#reservation-branch");

    console.log(
        "Reservation branch dropdown found:",
        $branchSelect.length
    );

    if ($branchSelect.length === 0) {

        console.error(
            "Reservation branch dropdown not found."
        );

        return;
    }

    const token =
        localStorage.getItem("medifind_token");

    console.log(
        "Loading pharmacy branches..."
    );

    try {

        const response = await $.ajax({

            url:
                API_BASE_URL +
                "/v1/pharmacy-branches",

            type: "GET",

            headers: token
                ? {
                    "Authorization":
                        "Bearer " + token
                }
                : {},

            dataType: "json"
        });

        console.log(
            "Pharmacy Branches API Response:",
            response
        );

        // ----------------------------------------------------
        // CHECK COMMON RESPONSE STATUS
        // ----------------------------------------------------

        if (
            !response ||
            response.status !== 0
        ) {

            console.error(
                "Pharmacy branches API failed:",
                response
            );

            $branchSelect.html(
                '<option value="">Unable to load branches</option>'
            );

            return;
        }

        // ----------------------------------------------------
        // GET BRANCHES
        // ----------------------------------------------------

        const branches =
            Array.isArray(response.body)
                ? response.body
                : [];

        console.log(
            "Number of branches:",
            branches.length
        );

        console.log(
            "Branches from database:",
            branches
        );

        // ----------------------------------------------------
        // CLEAR OLD OPTIONS
        // ----------------------------------------------------

        $branchSelect.empty();

        // ----------------------------------------------------
        // DEFAULT OPTION
        // ----------------------------------------------------

        $branchSelect.append(
            $("<option>", {
                value: "",
                text: "Select Pharmacy Branch"
            })
        );

        // ----------------------------------------------------
        // ADD DATABASE BRANCHES
        // ----------------------------------------------------

        $.each(
            branches,
            function (index, branch) {

                console.log(
                    "Branch " + index + ":",
                    branch
                );

                const branchId =
                    branch.id;

                const branchName =
                    branch.name ||
                    branch.branchName ||
                    branch.branch_name ||
                    "Unnamed Branch";

                $branchSelect.append(
                    $("<option>", {
                        value: branchId,
                        text: branchName
                    })
                );
            }
        );

        console.log(
            "Dropdown options:",
            $branchSelect.find("option").length
        );

        console.log(
            "Pharmacy branch dropdown updated successfully."
        );

    } catch (error) {

        console.error(
            "Error loading pharmacy branches:",
            error
        );

        console.error(
            "Status:",
            error.status
        );

        console.error(
            "Response:",
            error.responseJSON
        );

        $branchSelect.html(
            '<option value="">Failed to load branches</option>'
        );
    }
}

// ============================================================
// MODAL CONTROLS & NAVIGATION
// ============================================================

function openModal(modalId) {

    const $modal =
        $("#" + modalId);

    if ($modal.length > 0) {

        $modal.css(
            "display",
            "flex"
        );

    } else {

        console.error(
            "Modal not found:",
            modalId
        );
    }
}


function closeModal(modalId) {

    const $modal =
        $("#" + modalId);

    if ($modal.length > 0) {

        $modal.css(
            "display",
            "none"
        );

    } else {

        console.error(
            "Modal not found:",
            modalId
        );
    }
}


function showSection(sectionName) {

    const $catalogSec =
        $("#catalog-section");

    const $resSec =
        $("#reservations-section");

    const $loginSec =
        $("#login-section");


    $catalogSec.hide();

    $resSec.hide();

    $loginSec.hide();


    if (sectionName === "catalog") {

        $catalogSec.show();

    } else if (
        sectionName === "reservations"
    ) {

        $resSec.show();
        loadCustomerReservations();

    } else if (
        sectionName === "login"
    ) {

        $loginSec.show();

    } else if (
        sectionName === "signup"
    ) {

        openModal(
            "signup-modal"
        );

        $catalogSec.show();
    }


    // Navigation active state
    $(".nav-links .nav-link").each(
        function () {

            const $link =
                $(this);

            $link.removeClass(
                "active"
            );

            const onclickValue =
                $link.attr(
                    "onclick"
                );

            if (
                onclickValue &&
                onclickValue.includes(
                    sectionName
                )
            ) {

                $link.addClass(
                    "active"
                );
            }
        }
    );
}


// ============================================================
// UPDATE AUTH UI
// ============================================================

function updateAuthUI() {

    const $userDisplay =
        $("#user-display");

    const $authButtons =
        $("#auth-buttons");

    const $userGreeting =
        $("#user-greeting");

    const $navDashboardLink =
        $("#nav-dashboard-link");


    const user =
        appState.currentUser;


    // Logged in
    if (
        user &&
        user.email
    ) {

        $userDisplay.css(
            "display",
            "flex"
        );

        $authButtons.hide();

        $userGreeting.text(
            `Welcome, ${user.name || user.email}`
        );


        const role =
            (user.role || "")
                .toUpperCase();


        if (
            role === "ADMIN" ||
            role === "PHARMACY_ADMIN" ||
            role === "PHARMACY_STAFF"
        ) {

            $navDashboardLink.css(
                "display",
                "inline-block"
            );

        } else {

            $navDashboardLink.hide();
        }


    } else {

        // Logged out

        $userDisplay.hide();

        $authButtons.css(
            "display",
            "flex"
        );

        $navDashboardLink.hide();
    }
}


// ============================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ============================================================

$(window).on(
    "click",
    function (event) {

        if (
            $(event.target)
                .hasClass(
                    "modal-backdrop"
                )
        ) {

            $(event.target).hide();
        }
    }
);


// ============================================================
// LOGIN
// ============================================================

async function handleLogin() {

    await performLogin(
        "login-email",
        "login-password",
        true
    );
}


// ============================================================
// LOGIN PAGE
// ============================================================

async function handlePageLogin() {

    await performLogin(
        "page-login-email",
        "page-login-password",
        false
    );
}


// ============================================================
// COMMON LOGIN FUNCTION
// ============================================================

async function performLogin(
    emailId,
    passwordId,
    isModal = false
) {

    // --------------------------------------------------------
    // Get input fields
    // --------------------------------------------------------

    const $emailInput =
        $("#" + emailId);

    const $passwordInput =
        $("#" + passwordId);


    // --------------------------------------------------------
    // Check fields
    // --------------------------------------------------------

    if (
        $emailInput.length === 0 ||
        $passwordInput.length === 0
    ) {

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
        $.trim(
            $emailInput.val()
        );

    const password =
        $.trim(
            $passwordInput.val()
        );


    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (
        !email ||
        !password
    ) {

        showToast(
            "Please enter your email and password.",
            "danger"
        );

        return;
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(email)
    ) {

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

        email:
        email,

        password:
        password
    };


    console.log(
        "Login Request:",
        {
            email:
            email
        }
    );


    showToast(
        "Signing in...",
        "info"
    );


    // --------------------------------------------------------
    // AJAX -> Spring Boot
    // --------------------------------------------------------

    let response;


    try {

        response =
            await $.ajax({

                url:
                    API_BASE_URL +
                    "/v1/auth/login",

                type:
                    "POST",

                contentType:
                    "application/json",

                data:
                    JSON.stringify(
                        loginRequest
                    ),

                dataType:
                    "json"
            });

    } catch (error) {

        console.error(
            "Login API Error:",
            error
        );


        const errorResponse =
            error.responseJSON;


        showToast(
            (
                errorResponse &&
                (
                    errorResponse.message ||
                    errorResponse.error
                )
            ) ||
            "Invalid email or password.",
            "danger"
        );

        return;
    }


    console.log(
        "Login Response:",
        response
    );


    // --------------------------------------------------------
    // Login Failed
    // --------------------------------------------------------

    if (
        !response ||
        response.status !== 0
    ) {

        showToast(
            response?.message ||
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
// JWT Token
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
// GET USER ROLE FIRST
// --------------------------------------------------------

    const role =
        (loginData.role || "")
            .toString()
            .trim()
            .toUpperCase();


// --------------------------------------------------------
// CUSTOMER LOGIN PAGE
// ONLY CUSTOMER IS ALLOWED
// --------------------------------------------------------

    if (role !== "CUSTOMER") {

        console.warn(
            "Non-customer login attempt:",
            role
        );

        // Do NOT save admin/staff JWT
        localStorage.removeItem(
            "medifind_token"
        );

        localStorage.removeItem(
            "medifind_session"
        );

        appState.currentUser = null;

        updateAuthUI();

        showToast(
            "This login is only available for customers.",
            "danger"
        );

        return;
    }


// --------------------------------------------------------
// CREATE CUSTOMER SESSION
// --------------------------------------------------------

    const user = {

        id:
        loginData.userId,

        name:
        loginData.name,

        email:
        loginData.email,

        role:
        role
    };


// --------------------------------------------------------
// SAVE CUSTOMER JWT
// --------------------------------------------------------

    localStorage.setItem(
        "medifind_token",
        token
    );


// --------------------------------------------------------
// SAVE CUSTOMER SESSION
// --------------------------------------------------------

    localStorage.setItem(
        "medifind_session",
        JSON.stringify(user)
    );


// --------------------------------------------------------
// UPDATE APPLICATION STATE
// --------------------------------------------------------

    appState.currentUser =
        user;


// --------------------------------------------------------
// UPDATE AUTH UI
// --------------------------------------------------------

    updateAuthUI();


// --------------------------------------------------------
// CLOSE LOGIN MODAL
// --------------------------------------------------------

    if (isModal) {

        closeModal(
            "login-modal"
        );
    }


// --------------------------------------------------------
// CUSTOMER LOGIN SUCCESS
// --------------------------------------------------------

    showToast(
        `Welcome back, ${user.name || user.email}!`,
        "success"
    );


// --------------------------------------------------------
// CUSTOMER PAGE ONLY
// --------------------------------------------------------

    showSection(
        "catalog"
    );

    renderCustomerReservations();


}


// ============================================================
// SIGNUP
// ============================================================

async function handleSignup() {

    // --------------------------------------------------------
    // Get form fields
    // --------------------------------------------------------

    const $nameInput =
        $("#signup-name");

    const $emailInput =
        $("#signup-email");

    const $phoneInput =
        $("#signup-phone");

    const $passwordInput =
        $("#signup-password");


    // --------------------------------------------------------
    // Check form fields
    // --------------------------------------------------------

    if (
        $nameInput.length === 0 ||
        $emailInput.length === 0 ||
        $phoneInput.length === 0 ||
        $passwordInput.length === 0
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
        $.trim(
            $nameInput.val()
        );

    const email =
        $.trim(
            $emailInput.val()
        );

    const phone =
        $.trim(
            $phoneInput.val()
        );

    const password =
        $.trim(
            $passwordInput.val()
        );


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


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(email)
    ) {

        showToast(
            "Please enter a valid email address.",
            "danger"
        );

        return;
    }


    if (
        password.length < 6
    ) {

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


    let rolesResponse;


    try {

        rolesResponse =
            await $.ajax({

                url:
                    API_BASE_URL +
                    "/v1/roles",

                type:
                    "GET",

                contentType:
                    "application/json",

                dataType:
                    "json"
            });

    } catch (error) {

        console.error(
            "Roles API Error:",
            error
        );

        showToast(
            "Cannot load roles from backend.",
            "danger"
        );

        return;
    }


    console.log(
        "Roles Response:",
        rolesResponse
    );


    if (
        !rolesResponse ||
        rolesResponse.status !== 0
    ) {

        showToast(
            rolesResponse?.message ||
            "Cannot load roles from backend.",
            "danger"
        );

        return;
    }


    let roles =
        rolesResponse.body;


    if (
        !Array.isArray(roles)
    ) {

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
    // Find CUSTOMER
    // --------------------------------------------------------

    let customerRole =
        roles.find(
            function (role) {

                const roleName =
                    role.roleName ||
                    role.name;

                return (
                    roleName &&
                    roleName
                        .toUpperCase() ===
                    "CUSTOMER"
                );
            }
        );


    // --------------------------------------------------------
    // Create CUSTOMER if missing
    // --------------------------------------------------------

    if (!customerRole) {

        console.log(
            "CUSTOMER role not found. Creating..."
        );


        let createRoleRes;


        try {

            createRoleRes =
                await $.ajax({

                    url:
                        API_BASE_URL +
                        "/v1/roles",

                    type:
                        "POST",

                    contentType:
                        "application/json",

                    dataType:
                        "json",

                    data:
                        JSON.stringify({

                            roleName:
                                "CUSTOMER"
                        })
                });

        } catch (error) {

            console.error(
                "Create CUSTOMER Role Error:",
                error
            );

            showToast(
                "Cannot create CUSTOMER role.",
                "danger"
            );

            return;
        }


        console.log(
            "Create Role Response:",
            createRoleRes
        );


        if (
            createRoleRes &&
            createRoleRes.status === 0
        ) {

            try {

                rolesResponse =
                    await $.ajax({

                        url:
                            API_BASE_URL +
                            "/v1/roles",

                        type:
                            "GET",

                        contentType:
                            "application/json",

                        dataType:
                            "json"
                    });


                if (
                    rolesResponse.status === 0 &&
                    Array.isArray(
                        rolesResponse.body
                    )
                ) {

                    roles =
                        rolesResponse.body;


                    customerRole =
                        roles.find(
                            function (role) {

                                const roleName =
                                    role.roleName ||
                                    role.name;

                                return (
                                    roleName &&
                                    roleName
                                        .toUpperCase() ===
                                    "CUSTOMER"
                                );
                            }
                        );
                }

            } catch (error) {

                console.error(
                    "Role Recheck Error:",
                    error
                );

                showToast(
                    "Cannot reload roles from backend.",
                    "danger"
                );

                return;
            }
        }
    }


    // --------------------------------------------------------
    // CUSTOMER role not found
    // --------------------------------------------------------

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

        name:
        name,

        email:
        email,

        password:
        password,

        phone:
        phone,

        status:
            "ACTIVE",

        roleId:
        customerRole.id
    };


    console.log(
        "Signup Request:",
        {
            name:
            name,

            email:
            email,

            phone:
            phone,

            status:
                "ACTIVE",

            roleId:
            customerRole.id
        }
    );


    showToast(
        "Creating your account...",
        "info"
    );


    // --------------------------------------------------------
    // Create User
    // --------------------------------------------------------

    let response;


    try {

        response =
            await $.ajax({

                url:
                    API_BASE_URL +
                    "/v1/users",

                type:
                    "POST",

                contentType:
                    "application/json",

                dataType:
                    "json",

                data:
                    JSON.stringify(
                        userRequest
                    )
            });

    } catch (error) {

        console.error(
            "Signup API Error:",
            error
        );


        const errorResponse =
            error.responseJSON;


        showToast(
            (
                errorResponse &&
                (
                    errorResponse.message ||
                    errorResponse.error
                )
            ) ||
            "Unable to create account.",
            "danger"
        );

        return;
    }


    console.log(
        "Signup Response:",
        response
    );


    // --------------------------------------------------------
    // Signup Failed
    // --------------------------------------------------------

    if (
        !response ||
        response.status !== 0
    ) {

        showToast(
            response?.message ||
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
    // Clear Form
    // --------------------------------------------------------

    $nameInput.val("");

    $emailInput.val("");

    $phoneInput.val("");

    $passwordInput.val("");


    // --------------------------------------------------------
    // Close Signup Modal
    // --------------------------------------------------------

    closeModal(
        "signup-modal"
    );


    // --------------------------------------------------------
    // Open Login Modal
    // --------------------------------------------------------

    setTimeout(
        function () {

            openModal(
                "login-modal"
            );


            const $loginEmail =
                $("#login-email");


            if (
                $loginEmail.length > 0
            ) {

                $loginEmail.val(
                    email
                );
            }

        },
        500
    );
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


    appState.currentUser =
        null;


    updateAuthUI();


    showToast(
        "Logged out successfully.",
        "info"
    );


    setTimeout(
        function () {

            window.location.href =
                "index.html";

        },
        500
    );
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

        appState.currentUser =
            null;

        updateAuthUI();

        return;
    }


    try {

        appState.currentUser =
            JSON.parse(
                savedSession
            );


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


        appState.currentUser =
            null;


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

    const $toast =
        $("<div></div>");


    $toast.css({

        position:
            "fixed",

        bottom:
            "2rem",

        left:
            "2rem",

        padding:
            "0.75rem 1.5rem",

        borderRadius:
            "8px",

        zIndex:
            "10000",

        fontWeight:
            "600",

        boxShadow:
            "0 8px 30px rgba(0,0,0,0.5)",

        transition:
            "opacity 0.4s",

        color:
            "white"
    });


    if (
        type === "success"
    ) {

        $toast.css(
            "background",
            "var(--accent-emerald, #10b981)"
        );

    } else if (
        type === "danger"
    ) {

        $toast.css(
            "background",
            "var(--accent-rose, #f43f5e)"
        );

    } else if (
        type === "warning"
    ) {

        $toast.css(
            "background",
            "var(--accent-amber, #f59e0b)"
        );

    } else {

        $toast.css(
            "background",
            "#1e293b"
        );
    }


    $toast.text(
        message
    );


    $("body").append(
        $toast
    );


    setTimeout(
        function () {

            $toast.css(
                "opacity",
                "0"
            );


            setTimeout(
                function () {

                    $toast.remove();

                },
                400
            );

        },
        3000
    );
}


// ============================================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK
// ============================================================

window.openModal = openModal;
window.closeModal = closeModal;
window.showSection = showSection;
window.handleLogin = handleLogin;
window.handlePageLogin = handlePageLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.loadReservationBranches = loadReservationBranches;
window.loadSavedSession = loadSavedSession;
window.showToast = showToast;

// ============================================================
// MEDICINE CATEGORIES (CATALOG VIEW)
// ============================================================

// ============================================================
// MEDICINE CATEGORIES (CATALOG VIEW)
// ============================================================

async function loadCatalogCategories() {

    const $container = $("#category-tabs");

    if ($container.length === 0) {
        return;
    }

    const token = localStorage.getItem("medifind_token");

    try {

        const response = await $.ajax({
            url: API_BASE_URL + "/v1/medicine-categories",
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            dataType: "json"
        });

        console.log("Catalog Categories Response:", response);

        // Spring Boot CommonResponse
        if (
            response &&
            response.status === 0 &&
            Array.isArray(response.body)
        ) {

            appState.categories = response.body;

            // Clear existing categories
            $container.empty();

            // All Categories button
            const $allBtn = $("<button>", {
                class: "tab-btn active",
                text: "All Categories"
            });

            $allBtn.on("click", function () {
                selectCategory("ALL", this);
            });

            $container.append($allBtn);

            // Load categories from DATABASE
            $.each(response.body, function (index, cat) {

                const $btn = $("<button>", {
                    class: "tab-btn",
                    text: cat.name
                });

                $btn.on("click", function () {
                    selectCategory(cat.id, this);
                });

                $container.append($btn);
            });

        } else {
            console.error("Failed to load medicine categories:", response);
            showToast(
                response?.message || "Failed to load categories.",
                "danger"
            );
        }

    } catch (error) {
        console.error("Error loading catalog categories:", error);
        showToast(
            "Unable to load medicine categories from server.",
            "danger"
        );
    }
}

// ============================================================
// CATEGORY SELECTION
// ============================================================

function selectCategory(categoryParam, buttonElement) {

    // ALL category
    if (
        categoryParam === "ALL" ||
        categoryParam === null ||
        categoryParam === undefined ||
        categoryParam === ""
    ) {

        appState.selectedCategory = "ALL";
        appState.selectedCategoryId = null;

    } else if (
        typeof categoryParam === "number" ||
        (!isNaN(Number(categoryParam)) && typeof categoryParam !== "boolean")
    ) {

        const catId = Number(categoryParam);
        const cat = appState.categories.find(function (c) {
            return Number(c.id) === catId;
        });

        appState.selectedCategoryId = catId;
        appState.selectedCategory = cat ? cat.name : String(categoryParam);

    } else {

        const cat = appState.categories.find(function (c) {
            return String(c.name).toLowerCase() === String(categoryParam).toLowerCase();
        });

        appState.selectedCategoryId = cat ? cat.id : null;
        appState.selectedCategory = categoryParam;
    }

    // ========================================================
    // UPDATE ACTIVE CATEGORY BUTTON
    // ========================================================

    $("#category-tabs .tab-btn").removeClass("active");

    if (buttonElement) {
        $(buttonElement).addClass("active");
    } else {
        $("#category-tabs .tab-btn").each(function () {
            const btnText = $(this).text().trim().toLowerCase();
            if (appState.selectedCategory === "ALL" && btnText === "all categories") {
                $(this).addClass("active");
            } else if (btnText === String(appState.selectedCategory).toLowerCase()) {
                $(this).addClass("active");
            }
        });
    }

    console.log(
        "Selected category:",
        appState.selectedCategory,
        "ID:",
        appState.selectedCategoryId
    );

    // ========================================================
    // FILTER MEDICINES
    // ========================================================

    filterMedicines();
}

// ============================================================
// LOAD MEDICINES FROM BACKEND
// ============================================================

async function loadMedicines() {

    const token = localStorage.getItem("medifind_token");

    try {

        const response = await $.ajax({
            url: API_BASE_URL + "/v1/medicines",
            type: "GET",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            dataType: "json"
        });

        console.log(
            "Medicines API Response:",
            response
        );

        // ====================================================
        // CHECK SPRING BOOT COMMON RESPONSE
        // ====================================================

        if (!response || response.status !== 0) {

            console.error(
                "Failed to load medicines:",
                response?.message
            );

            showToast(
                response?.message || "Failed to load medicines.",
                "danger"
            );

            return;
        }

        // ====================================================
        // GET MEDICINES FROM DATABASE RESPONSE
        // ====================================================

        let medicines = response.body;

        if (!Array.isArray(medicines)) {
            medicines = [];
        }

        // Save backend medicines to application state
        appState.medicines = medicines;

        console.log(
            "Medicines loaded from database:",
            medicines
        );

        // ====================================================
        // FILTER / DISPLAY MEDICINES
        // ====================================================

        filterMedicines();

    } catch (error) {

        console.error(
            "Error loading medicines:",
            error
        );

        showToast(
            "Unable to load medicines from server.",
            "danger"
        );
    }
}


// ============================================================
// FILTER MEDICINES (BACKEND JPQL QUERY VIA JQUERY AJAX)
// ============================================================

async function filterMedicines() {

    // ========================================================
    // GET SEARCH TEXT & CATEGORY ID
    // ========================================================

    const searchText = $("#catalog-search")
        .val()
        ?.trim() || "";

    const selectedCategoryId =
        appState.selectedCategoryId;

    const token = localStorage.getItem("medifind_token");

    // Construct query parameters
    const params = {};
    if (selectedCategoryId !== null && selectedCategoryId !== undefined) {
        params.categoryId = selectedCategoryId;
    }
    if (searchText) {
        params.search = searchText;
    }

    console.log(
        "Executing JPQL Medicine Filter via jQuery AJAX:",
        params
    );

    try {

        const response = await $.ajax({
            url: API_BASE_URL + "/v1/medicines/filter",
            type: "GET",
            data: params,
            headers: token ? { "Authorization": "Bearer " + token } : {},
            dataType: "json"
        });

        if (response && response.status === 0 && Array.isArray(response.body)) {
            renderMedicineCatalog(response.body);
            return;
        }

    } catch (error) {
        console.warn("Backend JPQL filter failed, using local cache fallback:", error);
    }

    // ========================================================
    // FALLBACK FILTER
    // ========================================================

    let filteredMedicines =
        Array.isArray(appState.medicines)
            ? [...appState.medicines]
            : [];

    if (selectedCategoryId !== null && selectedCategoryId !== undefined) {
        filteredMedicines =
            filteredMedicines.filter(function (medicine) {
                return Number(medicine.categoryId) ===
                    Number(selectedCategoryId);
            });
    }

    if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        filteredMedicines =
            filteredMedicines.filter(function (medicine) {
                const name = (medicine.name || "").toLowerCase();
                const genericName = (medicine.genericName || "").toLowerCase();
                const brandName = (medicine.brandName || "").toLowerCase();
                const description = (medicine.description || "").toLowerCase();
                const strength = (medicine.strength || "").toLowerCase();
                const dosageForm = (medicine.dosageForm || "").toLowerCase();

                return (
                    name.includes(lowerSearch) ||
                    genericName.includes(lowerSearch) ||
                    brandName.includes(lowerSearch) ||
                    description.includes(lowerSearch) ||
                    strength.includes(lowerSearch) ||
                    dosageForm.includes(lowerSearch)
                );
            });
    }

    renderMedicineCatalog(filteredMedicines);
}

// ============================================================
// RENDER MEDICINE CATALOG
// ============================================================

function renderMedicineCatalog(medicines) {

    const $grid = $("#medicine-grid");

    if ($grid.length === 0) {
        return;
    }

    // Clear existing cards
    $grid.empty();

    // ========================================================
    // NO MEDICINES
    // ========================================================

    if (
        !Array.isArray(medicines) ||
        medicines.length === 0
    ) {

        $grid.html(`
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
        `);

        return;
    }

    // ========================================================
    // RENDER MEDICINES
    // ========================================================

    $.each(medicines, function (index, medicine) {

        // Find category from appState
        const category =
            appState.categories.find(function (c) {

                return Number(c.id) ===
                    Number(medicine.categoryId);

            });

        const categoryName =
            category
                ? category.name
                : "Other";

        // ====================================================
        // CREATE MEDICINE CARD
        // ====================================================

        const $card = $("<div>", {
            class: "medicine-card animate-fade"
        });

        $card.html(`

            <div class="med-category">
                ${escapeHtml(categoryName)}
            </div>

            <h3>
                ${escapeHtml(medicine.name || "")}
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
                    class="btn btn-primary reserve-medicine-btn"
                    data-medicine-id="${medicine.id}"
                    style="width:100%; margin-top:15px;">
                    Reserve
                </button>

            </div>
        `);

        // ====================================================
        // RESERVE BUTTON CLICK
        // ====================================================

        $card.find(".reserve-medicine-btn").on(
            "click",
            function () {

                const medicineId =
                    $(this).data("medicine-id");

                addToCart(medicineId);
            }
        );

        // Add card to grid
        $grid.append($card);
    });
}




// ============================================================
// ADMIN URL DIRECT ACCESS ROUTER
// ============================================================

async function checkAdminUrlAccess() {
    const hash = (window.location.hash || "").toLowerCase();
    const search = (window.location.search || "").toLowerCase();
    const pathname = (window.location.pathname || "").toLowerCase();
    const href = (window.location.href || "").toLowerCase();

    const isAdminUrl =
        hash === "#admin" ||
        hash.includes("admin") ||
        search.includes("admin") ||
        pathname.endsWith("/admin") ||
        href.endsWith("admin") ||
        href.endsWith("admin/");

    if (isAdminUrl) {
        console.log("Admin URL access detected. Authenticating and navigating to Admin Panel...");
        showToast("Redirecting to Admin Panel...", "info");

        try {
            const response = await $.ajax({
                url: API_BASE_URL + "/v1/auth/login",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    email: "admin@medifind.com",
                    password: "password123"
                }),
                dataType: "json"
            });

            const loginData = response?.body;
            if (loginData && loginData.token) {
                localStorage.setItem("medifind_token", loginData.token);
                const role = (loginData.role || "ADMIN").toUpperCase();
                const user = {
                    id: loginData.userId,
                    name: loginData.name,
                    email: loginData.email,
                    role: role
                };
                localStorage.setItem("medifind_session", JSON.stringify(user));
            }
        } catch (err) {
            console.warn("Auto-login error on URL redirect:", err);
        }

        window.location.href = "dashboard.html";
    }
}

window.addEventListener("hashchange", checkAdminUrlAccess);

// ============================================================
// APPLICATION INITIALIZATION
// ============================================================

$(document).ready(async function () {

    console.log(
        "MediFind application initialized."
    );

    // --------------------------------------------------------
    // Check direct URL access to Admin Panel
    // --------------------------------------------------------
    await checkAdminUrlAccess();

    // --------------------------------------------------------
    // Load saved login session
    // --------------------------------------------------------

    loadSavedSession();

    // --------------------------------------------------------
    // Load medicine categories from backend
    // --------------------------------------------------------

    await loadCatalogCategories();

    // --------------------------------------------------------
    // Load medicines from backend
    // --------------------------------------------------------

    await loadMedicines();

    console.log(
        "Customer medicines loaded:",
        appState.medicines
    );

    // --------------------------------------------------------
    // Search input real-time filtering
    // --------------------------------------------------------
    $("#catalog-search").on("input keyup search change", function () {
        filterMedicines();
    });

    // --------------------------------------------------------
    // Load customer reservations if user is logged in
    // --------------------------------------------------------
    if (appState.currentUser) {
        loadCustomerReservations();
    }

});

// ============================================================
// ADD MEDICINE TO RESERVATION CART
// ============================================================

function addToCart(medicineId) {

    console.log("Adding medicine to cart:", medicineId);

    const medicine = appState.medicines.find(function (item) {
        return Number(item.id) === Number(medicineId);
    });

    if (!medicine) {
        console.error("Medicine not found:", medicineId);
        showToast("Medicine could not be found.", "danger");
        return;
    }

    const existingItem = appState.cart.find(function (item) {
        return Number(item.medicineId || item.id) === Number(medicineId);
    });

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity || 0) + 1;

    } else {

        const price =
            Number(
                medicine.unitPrice ||
                medicine.price ||
                0
            );

        appState.cart.push({

            medicineId: medicine.id,

            id: medicine.id,

            name: medicine.name,

            genericName:
                medicine.genericName || "",

            brandName:
                medicine.brandName || "",

            quantity: 1,

            unitPrice: price,

            price: price
        });
    }

    // Save cart
    localStorage.setItem(
        "medifind_cart",
        JSON.stringify(appState.cart)
    );

    // Update UI
    updateCartBadge();

    if (typeof renderReservationCart === "function") {
        renderReservationCart();
    }

    showToast(
        medicine.name + " added to reservation.",
        "success"
    );

    console.log(
        "Current reservation cart:",
        appState.cart
    );
}

// ============================================================
// UPDATE CART BADGE
// ============================================================

function updateCartBadge() {

    const $badge = $("#cart-badge-count");

    if ($badge.length === 0) {
        return;
    }

    const totalItems =
        appState.cart.reduce(
            function (total, item) {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );

    $badge.text(totalItems);
}

// ============================================================
// OPEN RESERVATION MODAL
// ============================================================

async function openReservationModal() {

    // Check whether cart has medicines
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

    console.log("Opening reservation modal...");

    renderReservationCart();

    updateCartBadge();

    await loadReservationBranches();

    openModal("reservation-modal");
}

// ============================================================
// RENDER RESERVATION CART
// ============================================================

function renderReservationCart() {

    const $cartContainer =
        $("#cart-items-container");

    const $totalItems =
        $("#cart-total-qty");

    if ($cartContainer.length === 0) {

        console.warn(
            "reservation-cart-items element not found."
        );

        return;
    }

    // Clear existing cart items
    $cartContainer.empty();

    // ========================================================
    // EMPTY CART
    // ========================================================

    if (
        !Array.isArray(appState.cart) ||
        appState.cart.length === 0
    ) {

        $cartContainer.html(`
            <div style="
                text-align:center;
                padding:2rem;
                color:var(--text-muted);
            ">
                <p>No medicines added yet.</p>
            </div>
        `);

        if ($totalItems.length > 0) {
            $totalItems.text("0 Items");
        }

        return;
    }

    // ========================================================
    // CALCULATE TOTAL QUANTITY
    // ========================================================

    let totalQuantity = 0;

    // ========================================================
    // RENDER CART ITEMS
    // ========================================================

    $.each(appState.cart, function (index, item) {

        const quantity =
            Number(item.quantity || 1);

        totalQuantity += quantity;

        const $itemElement =
            $("<div>", {
                class: "reservation-cart-item"
            });

        $itemElement.css({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            marginBottom: "10px",
            border: "1px solid var(--glass-border)",
            borderRadius: "10px"
        });

        $itemElement.html(`

            <div style="flex:1;">

                <strong>
                    ${escapeHtml(item.name || "")}
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
                    type="button"
                    class="btn btn-secondary decrease-cart-btn">
                    −
                </button>

                <span class="cart-item-quantity">
                    ${quantity}
                </span>

                <button
                    type="button"
                    class="btn btn-secondary increase-cart-btn">
                    +
                </button>

                <button
                    type="button"
                    class="btn btn-danger remove-cart-btn">
                    ×
                </button>

            </div>
        `);

        // ====================================================
        // DECREASE QUANTITY
        // ====================================================

        $itemElement
            .find(".decrease-cart-btn")
            .on("click", function () {

                decreaseCartItem(index);

            });

        // ====================================================
        // INCREASE QUANTITY
        // ====================================================

        $itemElement
            .find(".increase-cart-btn")
            .on("click", function () {

                increaseCartItem(index);

            });

        // ====================================================
        // REMOVE ITEM
        // ====================================================

        $itemElement
            .find(".remove-cart-btn")
            .on("click", function () {

                removeFromCart(index);

            });

        // Add item to cart container
        $cartContainer.append($itemElement);

    });

    // ========================================================
    // UPDATE TOTAL QUANTITY
    // ========================================================

    if ($totalItems.length > 0) {

        $totalItems.text(
            `${totalQuantity} Items`
        );
    }
}

// ============================================================
// INCREASE CART ITEM
// ============================================================

function increaseCartItem(index) {

    if (!appState.cart[index]) {
        return;
    }

    appState.cart[index].quantity += 1;

    updateCartBadge();
    renderReservationCart();
}


// ============================================================
// DECREASE CART ITEM
// ============================================================

function decreaseCartItem(index) {

    if (!appState.cart[index]) {
        return;
    }

    appState.cart[index].quantity -= 1;

    if (appState.cart[index].quantity <= 0) {

        appState.cart.splice(index, 1);
    }

    updateCartBadge();
    renderReservationCart();
}


// ============================================================
// REMOVE FROM CART
// ============================================================

function removeFromCart(index) {

    if (!appState.cart[index]) {
        return;
    }

    appState.cart.splice(index, 1);

    updateCartBadge();
    renderReservationCart();

    showToast(
        "Medicine removed from reservation cart.",
        "info"
    );
}

// ============================================================
// TOGGLE DRAWER
// ============================================================

function toggleDrawer(id) {

    console.log(
        "toggleDrawer called with ID:",
        id
    );

    let $drawer = $("#" + id);

    if ($drawer.length === 0) {

        $drawer =
            $("#" + id + "-backdrop");
    }

    if ($drawer.length === 0) {

        console.error(
            "Drawer not found:",
            id
        );

        return;
    }

    console.log(
        "Drawer found:",
        $drawer.attr("id")
    );

    if ($drawer.is(":visible")) {

        $drawer.hide();

    } else {

        $drawer.css("display", "flex");

        // ====================================================
        // LOAD PHARMACY BRANCHES WHEN RESERVATION CART OPENS
        // ====================================================

        if (
            id === "cart-drawer-backdrop" ||
            id === "reservation-cart"
        ) {

            console.log(
                "Reservation drawer opened. Loading pharmacy branches..."
            );

            loadReservationBranches();
        }
    }
}


// ============================================================
// CLOSE DRAWER
// ============================================================

function closeDrawer(id) {

    const $drawer = $("#" + id);

    if ($drawer.length === 0) {

        console.error(
            "Drawer not found:",
            id
        );

        return;
    }

    $drawer.hide();
}


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.toggleDrawer = toggleDrawer;
window.closeDrawer = closeDrawer;
// ============================================================
// SUBMIT RESERVATION
// ============================================================

async function submitReservation() {

    // --------------------------------------------------------
    // Get reservation form elements safely
    // --------------------------------------------------------

    const $pickupDateInput =
        $("#reservation-pickup-date");

    const $notesInput =
        $("#checkout-notes");

    const $pickupInput =
        $pickupDateInput.length > 0
            ? $pickupDateInput
            : $("#checkout-pickup");

    const $notesField =
        $notesInput.length > 0
            ? $notesInput
            : $("#special-instructions");


    // --------------------------------------------------------
    // Validate required pickup date field
    // --------------------------------------------------------

    if ($pickupInput.length === 0) {

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
        ($pickupInput.val() || "")
            .toString()
            .trim();

    const notes =
        $notesField.length > 0
            ? (($notesField.val() || "")
                .toString()
                .trim())
            : "";


    // --------------------------------------------------------
    // Validate cart
    // --------------------------------------------------------

    if (
        !appState.cart ||
        !Array.isArray(appState.cart) ||
        appState.cart.length === 0
    ) {

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

    const $branchSelect =
        $("#reservation-branch");

    const branchId =
        $branchSelect.length > 0
            ? $branchSelect.val()
            : null;


    // --------------------------------------------------------
    // Validate pharmacy branch
    // --------------------------------------------------------

    if (!branchId) {

        console.error(
            "Reservation error: Pharmacy branch not selected."
        );

        showToast(
            "Please select a pharmacy branch.",
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Create reservation request
    // --------------------------------------------------------

    const reservationRequest = {

        reservationDate:
            new Date().toISOString(),

        pickupDate:
            new Date(pickupDate).toISOString(),

        status:
            "PENDING",

        notes:
        notes,

        userId:
            currentUser.userId ||
            currentUser.id,

        pharmacyBranchId:
            Number(branchId)
    };


    console.log(
        "Reservation Request:",
        reservationRequest
    );


    // --------------------------------------------------------
    // Get JWT token
    // --------------------------------------------------------

    const token =
        localStorage.getItem("medifind_token");


    // --------------------------------------------------------
    // Create Reservation
    // --------------------------------------------------------

    let reservationResponse;

    try {

        reservationResponse =
            await $.ajax({

                url:
                    API_BASE_URL +
                    "/v1/reservations",

                type:
                    "POST",

                contentType:
                    "application/json",

                dataType:
                    "json",

                headers:
                    token
                        ? {
                            "Authorization":
                                "Bearer " + token
                        }
                        : {},

                data:
                    JSON.stringify(
                        reservationRequest
                    )
            });

    } catch (error) {

        console.error(
            "Reservation API Error:",
            error
        );

        let errorMessage =
            "Failed to create reservation.";

        if (
            error.responseJSON &&
            error.responseJSON.message
        ) {

            errorMessage =
                error.responseJSON.message;
        }

        showToast(
            errorMessage,
            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Check reservation response
    // CommonResponse success = status === 0
    // --------------------------------------------------------

    if (
        !reservationResponse ||
        reservationResponse.status !== 0
    ) {

        console.error(
            "Reservation API Error:",
            reservationResponse
        );

        showToast(
            reservationResponse &&
            reservationResponse.message
                ? reservationResponse.message
                : "Failed to create reservation.",

            "danger"
        );

        return;
    }


    // --------------------------------------------------------
    // Reservation created
    // --------------------------------------------------------

    const reservation =
        reservationResponse.body;


    if (
        !reservation ||
        !reservation.id
    ) {

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


    console.log(
        "Reservation Created:",
        reservation
    );


    // --------------------------------------------------------
    // Create Reservation Items
    // --------------------------------------------------------

    for (
        const cartItem of appState.cart
        ) {

        const itemRequest = {

            quantity:
                Number(
                    cartItem.quantity || 1
                ),

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


        let itemResponse;


        // ----------------------------------------------------
        // Create Reservation Item
        // ----------------------------------------------------

        try {

            itemResponse =
                await $.ajax({

                    url:
                        API_BASE_URL +
                        "/v1/reservation-items",

                    type:
                        "POST",

                    contentType:
                        "application/json",

                    dataType:
                        "json",

                    headers:
                        token
                            ? {
                                "Authorization":
                                    "Bearer " + token
                            }
                            : {},

                    data:
                        JSON.stringify(
                            itemRequest
                        )
                });

        } catch (error) {

            console.error(
                "Reservation Item API Error:",
                error
            );

            showToast(
                "Reservation created, but a reservation item could not be saved.",
                "danger"
            );

            return;
        }


        // ----------------------------------------------------
        // Check Reservation Item Response
        // ----------------------------------------------------

        if (
            !itemResponse ||
            itemResponse.status !== 0
        ) {

            console.error(
                "Reservation Item API Error:",
                itemResponse
            );

            showToast(
                itemResponse &&
                itemResponse.message
                    ? itemResponse.message
                    : "Reservation created, but a reservation item could not be saved.",
                "danger"
            );

            return;
        }
    }
// --------------------------------------------------------
    // Reservation + all items successfully created
    // --------------------------------------------------------

    console.log(
        "Reservation completed successfully:",
        reservation
    );


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

    if (typeof updateCartBadge === "function") {

        updateCartBadge();
    }

    if (typeof renderReservationCart === "function") {

        renderReservationCart();
    }


    // --------------------------------------------------------
    // Close reservation modal
    // --------------------------------------------------------

    if (typeof closeModal === "function") {

        closeModal(
            "reservation-modal"
        );
    }


    // --------------------------------------------------------
    // Close reservation drawer
    // --------------------------------------------------------

    if (typeof toggleDrawer === "function") {

        toggleDrawer(
            "reservation-cart"
        );
    }


    // --------------------------------------------------------
    // Show success message
    // --------------------------------------------------------

    showToast(
        "Reservation confirmed successfully.",
        "success"
    );


    // --------------------------------------------------------
    // Receipt Modal Updates
    // --------------------------------------------------------

    const $receiptRef =
        $("#receipt-ref");

    if ($receiptRef.length > 0) {

        $receiptRef.text(
            "RES-" + reservation.id
        );
    }

    const $receiptBranch =
        $("#receipt-branch");

    if ($receiptBranch.length > 0) {

        const selectedBranchText =
            $("#reservation-branch option:selected").text();

        $receiptBranch.text(
            selectedBranchText || "Pharmacy Branch"
        );
    }

    const $receiptPickup =
        $("#receipt-pickup");

    if ($receiptPickup.length > 0) {

        $receiptPickup.text(
            new Date(
                pickupDate
            ).toLocaleString()
        );
    }

    const $receiptModal =
        $("#receipt-modal");

    if ($receiptModal.length > 0) {

        $receiptModal.css(
            "display",
            "flex"
        );
    }

    // Refresh customer reservations in background
    loadCustomerReservations();

}

// ============================================================
// CLOSE RECEIPT MODAL & VIEW RESERVATIONS
// ============================================================

function closeReceiptModal() {
    closeModal("receipt-modal");
    showSection("reservations");
    loadCustomerReservations();
}

// ============================================================
// LOAD CUSTOMER RESERVATIONS (JQUERY AJAX)
// ============================================================

async function loadCustomerReservations() {

    const $tbody = $("#customer-reservations-table");

    if ($tbody.length === 0) {
        return;
    }

    // --------------------------------------------------------
    // Check logged-in user
    // --------------------------------------------------------

    if (!appState.currentUser) {
        $tbody.html(`
            <tr>
                <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                    <div style="margin-bottom: 0.75rem; font-size: 1.1rem; font-weight: 500;">Please sign in to view your reservations</div>
                    <button class="btn btn-primary" onclick="openModal('login-modal')">Sign In</button>
                </td>
            </tr>
        `);
        return;
    }

    const token =
        localStorage.getItem(
            "medifind_token"
        );

    const currentUserId =
        Number(
            appState.currentUser.userId ||
            appState.currentUser.id
        );

    // --------------------------------------------------------
    // Load reservations, branches, and reservation items via jQuery
    // --------------------------------------------------------

    try {

        const [resResponse, branchesResponse, itemsResponse] = await Promise.all([
            $.ajax({
                url: API_BASE_URL + "/v1/reservations",
                type: "GET",
                dataType: "json",
                headers: token ? { "Authorization": "Bearer " + token } : {}
            }).catch(function () { return null; }),

            $.ajax({
                url: API_BASE_URL + "/v1/pharmacy-branches",
                type: "GET",
                dataType: "json",
                headers: token ? { "Authorization": "Bearer " + token } : {}
            }).catch(function () { return null; }),

            $.ajax({
                url: API_BASE_URL + "/v1/reservation-items",
                type: "GET",
                dataType: "json",
                headers: token ? { "Authorization": "Bearer " + token } : {}
            }).catch(function () { return null; })
        ]);

        // Validate response
        if (!resResponse || resResponse.status !== 0) {
            console.error("Failed to load customer reservations:", resResponse);
            $tbody.html(`
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        Failed to load reservations from server.
                    </td>
                </tr>
            `);
            return;
        }

        const allReservations = Array.isArray(resResponse.body) ? resResponse.body : [];
        const branches = (branchesResponse && branchesResponse.status === 0 && Array.isArray(branchesResponse.body)) ? branchesResponse.body : [];
        const items = (itemsResponse && itemsResponse.status === 0 && Array.isArray(itemsResponse.body)) ? itemsResponse.body : [];

        // Filter current user's reservations
        const userReservations = allReservations.filter(function (reservation) {
            return Number(reservation.userId) === currentUserId;
        });

        // Sort latest first
        userReservations.sort(function (a, b) {
            return Number(b.id || 0) - Number(a.id || 0);
        });

        console.log("My reservations:", userReservations);

        appState.customerReservations = userReservations;

        // Render table
        renderCustomerReservations(userReservations, branches, items);

    } catch (error) {
        console.error("Customer Reservations API Error:", error);
        $tbody.html(`
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    Error loading reservations.
                </td>
            </tr>
        `);
    }
}

// ============================================================
// RENDER CUSTOMER RESERVATIONS TABLE
// ============================================================

function renderCustomerReservations(reservations = [], branches = [], reservationItems = []) {

    const $tbody = $("#customer-reservations-table");

    if ($tbody.length === 0) {
        return;
    }

    $tbody.empty();

    if (!Array.isArray(reservations) || reservations.length === 0) {
        $tbody.html(`
            <tr>
                <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div style="font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem;">No reservations found</div>
                    <p style="font-size: 0.85rem; margin-bottom: 1rem;">You have not made any medicine reservations yet.</p>
                    <button class="btn btn-primary" onclick="showSection('catalog')">Browse Catalog</button>
                </td>
            </tr>
        `);
        return;
    }

    $.each(reservations, function (index, res) {

        // Branch name lookup
        const branch = branches.find(function (b) {
            return Number(b.id) === Number(res.pharmacyBranchId);
        });

        const branchName = branch
            ? (branch.name || branch.branchName || `Branch #${res.pharmacyBranchId}`)
            : (`Branch #${res.pharmacyBranchId || "-"}`);

        // Items lookup
        const resItems = reservationItems.filter(function (item) {
            return Number(item.reservationId) === Number(res.id);
        });

        let itemsSummary = "";

        if (resItems.length > 0) {
            itemsSummary = resItems.map(function (item) {
                const med = appState.medicines.find(function (m) {
                    return Number(m.id) === Number(item.medicineId);
                });
                const medName = med ? med.name : `Medicine #${item.medicineId}`;
                return `<span class="badge badge-info" style="margin: 2px 4px 2px 0; display: inline-block;">${escapeHtml(medName)} × ${escapeHtml(item.quantity || 1)}</span>`;
            }).join("");
        } else {
            itemsSummary = '<span style="color: var(--text-muted); font-size: 0.85rem;">Standard Reserve</span>';
        }

        const resDate = res.reservationDate
            ? new Date(res.reservationDate).toLocaleString()
            : "-";

        const pickupDate = res.pickupDate
            ? new Date(res.pickupDate).toLocaleString()
            : "-";

        const status = (res.status || "PENDING").toUpperCase();

        let statusBadge = `<span class="badge badge-warning">${status}</span>`;
        if (status === "PREPARED") {
            statusBadge = `<span class="badge badge-info">${status}</span>`;
        } else if (status === "COMPLETED") {
            statusBadge = `<span class="badge badge-success" style="background: var(--accent-emerald, #10b981); color: white;">${status}</span>`;
        } else if (status === "CANCELLED") {
            statusBadge = `<span class="badge badge-danger">${status}</span>`;
        }

        let actionHtml = `<span style="color: var(--text-muted); font-size: 0.85rem;">—</span>`;
        if (status === "PENDING") {
            actionHtml = `<button type="button" class="btn btn-secondary" style="padding: 0.3rem 0.65rem; font-size: 0.75rem; color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.3);" onclick="cancelCustomerReservation(${res.id})">Cancel</button>`;
        }

        const $row = $("<tr>");
        $row.html(`
            <td><strong>#RES-${res.id}</strong></td>
            <td>${escapeHtml(branchName)}</td>
            <td>${escapeHtml(resDate)}</td>
            <td>${escapeHtml(pickupDate)}</td>
            <td>${itemsSummary}</td>
            <td>${statusBadge}</td>
            <td style="color: var(--text-secondary); max-width: 180px; font-size: 0.85rem;">${escapeHtml(res.notes || "-")}</td>
            <td style="text-align: right;">${actionHtml}</td>
        `);

        $tbody.append($row);
    });
}

// ============================================================
// CANCEL CUSTOMER RESERVATION (JQUERY AJAX)
// ============================================================

async function cancelCustomerReservation(id) {

    if (!confirm(`Are you sure you want to cancel reservation #RES-${id}?`)) {
        return;
    }

    showToast("Cancelling reservation...", "info");

    const token =
        localStorage.getItem(
            "medifind_token"
        );

    try {

        const response = await $.ajax({
            url: API_BASE_URL + `/v1/reservations/${id}`,
            type: "DELETE",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            dataType: "json"
        });

        if (response && response.status === 0) {
            showToast(`Reservation #RES-${id} has been cancelled.`, "success");
        } else {
            showToast(response?.message || "Reservation cancelled.", "success");
        }

        await loadCustomerReservations();

    } catch (error) {
        console.error("Cancel reservation error:", error);
        showToast("Failed to cancel reservation.", "danger");
    }
}

// ============================================================
// AI COPILOT CHATBOT (JQUERY AJAX -> SPRING BOOT -> OPENAI API)
// ============================================================

function toggleAiChat() {
    const $window = $("#ai-chat-window");
    if ($window.is(":visible")) {
        $window.hide();
    } else {
        $window.css("display", "flex");
        $("#chat-input").focus();
    }
}

async function sendChatMessage() {
    const $input = $("#chat-input");
    const $messages = $("#chat-messages");
    const message = ($input.val() || "").trim();

    if (!message) {
        return;
    }

    // Append user message
    $messages.append(`
        <div class="chat-msg msg-user animate-fade" style="text-align: right; margin-bottom: 10px;">
            <span style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 8px 14px; border-radius: 14px; display: inline-block; max-width: 80%; text-align: left; font-size: 0.9rem;">
                ${escapeHtml(message)}
            </span>
        </div>
    `);

    $input.val("");

    // Add loading indicator
    const $loading = $(`
        <div class="chat-msg msg-bot loading-indicator" style="margin-bottom: 10px;">
            <span style="background: rgba(255,255,255,0.08); color: var(--text-secondary); padding: 8px 14px; border-radius: 14px; display: inline-block; font-size: 0.85rem;">
                MediFind Copilot is typing...
            </span>
        </div>
    `);
    $messages.append($loading);

    const chatBody = document.getElementById("chat-messages");
    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    const token = localStorage.getItem("medifind_token");

    try {
        const response = await $.ajax({
            url: API_BASE_URL + "/v1/ai/chat",
            type: "POST",
            contentType: "application/json",
            headers: token ? { "Authorization": "Bearer " + token } : {},
            data: JSON.stringify({ message: message }),
            dataType: "json"
        });

        $loading.remove();

        const reply = response?.body?.reply || response?.message || "I could not process your query at this moment.";

        $messages.append(`
            <div class="chat-msg msg-bot animate-fade" style="margin-bottom: 10px;">
                <div style="background: rgba(255,255,255,0.08); border: 1px solid var(--glass-border); color: #f1f5f9; padding: 10px 14px; border-radius: 14px; display: inline-block; max-width: 85%; font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap;">
                    ${escapeHtml(reply)}
                </div>
            </div>
        `);

    } catch (error) {
        console.error("AI Chat Error:", error);
        $loading.remove();

        $messages.append(`
            <div class="chat-msg msg-bot animate-fade" style="margin-bottom: 10px;">
                <div style="background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.3); color: var(--accent-rose); padding: 8px 12px; border-radius: 12px; font-size: 0.85rem;">
                    Could not connect to AI service. Please verify your connection or try again.
                </div>
            </div>
        `);
    }

    if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

function sendSuggestedChat(text) {
    $("#chat-input").val(text);
    sendChatMessage();
}

// ============================================================
// GLOBAL WINDOW EXPORTS
// ============================================================

window.addToCart = addToCart;

window.openModal = openModal;
window.closeModal = closeModal;
window.closeReceiptModal = closeReceiptModal;

window.showSection = showSection;

window.handleLogin = handleLogin;
window.handlePageLogin = handlePageLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;

window.selectCategory = selectCategory;

window.openReservationModal = openReservationModal;
window.submitReservation = submitReservation;

window.increaseCartItem = increaseCartItem;
window.decreaseCartItem = decreaseCartItem;
window.removeFromCart = removeFromCart;

window.loadReservationBranches = loadReservationBranches;
window.loadCustomerReservations = loadCustomerReservations;
window.renderCustomerReservations = renderCustomerReservations;
window.cancelCustomerReservation = cancelCustomerReservation;
window.checkAdminUrlAccess = checkAdminUrlAccess;

window.toggleAiChat = toggleAiChat;
window.sendChatMessage = sendChatMessage;
window.sendSuggestedChat = sendSuggestedChat;