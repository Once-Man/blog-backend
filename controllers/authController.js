const asynHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const {User, validateRegisterUser, validateLoginUser} = require('../models/User');

module.exports.registerUserCtrl = asynHandler(async(req, res) => {
    const {error} = validateRegisterUser(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }

    let user = await User.findOne({email: req.body.email});
    if(user){
        return res.status(400).json({message: 'User already exist!'});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({message: 'You registered successfully, Please login'});

});

module.exports.loginUserCtrl = asynHandler(async(req, res) => {
    const {error} = validateLoginUser(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message});
    }

    const user = await User.findOne({email: req.body.email});
    if(!user){
        return res.status(400).json({message: 'invalid email or password'})
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if(!isPasswordMatch){
        return res.status(400).json({message: 'invalid email or password'});
    }

    const token = user.generateAuthToken();
    res.status(200).json({
        _id: user._id,
        isAdmin: user.isAdmin,
        profilePhoto: user.profilePhoto,
        token,
    });

});
