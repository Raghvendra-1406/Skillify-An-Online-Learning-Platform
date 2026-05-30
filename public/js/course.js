document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get("courseId");

    const titleEl = document.getElementById("courseTitle");
    const descEl = document.getElementById("courseDescription");
    const imgEl = document.getElementById("courseImage");
    const lessonsContainer = document.getElementById("lessonsContainer");

    if (!courseId) {
        titleEl.textContent = "No course ID provided!";
        return;
    }

    try {
        const res = await fetch(`${window.location.origin}/course-details/${courseId}`);
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        const course = data.course;

        titleEl.textContent = course.title;
        descEl.textContent = course.description;
        imgEl.src = course.image;

        course.lessons.forEach(lesson => {
            const lessonEl = document.createElement("div");
            lessonEl.classList.add("lesson-card");
            lessonEl.innerHTML = `
                <h3>${lesson.title}</h3>
                <ul>
                    ${(lesson.links || []).map(link => `<li><a href="${link}" target="_blank">${link}</a></li>`).join("")}
                </ul>
            `;
            lessonsContainer.appendChild(lessonEl);
        });

    } catch (err) {
        lessonsContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
});
