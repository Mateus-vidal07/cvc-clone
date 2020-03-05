const mongoose = require('mongoose');
const validator = require('validator');
const schema = mongoose.Schema;

/*
   ? Aqui fica o modelo das transportadoras (ex: TAM, GOL, ETC...)
   * O modelo esta temporariamente pronto
*/

const companySchema = new schema({
    name: {
        type: String,
        required: [true, 'Por favor a companhia precisa precisa informar o nome'],
        unique: true
    },
    cnpj: {
        type: Number,
        required: [true, 'Insira o cnpj da companhia']
    },
    email: {
        type: String,
        required: [true, 'Por favor diga o email da companhia'],
        validate: [validator.isEmail, 'Email invalido']
    },
    site: {
        type: String,
        required: [true, 'Desejamos saber o site da companhia']
    }
});

const companyModel = mongoose.model('Company', companySchema);

module.exports = companyModel;