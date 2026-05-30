document.addEventListener("DOMContentLoaded", function () {

    const logoutButton = document.getElementById("logout");
    const contentDiv = document.getElementById("content");

    // 🟢 LOGOUT FUNCTION
    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            
            // Clear session or token (adjust based on your authentication method)
            localStorage.removeItem("authToken"); // If using JWT/localStorage
            sessionStorage.removeItem("authToken");

            // Redirect to login page
            window.location.href = "login.html"; // Update the path if needed
        });
    }

    // 🟢 VIEW COURSES FUNCTION
    async function viewCourses() {
        contentDiv.innerHTML = "<h3>Loading courses...</h3>";

        try {
            const response = await fetch(`${window.location.origin}/get-courses`);
            const data = await response.json();

            if (!data.success) throw new Error(data.message);

            let courseList = `<h3>Available Courses</h3><div class="course-container">`;
            data.courses.forEach(course => {
                courseList += `
                    <div class="course-card">
                        <h4>${course.title}</h4>
                        <p>${course.description}</p>
                        <img src="${course.image}" alt="${course.title}" class="course-image">
                    </div>
                `;
            });
            courseList += "</div>";

            contentDiv.innerHTML = courseList;
        } catch (error) {
            contentDiv.innerHTML = `<p style="color: red;">Error fetching courses: ${error.message}</p>`;
        }
    }
    window.viewCourses = viewCourses;

    // 🟢 ADD COURSE FUNCTION
    window.showAddCourseForm = function () {
        contentDiv.innerHTML = `
            <h3>Add New Course</h3>
            <form id="addCourseForm">
                <label>Course Title:</label>
                <input type="text" id="courseTitle" required placeholder="Enter course title">
    
                <label>Description:</label>
                <textarea id="courseDescription" required placeholder="Enter course description"></textarea>
    
                <label>Image URL:</label>
                <input type="text" id="courseImage" required placeholder="Enter image URL">

                <div id="lessonContainer">
                </div>

                <button type="button" id="addLessonField">➕Add Lesson Field</button><br>
                <button type="submit">Submit Course</button>
            </form>
        `;
        
        document.getElementById("addLessonField").addEventListener("click", addLessonField);
        document.getElementById("addCourseForm").addEventListener("submit", handleFullCourseSubmit);
    };
    let currentCourseId = null;

    //To add the Lessons and the links field
    let lessonCount = 1;

    function addLessonField() {
        const container = document.getElementById("lessonContainer");
        if (!container) {
            console.error("Lesson container not found");
            return;
        }

        lessonCount++;

        const lessonDiv = document.createElement("div");
        lessonDiv.classList.add("lesson");

        lessonDiv.innerHTML = `
            <label>Lesson Title:</label>
            <input type="text" name="lessonTitle[]" placeholder="Enter lesson title">

            <label>Video Link:</label>
            <input type="text" name="lessonLink[]" placeholder="Enter video link">

            <button type="button" onclick="removeLesson(this)">➖Remove</button>
        `;
        
        container.appendChild(lessonDiv);
    };

    // Function to remove a lesson
    window.removeLesson = function(button) {
        const lessonDiv = button.parentElement; // remove the parent <div> of the button
        if (lessonDiv) {
            lessonDiv.remove();
        } else {
            console.error("Lesson div not found");
        }
    };
    

    //Submits the course and the lessons
    async function handleFullCourseSubmit(e) {
        e.preventDefault();
    
        const title = document.getElementById("courseTitle").value;
        const image = document.getElementById("courseImage").value;
        const description = document.getElementById("courseDescription").value;
    
        // Collect all lesson titles and links
        const lessonTitles = Array.from(document.getElementsByName("lessonTitle[]")).map(input => input.value.trim());
        const lessonLinks = Array.from(document.getElementsByName("lessonLink[]")).map(input => input.value.trim());
    
        const lessons = lessonTitles.map((lesson, index) => ({
            lessonTitle: lesson,
            videoLink: lessonLinks[index]
        }));
    
        try {
            // Step 1: Add the course
            const courseRes = await fetch(`${window.location.origin}/add-course`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, image, description })
            });
    
            const courseData = await courseRes.json();
            const courseId = courseData.courseId;
    
            // Step 2: Add lessons for the course
            if (lessons.length > 0) {
                const lessonRes = await fetch(`${window.location.origin}/add-lesson`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        courseId,
                        lessons: lessons
                    })
                });
    
                if (!lessonRes.ok) throw new Error("Failed to add lessons");
    
                alert("Course and all lessons added successfully!");
            } else {
                alert("No lessons to add.");
            }
    
            // Clear the form
            e.target.reset();
            document.getElementById("lessonContainer").innerHTML = ""; // Clear lesson fields
    
        } catch (err) {
            console.error("Error:", err);
            alert("An error occurred while adding the course or lessons.");
        }
    };
    

    // 🟢 DELETE COURSE FUNCTION
    window.showDeleteCourseForm = async function () {
        contentDiv.innerHTML = `<h3>Delete Course</h3><p>Loading courses...</p>`;
    
        try {
            const response = await fetch(`${window.location.origin}/get-courses`);
            const data = await response.json();
    
            if (!data.success) throw new Error(data.message);
    
            if (data.courses.length === 0) {
                contentDiv.innerHTML = `<p style="color: red;">No courses available to delete.</p>`;
                return;
            }
    
            let deleteForm = `
                <form id="deleteCourseForm">
                    <label>Select Course to Delete:</label>
                    <select id="courseSelect">
                        ${data.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join("")}
                    </select>
                    <button type="submit">Delete Course</button>
                </form>
            `;
    
            contentDiv.innerHTML = deleteForm;
    
            // Adding the event listener after the form is populated
            document.getElementById("deleteCourseForm").addEventListener("submit", async function (event) {
                event.preventDefault();
    
                // Get the selected course ID when the form is submitted
                const selectedCourseId = document.getElementById("courseSelect").value;
    
                if (!selectedCourseId) {
                    alert("Please select a course!");
                    return;
                }
    
                const confirmDelete = confirm("Are you sure you want to delete this course?");
                if (!confirmDelete) return;
    
                try {
                    const deleteResponse = await fetch(`${window.location.origin}/delete-course/${selectedCourseId}`, { method: "DELETE" });
                    const deleteData = await deleteResponse.json();
    
                    alert(deleteData.message);
    
                    if (deleteData.success) {
                        viewCourses(); // Refresh courses list after deletion
                    }
                } catch (error) {
                    console.error("❌ Error deleting course:", error);
                }
            });
        } catch (error) {
            contentDiv.innerHTML = `<p style="color: red;">Error loading courses: ${error.message}</p>`;
        }
    };

    // 🟢 EDIT COURSE FUNCTION
    window.manageCourses = async function () {
        contentDiv.innerHTML = `<h3>Loading courses for editing...</h3>`;

        try {
            const response = await fetch(`${window.location.origin}/get-courses`);
            const data = await response.json();

            if (!data.success) throw new Error(data.message);

            if (data.courses.length === 0) {
                contentDiv.innerHTML = `<p>No courses available for editing.</p>`;
                return;
            }

            let selectHTML = `
                <h3>Edit Course</h3>
                <form id="selectCourseForm">
                    <label>Select a course:</label>
                    <select id="editCourseSelect" required>
                        <option value="">-- Select Course --</option>
                        ${data.courses.map(course => `<option value="${course.id}">${course.title}</option>`).join("")}
                    </select>
                    <button type="submit">Edit Course</button>
                </form>
            `;
            contentDiv.innerHTML = selectHTML;

            document.getElementById("selectCourseForm").addEventListener("submit", function (event) {
                event.preventDefault();
                const selectedCourseId = document.getElementById("editCourseSelect").value;
                if (selectedCourseId) {
                    editCourse(selectedCourseId);
                }
            });
        } catch (error) {
            console.error("❌ Error managing courses:", error);
        }
    };

    async function showEditForm(course) {
        try {
            // Fetch lessons for the course
            const lessonsResponse = await fetch(`${window.location.origin}/get-lessons/${course.id}`);
            const lessonsData = await lessonsResponse.json();

            if (!lessonsData.success) throw new Error(lessonsData.message);

            // Create course editing form
            let formHTML = `
                <h3>Edit Course: ${course.title}</h3>
                <form id="editCourseForm">
                    <label>Title:</label>
                    <input type="text" id="editTitle" value="${course.title}" required>

                    <label>Description:</label>
                    <textarea id="editDescription" required>${course.description}</textarea>

                    <label>Image URL:</label>
                    <input type="text" id="editImage" value="${course.image}" required>

                    <button type="submit">Update Course</button>
                </form>
                <h4>Edit Lessons</h4>
                <div id="editLessonsContainer">
            `;

            lessonsData.lessons.forEach((lesson, index) => {
                const lessonId = lesson.id;
                formHTML += `
                    <div class="lessonEditBlock" data-lesson-id="${lessonId}">
                        <input type="text" class="lessonName" value="${lesson.name}" placeholder="Lesson Name">
                        <div class="videoLinksContainer">
                            ${lesson.links.map(link => `
                                <input type="text" class="lessonLink" value="${link}" placeholder="Video Link">
                            `).join("")}
                        </div>
                    </div>
                `;
            });

            formHTML += `
                </div>
                <button onclick="updateCourse(${course.id})">✅ Save Changes</button>
            `;

            contentDiv.innerHTML = formHTML;

            document.getElementById("editCourseForm").addEventListener("submit", function (event) {
                event.preventDefault();
                updateCourse(course.id);
            });

        } catch (error) {
            console.error("❌ Error loading course and lessons:", error);
            contentDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    }

    // Function to update course details and lessons
    async function updateCourse(courseId) {
        const title = document.getElementById("editTitle").value.trim();
        const description = document.getElementById("editDescription").value.trim();
        const image = document.getElementById("editImage").value.trim();

        const lessonBlocks = document.querySelectorAll(".lessonEditBlock");
        const lessons = [];

        lessonBlocks.forEach(block => {
            const name = block.querySelector(".lessonName").value.trim();
            const links = Array.from(block.querySelectorAll(".lessonLink"))
                               .map(input => input.value.trim())
                               .filter(link => link);

            if (name && links.length) {
                lessons.push({ name, links });
            }
        });

        try {
            // Update course details
            const courseResponse = await fetch(`${window.location.origin}/update-course/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, description, image })
            });
            const courseResult = await courseResponse.json();

            if (!courseResult.success) {
                alert("Failed to update course.");
                return;
            }

            // Update lessons
            const lessonResponse = await fetch(`${window.location.origin}/update-lessons/${courseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessons })
            });
            const lessonResult = await lessonResponse.json();

            if (lessonResult.success) {
                alert("Course and lessons updated successfully!");
                viewCourses(); // Refresh course view
            } else {
                alert("Course updated but failed to update lessons.");
            }

        } catch (error) {
            console.error("❌ Error updating course or lessons:", error);
            alert("Error updating course.");
        }
    }
});
 