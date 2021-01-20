const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../model/Profile.js');
const User = require('../../model/User.js');

//@route    POST api/posts
//@desc     Create a post
//@access   Public
router.post('/', [auth,[check('text','Text is required').not().isEmpty() ]],async(req, res) => {

const  errors=validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.arar()})
}

});

module.exports = router;