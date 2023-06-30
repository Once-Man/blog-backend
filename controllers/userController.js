const asynHandler = require('express-async-handler');
const {User, validateUpdateUser} = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require('../utils/cloudinary');
const fs = require('fs');

module.exports.getAllUserCtrl = asynHandler(async(req, res) => {
    const users = await User.find().select('-password');
    res.status(200).json(users);
});

module.exports.getUserProfileCtrl = asynHandler(async(req, res) => {
    const user_id = req.params.id;
    const user = await User.findById({_id: user_id}).select('-password');
    if(!user){
        return res.status(404).json({message: 'User not found!'});
    }
    res.status(200).json(user);
});

module.exports.updateUserProfileCtrl = asynHandler(async(req, res) => {
    const {error} = validateUpdateUser(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }

    if(req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updateUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            bio: req.body.bio
        }
    }, {new: true}).select('-password');

    res.status(200).json(updateUser);
});

module.exports.getUsersCounteCtrl = asynHandler(async(req, res) => {
    const count = await User.count();
    res.status(200).json(count);
});

module.exports.profilePhotoUploadCtrl = asynHandler(async(req, res) => {
    // 1. Validation 
    if(!req.file) {
        return res.status(400).json({message: 'No file provided!'});
    }
    
    // 2. Get the path to the image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

    // 3. Upload to cloudinary
    const result = await cloudinaryUploadImage(imagePath);
    
    // 4. Get th user from DB
    const user = await User.findById(req.user.id);

    // 5. Delete the old profile photo if exist
    if(user.profilePhoto.publicId !== null) {
        await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    // 6. Change th profilePhoto field in the DB
    user.profilePhoto = {
        url: result.secure_url,
        publicId: result.public_id,
    }
    await user.save();

    // 7. Send response to client
    res.status(200).json({message: 'Your profile photo uploaded successfully.',
    profilePhoto: {url: result.secure_url, publicId: result.public_id}
    });

    // 8. Remove image from the server
    fs.unlinkSync(imagePath);
});

module.exports.deleteUserProfileCtrl = asynHandler(async(req, res) => {
    // 1. Get the user from DB
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({message: 'User not found!'});
    }

    // 7. Delete the user himself
    await User.findByIdAndDelete(req.params.id);

    // 8. Send a response to the client
    res.status(200).json({message: "Your profile has been deleted."})
});