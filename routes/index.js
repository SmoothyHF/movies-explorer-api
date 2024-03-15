const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const { createUser, login } = require('../controllers/users');
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/notFound-error');

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Указан неверный адрес'));
});

module.exports = router;
