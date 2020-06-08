const { client } = require("./client");

// createUser
// createUser({ username, password })
// make sure to hash the password before storing it to the database
async function createUser({ username, password }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
              INSERT INTO users(username, password)
              VALUES($1, $2)
              ON CONFLICT (username) DO NOTHING
              RETURNING *;
              `,
      [username, password]
    );
    console.log(user);
    return user;
  } catch (error) {
    throw error;
  }
}

// getUser
// getUser({ username, password })
// this should be able to verify the password against the hashed password

// **NEED TO FINISH...HASHING**
async function getUser() {
  try {
    const { rows } = await client.query(`
        SELECT id, username, password
        FROM users;
        `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT id, username
      FROM users
      WHERE id=${userId}
    `);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function updateUser({ id, username, password, name, location }) {
  try {
    await client.query(
      `
            UPDATE users
            SET username =$2, password=$3, name =$4, location=$5
            WHERE id=$1
            RETURNING *;
            `
    );
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username=$1
    `,
      [username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUser,
  updateUser,
  getUserByUsername,
  getUserById,
};
