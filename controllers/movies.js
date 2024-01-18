const MovieModel = require('../models/movie');
const BadRequestError = require('../errors/badRequest-error');
const NotFoundError = require('../errors/notFound-error');
const ForbiddenError = require('../errors/Forbidden-error');

const createMovie = (req, res, next) => {
  const owner = req.user._id;

  MovieModel.create({ owner, ...req.body })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные.'));
      }
      return next(err);
    });
};

const getMovies = (req, res, next) => {
  const owner = req.user._id;
  MovieModel.find({ owner })
    .then((movies) => {
      res.status(200).send(movies);
    })
    .catch(next);
};

const deleteMovies = (req, res, next) => {
  MovieModel.findById(req.params.movieId)
    .then((movie) => {
      if (!movie) {
        return next(new NotFoundError('Фильм с указанным id не найден.'));
      }
      return movie;
    })
    .then((movie) => {
      if (req.user._id === movie.owner.toString()) {
        return MovieModel.findByIdAndDelete(req.params.movieId)
          .then((deletedMovie) => res.status(200).send(deletedMovie))
          .catch(next);
      }
      return next(new ForbiddenError('Нельзя удалять чужие фильмы'));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Переданы некорректные данные для удаления фильма'));
      }
      return next(err);
    });
};

module.exports = {
  createMovie,
  getMovies,
  deleteMovies,
};
