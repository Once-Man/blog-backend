const mongoose = require('mongoose');

const validateObjectId = async(req, res, next) => {
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        return res.status(400).json({message: 'Invalid Id'});
    }
    next();
}

module.exports = {
    validateObjectId
}