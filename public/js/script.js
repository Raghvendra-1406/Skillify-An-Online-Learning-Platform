document.addEventListener('DOMContentLoaded', function() {
    const enrollNowButton = document.getElementById('enroll-now-button');

    if (enrollNowButton) {
        enrollNowButton.addEventListener('click', function() {
            // Show loading indicator by changing button text
            this.textContent = 'Enrolling...';

            // Simulate enrollment process with a timeout
            setTimeout(function() {
                // Return button text to normal
                enrollNowButton.textContent = 'Enroll Now';

                // Show confirmation message (replace with a better confirmation UI if needed)
                alert('You have successfully enrolled! You will be redirected to the courses page.');

                // Redirect to the courses page
                window.location.href = 'courses.html';

            }, 2000); // Simulate 2 seconds of loading time
        });
    }
     // Get Started Button
    const getStartedButton = document.getElementById('get-started-button');
    const coursesPreview = document.getElementById('courses-preview');
    if (getStartedButton && coursesPreview) {
        getStartedButton.addEventListener('click', function() {
            coursesPreview.scrollIntoView({ behavior: 'smooth' });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const features = document.querySelectorAll('.feature.clickable');

    features.forEach(feature => {
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('details-info');
        detailsDiv.textContent = feature.dataset.details;
        detailsDiv.style.display = 'none';
        feature.appendChild(detailsDiv);

        feature.addEventListener('click', function() {
            detailsDiv.style.display = (detailsDiv.style.display === 'block') ? 'none' : 'block';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const sentbtn = document.getElementById('send-message-button');
    if(sentbtn){
        sentbtn.addEventListener('click', function(){

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            const subject = document.getElementById('subject').value.trim();

            if(name == '' || email == '' || message == '' || subject == ''){
                alert("Please fill all the fields.");
                return;
            }
            
            alert('Your message has sended suceessfully!');

            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('message').value = '';
            document.getElementById('subject').value = '';
        })
    }
})