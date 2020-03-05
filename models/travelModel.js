const mongoose = require('mongoose');
const slugify = require('slugify');
const Company = require('./companyModel');

/*
    ? Aqui fica o modelo das Viagens (ex: Recife, São paulo, ...)
    ! Falta adicionar a geolocalizaçao
*/

const schema = mongoose.Schema;

const travelSchema = new schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Por favor defina o nome da viagem'],
        maxlength: [40, 'O [nome da viagem] nao pode ter mais de 40 letras'],
        minlength: [10, 'O [nome da viagem] nao pode ter menos de 10 letras']
    },
    slug: String,
    price: {
        type: Number,
        default: 0,
        required: [true, 'Por favor, defina o preco da viajem']
    },
    description: {
        type: String,
        minlength: [20, 'A descriçao precisa ter pelo menos 20 letras'],
        require: [true, 'Por favor defina a descriçao']
    },
    ratings: {
        type: Number,
        default: 4.5,
        require: [true, 'The travel must have a retings'],
        min: [1, 'A nota deve ser maior ou igual a 1'],
        max: [5, 'A nota deve ser menor ou igual a 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    imageCover: {
        type: String,
        required: [true, 'Defina a imagem de capa']
    },
    images: [String],
    createAt: {
        type: Date,
        default: Date.now()
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    destination: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        days: Number
    }],
    duration: {
        type: Number,
        required: [true, 'Defina a duracao da viagem'],
        default: 5
    },
    ticket: {
        type: String,
        enum: ['apenas ida', 'ida e volta'],
        required: [true, 'Por favor, defina o tipo da passagem']
    },
    goDates: [Date],
    backDates: [Date],
    transport: {
        type: String,
        default: 'aerio',
        enum: ['aerio', 'terrestre', 'aquatico']
    },
    maxVacancies: {
        type: Number,
        required: [true, 'Defina o numero de vagas']
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'Company'
    }
},

    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

// * virtual fields

// * Middlewares Schema
travelSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});

    next();
});

// * populate company field
travelSchema.pre(/^find/, function(next){
    this.populate({
        path: 'company',
        select: '-__v -_id -cnpj'
    });

    next();
});

const travelModel = mongoose.model('Travel', travelSchema);

module.exports = travelModel;