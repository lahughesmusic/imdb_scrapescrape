const express = require("express");
const scraper = require("./scraper");
const cors = require("cors");
const next = require("next");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: "this is my message"
  });
});

app.get("/search/:title", (req, res) => {
  scraper.searchMovies(req.params.title).then(movies => {
    res.json(movies);
  });
});

app.get("/movie/:imdbID", (req, res) => {
  scraper.getMovie(req.params.imdbID).then(movie => {
    res.json(movie);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
