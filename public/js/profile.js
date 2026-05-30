document.addEventListener("DOMContentLoaded", async function () {
    const usernameSpan = document.getElementById("username");
    const emailSpan = document.getElementById("email");
    const dobSpan = document.getElementById("dob");
    const interestsSpan = document.getElementById("interests");
    const coursesSpan = document.getElementById("courses");

    //Fetch user data from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        // Redirect to login page if user data is not found
        window.location.href = "login.html";
        return;
    }

    //Display user details
    usernameSpan.textContent = user.username;
    emailSpan.textContent = user.email;
    dobSpan.textContent = new Date(user.date_of_birth).toISOString().split("T")[0];
    interestsSpan.textContent = user.interests || "Not provided";

    //Fetch enrolled courses from the backend
    /*try {
        const response = await fetch(`${window.location.origin}/user-courses?user_id=${user.id}`);
        const data = await response.json();

        if (response.ok && data.courses.length > 0) {
            coursesSpan.innerHTML = data.courses.map(course => `<li>${course.name}</li>`).join("");
        } else {
            coursesSpan.innerHTML = "<p>No courses enrolled.</p>";
        }
    } catch (error) {
        console.error("❌ Error fetching courses:", error);
        coursesSpan.innerHTML = "<p>Failed to load courses.</p>";
    }*/
});

document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            console.log("🔴 Logging out...");
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    } else {
        console.error("❌ Logout link not found!");
    }
});

//Scrolling down the page when we click on the update button and when form is released


document.addEventListener("DOMContentLoaded", async function () {
    const usernameSpan = document.getElementById("username");
    const emailSpan = document.getElementById("email");
    const dobSpan = document.getElementById("dob");
    const interestsSpan = document.getElementById("interests");
    const coursesList = document.getElementById("courses-list");

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    usernameSpan.textContent = user.username;
    emailSpan.textContent = user.email;
    dobSpan.textContent = new Date(user.date_of_birth).toISOString().split("T")[0];
    interestsSpan.textContent = user.interests || "Not provided";

    /*try {
        const response = await fetch(`${window.location.origin}/user-courses?user_id=${user.id}`);
        const data = await response.json();

        if (response.ok && data.courses.length > 0) {
            coursesList.innerHTML = data.courses.map(course => `<li>${course.name}</li>`).join("");
        } else {
            coursesList.innerHTML = "<li>No courses enrolled.</li>";
        }
    } catch (error) {
        console.error("❌ Error fetching courses:", error);
        coursesList.innerHTML = "<li>Failed to load courses.</li>";
    }*/

    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }

    const showBtn = document.getElementById("showUpdateFormBtn");
    const updateSection = document.getElementById("updateProfileSection");

    showBtn.addEventListener("click", () => {
        updateSection.style.display = "block";
        document.getElementById("updateName").value = user.username;
        document.getElementById("updateDob").value = new Date(user.date_of_birth).toISOString().split("T")[0];
        document.getElementById("updateInterests").value = user.interests || "";
    });

    document.getElementById("updateProfileForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedUser = {
            id: user.id,
            username: document.getElementById("updateName").value,
            date_of_birth: document.getElementById("updateDob").value,
            interests: document.getElementById("updateInterests").value,
            oldPassword: document.getElementById("oldPassword").value,
            newPassword: document.getElementById("newPassword").value,
            confirmPassword: document.getElementById("confirmPassword").value
        };

        if (updatedUser.newPassword || updatedUser.confirmPassword) {
            if (!updatedUser.oldPassword) return alert("⚠️ Please enter old password to change password.");
            if (updatedUser.newPassword !== updatedUser.confirmPassword) return alert("⚠️ New passwords do not match.");
        }

        try {
            const res = await fetch(`${window.location.origin}/update-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedUser)
            });
            const result = await res.json();
            alert(result.message);

            if (result.success) {
                localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
                location.reload();
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const showBtn = document.getElementById("showUpdateFormBtn");
    const updateSection = document.getElementById("updateProfileSection");

    const user = JSON.parse(localStorage.getItem("user"));

    if (showBtn && updateSection) {
        showBtn.addEventListener("click", () => {
            updateSection.style.display = "block";

            // Pre-fill form fields
            document.getElementById("updateName").value = user.username;
            document.getElementById("updateDob").value = new Date(user.date_of_birth).toISOString().split("T")[0];
            document.getElementById("updateInterests").value = user.interests || "";

            // 🔽 Scroll to the update form
            updateSection.scrollIntoView({ behavior: "smooth" });
        });
    } else {
        console.error("showBtn or updateSection not found.");
    }
});