document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const usernameOrEmail = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value;
    const messageBox = document.getElementById("login-message");

    // Reset message box
    messageBox.innerHTML = "";

    if (!usernameOrEmail || !password) {
        messageBox.innerHTML = "<p style='color: red;'>All fields are required.</p>";
        return;
    }

    try {
        const response = await fetch(`${window.location.origin}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameOrEmail, password })
        });

        const result = await response.json();

        if (response.ok) {
            messageBox.innerHTML = "<p style='color: green;'>Login successful! Redirecting...</p>";
            localStorage.setItem("user", JSON.stringify(result.user)); // Store user session
            setTimeout(() => {
                window.location.href = "profile.html"; // Redirect to profile
            }, 2000);
        } else {
            messageBox.innerHTML = `<p style='color: red;'>${result.message}</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        messageBox.innerHTML = "<p style='color: red;'>An error occurred. Please try again.</p>";
    }
});

