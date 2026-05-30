CREATE DATABASE elearning_db;
USE elearning_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    interests TEXT
);


CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image VARCHAR(500),
    description TEXT
);

CREATE TABLE lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT,
    title VARCHAR(255) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lesson_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT,
    video_url VARCHAR(500),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE user_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    course_name VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER USER 'root'@'localhost'
IDENTIFIED WITH mysql_native_password
BY 'Raghav@2006';

FLUSH PRIVILEGES;

SELECT id, username, email, role FROM users WHERE role = 'admin';
select *from users;

ALTER TABLE users ADD UNIQUE (email);

DESCRIBE users;

