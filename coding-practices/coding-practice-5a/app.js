// const express = require("express");
// const path = require("path");

// const { open } = require("sqlite");
// const sqlite3 = require("sqlite3");

// const app = express();
// app.use(express.json());

// const dbPath = path.join(__dirname, "moviesData.db");

// let db = null;

// const initializeDBAndServer = async () => {
//   try {
//     db = await open({
//       filename: dbPath,
//       driver: sqlite3.Database,
//     });
//     app.listen(3000, () => {
//       console.log("Server Running at http://localhost:3000/");
//     });
//   } catch (e) {
//     console.log(`DB Error: ${e.message}`);
//     process.exit(1);
//   }
// };
// initializeDBAndServer();

// const convertDbObject = (objectItem) => {
//   return {
//     movieId: objectItem.movie_id,
//     directorId: objectItem.director_id,
//     movieName: objectItem.movie_name,
//     leadActor: objectItem.lead_actor,
//   };
// };

// //API 1
// // GET Movie API
// app.get("/movies/", async (request, response) => {
//   const getMoviesQuery = `
//     SELECT
//         movie_name
//     FROM
//         movie;`;
//   const movieArray = await db.all(getMoviesQuery);
//   response.send(movieArray.map((eachMovie) => convertDbObject(eachMovie)));
// });

// //API 2
// // POST Movie API
// app.post("/movies/", async (request, response) => {
//   const movieDetails = request.body;
//   const { directorId, movieName, leadActor } = movieDetails;
//   const createMoviesQuery = `
//     INSERT INTO
//     movie(director_id,movie_name,lead_actor)
//     VALUES(
//         ${directorId},
//         '${movieName}',
//         '${leadActor}'
//     );`;
//   const createMoviesResponse = await db.run(createMoviesQuery);
//   response.send("Movie Successfully Added");
// });

// //API 3
// // GET Movie API by movie_id
// app.get("/movies/:movieId/", async (request, response) => {
//   const { movieId } = request.params;
//   const getMovieDetailsQuery = `
//     SELECT
//         *
//     FROM
//         movie;
//     WHERE
//         movie_id = ${movieId}`;
//   const getMovieDetailsQueryResponse = await db.get(getMovieDetailsQuery);
//   response.send(convertDbObject(getMovieDetailsQueryResponse));
// });

// //API 4
// // PUT Movie API by movieId
// app.put("/movies/:movieId/", async (request, response) => {
//   const { movieId } = request.params;
//   const movieDetails = request.body;
//   const { directorId, movieName, leadActor } = movieDetails;
//   const updateMoviesQuery = `
//    UPDATE movie
//    SET
//         director_id = ${directorId},
//         movie_name = '${movieName}',
//         lead_actor = '${leadActor}'
//     WHERE
//         movie_id = ${movieId};`;
//   const updateMoviesResponse = await db.run(updateMoviesQuery);
//   response.send("Movie Details Updated");
//   //   response.send(updateMoviesResponse);
// });

// //API 5
// // DELETE movie API
// app.delete("/movies/:movieId/", async (request, response) => {
//   const { movieId } = request.params;
//   const deleteMovieQuery = `
//   DELETE FROM
//     movie
//   WHERE
//     movie_id = ${movieId};`;
//   await db.run(deleteMovieQuery);
//   response.send("Movie Removed");
// });

// /// ---------------DIRECTORS TABLE API CALLS-------------------

// const convertDbDirectorObject = (ObjectItems) => {
//   return {
//     directorId: ObjectItems.director_id,
//     directorName: ObjectItems.director_name,
//   };
// };

// //API 6
// // GET Director API
// app.get("/directors/", async (request, response) => {
//   const getDirectorQuery = `
//     SELECT
//         *
//     FROM
//         director;`;
//   const directorArray = await db.all(getDirectorQuery);
//   response.send(
//     directorArray.map((eachDirector) => convertDbDirectorObject(eachDirector))
//   );
// });

// //API 7
// // GET Director API
// ////Returns a list of all movie names directed by a specific director
// app.get("/directors/:directorId/movies/", async (request, response) => {
//   const { directorId } = request.params;
//   const getMoviesByDirectorQuery = `
//     SELECT
//         movie_name as movieName
//     FROM
//         movie
//     WHERE
//         director_id = ${directorId};`;
//   const getMoviesByDirectorQueryResponse = await db.all(
//     getMoviesByDirectorQuery
//   );
//   response.send(getMoviesByDirectorQueryResponse);
// });

// module.exports = app;

const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let database = null;
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data base error is ${error}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// get the list of all the movies in the database (movies table)
// API 1
const ConvertMovieDbAPI1 = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `select movie_name from movie;`;
  const getMoviesListQueryResponse = await database.all(getMoviesListQuery);
  response.send(
    getMoviesListQueryResponse.map((eachMovie) => ConvertMovieDbAPI1(eachMovie))
  );
});

//API 2
// create a movie in movies table in moviesData.db
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `insert into movie(director_id,movie_name,lead_actor) 
  values(${directorId},'${movieName}','${leadActor}');`;
  const createMovieQueryResponse = await database.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API 3
//Returns a movie based on the movie ID
const ConvertMovieDbAPI3 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `select * from movie where movie_id = ${movieId};`;
  const getMovieDetailsQueryResponse = await database.get(getMovieDetailsQuery);
  response.send(ConvertMovieDbAPI3(getMovieDetailsQueryResponse));
});

//API 4
//Updates the details of a movie in the movie table based on the movie ID

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;
  const deleteMovieQueryResponse = await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6
//Returns a list of all directors in the director table
const convertDirectorDbAPI6 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `select * from director;`;
  const getDirectorsQueryResponse = await database.all(getDirectorsQuery);
  response.send(
    getDirectorsQueryResponse.map((eachItem) => convertDirectorDbAPI6(eachItem))
  );
});

//API 7
//Returns a list of all movie names directed by a specific director
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `select movie_name as movieName from movie where 
  director_id = ${directorId};`;
  const getMoviesByDirectorQueryResponse = await database.all(
    getMoviesByDirectorQuery
  );
  response.send(getMoviesByDirectorQueryResponse);
});

module.exports = app;
