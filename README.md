# Skillify

Skillify is a full-stack e-learning platform for browsing courses, viewing lessons, managing user profiles, and supporting an admin workflow for course and registration management. The project now exposes a structured `src/` backend, a MySQL database layer, and a static frontend built with HTML, CSS, and vanilla JavaScript.

## Project Overview

This repository contains a learning platform prototype with:

- public-facing pages for home, courses, login, registration, profile, about, and contact
- an admin area for login, dashboard, and course management
- backend APIs for authentication, user management, registrations, course management, and lesson updates
- MySQL-backed persistence for users, courses, lessons, and lesson links

## Features

- User registration and login
- Admin login and dashboard access
- Course listing and course detail views
- Lesson and video-link management
- Profile updates for logged-in users
- Contact page and landing-page marketing sections
- Responsive static assets organized by page type

## Tech Stack

- Backend: Node.js, Express
- Database: MySQL
- Security/Auth Utilities: bcrypt, dotenv, cors
- Frontend: HTML, CSS, Vanilla JavaScript
- Package Management: npm

## Installation

1. Install Node.js and MySQL.
2. Clone or open this repository in your local machine.
3. Install dependencies:

```bash
npm install
```

4. Create a local `.env` file from `.env.example` and set your database credentials.
5. Import one of the SQL scripts into MySQL to create the schema and seed data, or use the copies in `database/`.
6. Start the server:

```bash
npm start
```

## Usage

- Open the frontend pages from the `public/pages` directory in a browser, or serve the `public` folder from your preferred static server.
- Make sure the backend is running before attempting registration, login, course, or profile actions.
- Update the MySQL connection values in `.env` if your local database settings differ.

## Folder Structure

```text
Full Stack Development Project/
├── .env
├── .env.example
├── .gitignore
├── README.md
├── database/
│   ├── learning-platform.sql
│   └── schema.sql
├── db.js
├── docs/
│   └── PROJECT_STRUCTURE.md
├── package-lock.json
├── package.json
├── public/
│   ├── css/
│   ├── images/
│   ├── js/
│   └── pages/
├── registration_server.js
├── SQL Code for FSDL Project.sql
├── SQL Code for learning platform.sql
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── courseController.js
    │   └── userController.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── notFound.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── courseRoutes.js
    │   └── userRoutes.js
    └── server.js
```

## Future Improvements

- Complete the migration by standardizing all frontend fetch URLs to a shared API base helper
- Split database SQL into clearer schema and seed files inside `database/`
- Add a `LICENSE` file for open-source clarity
- Add `CONTRIBUTING.md` for collaboration guidelines
- Add `docs/` for architecture notes, API references, and deployment steps
- Add automated tests and a linting workflow
- Add a centralized `assets/` structure if the static frontend grows further

## Author

Prepared for a GitHub-ready portfolio structure based on the existing project workspace.

## Repository Hygiene Notes

- `node_modules/` and `.env` are intentionally ignored through `.gitignore`
- The root SQL files are preserved, but the recommended long-term home is `database/`
- The backend now reads database settings from environment variables with safe defaults for local development
- Text files are normalized with `.gitattributes` so Git handles line endings consistently across Windows and non-Windows machines