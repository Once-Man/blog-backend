const express = require('express');
const router = express.Router();

const {createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl} = require('../controllers/categoryController');
const {verifyTokenAndAdmin} = require('../middlewares/verifyToken');
const {validateObjectId} = require('../middlewares/validateObjectId');

router.post('/create', verifyTokenAndAdmin, createCategoryCtrl);
router.get('/', getAllCategoriesCtrl);
router.delete('/delete/:id', verifyTokenAndAdmin, validateObjectId, deleteCategoryCtrl);

module.exports = router;