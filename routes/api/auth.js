const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../model/User');
const config = require('config');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


//@route    GET api/auth
//@desc     Test route
//@access   Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');// . find user by id in db after it is autherized. returning user.'-password' will return everything leaving pwd 
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('sever error');
    }

});

//@route    POST api/auth
//@desc     Authenticate user and get token
//@access   Public
router.post('/',
    [
        check('email', 'Please input valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body; //to store multiple things from req.body to const in one go

        try {
            //check if user already exist throw error
            let user = await User.findOne({ email });//to find in db if user exist by email
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
            }
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


        } catch (err) {
            console.error(err.message);
            res.status(500).send('server Error');
        }


    });

module.exports = router;