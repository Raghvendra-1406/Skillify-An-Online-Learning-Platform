const db = require("../config/db");

exports.getCourses = (req, res) => {
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

        results.forEach((row) => {
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

        res.json({ success: true, courses: Object.values(courseMap) });
    });
};

exports.getCourseDetails = (req, res) => {
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

        db.query(lessonsSql, [courseId], (lessonErr, lessonsResult) => {
            if (lessonErr) {
                return res.json({ success: false, message: "Error fetching lessons" });
            }

            const lessonMap = {};
            lessonsResult.forEach((row) => {
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
};

exports.addCourse = (req, res) => {
    const { title, image, description } = req.body;
    const sql = "INSERT INTO courses (title, image, description) VALUES (?, ?, ?)";

    db.query(sql, [title, image, description], (err, result) => {
        if (err) {
            console.error("Error adding course:", err);
            return res.status(500).json({ message: "Error adding course" });
        }

        res.status(200).json({ message: "Course added successfully", courseId: result.insertId });
    });
};

exports.addLessons = (req, res) => {
    const { courseId, lessons } = req.body;
    let completedLessons = 0;

    if (!Array.isArray(lessons) || lessons.length === 0) {
        return res.status(400).json({ success: false, message: "Lessons are required" });
    }

    lessons.forEach((lesson) => {
        const { lessonTitle, videoLink } = lesson;
        const lessonSql = "INSERT INTO lessons (course_id, title) VALUES (?, ?)";

        db.query(lessonSql, [courseId, lessonTitle], (lessonErr, lessonResult) => {
            if (lessonErr) {
                console.error("Error adding lesson:", lessonErr);
                return res.status(500).json({ message: "Error adding lesson" });
            }

            const lessonId = lessonResult.insertId;
            const videoSql = "INSERT INTO lesson_links (lesson_id, video_url) VALUES (?, ?)";

            db.query(videoSql, [lessonId, videoLink], (videoErr) => {
                if (videoErr) {
                    console.error("Error adding video link:", videoErr);
                    return res.status(500).json({ message: "Error adding video link" });
                }

                completedLessons += 1;
                if (completedLessons === lessons.length) {
                    return res.status(200).json({ message: "Lessons and video links added successfully" });
                }
            });
        });
    });
};

exports.deleteCourse = (req, res) => {
    const courseId = req.params.id;

    db.query("DELETE FROM courses WHERE id = ?", [courseId], (err, result) => {
        if (err) {
            return res.json({ success: false, message: "Error deleting course" });
        }

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Course not found!" });
        }

        res.json({ success: true, message: "Course deleted successfully!" });
    });
};

exports.getCourseById = (req, res) => {
    const courseId = req.params.id;

    db.query("SELECT * FROM courses WHERE id = ?", [courseId], (err, results) => {
        if (err) {
            return res.json({ success: false, message: "Error fetching course", error: err });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: "Course not found" });
        }

        res.json({ success: true, course: results[0] });
    });
};

exports.updateCourse = (req, res) => {
    const courseId = req.params.id;
    const { title, description, image } = req.body;

    if (!title || !description || !image) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const sql = "UPDATE courses SET title = ?, description = ?, image = ? WHERE id = ?";

    db.query(sql, [title, description, image, courseId], (err) => {
        if (err) {
            console.error("Error updating course:", err);
            return res.status(500).json({ success: false, message: "Failed to update course." });
        }

        res.json({ success: true, message: "Course updated successfully!" });
    });
};

exports.getLessons = (req, res) => {
    const courseId = req.params.courseId;

    const sql = `
        SELECT l.id AS lesson_id, l.title AS lesson_title, ll.video_url
        FROM lessons l
        LEFT JOIN lesson_links ll ON l.id = ll.lesson_id
        WHERE l.course_id = ?
        ORDER BY l.id
    `;

    db.query(sql, [courseId], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error fetching lessons" });
        }

        const lessonsMap = {};
        results.forEach((row) => {
            if (!lessonsMap[row.lesson_id]) {
                lessonsMap[row.lesson_id] = {
                    id: row.lesson_id,
                    name: row.lesson_title,
                    links: []
                };
            }

            if (row.video_url) {
                lessonsMap[row.lesson_id].links.push(row.video_url);
            }
        });

        res.json({ success: true, lessons: Object.values(lessonsMap) });
    });
};

exports.updateLessons = (req, res) => {
    const courseId = req.params.courseId;
    const { lessons } = req.body;

    if (!Array.isArray(lessons)) {
        return res.status(400).json({ success: false, message: "Lessons payload is required" });
    }

    db.query("SELECT id FROM lessons WHERE course_id = ?", [courseId], (err, existingLessons) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Error loading lessons" });
        }

        let remaining = existingLessons.length;

        if (remaining === 0) {
            return res.json({ success: true, message: "No lessons to update" });
        }

        existingLessons.forEach((lesson) => {
            db.query("DELETE FROM lesson_links WHERE lesson_id = ?", [lesson.id], (linkErr) => {
                if (linkErr) {
                    return res.status(500).json({ success: false, message: "Error updating lesson links" });
                }

                db.query("DELETE FROM lessons WHERE id = ?", [lesson.id], (deleteErr) => {
                    if (deleteErr) {
                        return res.status(500).json({ success: false, message: "Error updating lessons" });
                    }

                    remaining -= 1;
                    if (remaining === 0) {
                        let completed = 0;

                        if (lessons.length === 0) {
                            return res.json({ success: true, message: "Lessons updated successfully" });
                        }

                        lessons.forEach((lessonItem) => {
                            db.query("INSERT INTO lessons (course_id, title) VALUES (?, ?)", [courseId, lessonItem.name], (insertErr, insertResult) => {
                                if (insertErr) {
                                    return res.status(500).json({ success: false, message: "Error saving lesson" });
                                }

                                const lessonId = insertResult.insertId;
                                const links = Array.isArray(lessonItem.links) ? lessonItem.links : [];

                                if (links.length === 0) {
                                    completed += 1;
                                    if (completed === lessons.length) {
                                        return res.json({ success: true, message: "Lessons updated successfully" });
                                    }
                                    return;
                                }

                                let linkCount = 0;
                                links.forEach((link) => {
                                    db.query("INSERT INTO lesson_links (lesson_id, video_url) VALUES (?, ?)", [lessonId, link], (videoErr) => {
                                        if (videoErr) {
                                            return res.status(500).json({ success: false, message: "Error saving lesson link" });
                                        }

                                        linkCount += 1;
                                        if (linkCount === links.length) {
                                            completed += 1;
                                            if (completed === lessons.length) {
                                                return res.json({ success: true, message: "Lessons updated successfully" });
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            });
        });
    });
};