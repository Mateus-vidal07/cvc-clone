const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const { promisify } = require('util');
const sendMail = require('../utils/email');
const crypto = require('crypto');

const signToken = Id => {
    return jwt.sign({ id: Id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES
    });
}

const cookieOptions = { httpOnly: true, expires: new Date((Date.now() + process.env.COOKIE_EXPIRES * 24 * 360 * 60 * 1000/6) )}

exports.signUp = catchAsync(async (req, res, next) => {

    //? Cadastrando o usuario no banco de dados
    //* Cria um cookie que armazena o JWT

    const newUser = await User.create(req.body);

    const token = signToken(newUser.id);

    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        data: {
            token: token,
            user: newUser
        }
    });

});

exports.login = catchAsync(async (req, res, next) => {

    // ? Confere se o usuario postou os dados
    const { email, password } = req.body;

    if (!email || !password) return next(new appError('Insira o email e senha'));

    // ? Confere se os dados estao no banco de dados
    const user = await User.findOne({email: email});
    if (!user) return next(new appError('Email ou Senha incorreto', 404));

    const correctPassword = await user.correctPassword(password, user.password);
    if (!correctPassword) return next(new appError('Email ou Senha incorreto', 404));

    // ? Se tudo estiver certo libera o Token
    const token = signToken(user.id);

    res.cookie('jwt', token, cookieOptions);
    res.status(200).json({
        status: 'success',
        data: {
            token: token,
            user: user
        }
    });

});

exports.isLogged = catchAsync(async (req, res, next) => {

    // Esse meddleware verifica se o usuario esta logado
    // ? Ele cria a req.user que armazena os dados do usuario

    let token;
    if (req.cookies.jwt){
        token = req.cookies.jwt
    } else {
        return next(new appError('Entre na sua conta para ter acesso', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next(new appError('Usuario nao existe mais'));

    if (currentUser.changedPasswordAfter(decoded.iat)){
        return next(new appError('A senha foi alterada, faca login novamente', 401));
    }

    req.user = currentUser;

    next();

});

exports.restrictTo = (...roles) => {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) return next(new appError('Voce nao tem autorizaçao para esta pagina'));

        next();
    }
}

//* Update password
exports.changePassword = catchAsync(async (req, res, next) => {

    // Verificando se o usuario esta logado
    const user = await User.findOne({_id: req.user._id});
    if (!user) return next(new appError('Por favor, entre na sua conta', 401));

    // Coparando e validando as senhas
    const { oldPassword, password, passwordConfirm } = req.body;
    const correct = await user.correctPassword(oldPassword, user.password);

    if (!correct) return next(new appError('A senha antiga esta incorreta', 401));
    
    if (password != passwordConfirm) return next(new appError('As senhas não correspondem'));

    // Salvando as alteraçoes
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.save();

    const token = signToken(user._id);
    
    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        token: token,
        data: {
            message: 'senha alterada com sucesso'
        }
    });

});

//* Reset password step 1 (CASO ESQUECEU A SENHA)
exports.forgotPassword = catchAsync(async (req, res, next) => {

    // Pegar o usuario pelo email informado
    const user = await User.findOne({email: req.body.email});
    if (!user) return next(new appError('Nao existe usuarios com esse email', 404));

    // Gerar um token para resetar a senha
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Corpo da mensagem
    const resetURL = `${req.protocol}://${req.get('host')}/api/user/reset-password/${resetToken}`;
    const message = `Esqueceu sua senha? Altere sua senha usando o este link: ${resetURL}`;
    const subject = `Hey! ${user.first_name} você precisa de uma nova senha ?`

    try {

        await sendMail({
            email: user.email,
            subject,
            message
        });

        res.status(200).json({
            status: 'success',
            data: {
                message: 'Email enviado com sucesso, por favor verifique sua caixa de messagens'
            }
        });

    } catch (err) {
        res.status(400).json({
            status: 'fail',
            err
        });
    }

});

//* Reset password step 2 (Depois de receber o email)
exports.resetPassword = catchAsync( async (req, res, next) => {

    // Convertendo o token recebido pela requisiçao em um hash
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    
    //Verificando se tem um usuario com esse hash e se o tempo não expirou
    const user = await User.findOne({passwordResetToken: hashToken, passwordExpires: {$gt: Date.now()}});
    if (!user) return next(new appError('O link expirou, tente novamente', 404));

    // Fazendo a mudança de senha e resetando os campos auxiliares
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    const token = signToken(user._id);
    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
        status: 'success',
        token,
        data: {
            message: 'Senha alterada com sucesso'
        }
    });

});

const filterObj = (obj, ...alowedFields) => {

    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (alowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;

}

// *Atualisando dados da conta
exports.updateMe = catchAsync(async (req, res, next) => {

    // Caso o usario tente mudar a senha por esta rota
    if (req.body.password || req.body.passwordConfirm) return next(new appError('Esta url nao muda senha', 401));

    // Filtro as informaçoes importantes e aplico a mudança
    const filterBody = filterObj(req.body, 'first_name', 'last_name', 'email');

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, { new: true, validateBeforeSave: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });

});

// Deixanto conta inativa/ "Excluindo"
exports.deleteMe = catchAsync(async (req, res, next) => {

    await User.findByIdAndUpdate(req.user.id, {active: false});

    res.status(200).json({
        status: 'success',
        data: null
    });

});