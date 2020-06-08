// routines

const express = require("express");
const routinesRouter = express.Router();
const { requireUser } = require("./utils");

const {
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
} = require("../db");

// ***GET /routines
// Return a list of public routines, include the activities with them
routinesRouter.get("/", async (req, res) => {
  try {
    const publicRoutines = await getPublicRoutinesByActivity(activityId);

    res.send({ publicRoutines });
  } catch (error) {
    console.error(error);
  }
});

// ***POST /routines (*)
// Create a new routine
routinesRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const routine = await createRoutine();

    res.send({ routine });
  } catch (error) {
    console.error(error);
  }
});

// ***PATCH /routines/:routineId (**)
// Update a routine, notably change public/private, the name, or the goal

routinesRouter.patch(":/routineId", requireUser, async (req, res, next) => {
  console.log("Updating a routine...");

  const { routineId } = req.params;
  const { public, name, goal } = req.body;

  const updateFields = {};

  if (public) {
    updateFields.public = public;
  }

  if (name) {
    updateFields.name = name;
  }

  if (goal) {
    updateFields.goal = goal;
  }

  try {
    const originalRoutine = await getRoutineById(routineId);

    if (originalRoutine.author.id === req.user.id) {
      const updatedRoutine = await updateRoutine(routineId, updateFields);

      res.send({ routine: updatedRoutine });
    } else {
      next({
        public: "You cannot change field if you are not the creator",
        name: "UnauthorizedUserError",
        goal: "You cannot update a goal that is not yours",
      });
    }
  } catch ({ public, name, goal }) {
    next({ public, name, goal });
  }
});

// ***DELETE /routines/:routineId (**)
// Hard delete a routine. Make sure to delete all the routineActivities whose routine is the one being deleted.

routinesRouter.delete(":/routineId", requireUser, async (req, res) => {
  console.log("Deleting routine...");
  try {
    const deletedRoutine = await destroyRoutineActivity(routineId);
    res.send(deletedRoutine);
  } catch (error) {
    console.log(error);
  }
});

// ***POST /routines/:routineId/activities
// Attach a single activity to a routine. Prevent duplication on (routineId, activityId) pair.

routinesRouter.post(
  ":/routineId/activities",
  requireUser,
  async (req, res, next) => {
    console.log("Attaching single activity to a routine");

    const { activityId, routineId } = req.params;

    try {
      const routineByActivity = await getPublicRoutinesByActivity(req.params);

      res.send({ routineByActivity });
    } catch (error) {
      console.error(error);
    }
  }
);

module.exports = routinesRouter;
