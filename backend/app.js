require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const { signUp, signIn } = require('./middlewares/validations');
const users = require('./routes/users');
const cards = require('./routes/cards');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const NotFoundError = require('./error/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';
// const allowedCors = [
// 'http://maninep.novoredomains.xyz',
// 'https://maninep.novoredomains.xyz',
// 'http://localhost:3000'
// ];
const { PORT = 3000 } = process.env;
const app = express();
// присоединяем к localhost:27017
mongoose.connect('mongodb://localhost:27017/mestodb', { useNewUrlParser: true });

// обязательно должно быть!!! без этого не работает
app.use(express.json());

// добавляем поддержку CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', DEFAULT_ALLOWED_METHODS);
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});

// app.use((req, res, next) => {
// const { origin } = req.headers;
//  const { method } = req;
//  const requestHeaders = req.headers['access-control-request-headers'];
//    if(allowedCors.includes(origin)) {
// res.header('Access-Control-Allow-Origin', origin);
//    }
//    if(method === 'OPTIONS') {
// res.header('Access-Control-Allow-Methods', DEFAULT_ALLWED_METHODS);
// res.header('Access-Control-Allow-Headers', requestHeaders);
// return res.end();
// }
// next();
// });

// подключаем логгер запросов перед всеми обработчиками
app.use(requestLogger);

// краш-тест сервера
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

// создаем два обработчика
app.post('/signup', signUp, createUser);
app.post('/signin', signIn, login);

// добавляем авторизацию
app.use('/users', auth, users);
app.use('/cards', auth, cards);

// запрос к несуществующему роуту
app.use('*', auth, (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

// подключаем логгер ошибок после обработчиков
app.use(errorLogger);

// обработчики ошибок предварительной валидации (celebrate)
app.use(errors());

// централизованная обработка ошибок
app.use('*', (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'На сервере произошла ошибка.';

  res.status(status).send({
    err,
    message,
  });
  next();
});

app.listen(PORT);
