const fs = require('fs');
const path = require('path');
const asynHandler = require('express-async-handler');
const {Post, validateCreatePost, validateUpdatePost} = require('../models/Post');
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require('../utils/cloudinary');

module.exports.createPostCtrl = asynHandler(async(req, res) => {
    // 1. Validation for image
    if(!req.file){
        return res.status(400).json({message: 'No image provided!'});
    }

    // 2. Validation for data
    const {error} = validateCreatePost(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }

    // 3. Upload Photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    // 4. Create new post and save it to DB
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id,
        } 
    });

    // 5. Send response to the client
    res.status(201).json(post);

    // 6. Remove image from the server
    fs.unlinkSync(imagePath);
});

module.exports.getAllPostsCtrl = asynHandler(async(req, res) => {
    const POST_PER_PAGE = 3;
    const {pageNumber, category} = req.query;
    let posts;

    if(pageNumber) {
        posts = await Post.find()
                    .skip((pageNumber-1) * POST_PER_PAGE)
                    .limit(POST_PER_PAGE)
                    .sort({createdAt: -1})
                    .populate('user', ['-password']);

    }else if (category) {
        posts = await Post.find({category})
                          .sort({createdAt: -1})
                          .populate('user', ['-password']);

    } else {
        posts = await Post.find()
                          .sort({createdAt: -1})
                          .populate('user', ['-password']);
    }
    res.status(200).json(posts);
});

module.exports.singlePostCtrl = asynHandler(async(req,res) => {
    const post = await Post.findById(req.params.id).populate('user', ['-password']);

    if(!post) {
        return res.status(404).json({message: 'Post not found'});
    }

    res.status(200).json(post);
});

module.exports.getPostCountCtrl = asynHandler(async(req, res) => {
    console.log('count')
    const count = await Post.count();
    res.status(200).json(count);
});

module.exports.deletePostCtrl = asynHandler(async(req, res) => {
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: 'Post not found!'});
    }

    if(req.user.isAdmin || req.user.id === post.user.toString()){
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);

        res.status(200).json({message: 'Post has been deleted successfully.', postId: post._id});
    }else {
        res.status(403).json({message: 'Access denied, forbidden!'});
    }
});

module.exports.updatePostCtrl = asynHandler(async(req, res) => {
    // 1. Validation
    const {error} = validateUpdatePost(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }

    // 2. get the post from DB and check if post exist
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({message: 'Post not found!'});
    }

    // 3. Check if this post belong to logged in user
    if(req.user.id !== post.user.toString()) {
        return res.status(403).json({message: 'Access denied, You are not allowed!'});
    }

    // 4. Update Post
    const updatePost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        }
    }, {new: true}).populate('user', ['-password']);

    // 5. Send response to the client
    res.status(200).json(updatePost);
});

module.exports.updateImageCtrl = asynHandler(async(req, res) => {
    // 1. Validation
    if(!req.file) {
        return res.status(400).json({message: 'No image porvided!'});
    }

    // 2. get the post from DB and check if post exist
    const post = await Post.findById(req.params.id);
    if(!post) {
        return res.status(404).json({message: 'Post not found!'});
    }

    // 3. Check if this post belong to logged in user
    if(req.user.id !== post.user.toString()) {
        return res.status(403).json({message: 'Access denied, You are not allowed!'});
    }

    // 4. Delete the old image
    await cloudinaryRemoveImage(post.image.publicId);

    // 5. Upload new photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    // 6. Update the image field in the db
    const updatePost = await Post.findByIdAndUpdate(req.params.id, {
        $set: {
            url: result.secure_url,
            publicId: result.public_id
        }
    }, {new: true});

    // 7. Send response to the client
    res.status(200).json(updatePost);

    // 8. Remove image from the server
    fs.unlinkSync(imagePath);
});

module.exports.toogleLikeCtrl = asynHandler(async(req, res) => {
    const loggedInUser = req.user.id;
    const {id: postId} = req.params;

    let post = await Post.findById(postId);
    if(!post) {
        return res.status(404).json({message: 'Post not found!'});
    }

    const isPostAlreadyLiked = post.likes.find(
        (user) => user.toString() === loggedInUser
    );

    if(isPostAlreadyLiked){
        post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { likes: loggedInUser}
            },
            {new: true}
        );
    }else {
        post = await Post.findByIdAndUpdate(
            postId,
            {
                $push: { likes: loggedInUser }
            },
            {new: true}
        );
    }
    res.status(200).json(post);
});