const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19IndiaPortal.db");
let db = null;
const initializeAndDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};
initializeAndDBServer();
// API 1
// Path: /login/
// Method: POST
// get JWT token using jsonwebtoken package
// const JWTToken = jwt.sign(payload,'own_secret_key');
// payload is user information
//     Scenarios
// 1)Invalid user
//  2)Invalid password
//  3) Return the JWT Token
app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  //check the user
  const userDetailsQuery = `select * from user where username = '${username}';`;
  const userDetails = await db.get(userDetailsQuery);
  if (userDetails !== undefined) {
    const isPasswordValid = await bcrypt.compare(
      password,
      userDetails.password
    );
    if (isPasswordValid) {
      //get JWT Token
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "TANVEER_SECRET_KEY");
      response.send({ jwtToken }); //scenario 3
      console.log(jwtToken);
    } else {
      response.status(400);
      response.send("Invalid password"); // scenario 2
    }
  } else {
    response.status(400);
    response.send("Invalid user"); // scenario 1
  }
});

//            Authentication with Token
//    Scenarios
//1) If the token is not provided by the user or an invalid token-->Invalid JWT Token
// 2) After successful verification of token proceed to next middleware or handler
// get JWT token from headers and validate using jwt.verify
//jwt.verify(jwtToken , 'secret key given above' , callback function)

function authenticationToken(request, response, next) {
  let jwtToken;
  const authHeader = request.headers.authorization;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken !== undefined) {
    jwt.verify(jwtToken, "TANVEER_SECRET_KEY", async (error, payload) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        next();
      }
    });
  } else {
    response.status(401);
    response.send("Invalid JWT Token");
  }
}
//                           API 2
//Returns a list of all states in the state table
// get the results if the user has authentication
const convertStateDbObject = (objectItem) => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  };
};
app.get("/states/", authenticationToken, async (request, response) => {
  const getStatesQuery = `select * from state;`;
  const getStates = await db.all(getStatesQuery);
  response.send(getStates.map((eachState) => convertStateDbObject(eachState)));
});

//                                       API 3
// Returns a state based on the state ID
// only authenticated users get the details

app.get("/states/:stateId/", authenticationToken, async (request, response) => {
  const { stateId } = request.params;
  const getStateDetailsQuery = `select * from state where state_id = ${stateId};`;
  const getStateDetails = await db.get(getStateDetailsQuery);
  response.send(convertStateDbObject(getStateDetails));
});

//                    API 4
//Create a district in the district table, district_id is auto-incremented
// only authenticated users can post the data

app.post("/districts/", authenticationToken, async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const createDistrictQuery = `insert into district(district_name,state_id,cases,cured,active,deaths) 
  values('${districtName}',${stateId},${cases},${cured},${active},${deaths});`;
  const createDistrict = await db.run(createDistrictQuery);
  response.send(`District Successfully Added`);
});

//            API 5
//Returns a district based on the district ID
const convertDbObjectDistrict = (objectItem) => {
  return {
    districtId: objectItem.district_id,
    districtName: objectItem.district_name,
    stateId: objectItem.state_id,
    cases: objectItem.cases,
    cured: objectItem.cured,
    active: objectItem.active,
    deaths: objectItem.deaths,
  };
};
app.get(
  "/districts/:districtId/",
  authenticationToken,
  async (request, response) => {
    const { districtId } = request.params;
    const getDistrictByIdQuery = `select * from district where district_id=${districtId};`;
    const getDistrictByIdQueryResponse = await db.get(getDistrictByIdQuery);
    response.send(convertDbObjectDistrict(getDistrictByIdQueryResponse));
  }
);

//----------------------API 6
//Deletes a district from the district table based on the district ID
// only authenticated users can delete data from database.

app.delete(
  "/districts/:districtId/",
  authenticationToken,
  async (request, response) => {
    const { districtId } = request.params;
    const deleteDistrictQuery = `delete from district where district_id = ${districtId};`;
    const deleteDistrict = await db.run(deleteDistrictQuery);
    response.send(`District Removed`);
  }
);

//                                API 7
//Updates the details of a specific district based on the district ID
// only authenticated users can update the data.
app.put(
  "/districts/:districtId/",
  authenticationToken,
  async (request, response) => {
    const { districtId } = request.params;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = request.body;
    const updateDistrictQuery = `update district set
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths} where district_id = ${districtId};`;

    const updateDistrictQueryResponse = await db.run(updateDistrictQuery);
    response.send("District Details Updated");
  }
);

//                             API 8
//Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get(
  "/states/:stateId/stats/",
  authenticationToken,
  async (request, response) => {
    const { stateId } = request.params;
    const getStateByIDStatsQuery = `select sum(cases) as totalCases, sum(cured) as totalCured,
    sum(active) as totalActive , sum(deaths) as totalDeaths from district where state_id = ${stateId};`;

    const getStateByIDStatsQueryResponse = await db.get(getStateByIDStatsQuery);
    response.send(getStateByIDStatsQueryResponse);
  }
);

module.exports = app;
