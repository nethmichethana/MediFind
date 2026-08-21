// MediFind Customer Portal JS Controller
// Initializes and drives client state using localStorage for mock persistence

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

// Global UI App States
let appState = {
    selectedCategory: "ALL",
    cart: [],
    currentUser: null
};

// Database Getter/Setters
function getDB(key) {
    return JSON.parse(localStorage.getItem("medifind_" + key)) || [];
}
function setDB(key, data) {
    localStorage.setItem("medifind_" + key, JSON.stringify(data));
}

// --- App Initialization ---
window.onload = function() {
    initDatabase();
    
    // Check if user session exists
    const storedUser = localStorage.getItem("medifind_session");
    if (storedUser) {
        appState.currentUser = JSON.parse(storedUser);
        updateUserHeader();
    }

    renderCategoryTabs();
    renderMedicines();
    updateCartDisplay();
    
    // Default dates on picker (24 hours ahead)
    const picker = document.getElementById("checkout-pickup");
    if (picker) {
        const tomorrow = new Date();
        tomorrow.setHours(tomorrow.getHours() + 24);
        tomorrow.setMinutes(0);
        picker.value = tomorrow.toISOString().slice(0, 16);
    }
};

// --- Portal View Sections ---
function showSection(sectionId) {
    document.getElementById("catalog-section").style.display = sectionId === 'catalog' ? 'block' : 'none';
    document.getElementById("reservations-section").style.display = sectionId === 'reservations' ? 'block' : 'none';
    
    // Update active nav links
    const links = document.querySelectorAll(".nav-link");
    links.forEach(link => {
        if (link.textContent.toLowerCase().includes(sectionId.slice(0, 5))) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    if (sectionId === 'reservations') {
        renderCustomerReservations();
    }
}

// --- Category Tabs Rendering ---
function renderCategoryTabs() {
    const container = document.getElementById("category-tabs");
    if (!container) return;

    const categories = getDB("categories");
    // Clear and keep "All"
    container.innerHTML = `<button class="tab-btn ${appState.selectedCategory === 'ALL' ? 'active' : ''}" onclick="selectCategory('ALL')">All Products</button>`;
    
    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `tab-btn ${appState.selectedCategory == cat.id ? 'active' : ''}`;
        btn.textContent = cat.name;
        btn.onclick = () => selectCategory(cat.id);
        container.appendChild(btn);
    });
}

function selectCategory(catId) {
    appState.selectedCategory = catId;
    renderCategoryTabs();
    renderMedicines();
}

// --- Catalog Rendering & Filtering ---
function renderMedicines() {
    const grid = document.getElementById("medicine-grid");
    if (!grid) return;

    const medicines = getDB("medicines");
    const categories = getDB("categories");
    const searchVal = document.getElementById("catalog-search").value.toLowerCase();

    grid.innerHTML = "";

    const filtered = medicines.filter(med => {
        const matchCategory = appState.selectedCategory === "ALL" || med.categoryId == appState.selectedCategory;
        const matchSearch = med.name.toLowerCase().includes(searchVal) || 
                            med.genericName.toLowerCase().includes(searchVal) || 
                            med.brandName.toLowerCase().includes(searchVal) || 
                            med.description.toLowerCase().includes(searchVal);
        return med.active && matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">No medicines found matching your search criteria.</p>
                <button class="btn btn-secondary" onclick="resetSearch()">Clear Filters</button>
            </div>
        `;
        return;
    }

    filtered.forEach(med => {
        const cat = categories.find(c => c.id == med.categoryId);
        const catName = cat ? cat.name : "Uncategorized";

        const card = document.createElement("div");
        card.className = "glass-card med-card animate-fade";
        card.innerHTML = `
            <div class="med-header">
                <span class="med-category">${catName}</span>
                ${med.prescriptionRequired ? '<span class="badge badge-danger">Rx Required</span>' : '<span class="badge badge-success">Over-Counter</span>'}
            </div>
            <h3 class="med-title">${med.name}</h3>
            <div class="med-subtitles">
                <span><strong>Generic:</strong> ${med.genericName}</span>
                <span><strong>Brand:</strong> ${med.brandName}</span>
            </div>
            <p class="med-description">${med.description}</p>
            <div class="med-meta">
                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                    <span>Form: ${med.dosageForm}</span> | <span>Str: ${med.strength}</span>
                </div>
                <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="checkAvailability(${med.id})">Availability</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterMedicines() {
    renderMedicines();
}

function resetSearch() {
    document.getElementById("catalog-search").value = "";
    appState.selectedCategory = "ALL";
    renderCategoryTabs();
    renderMedicines();
}

// --- Availability Check Drawer Logic ---
let selectedMedicineForReserve = null;

function checkAvailability(medId) {
    const medicines = getDB("medicines");
    const batches = getDB("batches");
    const inventory = getDB("inventory");
    const branches = getDB("branches");

    const med = medicines.find(m => m.id == medId);
    if (!med) return;

    selectedMedicineForReserve = med;

    // Fill drawer content
    document.getElementById("drawer-med-name").textContent = med.name;
    document.getElementById("drawer-med-category").textContent = getDB("categories").find(c => c.id == med.categoryId)?.name || "General";
    document.getElementById("drawer-med-generic").textContent = med.genericName;
    document.getElementById("drawer-med-description").textContent = med.description;
    document.getElementById("drawer-med-strength").textContent = med.strength;
    document.getElementById("drawer-med-form").textContent = med.dosageForm;
    document.getElementById("drawer-med-rx").style.display = med.prescriptionRequired ? "inline-flex" : "none";

    const branchListContainer = document.getElementById("drawer-branches-stock");
    branchListContainer.innerHTML = "";

    // Join tables: Find which branches have stock for batches of this medicine
    const medBatches = batches.filter(b => b.medicineId == medId);
    
    branches.forEach(branch => {
        if (!branch.active) return;

        // Calculate cumulative stock for this medicine at this branch
        let totalStock = 0;
        let batchPrices = [];
        let matchingBatches = [];

        medBatches.forEach(batch => {
            const invRecord = inventory.find(i => i.branchId == branch.id && i.batchId == batch.id);
            if (invRecord) {
                totalStock += invRecord.quantity;
                batchPrices.push(batch.unitPrice);
                matchingBatches.push({
                    batchId: batch.id,
                    batchNumber: batch.batchNumber,
                    unitPrice: batch.unitPrice,
                    available: invRecord.quantity
                });
            }
        });

        const hasStock = totalStock > 0;
        const priceStr = batchPrices.length > 0 ? `LKR ${Math.min(...batchPrices).toFixed(2)} - LKR ${Math.max(...batchPrices).toFixed(2)}` : "Price N/A";
        
        const bCard = document.createElement("div");
        bCard.className = `branch-card ${hasStock ? 'has-stock' : 'no-stock'}`;
        
        bCard.innerHTML = `
            <div class="branch-header">
                <span class="branch-name">${branch.name}</span>
                <span class="badge ${hasStock ? 'badge-success' : 'badge-danger'}">
                    ${hasStock ? `${totalStock} In Stock` : 'Out of Stock'}
                </span>
            </div>
            <div class="branch-details">
                <div style="margin-bottom: 2px;">${branch.address}, ${branch.city}</div>
                <div>Phone: ${branch.phone} | Price: <span style="color: var(--primary-light); font-weight:600;">${priceStr}</span></div>
            </div>
            ${hasStock ? `
                <div class="branch-action">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">Qty:</span>
                        <input type="number" id="qty-input-${branch.id}" class="form-control" value="1" min="1" max="${totalStock}" style="width: 70px; padding: 0.25rem 0.5rem; text-align: center;">
                    </div>
                    <button class="btn btn-primary" style="padding: 0.35rem 0.85rem; font-size: 0.85rem;" onclick="addToReservation(${branch.id}, ${totalStock}, ${matchingBatches[0].unitPrice}, '${matchingBatches[0].batchNumber}', ${matchingBatches[0].batchId})">
                        Reserve Item
                    </button>
                </div>
            ` : `
                <div style="font-size: 0.8rem; color: var(--accent-rose); font-weight: 500;">
                    Currently out of stock. Contact branch for incoming batch schedules.
                </div>
            `}
        `;
        branchListContainer.appendChild(bCard);
    });

    openDrawer("availability-drawer-backdrop");
}

// --- Cart Actions ---
function addToReservation(branchId, maxStock, unitPrice, batchNumber, batchId) {
    if (!appState.currentUser) {
        closeDrawer('availability-drawer-backdrop');
        openModal('login-modal');
        showToast("Please sign in to place a reservation request.", "warning");
        return;
    }

    const qty = parseInt(document.getElementById(`qty-input-${branchId}`).value);
    if (isNaN(qty) || qty <= 0) {
        showToast("Please enter a valid quantity.", "danger");
        return;
    }

    if (qty > maxStock) {
        showToast(`Selected quantity exceeds available stock (${maxStock} units).`, "danger");
        return;
    }

    const branch = getDB("branches").find(b => b.id == branchId);
    
    // Check if adding items from multiple branches (prevent single reservation spanning multiple branches)
    if (appState.cart.length > 0 && appState.cart[0].branchId !== branchId) {
        if (!confirm("Your cart contains items from another branch. Clear current cart to reserve at this branch?")) {
            return;
        }
        appState.cart = [];
    }

    // Add to cart state
    const existingIndex = appState.cart.findIndex(item => item.medicineId === selectedMedicineForReserve.id);
    if (existingIndex > -1) {
        appState.cart[existingIndex].quantity = qty; // update
    } else {
        appState.cart.push({
            medicineId: selectedMedicineForReserve.id,
            medicineName: selectedMedicineForReserve.name,
            branchId: branchId,
            branchName: branch.name,
            batchId: batchId,
            batchNumber: batchNumber,
            unitPrice: unitPrice,
            quantity: qty
        });
    }

    updateCartDisplay();
    closeDrawer('availability-drawer-backdrop');
    openDrawer('cart-drawer-backdrop');
    showToast("Added to reservation cart.", "success");
}

function updateCartDisplay() {
    const countBadge = document.getElementById("cart-badge-count");
    const container = document.getElementById("cart-items-container");
    const totalQtySpan = document.getElementById("cart-total-qty");

    if (countBadge) countBadge.textContent = appState.cart.length;

    if (!container) return;

    if (appState.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p>Your reservation cart is empty.</p>
            </div>
        `;
        if (totalQtySpan) totalQtySpan.textContent = "0 Items";
        return;
    }

    container.innerHTML = "";
    let totalQty = 0;
    
    appState.cart.forEach((item, index) => {
        totalQty += item.quantity;
        const row = document.createElement("div");
        row.className = "cart-item animate-fade";
        row.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.medicineName}</h4>
                <p>Branch: ${item.branchName}</p>
                <p>Batch: ${item.batchNumber} | LKR ${item.unitPrice.toFixed(2)}/unit</p>
            </div>
            <div class="cart-item-qty">
                <button class="btn btn-secondary qty-btn" onclick="adjustCartQty(${index}, -1)">-</button>
                <span style="font-weight:600; min-width: 20px; text-align:center;">${item.quantity}</span>
                <button class="btn btn-secondary qty-btn" onclick="adjustCartQty(${index}, 1)">+</button>
                <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-left: 8px;" onclick="adjustCartQty(${index}, -999)">Remove</button>
            </div>
        `;
        container.appendChild(row);
    });

    if (totalQtySpan) totalQtySpan.textContent = `${totalQty} Unit(s)`;
}

function adjustCartQty(index, change) {
    if (change === -999) {
        appState.cart.splice(index, 1);
    } else {
        appState.cart[index].quantity += change;
        if (appState.cart[index].quantity <= 0) {
            appState.cart.splice(index, 1);
        }
    }
    updateCartDisplay();
}

// --- Submit Reservation ---
function submitReservation() {
    if (!appState.currentUser) {
        showToast("Please sign in to place a reservation.", "danger");
        return;
    }

    if (appState.cart.length === 0) {
        showToast("Your reservation cart is empty.", "danger");
        return;
    }

    const pickupVal = document.getElementById("checkout-pickup").value;
    const notesVal = document.getElementById("checkout-notes").value;

    if (!pickupVal) {
        showToast("Please specify a pickup date and time.", "danger");
        return;
    }

    const pickupDate = new Date(pickupVal);
    if (pickupDate <= new Date()) {
        showToast("Pickup time must be in the future.", "danger");
        return;
    }

    const reservations = getDB("reservations");
    const inventory = getDB("inventory");
    const audits = getDB("audits");
    
    const newReservationId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    const branchId = appState.cart[0].branchId;
    const branchName = appState.cart[0].branchName;

    // Build reservation record
    const newRes = {
        id: newReservationId,
        reservationDate: new Date().toISOString(),
        pickupDate: pickupDate.toISOString(),
        status: "PENDING",
        notes: notesVal,
        userId: appState.currentUser.id,
        branchId: branchId,
        items: appState.cart.map(item => ({
            id: Math.floor(Math.random() * 1000000),
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            batchNumber: item.batchNumber
        }))
    };

    // Deduct stock from Inventory
    let inventoryModified = false;
    appState.cart.forEach(cartItem => {
        const invRecord = inventory.find(i => i.branchId === cartItem.branchId && i.batchId === cartItem.batchId);
        if (invRecord) {
            invRecord.quantity = Math.max(0, invRecord.quantity - cartItem.quantity);
            invRecord.lastUpdated = new Date().toISOString();
            inventoryModified = true;
        }
    });

    if (inventoryModified) {
        setDB("inventory", inventory);
    }

    // Save Reservation
    reservations.push(newRes);
    setDB("reservations", reservations);

    // Save Audit
    audits.push({
        id: audits.length + 1,
        timestamp: new Date().toISOString(),
        user: appState.currentUser.email,
        action: "RESERVATION_CREATION",
        details: `Reserved ${newRes.items.length} items at branch ${branchName}. Ref ID: RES-${1000 + newReservationId}`
    });
    setDB("audits", audits);

    // Clear cart
    appState.cart = [];
    updateCartDisplay();
    closeDrawer('cart-drawer-backdrop');

    // Show confirmation Modal
    document.getElementById("receipt-ref").textContent = `RES-${1000 + newReservationId}`;
    document.getElementById("receipt-branch").textContent = branchName;
    document.getElementById("receipt-pickup").textContent = pickupDate.toLocaleString();
    openModal("receipt-modal");
}

function closeReceiptModal() {
    closeModal("receipt-modal");
    showSection("reservations");
}

// --- Customer Reservations Rendering ---
function renderCustomerReservations() {
    const tableBody = document.getElementById("customer-reservations-table");
    if (!tableBody) return;

    if (!appState.currentUser) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">Please sign in to view your reservations.</td></tr>`;
        return;
    }

    const reservations = getDB("reservations");
    const userRes = reservations.filter(r => r.userId === appState.currentUser.id);
    const branches = getDB("branches");

    if (userRes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">No active reservations found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = "";
    userRes.sort((a,b) => new Date(b.reservationDate) - new Date(a.reservationDate)).forEach(res => {
        const branchName = branches.find(b => b.id == res.branchId)?.name || "Unknown Branch";
        
        let statusBadge = "";
        if (res.status === "PENDING") statusBadge = `<span class="badge badge-warning">Pending Review</span>`;
        else if (res.status === "PREPARED") statusBadge = `<span class="badge badge-info">Prepared (Ready)</span>`;
        else if (res.status === "COMPLETED") statusBadge = `<span class="badge badge-success">Picked Up</span>`;
        else if (res.status === "CANCELLED") statusBadge = `<span class="badge badge-danger">Cancelled</span>`;

        const itemsStr = res.items.map(i => `${i.medicineName} (${i.quantity})`).join(", ");
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>RES-${1000 + res.id}</strong></td>
            <td>${branchName}</td>
            <td>${new Date(res.reservationDate).toLocaleString()}</td>
            <td>${new Date(res.pickupDate).toLocaleString()}</td>
            <td style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${itemsStr}">${itemsStr}</td>
            <td>${statusBadge}</td>
            <td><small style="color:var(--text-muted);">${res.notes || 'None'}</small></td>
            <td>
                ${res.status === 'PENDING' || res.status === 'PREPARED' ? `
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="cancelReservation(${res.id})">Cancel</button>
                ` : `<span style="font-size: 0.8rem; color: var(--text-muted);">No actions</span>`}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function cancelReservation(resId) {
    if (!confirm("Are you sure you want to cancel this reservation request?")) return;

    const reservations = getDB("reservations");
    const resIndex = reservations.findIndex(r => r.id == resId);
    
    if (resIndex > -1) {
        reservations[resIndex].status = "CANCELLED";
        
        // Return stock back to inventory
        const inventory = getDB("inventory");
        const batches = getDB("batches");
        const res = reservations[resIndex];

        res.items.forEach(resItem => {
            const batch = batches.find(b => b.medicineId === resItem.medicineId && b.batchNumber === resItem.batchNumber);
            if (batch) {
                const invRecord = inventory.find(i => i.branchId === res.branchId && i.batchId === batch.id);
                if (invRecord) {
                    invRecord.quantity += resItem.quantity;
                }
            }
        });

        setDB("inventory", inventory);
        setDB("reservations", reservations);

        // Audit Log
        const audits = getDB("audits");
        audits.push({
            id: audits.length + 1,
            timestamp: new Date().toISOString(),
            user: appState.currentUser.email,
            action: "RESERVATION_CANCEL",
            details: `Cancelled reservation request RES-${1000 + resId}. Returned stock.`
        });
        setDB("audits", audits);

        showToast("Reservation cancelled successfully.", "success");
        renderCustomerReservations();
    }
}

// --- Authentication Operations ---
function handleLogin() {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-password").value.trim();

    if (!email || !pass) {
        showToast("Please fill in email and password.", "danger");
        return;
    }

    const users = getDB("users");
    const user = users.find(u => u.email === email && u.password === pass);

    if (user) {
        if (user.status !== "ACTIVE") {
            showToast("Your account is suspended. Contact Admin.", "danger");
            return;
        }

        appState.currentUser = user;
        localStorage.setItem("medifind_session", JSON.stringify(user));
        
        closeModal("login-modal");
        updateUserHeader();
        showToast(`Signed in successfully as ${user.name}!`, "success");
        
        // Audit log
        const audits = getDB("audits");
        audits.push({
            id: audits.length + 1,
            timestamp: new Date().toISOString(),
            user: user.email,
            action: "USER_LOGIN",
            details: `User signed in successfully. Role: ${user.role}`
        });
        setDB("audits", audits);

        if (user.role !== "CUSTOMER") {
            // Redirect pharmacy staff/admin to dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            renderCustomerReservations();
        }
    } else {
        showToast("Invalid email or password.", "danger");
    }
}

function handleSignup() {
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const phone = document.getElementById("signup-phone").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!name || !email || !phone || !password) {
        showToast("Please fill in all registration fields.", "danger");
        return;
    }

    const users = getDB("users");
    if (users.some(u => u.email === email)) {
        showToast("An account already exists with this email address.", "danger");
        return;
    }

    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        password: password,
        phone: phone,
        role: "CUSTOMER",
        status: "ACTIVE"
    };

    users.push(newUser);
    setDB("users", users);

    appState.currentUser = newUser;
    localStorage.setItem("medifind_session", JSON.stringify(newUser));

    closeModal("signup-modal");
    updateUserHeader();
    showToast(`Welcome to MediFind, ${name}!`, "success");

    // Audit log
    const audits = getDB("audits");
    audits.push({
        id: audits.length + 1,
        timestamp: new Date().toISOString(),
        user: email,
        action: "CUSTOMER_REGISTER",
        details: `Customer registered account: ${name} (${phone})`
    });
    setDB("audits", audits);
}

function handleLogout() {
    if (appState.currentUser) {
        // Audit log
        const audits = getDB("audits");
        audits.push({
            id: audits.length + 1,
            timestamp: new Date().toISOString(),
            user: appState.currentUser.email,
            action: "USER_LOGOUT",
            details: "User logged out of customer session."
        });
        setDB("audits", audits);
    }

    appState.currentUser = null;
    appState.cart = [];
    localStorage.removeItem("medifind_session");
    updateUserHeader();
    updateCartDisplay();
    showSection("catalog");
    showToast("Logged out successfully.", "info");
}

function updateUserHeader() {
    const userDisplay = document.getElementById("user-display");
    const authButtons = document.getElementById("auth-buttons");
    const greeting = document.getElementById("user-greeting");
    const dashLink = document.getElementById("nav-dashboard-link");

    if (appState.currentUser) {
        greeting.textContent = `Hello, ${appState.currentUser.name} (${appState.currentUser.role.replace('_',' ')})`;
        userDisplay.style.display = "flex";
        authButtons.style.display = "none";
        
        if (appState.currentUser.role !== "CUSTOMER") {
            dashLink.style.display = "inline-block";
        } else {
            dashLink.style.display = "none";
        }
    } else {
        userDisplay.style.display = "none";
        authButtons.style.display = "flex";
        if (dashLink) dashLink.style.display = "none";
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
