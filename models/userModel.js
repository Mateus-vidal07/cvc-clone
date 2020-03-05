const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/*
   ? Aqui fica o modelo dos usuarios...
   ! Falta confirmação de email
*/

const schema = mongoose.Schema;

const userSchema = new schema({
    first_name: {
        type: String,
        required: [true, 'Por favor insira o primeiro nome'] 
    },
    last_name: {
        type: String,
        required: [true, 'Por favor insira o ultimo nome']
    },
    user_name: {
        type: String,
        required: [true, 'Digite o nome de usuario'],
        unique: [true, 'O nome informado ja esta em uso'],
        minlength: [4, "O nome de usuario deve ter pelo menos 4 digitos"],
        maxlength: [15, "O nome de usuario nao deve ter mais de 15 digitos"]
    },
    email: {
        type: String,
        required: [true, 'Insira seu email'],
        unique: [true, 'Email ja esta sendo usado'],
        validate: [validator.isEmail, 'Email invalido']
    },
    role: {
        type: String,
        default: 'cliente',
        enum: ['cliente', 'funcionario', 'gerenciador', 'administrador']
    },
    birthday: Date,
    password: {
        type: String,
        required: [true, 'Digite sua senha'],
        minlength: [4, 'A senha deve ter pelo menos 4 digitos'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Confirme sua senha'],
        validate: { validator: function(el){
            return el === this.password; 
        }, message: 'As senhas nao sao iguais' }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordExpires: Date,
    createAt: {
        type: Date,
        default: Date.now()
    },
    active: {
        type: Boolean,
        default: true
    }
});

// * Tratamento da senha antes de salvar
userSchema.pre('save', async function(next){
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

// * Colocando o valor do passwordChangedAt
userSchema.pre('save', function(next){
    console.log(this.isModified('password'));
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 2000;

    next();
});

// * Verificando se o usuario é ATIVO
userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});

    next();
});

//* Comparando senhas
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword);
    // Essafunçao retorna True ou False
}

// * Verificando a data que a senha foi mudada
userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if (this.passwordChangedAt){
        const changedTimestamp = this.passwordChangedAt.getTime();
        const changedPass = changedTimestamp < JWTTimestamp;
        console.log(changedPass);
        return changedPass;
    }

    // ? False significa q a senha nao foi mudada
    return false
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordExpires = Date.now() + 10 * 60 * 1000;
    console.log(this.passwordResetToken);

    return resetToken;
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;