// routine_activities

const express = require("express");
const routine_activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  destroyRoutineActivity,
  updateRoutineActivity,
  addActivityToRoutine,
} = require("../db");

// ***PATCH /routine_activities/:routineActivityId (**)
// Update the count or duration on the routine activity
routine_activitiesRouter.patch(
  ":/routineActivityId",
  requireUser,
  async (req, res, next) => {
    console.log("Updating a routineActivity");

    const { routineActivityId } = req.params;
    const { count, duration } = req.body;

    const updateFields = {};

    if (count) {
      updateFields.count = count;
    }

    if (duration) {
      updateFields.duration = duration;
    }

    try {
      const originalRoutineActivity = await addActivityToRoutine(req.params);

      if (originalRoutineActivity.author.id === req.user.id) {
        const updatedRoutineActivity = await updateRoutineActivity(
          routineActivityId,
          updateFields
        );

        res.send({ routineActivity: updatedRoutineActivity });
      } else {
        next({
          count: "You cannot update the count if you are not the creator",
          duration: "You cannot update the duration if you are not the creator",
        });
      }
    } catch ({ count, duration }) {
      next({ count, duration });
    }
  }
);

// ***DELETE /routine_activities/:routineActivityId (**)
// Remove an activity from a routine, use hard delete

//** WHERE IS routineActivityId??? */

routine_activitiesRouter.delete(
  "/:routineActivityId",
  requireUser,
  async (req, res, next) => {
    console.log("Deleting rountineActivity");
    try {
      const deletedRoutineActivity = await destroyRoutineActivity(
        routineActivityId
      );

      res.send(deletedRoutineActivity);
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = routine_activitiesRouter;
