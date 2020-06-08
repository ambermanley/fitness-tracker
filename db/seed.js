const { client } = require("./client");

const bcrypt = require("bcrypt");

const { createUser, getUser, updateUser } = require("./users");

const {
  updateActivity,
  createActivity,
  getAllActivities,
} = require("./activities");

const {
  getAllRoutines,
  getAllRoutinesByUser,
  createRoutine,
  updateRoutine,
  getPublicRoutines,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
} = require("./routines");

const {
  addActivityToRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
} = require("./routine_activities");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
        DROP TABLE IF EXISTS routine_activities;
        DROP TABLE IF EXISTS routines;
        DROP TABLE IF EXISTS activities;
        DROP TABLE IF EXISTS users;
        `);
    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");
    await client.query(`
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL
        );

        CREATE TABLE activities (
            id SERIAL PRIMARY KEY,
            name varchar(255) UNIQUE NOT NULL,
            description TEXT NOT NULL
            );

        CREATE TABLE routines (
            id SERIAL PRIMARY KEY,
            "creatorId" INTEGER REFERENCES users (id),
            public BOOLEAN DEFAULT false,
            name VARCHAR(255) UNIQUE NOT NULL,
            goal TEXT NOT NULL
        );

        CREATE TABLE routine_activities (
            id SERIAL PRIMARY KEY,
            "routineId" INTEGER REFERENCES routines (id),
            "activityId" INTEGER REFERENCES activities (id),
            duration INTEGER,
            count INTEGER,
            UNIQUE("routineId", "activityId")
        );

        `);
    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function createInitialUsers() {
  const SALT_COUNT = 10;
  try {
    console.log("Starting to create users...");
    bcrypt.hash("booya00", SALT_COUNT, function (err, hashedPassword) {
      createUser({
        username: "amberella",
        password: hashedPassword,
      });
    });

    bcrypt.hash("purplePuppiezBKute99", SALT_COUNT, function (
      err,
      hashedPassword
    ) {
      createUser({
        username: "dee-dee",
        password: hashedPassword,
      });
    });

    bcrypt.hash("iLoveAmberella", SALT_COUNT, function (err, hashedPassword) {
      createUser({
        username: "benfrank",
        password: hashedPassword,
      });
    });

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function createInitialActivities() {
  try {
    console.log("Starting to create activities...");
    await createActivity({
      name: "Jumping Jacks",
      description: "Do 50 jumping jacks",
    });

    await createActivity({
      name: "Push ups",
      description: "Do 50 push ups",
    });

    await createActivity({
      name: "Burpees",
      description: "Do 75 burpees",
    });
  } catch (error) {
    console.error(error);
  }
}

async function createInitialRoutines() {
  try {
    console.log("Starting to create routines...");
    await createRoutine({
      creatorId: 1,
      public: true,
      name: "Buff Drills",
      goal: "3 reps of jumping jacks, push ups and burpees",
    });

    await createRoutine({
      creatorId: 1,
      public: true,
      name: "Wake Up Routine",
      goal:
        "3 reps of mountain climbers, donkey kicks and jumping squats...STRETCH in between reps!",
    });

    await createRoutine({
      creatorId: 2,
      public: false,
      name: "Arms",
      goal: "3 reps of curls, push ups and punching bag jabs",
    });

    await createRoutine({
      creatorId: 3,
      public: false,
      name: "Glutes",
      goal: "3 reps of sumo squats, bridges and an exercise of your choice",
    });
  } catch (error) {
    throw error;
  }
}

async function createInitialRoutineActivities() {
  try {
    console.log("Starting to create routine_activities...");
    await addActivityToRoutine({
      routineId: 2,
      activityId: 1,
      count: 3,
      duration: 5,
    });

    await addActivityToRoutine({
      routineId: 1,
      activityId: 1,
      count: 3,
      duration: 5,
    });
  } catch (error) {
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialActivities();
    await createInitialRoutines();
    await createInitialRoutineActivities();
  } catch (error) {
    console.log("Error during rebuildDB");
    throw error;
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");
    console.log("Calling getUser");
    const users = await getUser();
    console.log("Result:", users);
    console.log("Calling getAllActivities");
    const activities = await getAllActivities();
    console.log("Result:", activities);
    console.log("Calling getAllRoutines");
    const routines = await getAllRoutines();
    console.log("Result:", routines);
    console.log("Calling getPublicRoutinesByActivity");
    const publicRoutines = await getPublicRoutinesByActivity({
      activityId: 2,
      activityId: 1,
    });
    console.log("Result:", publicRoutines);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
