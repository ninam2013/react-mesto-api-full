// импортируем модуль jsonwebtoken для создания токена
const jwt = require('jsonwebtoken');
// импортируем bcrypt для создания хеша
const bcrypt = require('bcryptjs');
// импортируем модель
const User = require('../models/user');
// импортируем ошибки
const BadRequestError = require('../error/BadRequestError');
const UnauthorizedError = require('../error/UnauthorizedError');
const NotFoundError = require('../error/NotFoundError');
const ConflictError = require('../error/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUsers = (_, res, next) => {
  // все пользователи
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const returnUser = (req, res, next) => {
  // возвращаем пользователя по _id
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        return next(new BadRequestError('Переданы некорректные данные'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  // хешируем пароль
  bcrypt.hash(password, 10)
    // создаём пользователя
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    // вернём записанные в базу данные
    .then((user) => {
      res.status(201).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      })
    })
    // данные не записались, вернём ошибку
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные обновления пользователя или профиля'));
      }
      if (err.code === 11000) {
        return next(new ConflictError('Такой пользователь есть в базе данных'));
      }
      return next(err);
    });
};

const updateProfile = (req, res, next) => {
  // обнавляем данные пользователя по _id
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true, new: true, upsert: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные обновления пользователя или профиля'));
      }
      return next(err);
    });
};

const updateAvatar = (req, res, next) => {
  // обнавляем аватар по _id
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные обновления пользователя или профиля'));
      }
      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  // возвращаем метод findUserByCredentials проверки почты и пароля
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // аутентификация успешна! создадим токен. Для этого вызовем метод jwt.sign с 3 аргументами
      // 1.пайлоад 2.секретный ключ(соль) 3.время действия токена
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      // если всё хорошо возвращаем токен
      res.send({ token });
    })
    .catch(() => {
      // если что-то пошло не так
      next(new UnauthorizedError('Неверная авторизация'));
    });
};

const returnProfile = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('Пользователь не найден'));
      }
      return res.send(user);
    })
    .catch(next);
};

module.exports = {
  getUsers,
  returnUser,
  returnProfile,
  createUser,
  updateProfile,
  updateAvatar,
  login,
};
