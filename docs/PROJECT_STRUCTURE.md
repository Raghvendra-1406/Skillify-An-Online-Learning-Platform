# Project Structure Notes

This project keeps the original root files as backups and exposes the maintainable runtime code through `src/`.

## Primary Entry Points

- `src/server.js` starts the application
- `src/app.js` configures Express, middleware, static files, and routes
- `src/config/db.js` contains the MySQL connection

## Notes

- The legacy root files are intentionally preserved
- Database SQL files are being normalized into `database/`
- Frontend assets remain under `public/`