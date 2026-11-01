# Sedona Travel Blog

Jaden Patel — CS-312 Mini-Project 4

This project builds on my Sedona blog from Mini-Project 3. I added a React frontend for signing in and managing posts. Express handles the requests, and PostgreSQL saves the accounts and posts so they stay after restarting the server.

## Features

- Sign up, sign in, and log out.
- Create posts with a title and content.
- View posts with the author's name and creation date.
- Edit and delete only your own posts.
- See changes to the post list without reloading the page.
- Use the site on different screen sizes.

## Running the Project

Make sure Node.js, npm, and PostgreSQL are installed.

1. Clone the repository and open the project folder.
2. Run `npm install`.
3. Create a database named `blogdb` in pgAdmin.
4. Run `database/schema.sql`, then `database/seed.sql` in that database. Run the seed file once.
5. Copy `.env.example` to `.env` and fill in your database settings and a new `SESSION_SECRET`.
6. Run `node index.js` in the project folder.
7. Open a second terminal, run `cd client`, then run `npm install` and `npm run dev`.

Open `http://localhost:5173` in your browser. Press Ctrl+C in each terminal to stop the servers.

## Main Files

- `index.js` handles the server, accounts, and blog API routes.
- `db.js` connects to PostgreSQL.
- `client/src/App.jsx` shows the sign-in pages or blog feed.
- `client/src/components` contains the forms and post list.
- `client/src/index.css` styles the React pages.
- `database` contains the table setup and starting entries.

## Testing

I tested signing up, signing in, logging out, and creating, editing, and deleting posts. I also checked that users can only change their own posts and that posts stay saved after restarting the server.