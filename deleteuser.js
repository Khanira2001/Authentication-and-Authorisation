const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Initialize Sequelize (adjust your database configuration as needed)
const sequelize = new Sequelize('sqlite::memory:'); // Example for SQLite in-memory database

// Define UserModel
const UserModel = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

// Authentication and authorization middleware (dummy placeholders)
const authentication = (req, res, next) => {
    // Dummy authentication logic
    next();
};

const authorisation = (options) => (req, res, next) => {
    // Dummy authorization logic (options: { isAdmin: boolean })
    next();
};

// Delete user endpoint
app.post("/auth/delete/user", authentication, authorisation({ isAdmin: false }), async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const deletedUser = await UserModel.destroy({
            where: { username }
        });

        if (deletedUser) {
            return res.status(200).json({ message: `User ${username} has been deleted` });
        } else {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Serve the frontend HTML and JS
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Delete User</title>
        </head>
        <body>
            <form id="delete-user-form">
                <label for="other-username">Username to delete:</label>
                <input type="text" id="other-username" name="other-username" required>
                <button type="submit">Delete User</button>
            </form>

            <script>
                document.getElementById("delete-user-form").addEventListener("submit", async (event) => {
                    event.preventDefault();
                    const username = document.getElementById("other-username").value;

                    const response = await fetch(\`http://localhost:4001/auth/delete/user\`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            username
                        })
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alert(result.message);
                    } else {
                        alert(result.error);
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Sync database and start server
sequelize.sync().then(() => {
    app.listen(4001, () => {
        console.log('Server running on http://localhost:4001');
    });
}).catch(error => {
    console.error('Unable to connect to the database:', error);
});
