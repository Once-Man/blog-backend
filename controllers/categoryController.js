const asyncHandler = require('express-async-handler');
const {Category, validateCreateCategory} = require('../models/Category');

module.exports.createCategoryCtrl = asyncHandler(async (req, res, next) => {
    const {error} = validateCreateCategory(req.body);
    if(error){
        return res.status(400).json({error: error.details[0].message});
    }

    const category = await Category.create({
       user: req.user.id,
       title: req.body.title, 
    });
    res.status(201).json(category);
});

module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();
    res.status(200).json(categories);
});

module.exports.deleteCategoryCtrl = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if(!category){
        return res.status(404).json({error: 'Category not found'});
    }
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message: 'Category deleted',
        categoryId: category._id
    });
});