const cheerio = require("cheerio");
const fetch = require("node-fetch");
const searchUrl = "https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=";
const movieUrl = "https://www.imdb.com/title/";

const searchCache = {};
const movieCache = {};

function searchMovies(searchTerm) {
  if (searchCache[searchTerm]) {
    console.log("Serving form cache:", searchTerm);
    return Promise.resolve(searchCache[searchTerm]);
  }

  return fetch(`${searchUrl}${searchTerm}`)
    .then(response => response.text())
    .then(body => {
      const movies = [];
      const $ = cheerio.load(body);
      $(".findResult").each(function(i, element) {
        const $element = $(element);
        const image = $element.find("td a img");
        const title = $element.find("td.result_text a ");
        const imdbID = title.attr("href").match(/title\/(.*)\//)[1];
        const movie = {
          image: image.attr("src"),
          title: title.text(),
          imdbID
        };

        movies.push(movie);
      });
      searchCache[searchTerm] = movies;

      return movies;
    });
}

function getMovie(imdbID) {
  if (movieCache[imdbID]) {
    console.log("Serving form cache:", imdbID);

    return Promise.resolve(movieCache[imdbID]);
  }
  return fetch(`${movieUrl}${imdbID}`).then(response =>
    response.text().then(body => {
      const $ = cheerio.load(body);
      const $title = $(".title_wrapper h1");
      const summary = $(".summary_text")
        .text()
        .trim();
      const title = $title
        .first()
        .contents()
        .filter(function() {
          return this.type === "text";
        })
        .text()
        .trim();
      const rating = $(".subtext")
        .text()
        .match(/[^\s]+/)[0]
        .trim();
      const runTime = $("time")
        .first()
        .contents()
        .text()
        .trim();
      const filmRating = $('span[itemProp="ratingValue"]').text();
      const genres = [];
      $("div.subtext")
        .children("a")
        .not('a[title="See more release dates"]')
        .each(function(i, el) {
          const ele = $(el);
          const genre = ele.html();
          genres.push(genre);
        });

      const releaseDate = $('a[title="See more release dates"]').text();
      const poster = $("div.poster a img").attr("src");
      const director = $("div.plot_summary div a")
        .first()
        .html();
      const storyline = $(".inline p span")
        .text()
        .trim();

      function getItems(itemArray) {
        return function(i, element) {
          const item = $(element)
            .text()
            .trim();
          itemArray.push(item);
        };
      }
      const trailer = $("div.slate a").attr("href");

      const movie = {
        title,
        rating,
        summary,
        runTime,
        filmRating,
        genres,
        releaseDate,
        poster,
        director,
        storyline
      };
      movieCache[imdbID] = movie;
      return movie;
    })
  );
}

module.exports = {
  searchMovies,
  getMovie
};
