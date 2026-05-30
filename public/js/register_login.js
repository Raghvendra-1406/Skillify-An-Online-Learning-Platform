document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registration-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const date_of_birth = document.getElementById('reg-date-of-birth').value;   // make sure this field exists
        const interests = document.getElementById('reg-interests')?.value || "";

        if (!username || !email || !password || !date_of_birth) {
            alert('Please fill in all required fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        try {
            const response = await fetch(`${window.location.origin}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    date_of_birth,
                    interests
                })
            });

            const data = await response.json();

            if(!data.success){
                alert(data.message);
                if (data.message.includes("already")){
                    window.location.href = "login.html";
                }
                return;
            }

            alert("Registration successful !");
            window.location.href = "login.html";

        } catch (error) {
            console.error("Error:", error);
            alert("Server error. Check backend.");
        }
    });
});
