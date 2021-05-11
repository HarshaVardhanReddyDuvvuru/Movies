const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const createMovieQuery = `
        INSERT INTO movie(director_id,movie_name,lead_actor)
        VALUES(
            '${directorId}',
            '${movieName}',
            '${leadActor}'
        );

    `;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const selectMovieQuery = `
        SELECT
            *
        FROM
            movie
        WHERE movie_id = ${movieId};
    `;

  const movie = await db.get(selectMovieQuery);

  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const selectMovieQuery = `
        UPDATE
            movie
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};
    `;

  await db.run(selectMovieQuery);

  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const selectMovieQuery = `
        DELETE 
        FROM
            movie
        WHERE movie_id = ${movieId};
    `;

  const movie = await db.run(selectMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const selectMovieQuery = `
        SELECT
            *
        FROM
            director;
    `;
  const directorArray = await db.all(selectMovieQuery);
  response.send(
    directorArray.map((eachDirector) => {
      return {
        directorId: eachDirector.director_id,
        directorName: eachDirector.director_name,
      };
    })
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const selectDirectorMoviesQuery = `
        SELECT
            movie_name
        FROM
            movie
        WHERE 
            director_id = ${directorId};
    `;
  const directorMoviesArray = await db.all(selectDirectorMoviesQuery);
  response.send(
    directorMoviesArray.map((eachMovie) => {
      return {
        movieName: eachMovie.movie_name,
      };
    })
  );
});

module.exports = app;
