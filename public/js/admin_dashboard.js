document.addEventListener("DOMContentLoaded", function () {
    const logoutBtn = document.getElementById("logout");
    const adminContent = document.getElementById("admin-content");

    if (!logoutBtn || !adminContent) {
        console.error("❌ Required elements missing in admin dashboard!");
        return;
    }

    // LOGOUT FUNCTION
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("adminToken"); // Remove authentication token
        window.location.href = "admin_login.html"; // Redirect to login
    });

    // VIEW REGISTRATIONS FUNCTION
    async function viewRegistrations() {
        console.log("Fetching student registrations...");
        

        const tableContainer = document.getElementById("registrationsTable");

        // Check if the table already exists
        if (tableContainer.innerHTML.trim() !== "") {
            tableContainer.innerHTML = ""; // Hide table if already present
            return; // Exit function
        }
    
        try {
            const response = await fetch(`${window.location.origin}/get-registrations`);
            const data = await response.json();
    
            if (!data.success) {
                throw new Error(data.message);
            }
    
            const registrations = data.registrations;
            const tableContainer = document.getElementById("registrationsTable");
    
            // Clear previous table if exists
            tableContainer.innerHTML = "";
    
            // Create table element
            const table = document.createElement("table");
            table.border = "1";
            table.style.width = "95%";
            table.style.borderCollapse = "collapse";
            
    
            // Create table header
            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th style="padding: 10px; background-color: #3498db;">ID</th>
                    <th style="padding: 10px; background-color: #3498db;">Username</th>
                    <th style="padding: 10px; background-color: #3498db;">Email</th>
                    <th style="padding: 10px; background-color: #3498db;">Role</th>
                    <th style="padding: 10px; background-color: #3498db;">Course</th>
                </tr>
            `;
            table.appendChild(thead);
    
            // Create table body
            const tbody = document.createElement("tbody");
    
            registrations.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td style="padding: 10px; text-align: center;">${user.id}</td>
                    <td style="padding: 10px;">${user.username}</td>
                    <td style="padding: 10px;">${user.email}</td>
                    <td style="padding: 10px;">${user.role}</td>
                    <td style="padding: 10px;">${user.course_name || "Not Enrolled"}</td>
                `;
                tbody.appendChild(row);
            });
    
            table.appendChild(tbody);
            tableContainer.appendChild(table);
        } catch (error) {
            console.error("Error fetching registrations:", error);
        }
    };
    window.viewRegistrations = viewRegistrations;

    // VIEW USERS FUNCTION

    async function toggleUsers() {
        // Check if content is already present
        if (adminContent.innerHTML.trim() !== "") {
            adminContent.innerHTML = ""; // Hide table if already present
            return;
        }
    
        await viewUsers(); // Load user data
    }
    
    window.toggleUsers = toggleUsers;
    async function viewUsers() {
        console.log("Fetching user data...");

        try {
            const response = await fetch(`${window.location.origin}/get-users`); // API to fetch users
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            const users = data.users;
            adminContent.innerHTML = "";

            // Create table element
            const table = document.createElement("table");
            table.border = "1";
            table.style.width = "95%";
            table.style.borderCollapse = "collapse";

            // Table header
            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th style="padding: 10px; background-color: #3498db;">ID</th>
                    <th style="padding: 10px; background-color: #3498db;">Username</th>
                    <th style="padding: 10px; background-color: #3498db;">Email</th>
                    <th style="padding: 10px; background-color: #3498db;">Role</th>
                    <th style="padding: 10px; background-color: #3498db;">Actions</th>
                </tr>
            `;
            table.appendChild(thead);

            // Table body
            const tbody = document.createElement("tbody");

            users.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td style="padding: 10px; text-align: center;">${user.id}</td>
                    <td style="padding: 10px;">${user.username}</td>
                    <td style="padding: 10px;">${user.email}</td>
                    <td style="padding: 10px;">${user.role}</td>
                    <td style="padding: 10px;">
                        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            adminContent.appendChild(table);
        } catch (error) {
            console.error(" Error fetching users:", error);
        }
    }
    window.viewUsers = viewUsers;

    // DELETE USER FUNCTION
    window.deleteUser = async function (userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;
    
        console.log(`Deleting user ID: ${userId}`);
    
        try {
            const response = await fetch(`${window.location.origin}/delete-user/${userId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    // If authentication is required, you might need to add a token:
                    // "Authorization": `Bearer ${yourToken}`
                },
            });
    
            const data = await response.json();
    
            if (data.success) {
                alert(data.message);
                viewUsers(); // Refresh user list
            } else {
                alert(data.message); // Handle error if any
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("An error occurred while deleting the user.");
        }
    };
});

