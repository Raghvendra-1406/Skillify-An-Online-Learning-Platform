const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.register = async (req, res) => {
    const { username, email, password, date_of_birth, interests } = req.body;

    if (!username || !email || !password || !date_of_birth) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try {
        const checkSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkSql, [email], async (checkErr, results) => {
            if (checkErr) {
                console.error(checkErr);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (results.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "You have already registered with this email!"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const insertSql = "INSERT INTO users(username, email, password, date_of_birth, interests, role) VALUES (?, ?, ?, ?, ?, 'student')";

            db.query(insertSql, [username, email, hashedPassword, date_of_birth, interests], (err) => {
                if (err) {
                    console.error("Insert error:", err);
                    return res.status(500).json({ success: false, message: "Error Registering User" });
                }

                res.json({ success: true, message: "User registered successfully!" });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.adminLogin = (req, res) => {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    if (username === adminUsername && password === adminPassword) {
        res.status(200).json({ success: true, message: "Admin login successful!" });
    } else {
        res.status(401).json({ success: false, message: "Invalid admin credentials!" });
    }
};

exports.login = (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    const sql = "SELECT * FROM users WHERE username = ? OR email = ?";
    db.query(sql, [usernameOrEmail, usernameOrEmail], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: "Incorrect password!" });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                interests: user.interests,
                date_of_birth: user.date_of_birth
            }
        });
    });
};