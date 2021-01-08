const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator')

const User = require('../../model/User');//need model for storing data in db
const { JsonWebTokenError } = require('jsonwebtoken');

//@route    POST api/users
//@desc     Register User
//@access   Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please input valid email').isEmail(),
    check('password', 'Please provide password of minimum of 6 character').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body; //to store multiple things from req.body to const in one go

    try {
        //check if user alredy exist throw error
        let user = await User.findOne({ email });//to find in User(model) if user exist by email
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exist' }] })
        }
        //if user not exist
        //get users gravatar
        const avatar = gravatar.url(email, {
            s: '200',// default size
            r: 'pg', //rating : pg: may contain rude gestures, provocatively dressed individuals, the lesser swear words, or mild violence.
            d: 'mm'  //default icon for user we can use 404 instaed of mm

        })
        //create instance of user
        user = new User({
            name,
            email,
            avatar,
            password

        })

        //encrypt password for storing in db using bcrypt dependency 
        const salt = await bcrypt.genSalt(10);//generate salt for hashing we have taken length of 10 more the length is more is the password secure
        user.password = await bcrypt.hash(password, salt);
        await user.save()// saving user to database;

        //return jsonwebtoken: because in front end when user register we wantuser to logged in right away, for thast we need jasonwebtoken
        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload,          //passing payload
            config.get('jwtToken'), //passing secret defined in default.json
            { expiresIn: 87000000 },
            (err, token) => {        //return error or token in callback 
                if (err) {
                    throw err;
                } else {

                    res.json({ token });
                }
            }
        );
        //console.log(req.body);
        //res.send('user registered')
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server Error');
    }


});

module.exports = router;