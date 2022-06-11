const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const REGEXP = require('../utils/constants');

const {
  getUsers,
  returnUser,
  updateProfile,
  updateAvatar,
  returnProfile,
} = require('../controllers/users');

router.get('/', getUsers);

router.get('/me', returnProfile);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), returnUser);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(REGEXP),
  }),
}), updateAvatar);

module.exports = router;
