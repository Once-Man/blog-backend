const express = require('express');
const router = express.Router();

const {getAllUserCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUsersCounteCtrl, profilePhotoUploadCtrl, deleteUserProfileCtrl} = require('../controllers/userController');
const {verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization} = require('../middlewares/verifyToken');
const {validateObjectId} = require('../middlewares/validateObjectId');
const photoUpload = require('../middlewares/photoUpload');

router.get('/profile', verifyTokenAndAdmin, getAllUserCtrl);
router.get('/profile/:id', validateObjectId, getUserProfileCtrl);
router.put('/profile/:id', validateObjectId, verifyTokenAndOnlyUser, updateUserProfileCtrl);
router.get('/count', verifyTokenAndAdmin, getUsersCounteCtrl);
router.post('/profile-photo-upload', verifyToken, photoUpload.single('image'), profilePhotoUploadCtrl);
router.delete('/profile/:id', verifyTokenAndAuthorization, validateObjectId, deleteUserProfileCtrl);

module.exports = router;