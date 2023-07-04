const express = require('express');
const router = express.Router();

const {createCommentCtrl, getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl} = require('../controllers/commentController');
const {verifyToken, verifyTokenAndAdmin} = require('../middlewares/verifyToken');
const {validateObjectId} = require('../middlewares/validateObjectId');

router.post('/', verifyToken, createCommentCtrl);
router.get('/', verifyTokenAndAdmin, getAllCommentsCtrl);
router.delete('/:id', validateObjectId, verifyToken, deleteCommentCtrl);
router.put('/:id', validateObjectId, verifyToken, updateCommentCtrl);

module.exports = router;