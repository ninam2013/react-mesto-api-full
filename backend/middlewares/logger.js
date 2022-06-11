// импортируем модули
const winston = require('winston');
const expressWinston = require('express-winston');

// создадим логгер запросов, запрос к серверу
const requestLogger = expressWinston.logger({
  // пишем куда нужно писать лог
  transports: [
    new winston.transports.File({ filename: 'request.log' }),
  ],
  // пишем формат записи логов json
  format: winston.format.json(),
});

// логгер ошибок
const errorLogger = expressWinston.errorLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
  format: winston.format.json(),
});

module.exports = {
  requestLogger,
  errorLogger,
};
