const router = require("express").Router();
const courseController = require("../controllers/courseController");

router.get("/get-courses", courseController.getCourses);
router.get("/course-details/:courseId", courseController.getCourseDetails);
router.post("/add-course", courseController.addCourse);
router.post("/add-lesson", courseController.addLessons);
router.delete("/delete-course/:id", courseController.deleteCourse);
router.get("/course/:id", courseController.getCourseById);
router.put("/update-course/:id", courseController.updateCourse);
router.get("/get-lessons/:courseId", courseController.getLessons);
router.put("/update-lessons/:courseId", courseController.updateLessons);

module.exports = router;