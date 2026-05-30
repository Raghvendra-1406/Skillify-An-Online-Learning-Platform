const bcrypt = require("bcrypt");
const db = require("../config/db");

exports.getUsers = (req, res) => {
    const sql = "SELECT id, username, email, role FROM users";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, users: results });
    });
};

exports.deleteUser = (req, res) => {
    const userId = req.params.id;

    db.query("DELETE FROM user_courses WHERE user_id = ?", [userId], (courseErr) => {
        if (courseErr) {
            return res.status(500).json({ success: false, message: "Error removing user courses" });
        }

        db.query("DELETE FROM users WHERE id = ?", [userId], (userErr, result) => {
            if (userErr) {
                return res.status(500).json({ success: false, message: "Error deleting user" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            res.status(200).json({ success: true, message: "User deleted successfully" });
        });
    });
};

exports.getRegistrations = (req, res) => {
    const sql = `
        SELECT users.id, users.username, users.email, users.role, user_courses.course_name
        FROM users
        LEFT JOIN user_courses ON users.id = user_courses.user_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }

        res.json({ success: true, registrations: results });
    });
};

exports.getUserCourses = (req, res) => {
    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required!" });
    }

    const sql = "SELECT course_name FROM user_courses WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error!" });
        }

        res.json({ success: true, courses: results });
    });
};

exports.updateProfile = (req, res) => {
    const { id, username, date_of_birth, interests, oldPassword, newPassword } = req.body;

    if (!id || !username || !date_of_birth) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    db.query("SELECT * FROM users WHERE id = ?", [id], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const user = results[0];

        if (newPassword) {
            const matches = await bcrypt.compare(oldPassword || "", user.password);

            if (!matches) {
                return res.status(400).json({ success: false, message: "Incorrect old password." });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updateQuery = "UPDATE users SET username = ?, date_of_birth = ?, interests = ?, password = ? WHERE id = ?";

            db.query(updateQuery, [username, date_of_birth, interests, hashedPassword, id], (updateErr) => {
                if (updateErr) return res.status(500).json({ success: false, message: "Failed to update." });
                return res.json({ success: true, message: "Profile & password updated!" });
            });
            return;
        }

        const updateQuery = "UPDATE users SET username = ?, date_of_birth = ?, interests = ? WHERE id = ?";
        db.query(updateQuery, [username, date_of_birth, interests, id], (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false, message: "Failed to update." });
            return res.json({ success: true, message: "Profile updated!" });
        });
    });
};