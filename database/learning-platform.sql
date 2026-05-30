create database test_learning;
use test_learning;

create table test_users(
	id int auto_increment primary key,
    name varchar(100)
);

insert into test_users (name) values ('Raghvendra');

select *from test_users;

create database learning_platform_db;
use learning_platform_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('student', 'instructor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, role)
VALUES ('Test User', 'test@example.com', 'student');

SELECT * FROM users;

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id)
);

INSERT INTO courses (title, description, instructor_id)
VALUES ('Introduction to AI', 'Learn the basics of AI', 1);

INSERT INTO courses (title, description, instructor_id)
VALUES ('Introduction to DSA', 'Learn the basics of DSA', 1);

SELECT * FROM courses;

CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    lesson_order INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO lessons (course_id, title, content, lesson_order)
VALUES (1, 'Introduction to AI', 'This lesson covers AI basics', 1);

INSERT INTO lessons (course_id, title, content, lesson_order)
VALUES (2, 'AI and Alan Turing', 'This lesson covers the 4 principles of the AI and also about the Alan Turing', 1);

INSERT INTO lessons (course_id, title, content, lesson_order)
VALUES (1, 'AI and Alan Turing', 'This lesson covers the 4 principles of the AI and also about the Alan Turing', 2);
SELECT * FROM lessons;


