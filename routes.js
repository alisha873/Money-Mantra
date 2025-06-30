const express = require('express');
const router = express.Router();
const {CreateUser,saveUserProfile,generateTax,answerQuestions,getContentByRole} = require('./controllers');
const verifyToken = require('./middleware/verifySupabaseTokens');

router.post('/user/init',CreateUser);

//to store user profile on login
router.post('/user/profile',saveUserProfile);

//route for direction to ai-summary 
router.post('/tax/summary',verifyToken,generateTax);

//route to get the custom ans
router.post('/tax/gpt',verifyToken,answerQuestions);

//route to direct to the role we got from form and to take to summary
router.post('/learn/content',verifyToken,getContentByRole);

module.exports= router

