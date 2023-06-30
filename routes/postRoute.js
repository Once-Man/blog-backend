const express = require('express');
const router = express.Router();

const {createPostCtrl, getAllPostsCtrl, singlePostCtrl, getPostCountCtrl, updatePostCtrl, deletePostCtrl, updateImageCtrl, toogleLikeCtrl} = require('../controllers/postController');
const photoUpload = require('../middlewares/photoUpload');
const {verifyToken} = require('../middlewares/verifyToken');
const {validateObjectId} = require('../middlewares/validateObjectId');

router.post('/create', verifyToken, photoUpload.single('image'), createPostCtrl);
router.get('/', verifyToken, getAllPostsCtrl);
router.get('/:id', validateObjectId, singlePostCtrl);
router.get('/count/post-count', getPostCountCtrl);
router.put('/:id', validateObjectId, verifyToken, updatePostCtrl);
router.delete('/:id', validateObjectId, verifyToken, deletePostCtrl);
router.put('/update-image/:id', validateObjectId, verifyToken, photoUpload.single('image'), updateImageCtrl);
router.put('/like/:id', validateObjectId, verifyToken, toogleLikeCtrl);

module.exports = router;