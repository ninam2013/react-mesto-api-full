const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const REGEXP = require('../utils/constants');

const {
  getCards,
  createCard,
  deleteCard,
  likesCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(REGEXP),
  }),
}), createCard);

router.delete('/:cardsId', celebrate({
  params: Joi.object().keys({
    cardsId: Joi.string().length(24).hex().required(),
  }),
}), deleteCard);

router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), likesCard);

router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().length(24).hex().required(),
  }),
}), dislikeCard);

module.exports = router;
