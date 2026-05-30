document.getElementById("admin-login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form refresh

    // Get admin input values
    const username = document.getElementById("admin-username").value.trim();
    const password = document.getElementById("admin-password").value;

    // Check if fields are empty
    if (!username || !password) {
        alert("Please fill in all fields!");
        return;
    }

    // Send login data to backend for verification
    fetch(`${window.location.origin}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("✅ Admin Login Successful! Redirecting...");
            window.location.href = "admin_dashboard.html"; // Redirect to admin dashboard
        } else {
            alert("❌ Invalid credentials!");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("⚠️ Server error! Please try again later.");
    });
});
