// activities

const express = require("express");
const activitiesRouter = express.Router();
const { requireUser } = require("./utils");
const {
  createActivity,
  getAllActivities,
  updateActivity,
  getPublicRoutinesByActivity,
} = require("../db");

// ***GET /activities
// Just return a list of all activities in the database

activitiesRouter.get("/", async (req, res) => {
  //   try {
  const allActivities = await getAllActivities();
  console.log(allActivities, "This is all activities");
  res.send({ allActivities });
  //   } catch (error) {
  //     console.error(error);
  //   }
});

// ***POST /activities (*)
// Create a new activity

activitiesRouter.post("/", requireUser, async (req, res, next) => {
  try {
    const activity = await createActivity(req.body);
    console.log(activity, "This is a newly created activity");
    res.send({ activity });
  } catch (error) {
    console.error(error);
  }
});

// ***PATCH /activities/:activityId (*)
// Anyone can update an activity (yes, this could lead to long term problems a la wikipedia)

activitiesRouter.patch("/:activityId", requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;

  const updateFields = {};

  if (name) {
    updateFields.name = name;
  }

  if (description) {
    updateFields.description = description;
  }

  try {
    const originalActivity = await getActivityById(activityId);

    if (originalActivity.author.id === req.user.id) {
      const updatedActivity = await updateActivity(activityId, updateFields);

      res.send({ activity: updatedActivity });
    } else {
      next({
        name: "UnauthorizedUserError",
        description: "You cannot update an activity that is not yours",
      });
    }
  } catch ({ name, description }) {
    next({ name, description });
  }
});

// ***GET /activities/:activityId/routines
// Get a list of all public routines which feature that activity
activitiesRouter.get("/:activityId", async (req, res) => {
  try {
    const publicRoutinesByActivity = await getPublicRoutinesByActivity(
      activityId
    );

    res.send({ publicRoutinesByActivity });
  } catch (error) {
    console.error(error);
  }
});

module.exports = activitiesRouter;
