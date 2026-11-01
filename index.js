const express = require("express"); // Set up Express and create the app
const app = express();
const db = require("./db");
const session = require("express-session");

app.use(express.json()); // Read JSON submitted by React

// Stay signed in
app.use(session({
    name: "blog.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    }
}));

// Send a test response to the React frontend
app.get("/api/test", function (req, res) {
    res.json({ message: "Express is working" });
});

// Tell React whether someone is already signed in
app.get("/api/me", function (req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: "You need to sign in" });
    }

    res.json({ user: req.session.user });
});

// End the current session
app.post("/api/logout", function (req, res) {
    req.session.destroy(function (error) {
        if (error) {
            return res.status(500).json({ error: "Could not log out" });
        }

        res.clearCookie("blog.sid", { path: "/" });
        res.json({ message: "Logged out" });
    });
});

// Create an account and return JSON to React
app.post("/api/signup", async function (req, res) {
    const userId = (req.body.user_id || "").trim();
    const password = req.body.password || "";
    const name = (req.body.name || "").trim();

    if (!userId || !password.trim() || !name) {
        return res.status(400).json({
            error: "Fill in all fields."
        });
    }

    if (userId.length > 255 || name.length > 255 ||
        Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({
            error: "Your user ID, name or password is too long."
        });
    }

    try {
        // Check whether the user ID is taken
        const result = await db.query(
            "SELECT user_id FROM users WHERE user_id = $1",
            [userId]
        );

        if (result.rows.length > 0) {
            return res.status(409).json({
                error: "That user ID is already taken."
            });
        }

        // Save the account with a hashed password
        await db.query(
            `INSERT INTO users (user_id, password, name)
             VALUES ($1, crypt($2, gen_salt('bf', 10)), $3)`,
            [userId, password, name]
        );

        res.status(201).json({
            message: "Account created sign in."
        });
    } catch (error) {
        console.error("Signup failed:", error.message);

        res.status(error.code === "23505" ? 409 : 500).json({
            error: error.code === "23505"
                ? "That user ID is already taken."
                : "Could not create your account try again."
        });
    }
});

// Check login information and return JSON to React
app.post("/api/signin", async function (req, res) {
    const userId = (req.body.user_id || "").trim();
    const password = req.body.password || "";

    if (!userId || !password ||
        Buffer.byteLength(password, "utf8") > 72) {
        return res.status(401).json({
            error: "User ID or password not right"
        });
    }

    try {
        const result = await db.query(
            `SELECT user_id, name FROM users
             WHERE user_id = $1
             AND password = crypt($2, password)`,
            [userId, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "User ID or password not right"
            });
        }

        // Start a fresh session after a successful sign-in
        req.session.regenerate(function (error) {
            if (error) {
                return res.status(500).json({
                    error: "try again could not log in"
                });
            }

            req.session.user = result.rows[0];

            req.session.save(function (error) {
                if (error) {
                    return res.status(500).json({
                        error: "try again could not log in"
                    });
                }

                res.json({ user: req.session.user });
            });
        });
    } catch (error) {
        console.error("Signin failed:", error.message);
        res.status(500).json({
            error: "try again could not log in"
        });
    }
});

// Send the blog feed to React
app.get("/api/posts", async function (req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Sign in" });
    }

    try {
        const result = await db.query(`
            SELECT blog_id AS id, creator_name AS author,
                   creator_user_id, title, body AS content,
                   date_created AS "createdAt"
            FROM blogs
            ORDER BY date_created DESC, blog_id DESC
        `);

        res.json({ posts: result.rows });
    } catch (error) {
        console.error("Could not load posts:", error.message);
        res.status(500).json({ error: "Could not load posts" });
    }
});

// Create a post from React
app.post("/api/posts", async function (req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Please sign in." });
    }

    const input = req.body || {};
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const content = typeof input.content === "string" ? input.content.trim() : "";

    if (!title || !content || title.length > 255) {
        return res.status(400).json({
            error: "Enter a title and content"
        });
    }

    try {
        const result = await db.query(
            `INSERT INTO blogs (creator_name, creator_user_id, title, body)
             VALUES ($1, $2, $3, $4)
             RETURNING blog_id AS id, creator_name AS author,
                       creator_user_id, title, body AS content,
                       date_created AS "createdAt"`,
            [req.session.user.name, req.session.user.user_id, title, content]
        );

        res.status(201).json({ post: result.rows[0] });
    } catch (error) {
        console.error("Could not create post", error.message);
        res.status(500).json({ error: "Could not save the post" });
    }
});

// Update a post from React, but only if the signed-in user created it
app.put("/api/posts/:id", async function (req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Sign in" });
    }

    const postId = Number(req.params.id);
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (!Number.isInteger(postId) || postId < 1 || postId > 2147483647) {
        return res.status(400).json({ error: "Invalid post ID" });
    }

    if (!title || !content || title.length > 255) {
        return res.status(400).json({ error: "Enter a title and content" });
    }

    try {
        const result = await db.query(
            `UPDATE blogs
             SET title = $1, body = $2
             WHERE blog_id = $3 AND creator_user_id = $4
             RETURNING blog_id AS id, creator_name AS author,
                       creator_user_id, title, body AS content,
                       date_created AS "createdAt"`,
            [title, content, postId, req.session.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Post not found or you cannot edit it"
            });
        }

        res.json({ post: result.rows[0] });
    } catch (error) {
        console.error("Could not update post:", error.message);
        res.status(500).json({ error: "Could not update post" });
    }
});

// Delete a post from React only when it belongs to the signed-in user
app.delete("/api/posts/:id", async function (req, res) {
    if (!req.session.user) {
        return res.status(401).json({ error: "Sign in" });
    }

    const postId = Number(req.params.id);

    if (!Number.isInteger(postId) || postId < 1 || postId > 2147483647) {
        return res.status(400).json({ error: "Invalid post ID" });
    }

    try {
        const result = await db.query(
            `DELETE FROM blogs
             WHERE blog_id = $1 AND creator_user_id = $2
             RETURNING blog_id`,
            [postId, req.session.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Post not found or you cannot delete it"
            });
        }

        res.json({ message: "Post deleted." });
    } catch (error) {
        console.error("Could not delete post:", error.message);
        res.status(500).json({ error: "Could not delete post" });
    }
});

// Start the server on port 3000
app.listen(3000, function () {
    console.log("Server running at http://localhost:3000");
});