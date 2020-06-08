const { client } = require("./client");
// const client = new Client("postgres://localhost:5432/fitness-dev");

module.exports = {
  ...require("./client"),
  ...require("./users"),
  ...require("./activities"),
  ...require("./routines"),
  ...require("./routine_activities"),
};
