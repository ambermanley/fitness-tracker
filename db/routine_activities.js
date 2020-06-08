const { client } = require("./client");

// addActivityToRoutine

// addActivityToRoutine({ routineId, activityId, count, duration })
// create a new routine_activity, and return it

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration,
}) {
  try {
    const {
      rows: [routine_activity],
    } = await client.query(
      `
            INSERT INTO routine_activities("routineId", "activityId", count, duration)
            VALUES($1, $2, $3, $4)
            RETURNING *;
            `,
      [routineId, activityId, count, duration]
    );
    return routine_activity;
  } catch (error) {
    throw error;
  }
}

// updateRoutineActivity

// updateRoutineActivity({ id, count, duration })
// Find the routine with id equal to the passed in id
// Update the count or duration as necessary
async function updateRoutineActivity({ id, count, duration }) {
  try {
    await client.query(
      `
            UPDATE routine_activities
            SET count = $2, duration = $3
            WHERE id=$1
            RETURNING *;
            `,
      [id, count, duration]
    );
  } catch (error) {
    console.error(error);
  }
}

// destroyRoutineActivity

// destroyRoutineActivity(id)
// remove routine_activity from database

async function destroyRoutineActivity(id) {
  try {
    await client.query(
      `
            DELETE FROM routine_activities
            WHERE id = ${id}
            `
    );
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
};
