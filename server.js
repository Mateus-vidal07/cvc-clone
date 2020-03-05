const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// dotEnv
dotenv.config({path: './.env'});

mongoose.connect(process.env.DB_URL, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(console.log('Banco de dados conectado!'));

const port = 3000;
app.listen(port, ()=>{
    console.log('servidor rodando!');
});