const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const db = require("./db");

//  User Registration API
app.post("/register", async (req, res) => {
    const { username, email, password, date_of_birth, interests } = req.body;

    if (!username || !email || !password || !date_of_birth) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    try{
        const checksql = "SELECT * FROM users WHERE email = ?";
        db.query(checksql, [email], async (checkErr, results) => {
            if(checkErr) {
                console.error(checkErr);
                return res.status(500).json({success: false, message: "Database error"});
            }

            if (results.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "You have already registered with this email!"
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql = `INSERT INTO users(username, email, password, date_of_birth, interests, role) VALUES (?, ?, ?, ?, ?, 'student')`;

            db.query(insertSql, [username, email, hashedPassword, date_of_birth, interests], (err, result) => {
                if(err){
                    console.error("❌ Insert error: ", err);
                    return res.status(500).json({ success: false, message: "Error Registering User"});
                }

                res.json({ success: true, message: "User registered successfully!"});
            });
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({ success: false, message: "Server error"});
    }
});


//  Admin Login API (Hardcoded Credentials)
app.post("/admin-login", (req, res) => {
    const { username, password } = req.body;

    // Hardcoded Admin Credentials
    const adminUsername = "admin";
    const adminPassword = "Admin@123"; // ⚠️ Change if needed

    if (username === adminUsername && password === adminPassword) {
        res.status(200).json({ success: true, message: "Admin login successful!" });
    } else {
        res.status(401).json({ success: false, message: "Invalid admin credentials!" });
    }
});

//  User Login API
app.post("/login", (req, res) => {
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

        // Verify password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "❌ Incorrect password!" });
        }

        res.json({
            success: true,
            message: "Login successful!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                date_of_birth: user.date_of_birth
            }
        });
    });
});


app.get("/user-courses", (req, res) => {
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
});

/*View Users by Admin*/
app.get("/get-users", (req, res) => {
    const sql = "SELECT id, username, email, role FROM users";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, users: results });
    });
});

//Delete User 
app.delete("/delete-user/:id", (req, res) => {
    const userId = req.params.id;

    // Start by attempting to delete from the `user_courses` table first (if there's any related course data)
    const deleteUserCoursesQuery = "DELETE FROM user_courses WHERE user_id = ?";
    db.query(deleteUserCoursesQuery, [userId], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error removing user courses" });
        }

        // After handling the courses, proceed to delete the user
        const deleteUserQuery = "DELETE FROM users WHERE id = ?";
        db.query(deleteUserQuery, [userId], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Error deleting user" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, message: "User deleted successfully" });
        });
    });
});

//  View Student Registrations API
app.get("/get-registrations", (req, res) => {
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
});

/*Manage Courses*/
//  GET COURSES (Fetch all courses)
app.get("/get-courses", (req, res) => {
    const sql = `
        SELECT c.id AS course_id, c.title, c.image, c.description, 
               l.id AS lesson_id, l.title AS lesson_title
        FROM courses c
        LEFT JOIN lessons l ON c.id = l.course_id
        ORDER BY c.id, l.id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.json({ success: false, message: "Error fetching courses", error: err });
        }

        const courseMap = {};

        results.forEach(row => {
            const courseId = row.course_id;
            if (!courseMap[courseId]) {
                courseMap[courseId] = {
                    id: courseId,
                    title: row.title,
                    image: row.image,
                    description: row.description,
                    lessons: []
                };
            }

            if (row.lesson_id) {
                courseMap[courseId].lessons.push({
                    id: row.lesson_id,
                    title: row.lesson_title
                });
            }
        });

        const courses = Object.values(courseMap);
        res.json({ success: true, courses });
    });
});


//Course Detail Page
app.get("/course-details/:courseId", (req, res) => {
    const courseId = req.params.courseId;

    const courseSql = "SELECT * FROM courses WHERE id = ?";
    const lessonsSql = `
        SELECT l.id AS lesson_id, l.title AS lesson_title, ll.video_url
        FROM lessons l
        LEFT JOIN lesson_links ll ON l.id = ll.lesson_id
        WHERE l.course_id = ?
    `;

    db.query(courseSql, [courseId], (err, courseResult) => {
        if (err || courseResult.length === 0) {
            return res.json({ success: false, message: "Course not found" });
        }

        const course = {
            id: courseResult[0].id,
            title: courseResult[0].title,
            image: courseResult[0].image,
            description: courseResult[0].description,
            lessons: []
        };

        db.query(lessonsSql, [courseId], (err, lessonsResult) => {
            if (err) {
                return res.json({ success: false, message: "Error fetching lessons" });
            }

            const lessonMap = {};
            lessonsResult.forEach(row => {
                if (!lessonMap[row.lesson_id]) {
                    lessonMap[row.lesson_id] = {
                        title: row.lesson_title,
                        links: []
                    };
                }
                if (row.video_url) {
                    lessonMap[row.lesson_id].links.push(row.video_url);
                }
            });

            course.lessons = Object.values(lessonMap);
            res.json({ success: true, course });
        });
    });
});



//  ADD COURSE (Insert a new course)
app.post("/add-course", (req, res) => {
    const { title, image, description } = req.body;

    const sql = "INSERT INTO courses (title, image, description) VALUES (?, ?, ?)";
    db.query(sql, [title, image, description], (err, result) => {
        if (err) {
            console.error("Error adding course:", err);
            return res.status(500).json({ message: "Error adding course" });
        }

        const courseId = result.insertId; //  Get the inserted course ID
        res.status(200).json({ message: "Course added successfully", courseId });
    });
});

//  ADD LESSONS (Insert lessons for a course)
app.post("/add-lesson", (req, res) => {
    const { courseId, lessons } = req.body;

    let completedLessons = 0; // To track the completion of all lessons

    // Loop through each lesson and insert them one by one
    lessons.forEach((lesson, index) => {
        const { lessonTitle, videoLink } = lesson;

        // Insert lesson into the lessons table
        const lessonSql = "INSERT INTO lessons (course_id, title) VALUES (?, ?)";
        db.query(lessonSql, [courseId, lessonTitle], (err, lessonResult) => {
            if (err) {
                console.error("Error adding lesson:", err);
                return res.status(500).json({ message: "Error adding lesson" });
            }

            const lessonId = lessonResult.insertId;

            // Insert video link for the current lesson
            const videoSql = "INSERT INTO lesson_links (lesson_id, video_url) VALUES (?, ?)";
            db.query(videoSql, [lessonId, videoLink], (videoErr) => {
                if (videoErr) {
                    console.error("Error adding video link:", videoErr);
                    return res.status(500).json({ message: "Error adding video link" });
                }

                completedLessons++;

                // Check if all lessons have been processed
                if (completedLessons === lessons.length) {
                    return res.status(200).json({ message: "Lessons and video links added successfully" });
                }
            });
        });
    });
});


//  DELETE COURSE (Delete by ID)
app.delete('/delete-course/:id', (req, res) => {
    const courseId = req.params.id;

    const sql = "DELETE FROM courses WHERE id = ?";
    db.query(sql, [courseId], (err, result) => {
        if (err) {
            return res.json({ success: false, message: "Error deleting course" });
        }
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Course not found!" });
        }
        res.json({ success: true, message: "Course deleted successfully!" });
    });
});

app.get("/get-courses", (req, res) => {
    const sql = "SELECT * FROM courses";
    db.query(sql, (err, results) => {
        if (err) {
            return res.json({ success: false, message: "Error fetching courses", error: err });
        }
        res.json({ success: true, courses: results });
    });
});

//  UPDATE PROFILE (Update by ID)
app.post("/update-profile", (req, res) => {
    const { id, username, date_of_birth, interests, oldPassword, newPassword } = req.body;

    if (!id || !username || !date_of_birth) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // First, fetch existing user to verify old password (if needed)
    const selectQuery = "SELECT * FROM users WHERE id = ?";
    db.query(selectQuery, [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const user = results[0];

        if (newPassword) {
            if (oldPassword !== user.password) {
                return res.status(400).json({ success: false, message: "Incorrect old password." });
            }

            const updateQuery = "UPDATE users SET username = ?, date_of_birth = ?, interests = ?, password = ? WHERE id = ?";
            db.query(updateQuery, [username, date_of_birth, interests, newPassword, id], (err) => {
                if (err) return res.status(500).json({ success: false, message: "Failed to update." });
                return res.json({ success: true, message: "Profile & password updated!" });
            });
        } else {
            const updateQuery = "UPDATE users SET username = ?, date_of_birth = ?, interests = ? WHERE id = ?";
            db.query(updateQuery, [username, date_of_birth, interests, id], (err) => {
                if (err) return res.status(500).json({ success: false, message: "Failed to update." });
                return res.json({ success: true, message: "Profile updated!" });
            });
        }
    });
});


//  UPDATE COURSE (Update by ID)
app.put("/update-course/:id", (req, res) => {
    const courseId = req.params.id;
    const { title, description, image, lessons } = req.body;

    if (!title || !description || !image || !lessons) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const sql = `
        UPDATE courses 
        SET title = ?, description = ?, image = ?, lessons = ? 
        WHERE id = ?
    `;
    db.query(sql, [title, description, image, lessons, courseId], (err, result) => {
        if (err) {
            console.error("Error updating course:", err);
            return res.status(500).json({ success: false, message: "Failed to update course." });
        }
        res.json({ success: true, message: "Course updated successfully!" });
    });
});


// Update a lesson's title and video link
app.put('/lessons/:lessonId', (req, res) => {
    const lessonId = req.params.lessonId;
    const { title, video_link } = req.body;

    const updateLessonQuery = `UPDATE lessons SET lesson_title = ? WHERE id = ?`;
    const updateLinkQuery = `UPDATE lesson_links SET video_link = ? WHERE lesson_id = ?`;

    db.query(updateLessonQuery, [title, lessonId], (err, lessonResult) => {
        if (err) {
            console.error('Error updating lesson:', err);
            return res.status(500).json({ error: 'Failed to update lesson title' });
        }

        db.query(updateLinkQuery, [video_link, lessonId], (err, linkResult) => {
            if (err) {
                console.error('Error updating video link:', err);
                return res.status(500).json({ error: 'Failed to update video link' });
            }

            res.status(200).json({ message: 'Lesson updated successfully' });
        });
    });
});

//Fetch course by ID (For editing purposes)
app.get("/course/:id", (req, res) => {
    const courseId = req.params.id;

    const sql = "SELECT * FROM courses WHERE id = ?";
    db.query(sql, [courseId], (err, results) => {
        if (err) {
            return res.json({ success: false, message: "Error fetching course", error: err });
        }
        if (results.length === 0) {
            return res.json({ success: false, message: "Course not found" });
        }
        res.json({ success: true, course: results[0] });
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
