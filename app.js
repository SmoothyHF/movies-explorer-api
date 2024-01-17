const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cors = require('cors');

const appRouter = require('./routes/index');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const {
  PORT = 3000,
  MONGO_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb',
} = process.env;

mongoose.connect(`${MONGO_URL}`).then();

const app = express();

app.use(cors());

app.use(express.json());

app.use(requestLogger);

app.use(appRouter);

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT);
