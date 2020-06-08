const { client } = require("./client");

//  ***include their activities?
async function getAllRoutines() {
  try {
    const { rows } = await client.query(`
        SELECT *
        FROM routines;
      `);
    return rows;
  } catch (error) {
    throw error;
  }
}

//  ***include their activities?
async function getPublicRoutines() {
  try {
    const { rows } = await client.query(`
        SELECT public
        FROM routines;
        `);
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routineIds } = await client.query(`
        SELECT id
        FROM routines
        WHERE "authorId"=${username}
      `);
    const routines = await Promise.all(
      routineIds.map((routine) => getRoutineById(routine.id))
    );
    return routines;
  } catch (error) {
    throw error;
  }
}

// getPublicRoutinesByUser
// getPublicRoutinesByUser({ username })
// select and return an array of public routines made by user, include their activities

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows } = await client.query(
      `
            SELECT r.*
            FROM routines r
            JOIN users ON users.id = r."creatorId"
            WHERE users.username=${username}
            `
    );
    // const routines = await Promise.all(
    //   routineIds.map((routine) => getRoutineById(routine.id))
    // );
    return rows;
  } catch (error) {
    throw error;
  }
}

// getPublicRoutinesByActivity
// getPublicRoutinesByActivity({ activityId })
// select and return an array of public routines which have a specific activityId in their routine_activities join, include their activities

async function getPublicRoutinesByActivity({ activityId }) {
  try {
    const { rows } = await client.query(
      `
            SELECT r.*
            FROM routines r
            JOIN routine_activities ra ON r.id = ra."routineId"
            JOIN activities a ON a.id = ra."activityId"
            WHERE "activityId"=${activityId} AND r.public = true
            `
    );
    console.log(rows);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function createRoutine({ creatorId, public, name, goal }) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
        INSERT INTO routines("creatorId", public, name, goal)
        VALUES($1, $2, $3, $4)
        RETURNING *;
        `,
      [creatorId, public, name, goal]
    );

    // const activityList = await createActivity(activities);

    return routine;
  } catch (error) {
    throw error;
  }
}

async function updateRoutine({ id, public, name, goal }) {
  try {
    await client.query(
      `
            UPDATE routines
            SET name = $3, public = $2, goal = $4
            WHERE id=$1
            RETURNING *;
            `,
      [id, public, name, goal]
    );
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineById(routineId) {
  try {
    const {
      rows: [routine],
    } = await client.query(
      `
              SELECT *
              FROM routines
              WHERE id=$1
              `,
      [routineId]
    );

    if (!routine) {
      throw {
        name: "RoutineNotFoundError",
        message: "Could not find a routine with that routineId",
      };
    }

    const { row: activities } = await client.query(
      `
              SELECT activities.*
              FROM activities
              JOIN routine_activities ON activities.id=routine_activities."activityId"
              WHERE routine_activities."routineId"=$1;
          `,
      [routineId]
    );

    return routine;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllRoutines,
  getAllRoutinesByUser,
  createRoutine,
  updateRoutine,
  getPublicRoutines,
  getPublicRoutinesByUser,
  getRoutineById,
  getPublicRoutinesByActivity,
};
