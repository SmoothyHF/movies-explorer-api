const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const BadRequestError = require('../errors/badRequest-error');
const ConflictError = require('../errors/conflict-error');

const { JWT_SECRET = 'SECRET_KEY' } = process.env;

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => UserModel.create({
      name, email, password: hash,
    }))
    .then((user) => {
      res.status(201).send({
        name: user.name, email: user.email,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError('Такой email уже зарегистрирован'));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при создании пользователя.'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return UserModel.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(200).send({ token });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  UserModel.findById(req.user._id)
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан несуществующий id.'));
      }
      return next(err);
    });
};

const updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;
  UserModel.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля.'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Такой email уже зарегистрирован'));
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUserProfile,
};
