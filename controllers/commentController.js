const {Comment, validateCreateComment, validateUpdateComment} = require('../models/Comment');
const asynHandler = require('express-async-handler');
const {User} = require('../models/User');


module.exports.createCommentCtrl = asynHandler(async(req, res) => {
    const {error} = validateCreateComment(req.body);

    if(error) {
        return res.status(400).json({message: error.details[0].message});
    }

    const profile = await User.findById(req.user.id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username
    });
    res.status(201).json(comment);
});


module.exports.getAllCommentsCtrl = asynHandler(async(req, res) => {
    const comments = await Comment.find().populate('user');
    res.status(200).json(comments);
});


module.exports.deleteCommentCtrl = asynHandler(async(req, res) => {

    const comment = await Comment.findById(req.params.id);
    if(!comment) {
            return res.status(404).json({message: 'Comment not found'});
        }
    if(req.user.isAdmin || req.user.id === comment.user.toString()) {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({message: 'Comment deleted'});
    }else{
        res.status(403).json({message: 'Access denied, Not allowed to delete this'});
    }

});

module.exports.updateCommentCtrl = asynHandler(async(req, res) => {
    const {error} = validateUpdateComment(req.body);
    if(error) {
            return res.status(400).json({message: error.details[0].message});
        }

    const comment = await Comment.findById(req.params.id);
    if(!comment) {
                return res.status(404).json({message: 'Comment not found'});
            }

    if(req.user.id !== comment.user.toString()) {
        return res.status(403).json({message: 'Access denied, Not allowed to update this only himself'});
    }

    const updateComment = await Comment.findByIdAndUpdate(req.params.id, {
        $set: {
            text: req.body.text
        }, 
    }, {new: true});
    res.status(200).json(updateComment);
});