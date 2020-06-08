const { client } = require("./client");

async function createActivity({ name, description }) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      RETURNING *;
      `,
      [name, description]
    );

    return activity;
  } catch (error) {
    throw error;
  }
}

// updateActivity({ id, name, description })
// don't try to update the id
// do update the name and description
// return the updated activity

// ***NEED TO FINISH***

async function updateActivity({ id, name, description }) {
  try {
    await client.query(
      `
          UPDATE activities
          SET name = $2, description = $3
          WHERE id=$1
          RETURNING *;
        `,
      [id, name, description]
    );
  } catch (error) {
    console.error(error);
  }
}

async function getAllActivities() {
  try {
    const { rows: activityIds } = await client.query(`
        SELECT id
        FROM activities;
      `);
    const activities = await Promise.all(
      activityIds.map((activity) => getActivityById(activity.id))
    );
    return activities;
  } catch (error) {
    throw error;
  }
}

async function getActivityById(activityId) {
  try {
    const {
      rows: [activity],
    } = await client.query(
      `
        SELECT *
        FROM activities
        WHERE id=$1;
        `,
      [activityId]
    );

    if (!activity) {
      throw {
        name: "ActivityNotFoundError",
        message: "Could not find an activity with that activityId",
      };
    }

    const { rows: routines } = await client.query(
      `
        SELECT routines.*
        FROM routines
        JOIN routine_activities ON routines.id=routine_activities."routineId"
        WHERE routine_activities."activityId"=$1;
        `,
      [activityId]
    );

    // const {
    //   rows: [author],
    // } = await client.query(
    //   `
    //     SELECT id, username, name, location
    //     FROM users
    //     WHERE id=$1;
    //   `,
    //   [activity.authorId]
    // );

    // activity.routines = routines;
    // activity.author = author;

    // delete activity.authorId;

    return activity;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  createActivity,
  getActivityById,
  updateActivity,
};
