const express = require('express');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimite = require('express-rate-limit');
const helmet = require('helmet');

// importando rotas
const travelRouter = require('./routes/travelRouter');
const companyRouter = require('./routes/companyRouter');
const userRouter = require('./routes/userRouter');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

//* Protect for brute force
const limite = rateLimite({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Voce ultrapassou o numero de tentativas por hora, tente mais tarde'
});

// *Protect for mongo query injection
app.use(mongoSanitize());
// *Protect for xss
app.use(xss());

app.use('/api', limite);

// Usando rotas
app.use('/api/travel', travelRouter);
app.use('/api/company', companyRouter);
app.use('/api/user', userRouter);

module.exports = app;