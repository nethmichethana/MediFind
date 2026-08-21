let dashboardRole = "ADMIN"; // Default view role
let activeTab = "categories"; // Default workspace menu tab

// Current mock logged-in user simulation
let sessionUser = { name: "System Administrator", role: "ADMIN", email: "admin@medifind.com" };

// --- Initialize Database References ---
function getDB(key) {
    return JSON.parse(localStorage.getItem("medifind_" + key)) || [];
}
function setDB(key, data) {
    localStorage.setItem("medifind_" + key, JSON.stringify(data));
}

// --- Window Init ---
window.onload = function() {
    // If the DB hasn't been initialized by the portal, seed it.
    if (!localStorage.getItem("medifind_initialized")) {
        alert("Initializing Database... Please visit index.html first.");
        window.location.href = "index.html";
        return;
    }

    // Set mock user from session if available and authorized
    const session = localStorage.getItem("medifind_session");
    if (!session) {
        alert("Access Denied. Please sign in with a staff or admin account to view the internal dashboard.");
        window.location.href = "index.html";
        return;
    }

    const u = JSON.parse(session);
    if (u.role === "CUSTOMER") {
        alert("Access Denied. Customers do not have permission to view the internal dashboard.");
        window.location.href = "index.html";
        return;
    }

    // Load appropriate role dashboard
    dashboardRole = u.role;
    sessionUser = u;
    
    // Activate corresponding role switch button
    document.querySelectorAll(".role-tab").forEach(tab => {
        tab.classList.remove("active");
        if (tab.getAttribute("data-role") === dashboardRole) {
            tab.classList.add("active");
        }
    });

    // Initialize display
    switchRole(dashboardRole);
};

// --- Role Switcher Action ---
function switchRole(role) {
    dashboardRole = role;
    
    // Update active switcher tab
    document.querySelectorAll(".role-tab").forEach(tab => {
        if (tab.getAttribute("data-role") === role) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });

    // Update session label
    document.getElementById("active-user-status").textContent = `Logged in: ${role.replace('_',' ')}`;

    // Set Default active tab based on role
    if (role === "ADMIN") {
        activeTab = "categories";
        document.getElementById("sidebar-role-title").textContent = "System Admin";
        document.getElementById("sidebar-role-desc").textContent = "Main platform controls";
    } else if (role === "PHARMACY_ADMIN") {
        activeTab = "branches";
        document.getElementById("sidebar-role-title").textContent = "Pharmacy Admin";
        document.getElementById("sidebar-role-desc").textContent = "Inventory & outlet manager";
    } else if (role === "PHARMACY_STAFF") {
        activeTab = "staff-reservations";
        document.getElementById("sidebar-role-title").textContent = "Dispensing Staff";
        document.getElementById("sidebar-role-desc").textContent = "Branch customer desk";
    }

    renderSidebarMenu();
    loadWorkspaceTab(activeTab);
}

// --- Dynamic Sidebar Menu based on role ---
function renderSidebarMenu() {
    const list = document.getElementById("sidebar-menu-list");
    list.innerHTML = "";

    let items = [];
    if (dashboardRole === "ADMIN") {
        items = [
            { id: "categories", name: "Medicine Categories", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />` },
            { id: "pharmacies", name: "Pharmacies", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />` },
            { id: "audits", name: "Audit Logs", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />` }
        ];
    } else if (dashboardRole === "PHARMACY_ADMIN") {
        items = [
            { id: "branches", name: "Pharmacy Branches", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />` },
            { id: "batches", name: "Medicine Batches", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />` },
            { id: "inventory", name: "Stock Inventory", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />` }
        ];
    } else if (dashboardRole === "PHARMACY_STAFF") {
        items = [
            { id: "staff-reservations", name: "Client Reservations", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />` },
            { id: "notifications", name: "Alert Notifications", icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />` }
        ];
    }

    items.forEach(item => {
        const li = document.createElement("li");
        li.className = `sidebar-item ${activeTab === item.id ? 'active' : ''}`;
        li.innerHTML = `
            <svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                ${item.icon}
            </svg>
            <span>${item.name}</span>
        `;
        li.onclick = () => loadWorkspaceTab(item.id);
        list.appendChild(li);
    });
}

// --- Load Content according to menu choice ---
function loadWorkspaceTab(tabId) {
    activeTab = tabId;
    
    // Update active styling in sidebar list
    document.querySelectorAll(".sidebar-item").forEach(item => {
        if (item.textContent.trim() === getTabFriendlyName(tabId)) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    const wTitle = document.getElementById("workspace-title");
    const wDesc = document.getElementById("workspace-desc");
    const wActions = document.getElementById("workspace-actions");
    
    wActions.innerHTML = ""; // Clear actions

    // Setup Workspace labels & statistics
    if (tabId === "categories") {
        wTitle.textContent = "Medicine Categories";
        wDesc.textContent = "Define therapeutic classifications for the medicine database template.";
        wActions.innerHTML = `<button class="btn btn-primary" onclick="openCategoryModal()">Add Category</button>`;
        renderStats("categories");
        renderTable("categories");
    } else if (tabId === "pharmacies") {
        wTitle.textContent = "Pharmacy Registration";
        wDesc.textContent = "Manage parent pharmacy organizations and assign corporate owners.";
        wActions.innerHTML = `<button class="btn btn-primary" onclick="openPharmacyModal()">Register Pharmacy</button>`;
        renderStats("pharmacies");
        renderTable("pharmacies");
    } else if (tabId === "audits") {
        wTitle.textContent = "Platform Audit Trail";
        wDesc.textContent = "Trace system configuration operations, updates, and customer activity logs.";
        wActions.innerHTML = `<button class="btn btn-secondary" onclick="clearAudits()">Clear Log History</button>`;
        renderStats("audits");
        renderTable("audits");
    } else if (tabId === "branches") {
        wTitle.textContent = "Pharmacy Branch Management";
        wDesc.textContent = "Configure geographical branches, contact numbers, and operational status.";
        wActions.innerHTML = `<button class="btn btn-primary" onclick="openBranchModal()">Add Branch</button>`;
        renderStats("branches");
        renderTable("branches");
    } else if (tabId === "batches") {
        wTitle.textContent = "Medicine Batch Registry";
        wDesc.textContent = "Add incoming shipments, expire date sheets, and purchase unit pricing.";
        wActions.innerHTML = `<button class="btn btn-primary" onclick="openBatchModal()">Register Batch</button>`;
        renderStats("batches");
        renderTable("batches");
    } else if (tabId === "inventory") {
        wTitle.textContent = "Inventory Stock & Alerts";
        wDesc.textContent = "Manage stock quantities, warning levels, and identify low stock levels.";
        renderStats("inventory");
        renderTable("inventory");
    } else if (tabId === "staff-reservations") {
        wTitle.textContent = "Client Dispensing Desk";
        wDesc.textContent = "Verify customer prescription reservations, update preparation status, and complete handovers.";
        renderStats("staff-reservations");
        renderTable("staff-reservations");
    } else if (tabId === "notifications") {
        wTitle.textContent = "System Notifications Hub";
        wDesc.textContent = "Review automatic reorder thresholds and batch expiry alerts.";
        wActions.innerHTML = `<button class="btn btn-secondary" onclick="markAllNotificationsRead()">Mark All Read</button>`;
        renderStats("notifications");
        renderTable("notifications");
    }
}

function getTabFriendlyName(tabId) {
    if (tabId === "categories") return "Medicine Categories";
    if (tabId === "pharmacies") return "Pharmacies";
    if (tabId === "audits") return "Audit Logs";
    if (tabId === "branches") return "Pharmacy Branches";
    if (tabId === "batches") return "Medicine Batches";
    if (tabId === "inventory") return "Stock Inventory";
    if (tabId === "staff-reservations") return "Client Reservations";
    if (tabId === "notifications") return "Alert Notifications";
    return "";
}

// --- Render Widgets / Stat cards ---
function renderStats(tabId) {
    const statsContainer = document.getElementById("workspace-stats");
    statsContainer.innerHTML = "";

    let stats = [];

    if (tabId === "categories" || tabId === "pharmacies" || tabId === "audits") {
        const catCount = getDB("categories").length;
        const pharmCount = getDB("pharmacies").length + 1; // including seed pharmacy
        const auditCount = getDB("audits").length;
        
        stats = [
            { title: "Active Categories", value: catCount, desc: "Therapeutic classes", color: "var(--primary)" },
            { title: "Registered Corporations", value: pharmCount, desc: "Parent corporations", color: "var(--secondary)" },
            { title: "Audit Trail Count", value: auditCount, desc: "Logged system operations", color: "var(--accent-amber)" }
        ];
    } else if (tabId === "branches" || tabId === "batches" || tabId === "inventory") {
        const branchCount = getDB("branches").length;
        const batchCount = getDB("batches").length;
        const inventory = getDB("inventory");
        const lowStockCount = inventory.filter(i => i.quantity <= i.reorderLevel).length;

        stats = [
            { title: "Pharmacy Branches", value: branchCount, desc: "Geographic outlets", color: "var(--secondary)" },
            { title: "Active Shipments / Batches", value: batchCount, desc: "Unique inventory lots", color: "var(--primary)" },
            { title: "Low Stock Indicators", value: lowStockCount, desc: "Needs immediate reorder", color: "var(--accent-rose)" }
        ];
    } else if (tabId === "staff-reservations" || tabId === "notifications") {
        const reservations = getDB("reservations");
        const pendingCount = reservations.filter(r => r.status === "PENDING").length;
        const readyCount = reservations.filter(r => r.status === "PREPARED").length;
        const unreadNotifs = getDB("notifications").filter(n => !n.isRead).length;

        stats = [
            { title: "Pending Orders", value: pendingCount, desc: "Awaiting staff review", color: "var(--accent-amber)" },
            { title: "Prepared / Cabinet Ready", value: readyCount, desc: "Ready for pickup", color: "var(--primary)" },
            { title: "Active Alerts", value: unreadNotifs, desc: "Unread warnings", color: "var(--accent-rose)" }
        ];
    }

    stats.forEach(stat => {
        const div = document.createElement("div");
        div.className = "glass-card stat-card animate-fade";
        div.innerHTML = `
            <div class="stat-header">
                <span class="stat-title">${stat.title}</span>
                <span class="stat-icon" style="color: ${stat.color};">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                </span>
            </div>
            <div class="stat-val">${stat.value}</div>
            <span class="stat-desc">${stat.desc}</span>
        `;
        statsContainer.appendChild(div);
    });
}

// --- Render Table Sheets ---
function renderTable(tabId) {
    const head = document.getElementById("workspace-table-head");
    const body = document.getElementById("workspace-table-body");
    const panelTitle = document.getElementById("table-panel-title");
    
    head.innerHTML = "";
    body.innerHTML = "";

    if (tabId === "categories") {
        panelTitle.textContent = "Medicine Category Definitions";
        head.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        `;
        const list = getDB("categories");
        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No categories found. Click Add Category to create one.</td></tr>`;
            return;
        }
        list.forEach(cat => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cat.id}</td>
                <td><strong>${cat.name}</strong></td>
                <td>${cat.description}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="editCategory(${cat.id})">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteCategory(${cat.id})">Delete</button>
                </td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "pharmacies") {
        panelTitle.textContent = "Registered Pharmacy Entities";
        head.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Corporate Name</th>
                <th>Reg Code</th>
                <th>Phone</th>
                <th>HQ Email</th>
                <th>Owner Assigned</th>
            </tr>
        `;
        const list = getDB("pharmacies");
        const owners = getDB("users");
        
        // Render Seed Pharmacy manually
        const seedTr = document.createElement("tr");
        seedTr.innerHTML = `
            <td>1</td>
            <td><strong>MediFind Super Pharmacy (Seed)</strong></td>
            <td>PH-99238-SL</td>
            <td>0112345678</td>
            <td>corporate@medifind.com</td>
            <td><span class="badge badge-success">Nipuna Owner (owner@medifind.com)</span></td>
        `;
        body.appendChild(seedTr);

        list.forEach((pharm, idx) => {
            const ownerName = owners.find(o => o.id == pharm.ownerId)?.name || "Unassigned";
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${idx + 2}</td>
                <td><strong>${pharm.name}</strong></td>
                <td>${pharm.registrationNumber}</td>
                <td>${pharm.phone}</td>
                <td>${pharm.email}</td>
                <td><span class="badge badge-info">${ownerName}</span></td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "audits") {
        panelTitle.textContent = "Security Audit Logs";
        head.innerHTML = `
            <tr>
                <th>Log ID</th>
                <th>Timestamp</th>
                <th>User Identity</th>
                <th>Action Code</th>
                <th>Details</th>
            </tr>
        `;
        const list = getDB("audits");
        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No audit trails logged.</td></tr>`;
            return;
        }
        list.sort((a,b) => b.id - a.id).forEach(audit => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><small style="color:var(--text-muted);">AUD-${1000 + audit.id}</small></td>
                <td><small>${new Date(audit.timestamp).toLocaleString()}</small></td>
                <td><span style="font-weight: 500;">${audit.user}</span></td>
                <td><span class="badge badge-info" style="font-size:0.7rem; font-family:monospace;">${audit.action}</span></td>
                <td><small>${audit.details}</small></td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "branches") {
        panelTitle.textContent = "Branch Outlets Configuration";
        head.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Branch Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Active Status</th>
                <th>Actions</th>
            </tr>
        `;
        const list = getDB("branches");
        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No branches registered.</td></tr>`;
            return;
        }
        list.forEach(branch => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${branch.id}</td>
                <td><strong>${branch.name}</strong></td>
                <td>${branch.address}</td>
                <td>${branch.city}</td>
                <td>${branch.phone}</td>
                <td>${branch.email}</td>
                <td><span class="badge ${branch.active ? 'badge-success' : 'badge-danger'}">${branch.active ? 'Active' : 'Suspended'}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="editBranch(${branch.id})">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteBranch(${branch.id})">Delete</button>
                </td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "batches") {
        panelTitle.textContent = "Incoming Batch Registry";
        head.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Batch Num</th>
                <th>Product Item</th>
                <th>Intake Qty</th>
                <th>Unit Price</th>
                <th>Mfg Date</th>
                <th>Expiry Date</th>
                <th>Alerts</th>
                <th>Actions</th>
            </tr>
        `;
        const list = getDB("batches");
        const meds = getDB("medicines");
        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">No product batches registered.</td></tr>`;
            return;
        }
        list.forEach(batch => {
            const medName = meds.find(m => m.id == batch.medicineId)?.name || "Unknown Medicine";
            
            // Check expiry condition
            const exp = new Date(batch.expiryDate);
            const today = new Date();
            const timeDiff = exp - today;
            const diffMonths = timeDiff / (1000 * 60 * 60 * 24 * 30);
            
            let alertBadge = "";
            if (diffMonths < 0) alertBadge = `<span class="badge badge-danger">Expired</span>`;
            else if (diffMonths <= 9) alertBadge = `<span class="badge badge-warning">Near Expiry (${Math.ceil(diffMonths)}m)</span>`;
            else alertBadge = `<span class="badge badge-success">OK</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${batch.id}</td>
                <td><strong style="font-family:monospace;">${batch.batchNumber}</strong></td>
                <td>${medName}</td>
                <td>${batch.quantity} Units</td>
                <td><strong>LKR ${batch.unitPrice.toFixed(2)}</strong></td>
                <td><small>${batch.manufactureDate || 'N/A'}</small></td>
                <td><small>${batch.expiryDate}</small></td>
                <td>${alertBadge}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="editBatch(${batch.id})">Edit</button>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteBatch(${batch.id})">Delete</button>
                </td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "inventory") {
        panelTitle.textContent = "Branch Stock Allocation Sheets";
        head.innerHTML = `
            <tr>
                <th>ID</th>
                <th>Branch Location</th>
                <th>Medicine / Batch</th>
                <th>Available Qty</th>
                <th>Reorder Trigger</th>
                <th>Last Synced</th>
                <th>Alert Status</th>
                <th>Actions</th>
            </tr>
        `;
        const list = getDB("inventory");
        const branches = getDB("branches");
        const batches = getDB("batches");
        const meds = getDB("medicines");

        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No stock counts allocated.</td></tr>`;
            return;
        }

        list.forEach(inv => {
            const branchName = branches.find(b => b.id == inv.branchId)?.name || "Unknown Branch";
            const batch = batches.find(b => b.id == inv.batchId);
            const medName = batch ? (meds.find(m => m.id == batch.medicineId)?.name || "Unknown Medicine") : "Unknown";
            const batchNum = batch ? batch.batchNumber : "N/A";
            
            const isLow = inv.quantity <= inv.reorderLevel;
            const alertBadge = isLow ? `<span class="badge badge-danger">LOW STOCK</span>` : `<span class="badge badge-success">OK Stock</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${inv.id}</td>
                <td>${branchName}</td>
                <td><strong>${medName}</strong><br><small style="color:var(--text-muted); font-family:monospace;">Lot: ${batchNum}</small></td>
                <td style="font-weight:600; color:${isLow ? 'var(--accent-rose)' : 'white'};">${inv.quantity} Units</td>
                <td>${inv.reorderLevel} Units</td>
                <td><small>${new Date(inv.lastUpdated).toLocaleString()}</small></td>
                <td>${alertBadge}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="editInventory(${inv.id})">Adjust Stock</button>
                </td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "staff-reservations") {
        panelTitle.textContent = "dispensing Ticket Bookings";
        head.innerHTML = `
            <tr>
                <th>Reservation ID</th>
                <th>Customer Identity</th>
                <th>Reserved Items</th>
                <th>Dispense Branch</th>
                <th>Scheduled Pickup</th>
                <th>Status</th>
                <th>Dispensing Comments</th>
                <th>Actions</th>
            </tr>
        `;
        const list = getDB("reservations");
        const branches = getDB("branches");
        const users = getDB("users");

        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No client reservations found.</td></tr>`;
            return;
        }

        list.sort((a,b) => new Date(b.reservationDate) - new Date(a.reservationDate)).forEach(res => {
            const branchName = branches.find(b => b.id == res.branchId)?.name || "Unknown Branch";
            const clientName = users.find(u => u.id == res.userId)?.name || "Guest Customer";
            const itemsStr = res.items.map(i => `${i.medicineName} (${i.quantity})`).join(", ");
            
            let statusBadge = "";
            if (res.status === "PENDING") statusBadge = `<span class="badge badge-warning">Pending Review</span>`;
            else if (res.status === "PREPARED") statusBadge = `<span class="badge badge-info">Prepared (Ready)</span>`;
            else if (res.status === "COMPLETED") statusBadge = `<span class="badge badge-success">Completed</span>`;
            else if (res.status === "CANCELLED") statusBadge = `<span class="badge badge-danger">Cancelled</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>RES-${1000 + res.id}</strong></td>
                <td>${clientName}</td>
                <td style="max-width: 200px; overflow:hidden; text-overflow:ellipsis;" title="${itemsStr}">${itemsStr}</td>
                <td>${branchName}</td>
                <td><small>${new Date(res.pickupDate).toLocaleString()}</small></td>
                <td>${statusBadge}</td>
                <td><small style="color:var(--text-secondary);">${res.staffNotes || 'None'}</small></td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="processReservation(${res.id})">Process Ticket</button>
                </td>
            `;
            body.appendChild(tr);
        });
    } else if (tabId === "notifications") {
        panelTitle.textContent = "Operational Alert Logs";
        head.innerHTML = `
            <tr>
                <th>Log ID</th>
                <th>Alert Type</th>
                <th>Alert Warning Description</th>
                <th>Triggered Timestamp</th>
                <th>Read Status</th>
            </tr>
        `;
        const list = getDB("notifications");
        if (list.length === 0) {
            body.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No warning notifications logged.</td></tr>`;
            return;
        }
        list.forEach(notif => {
            let typeBadge = "";
            if (notif.type === "LOW_STOCK") typeBadge = `<span class="badge badge-danger">LOW_STOCK</span>`;
            else if (notif.type === "EXPIRY_WARNING") typeBadge = `<span class="badge badge-warning">EXPIRY_ALERT</span>`;
            else typeBadge = `<span class="badge badge-info">NOTIFICATION</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><small style="color:var(--text-muted);">ALR-${100 + notif.id}</small></td>
                <td>${typeBadge}</td>
                <td><strong style="color:${notif.isRead ? 'var(--text-secondary)' : 'white'};">${notif.message}</strong></td>
                <td><small>${new Date(notif.timestamp).toLocaleString()}</small></td>
                <td>
                    ${notif.isRead ? `
                        <span class="badge badge-success">Read</span>
                    ` : `
                        <button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;" onclick="markNotificationRead(${notif.id})">Mark Read</button>
                    `}
                </td>
            `;
            body.appendChild(tr);
        });
    }
}

// --- CRUD Category Actions ---
function openCategoryModal() {
    document.getElementById("category-edit-id").value = "";
    document.getElementById("category-name").value = "";
    document.getElementById("category-desc").value = "";
    document.getElementById("category-modal-title").textContent = "Create Medicine Category";
    openModal("category-modal");
}

function saveCategory() {
    const name = document.getElementById("category-name").value.trim();
    const desc = document.getElementById("category-desc").value.trim();
    const editId = document.getElementById("category-edit-id").value;

    if (!name) {
        showToast("Category name is required.", "danger");
        return;
    }

    const categories = getDB("categories");
    const audits = getDB("audits");

    if (editId) {
        const cat = categories.find(c => c.id == editId);
        if (cat) {
            cat.name = name;
            cat.description = desc;
            audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "CATEGORY_UPDATE", details: `Updated category ID ${editId} to "${name}"` });
        }
    } else {
        const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        categories.push({ id: nextId, name: name, description: desc });
        audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "CATEGORY_CREATE", details: `Created category "${name}"` });
    }

    setDB("categories", categories);
    setDB("audits", audits);
    closeModal("category-modal");
    loadWorkspaceTab("categories");
    showToast("Category saved successfully.", "success");
}

function editCategory(id) {
    const cat = getDB("categories").find(c => c.id == id);
    if (!cat) return;

    document.getElementById("category-edit-id").value = cat.id;
    document.getElementById("category-name").value = cat.name;
    document.getElementById("category-desc").value = cat.description;
    document.getElementById("category-modal-title").textContent = "Modify Category Parameters";
    openModal("category-modal");
}

function deleteCategory(id) {
    if (!confirm("Are you sure you want to delete this category? Medicines assigned to it will require re-mapping.")) return;
    
    const categories = getDB("categories");
    const filtered = categories.filter(c => c.id != id);
    setDB("categories", filtered);

    const audits = getDB("audits");
    audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "CATEGORY_DELETE", details: `Deleted Category ID ${id}` });
    setDB("audits", audits);

    loadWorkspaceTab("categories");
    showToast("Category deleted.", "info");
}

// --- CRUD Pharmacy Owner Actions ---
function openPharmacyModal() {
    const ownerDrop = document.getElementById("pharmacy-owner");
    ownerDrop.innerHTML = "";

    // Load users who can own pharmacy
    const users = getDB("users");
    const owners = users.filter(u => u.role === "PHARMACY_ADMIN");
    
    owners.forEach(o => {
        ownerDrop.innerHTML += `<option value="${o.id}">${o.name} (${o.email})</option>`;
    });

    if (owners.length === 0) {
        ownerDrop.innerHTML = `<option value="">Create a Pharmacy Admin User First</option>`;
    }

    openModal("pharmacy-modal");
}

function savePharmacy() {
    const name = document.getElementById("pharmacy-name").value.trim();
    const reg = document.getElementById("pharmacy-reg").value.trim();
    const phone = document.getElementById("pharmacy-phone").value.trim();
    const email = document.getElementById("pharmacy-email").value.trim();
    const ownerId = document.getElementById("pharmacy-owner").value;

    if (!name || !reg || !ownerId) {
        showToast("Name, registration, and owner are required.", "danger");
        return;
    }

    const pharmacies = getDB("pharmacies");
    pharmacies.push({
        id: pharmacies.length + 2,
        name: name,
        registrationNumber: reg,
        phone: phone,
        email: email,
        ownerId: parseInt(ownerId)
    });
    setDB("pharmacies", pharmacies);

    const audits = getDB("audits");
    audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "PHARMACY_REGISTER", details: `Registered pharmacy corporation "${name}" with owner ID ${ownerId}` });
    setDB("audits", audits);

    closeModal("pharmacy-modal");
    loadWorkspaceTab("pharmacies");
    showToast("Pharmacy corporation registered successfully.", "success");
}

function clearAudits() {
    if (!confirm("Are you sure you want to clear system audit trail history? This action is irreversible.")) return;
    setDB("audits", []);
    loadWorkspaceTab("audits");
    showToast("Audit logs cleared.", "info");
}

// --- CRUD Branch Actions ---
function openBranchModal() {
    document.getElementById("branch-edit-id").value = "";
    document.getElementById("branch-name").value = "";
    document.getElementById("branch-address").value = "";
    document.getElementById("branch-city").value = "";
    document.getElementById("branch-phone").value = "";
    document.getElementById("branch-email").value = "";
    document.getElementById("branch-modal-title").textContent = "Register Pharmacy Branch";
    openModal("branch-modal");
}

function saveBranch() {
    const name = document.getElementById("branch-name").value.trim();
    const addr = document.getElementById("branch-address").value.trim();
    const city = document.getElementById("branch-city").value.trim();
    const phone = document.getElementById("branch-phone").value.trim();
    const email = document.getElementById("branch-email").value.trim();
    const editId = document.getElementById("branch-edit-id").value;

    if (!name || !city) {
        showToast("Branch name and city are required.", "danger");
        return;
    }

    const branches = getDB("branches");
    const audits = getDB("audits");

    if (editId) {
        const b = branches.find(item => item.id == editId);
        if (b) {
            b.name = name;
            b.address = addr;
            b.city = city;
            b.phone = phone;
            b.email = email;
            audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "BRANCH_UPDATE", details: `Updated branch outlet parameters: "${name}"` });
        }
    } else {
        const nextId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
        branches.push({
            id: nextId,
            name: name,
            address: addr,
            city: city,
            phone: phone,
            email: email,
            active: true,
            latitude: 6.9,
            longitude: 79.8
        });
        audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "BRANCH_CREATE", details: `Registered new branch outlet: "${name}" in ${city}` });
    }

    setDB("branches", branches);
    setDB("audits", audits);
    closeModal("branch-modal");
    loadWorkspaceTab("branches");
    showToast("Pharmacy branch configuration saved.", "success");
}

function editBranch(id) {
    const b = getDB("branches").find(item => item.id == id);
    if (!b) return;

    document.getElementById("branch-edit-id").value = b.id;
    document.getElementById("branch-name").value = b.name;
    document.getElementById("branch-address").value = b.address;
    document.getElementById("branch-city").value = b.city;
    document.getElementById("branch-phone").value = b.phone;
    document.getElementById("branch-email").value = b.email;
    document.getElementById("branch-modal-title").textContent = "Modify Branch Outlet";
    openModal("branch-modal");
}

function deleteBranch(id) {
    if (!confirm("Are you sure you want to deactivate/delete this outlet branch?")) return;

    const branches = getDB("branches");
    const filtered = branches.filter(item => item.id != id);
    setDB("branches", filtered);

    const audits = getDB("audits");
    audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "BRANCH_DELETE", details: `Deactivated Pharmacy Branch ID ${id}` });
    setDB("audits", audits);

    loadWorkspaceTab("branches");
    showToast("Branch deleted.", "info");
}

// --- CRUD Batch Actions ---
function openBatchModal() {
    document.getElementById("batch-edit-id").value = "";
    document.getElementById("batch-num").value = "";
    document.getElementById("batch-price").value = "";
    document.getElementById("batch-qty").value = "";
    document.getElementById("batch-mfg").value = "";
    document.getElementById("batch-exp").value = "";
    document.getElementById("batch-modal-title").textContent = "Register Medicine Shipment Lot";

    const medDrop = document.getElementById("batch-medicine");
    medDrop.innerHTML = "";
    getDB("medicines").forEach(m => {
        medDrop.innerHTML += `<option value="${m.id}">${m.name} (${m.genericName})</option>`;
    });

    openModal("batch-modal");
}

function saveBatch() {
    const medId = document.getElementById("batch-medicine").value;
    const num = document.getElementById("batch-num").value.trim();
    const price = parseFloat(document.getElementById("batch-price").value);
    const qty = parseInt(document.getElementById("batch-qty").value);
    const mfg = document.getElementById("batch-mfg").value;
    const exp = document.getElementById("batch-exp").value;
    const editId = document.getElementById("batch-edit-id").value;

    if (!medId || !num || isNaN(price) || isNaN(qty) || !exp) {
        showToast("Please fill in all batch shipment details.", "danger");
        return;
    }

    const batches = getDB("batches");
    const inventory = getDB("inventory");
    const audits = getDB("audits");
    const notifs = getDB("notifications");

    if (editId) {
        const b = batches.find(item => item.id == editId);
        if (b) {
            b.batchNumber = num;
            b.unitPrice = price;
            b.expiryDate = exp;
            b.manufactureDate = mfg;
            audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "BATCH_UPDATE", details: `Updated medicine shipment lot ${num} price to LKR ${price}` });
        }
    } else {
        const nextId = batches.length > 0 ? Math.max(...batches.map(b => b.id)) + 1 : 1;
        const newBatch = {
            id: nextId,
            batchNumber: num,
            quantity: qty,
            expiryDate: exp,
            manufactureDate: mfg,
            unitPrice: price,
            medicineId: parseInt(medId)
        };
        batches.push(newBatch);
        audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "BATCH_REGISTER", details: `Registered medicine shipment lot ${num} with quantity ${qty}` });

        // Distribute stock to default Colombo Branch for demo simplicity
        const nextInvId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
        inventory.push({
            id: nextInvId,
            branchId: 1, // Default Colombo Town Branch
            batchId: nextId,
            quantity: qty,
            reorderLevel: Math.floor(qty * 0.15), // default reorder level 15%
            lastUpdated: new Date().toISOString()
        });

        // Trigger Notification Warning if incoming batch is pre-expired or near expiry
        const expDateObj = new Date(exp);
        const warningPeriod = 9 * 30 * 24 * 60 * 60 * 1000; // 9 months
        if ((expDateObj - new Date()) < warningPeriod) {
            notifs.push({
                id: notifs.length + 1,
                type: "EXPIRY_WARNING",
                message: `Imported Batch ${num} is approaching expiration date (${exp}).`,
                timestamp: new Date().toISOString(),
                isRead: false
            });
            setDB("notifications", notifs);
        }
    }

    setDB("batches", batches);
    setDB("inventory", inventory);
    setDB("audits", audits);
    closeModal("batch-modal");
    loadWorkspaceTab("batches");
    showToast("Shipment lot batch register processed.", "success");
}

function editBatch(id) {
    const b = getDB("batches").find(item => item.id == id);
    if (!b) return;

    openBatchModal(); // initialize select lists
    
    document.getElementById("batch-edit-id").value = b.id;
    document.getElementById("batch-num").value = b.batchNumber;
    document.getElementById("batch-price").value = b.unitPrice;
    document.getElementById("batch-qty").value = b.quantity;
    document.getElementById("batch-qty").disabled = true; // prevent direct manipulation
    document.getElementById("batch-mfg").value = b.manufactureDate || "";
    document.getElementById("batch-exp").value = b.expiryDate;
    document.getElementById("batch-medicine").value = b.medicineId;
    document.getElementById("batch-modal-title").textContent = "Modify Shipment Lot Parameters";
    openModal("batch-modal");
}

function deleteBatch(id) {
    if (!confirm("Are you sure you want to discard this batch registry? It will drop linked inventory count sheets.")) return;

    const batches = getDB("batches");
    const filteredBatches = batches.filter(item => item.id != id);
    setDB("batches", filteredBatches);

    const inventory = getDB("inventory");
    const filteredInv = inventory.filter(item => item.batchId != id);
    setDB("inventory", filteredInv);

    const audits = getDB("audits");
    audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "BATCH_DISCARD", details: `Discarded medicine shipment lot record ID ${id}` });
    setDB("audits", audits);

    loadWorkspaceTab("batches");
    showToast("Medicine lot batch dropped.", "info");
}

// --- Inventory Manager Actions ---
function editInventory(id) {
    const inv = getDB("inventory").find(item => item.id == id);
    if (!inv) return;

    const batch = getDB("batches").find(b => b.id == inv.batchId);
    const medName = getDB("medicines").find(m => m.id == batch?.medicineId)?.name || "Unknown Medicine";
    const batchNum = batch ? batch.batchNumber : "N/A";

    document.getElementById("inventory-edit-id").value = inv.id;
    document.getElementById("inventory-med-name").value = `${medName} [Lot: ${batchNum}]`;
    document.getElementById("inventory-qty").value = inv.quantity;
    document.getElementById("inventory-reorder").value = inv.reorderLevel;
    
    openModal("inventory-modal");
}

function saveInventory() {
    const id = document.getElementById("inventory-edit-id").value;
    const qty = parseInt(document.getElementById("inventory-qty").value);
    const reorder = parseInt(document.getElementById("inventory-reorder").value);

    if (isNaN(qty) || isNaN(reorder)) {
        showToast("Stock quantity and reorder level must be valid digits.", "danger");
        return;
    }

    const inventory = getDB("inventory");
    const item = inventory.find(i => i.id == id);
    
    if (item) {
        item.quantity = qty;
        item.reorderLevel = reorder;
        item.lastUpdated = new Date().toISOString();
        
        // Trigger low stock notification if necessary
        if (qty <= reorder) {
            const notifs = getDB("notifications");
            const branches = getDB("branches");
            const batches = getDB("batches");
            const meds = getDB("medicines");
            
            const bName = branches.find(b => b.id == item.branchId)?.name || "Outlet";
            const batchNum = batches.find(b => b.id == item.batchId)?.batchNumber || "";
            const medName = meds.find(m => m.id === batches.find(b => b.id == item.batchId)?.medicineId)?.name || "";

            notifs.push({
                id: notifs.length + 1,
                type: "LOW_STOCK",
                message: `${bName} stock alert: ${medName} (Lot ${batchNum}) has reached low stock level (${qty} left).`,
                timestamp: new Date().toISOString(),
                isRead: false
            });
            setDB("notifications", notifs);
        }

        setDB("inventory", inventory);
        
        // Audit log
        const audits = getDB("audits");
        audits.push({ id: audits.length + 1, timestamp: new Date().toISOString(), user: sessionUser.email, action: "STOCK_ADJUST", details: `Adjusted inventory stock ID ${id} to count ${qty} units.` });
        setDB("audits", audits);

        closeModal("inventory-modal");
        loadWorkspaceTab("inventory");
        showToast("Branch stock values saved.", "success");
    }
}

// --- Reservation processing ---
function processReservation(resId) {
    const reservations = getDB("reservations");
    const res = reservations.find(r => r.id == resId);
    if (!res) return;

    const users = getDB("users");
    const clientName = users.find(u => u.id == res.userId)?.name || "Guest Customer";
    const itemsStr = res.items.map(i => `${i.medicineName} (x${i.quantity})`).join(", ");

    document.getElementById("process-res-id").value = res.id;
    document.getElementById("process-res-user").textContent = clientName;
    document.getElementById("process-res-items").textContent = itemsStr;
    document.getElementById("process-res-notes").textContent = res.notes || "None";
    document.getElementById("process-status").value = res.status;
    document.getElementById("process-feedback").value = res.staffNotes || "";

    openModal("reservation-process-modal");
}

function saveReservationStatus() {
    const id = document.getElementById("process-res-id").value;
    const status = document.getElementById("process-status").value;
    const staffNotes = document.getElementById("process-feedback").value.trim();

    const reservations = getDB("reservations");
    const res = reservations.find(r => r.id == id);

    if (res) {
        const oldStatus = res.status;
        res.status = status;
        res.staffNotes = staffNotes;

        // If ticket was cancelled from Prepared/Pending, return stock back
        if (status === "CANCELLED" && oldStatus !== "CANCELLED") {
            const inventory = getDB("inventory");
            const batches = getDB("batches");

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
        }

        setDB("reservations", reservations);

        // Save Auditing Record
        const audits = getDB("audits");
        audits.push({
            id: audits.length + 1,
            timestamp: new Date().toISOString(),
            user: sessionUser.email,
            action: "RESERVATION_DISPENSE",
            details: `Updated reservation RES-${1000 + res.id} status from ${oldStatus} to ${status}. Staff note: ${staffNotes || 'None'}`
        });
        setDB("audits", audits);

        closeModal("reservation-process-modal");
        loadWorkspaceTab("staff-reservations");
        showToast("Reservation request status updated.", "success");
    }
}

// --- Notification Hub Controls ---
function markNotificationRead(id) {
    const notifs = getDB("notifications");
    const n = notifs.find(item => item.id == id);
    if (n) {
        n.isRead = true;
        setDB("notifications", notifs);
        loadWorkspaceTab("notifications");
        showToast("Notification flagged as read.", "success");
    }
}

function markAllNotificationsRead() {
    const notifs = getDB("notifications");
    notifs.forEach(n => n.isRead = true);
    setDB("notifications", notifs);
    loadWorkspaceTab("notifications");
    showToast("All notifications flagged as read.", "success");
}

// --- Global UI helpers ---
function openModal(id) {
    document.getElementById(id).style.display = "flex";
}
function closeModal(id) {
    document.getElementById(id).style.display = "none";
}

// Toast Alert System
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
