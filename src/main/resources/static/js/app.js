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

            headers: token
                ? {
                    "Authorization": "Bearer " + token
                }
                : {},

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
            $container.append(`
                <button
                    class="tab-btn active"
                    onclick="selectCategory('ALL', this)">
                    All Categories
                </button>
            `);

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

            console.error(
                "Failed to load medicine categories:",
                response
            );

            showToast(
                response?.message || "Failed to load categories.",
                "danger"
            );
        }

    } catch (error) {

        console.error(
            "Error loading catalog categories:",
            error
        );

        showToast(
            "Unable to load medicine categories from server.",
            "danger"
        );
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
        const selectedCategory = appState.categories.find(
            function (category) {

                return String(category.name).toLowerCase() ===
                    String(categoryName).toLowerCase();

            }
        );

        appState.selectedCategoryId =
            selectedCategory
                ? selectedCategory.id
                : null;
    }

    // ========================================================
    // UPDATE ACTIVE CATEGORY BUTTON
    // ========================================================

    $("#category-tabs .tab-btn").removeClass("active");

    if (buttonElement) {
        $(buttonElement).addClass("active");
    }

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

            headers: token
                ? {
                    "Authorization": "Bearer " + token
                }
                : {},

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
// FILTER MEDICINES
// ============================================================

function filterMedicines() {

    // ========================================================
    // GET SEARCH TEXT
    // ========================================================

    const searchText = $("#catalog-search")
        .val()
        ?.trim()
        .toLowerCase() || "";

    const selectedCategoryId =
        appState.selectedCategoryId;

    // ========================================================
    // GET MEDICINES FROM APP STATE
    // ========================================================

    let filteredMedicines =
        Array.isArray(appState.medicines)
            ? [...appState.medicines]
            : [];

    // ========================================================
    // CATEGORY FILTER
    // ========================================================

    if (selectedCategoryId !== null) {

        filteredMedicines =
            filteredMedicines.filter(function (medicine) {

                return Number(medicine.categoryId) ===
                    Number(selectedCategoryId);

            });
    }

    // ========================================================
    // SEARCH FILTER
    // ========================================================

    if (searchText) {

        filteredMedicines =
            filteredMedicines.filter(function (medicine) {

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

    // ========================================================
    // DEBUG
    // ========================================================

    console.log(
        "Filtered medicines:",
        filteredMedicines
    );

    // ========================================================
    // RENDER MEDICINES
    // ========================================================

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
// APPLICATION INITIALIZATION
// ============================================================

$(document).ready(async function () {

    console.log(
        "MediFind application initialized."
    );

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
    // Receipt
    // --------------------------------------------------------

    const $receiptRef =
        $("#receipt-ref");

    if ($receiptRef.length > 0) {

        $receiptRef.text(
            "RES-" + reservation.id
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
        $("#reservation-receipt-modal");

    if ($receiptModal.length > 0) {

        $receiptModal.css(
            "display",
            "flex"
        );
    }

}
// ============================================================
// LOAD CUSTOMER RESERVATIONS
// ============================================================

async function loadCustomerReservations() {

    // --------------------------------------------------------
    // Check logged-in user
    // --------------------------------------------------------

    if (!appState.currentUser) {
        return;
    }


    // --------------------------------------------------------
    // Get JWT token
    // --------------------------------------------------------

    const token =
        localStorage.getItem(
            "medifind_token"
        );


    // --------------------------------------------------------
    // Load reservations
    // --------------------------------------------------------

    let response;

    try {

        response =
            await $.ajax({

                url:
                    API_BASE_URL +
                    "/reservations",

                type:
                    "GET",

                dataType:
                    "json",

                headers:
                    token
                        ? {
                            "Authorization":
                                "Bearer " + token
                        }
                        : {}
            });

    } catch (error) {

        console.error(
            "Customer Reservations API Error:",
            error
        );

        return;
    }


    // --------------------------------------------------------
    // Validate response
    // --------------------------------------------------------

    if (
        !response ||
        response.status !== 0
    ) {

        console.error(
            "Failed to load customer reservations:",
            response
        );

        return;
    }


    // --------------------------------------------------------
    // Filter current user's reservations
    // --------------------------------------------------------

    const reservations =
        Array.isArray(response.body)

            ? response.body.filter(
                function (reservation) {

                    return (
                        Number(
                            reservation.userId
                        ) ===
                        Number(
                            appState.currentUser.userId ||
                            appState.currentUser.id
                        )
                    );
                }
            )

            : [];


    // --------------------------------------------------------
    // Log reservations
    // --------------------------------------------------------

    console.log(
        "My reservations:",
        reservations
    );


    // --------------------------------------------------------
    // Save to appState if required
    // --------------------------------------------------------

    appState.customerReservations =
        reservations;
}


window.addToCart = addToCart;

window.openModal = openModal;
window.closeModal = closeModal;

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