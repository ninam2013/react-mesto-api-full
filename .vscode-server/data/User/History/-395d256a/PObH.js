// подключаем для создание токена
const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;
// ошибка
const UnauthorizedError = require('../error/UnauthorizedError');

// авторизация запросов
module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // если заголовка нет или он не начинается с Bearer-вылаем ошибку
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  // если токен на месте извлечём приставку Bearer и запишется только JWT
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    // Проверяем токена, если токен прошёл проверку вернётся пейлоуд
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    // отправим ошибку, если не получилось
    return next(new UnauthorizedError('Необходима авторизация'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса

  return next(); // пропускаем запрос дальше
};
