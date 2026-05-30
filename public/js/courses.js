document.addEventListener("DOMContentLoaded", async function () {
    const coursesContainer = document.getElementById("coursesContainer");

    async function fetchCourses() {
        try {
            const response = await fetch(`${window.location.origin}/get-courses`);
            const data = await response.json();

            if (!data.success) throw new Error(data.message);

            coursesContainer.innerHTML = ""; // Clear existing content

            data.courses.forEach(course => {
                const courseElement = document.createElement("div");
                courseElement.classList.add("course-card");
                courseElement.innerHTML = `
                    <img src="${course.image}" alt="${course.title}">
                    <h2>${course.title}</h2>
                    <p>${course.description}</p>
                `;

                //Making course card clickable
                courseElement.addEventListener("click", () => {
                    window.location.href = `course.html?courseId=${course.id}`; 
                });
                coursesContainer.appendChild(courseElement);
            });

        } catch (error) {
            coursesContainer.innerHTML = `<p style="color: red;">Error loading courses: ${error.message}</p>`;
        }
    }

    fetchCourses();  // Load courses when page loads
});

