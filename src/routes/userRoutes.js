const router = require("express").Router();
const userController = require("../controllers/userController");

router.get("/get-users", userController.getUsers);
router.delete("/delete-user/:id", userController.deleteUser);
router.get("/get-registrations", userController.getRegistrations);
router.get("/user-courses", userController.getUserCourses);
router.post("/update-profile", userController.updateProfile);

module.exports = router;