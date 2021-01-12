const e = require('express');
const express = require('express');
const request = require('request');
const config = require('config');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../model/Profile.js');
const User = require('../../model/User.js');


//@route    GET api/profile/me  //to display the profile based on userid in token
//@desc    get current user profile
//@access   Private
router.get('/me', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);//populate(<user>,<info we need>) is used to get other thing we need from user
        console.log(profile);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile); //if profile present, send profile
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
}
);


//@route    POST api/profile
//@desc     Create and update user profile
//@access   Private
router.post('/', [auth, [check('status', 'Status is required').not().isEmpty(), check('skills', 'Skills is required').not().isEmpty()]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ errors: errors.array() });
        }

        console.log('hello');

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        //build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }
        //build social objects
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (twitter) profileFields.social.twitter = twitter;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });

            if (profile) {
                //update profile if already exist
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile);
            }
            //create new profile if already not existed
            profile = new Profile(profileFields);
            console.log(profile);
            await profile.save();
            res.json(profile);

        } catch (err) {
            console
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    }
);

//@route    GET api/profile
//@desc     Get alll the profiles
//@access   Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    } catch (err) {
        console.err(err.message);
        res.status(500).send('Server Error');
    }
});


//@route    GET api/profile/user/:user_id
//@desc     Get profile by user ID
//@access   Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        //console.err(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/profile
//@desc     Delete profile & posts and user 
//@access   Private
router.delete('/', auth, async (req, res) => {
    try {
        //remove the profile
        await Profile.findOneAndRemove({ user: req.user.id });

        //remove user
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({ msg: 'User removed' });
    } catch (err) {
        //console.err(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
});


//@route    PUT api/profile/experience  // we can also used POST but PUT is used as we are just updating profile
//@desc     add experience in profile
//@access   Private
router.put('/experience', auth, [
    check('title', ' Title is required').not().isEmpty(),
    check('company', ' Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        try {

            const profile = await Profile.findOne({ user: req.user.id });
            console.log(newExp);
            profile.experience.unshift(newExp); //unshift add push element at start of array whereas put push element at end of the array
            await profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });


//@route    DELETE api/profile/experience/:exp_id 
//@desc     delete experience from profile
//@access   Private
router.delete('/experience/:exp_id', auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            //get the experinence index to  delete
            const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
            profile.experience.splice(removeIndex, 1);
            profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

//@route    PUT api/profile/education  // we can also used POST but PUT is used as we are just updating profile
//@desc     add education in profile
//@access   Private
router.put('/education', auth, [
    check('school', ' School is required').not().isEmpty(),
    check('degree', ' Degree is required').not().isEmpty(),
    check('from', "From is required").not().isEmpty(),
    check('fieldofstudy', 'fieldofstudy is required').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            description
        };

        try {

            const profile = await Profile.findOne({ user: req.user.id });
            console.log(newEdu);
            profile.education.unshift(newEdu); //unshift add push element at start of array whereas put push element at end of the array
            await profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });


//@route    DELETE api/profile/education/:edu_id
//@desc     delete education from profile
//@access   Private
router.delete('/education/:edu_id', auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({ user: req.user.id });
            //get the experinence index to  delete
            const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
            profile.education.splice(removeIndex, 1);
            profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

//@route    GET api/profile/github/:username
//@desc     get
//@access   public 
router.get('/github/:username',
    async (req, res) => {
        try {
            //Hitting https://api.github.com/users/USERNAME/repos will list public repositories for the user USERNAME.
            const options = {
                uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
                method: 'GET',
                headers: { 'user-agent': 'node.js' }
            };

            request(options, (error, response, body) => {
                if (error) {
                    console.error(error);
                }

                if (response.statusCode != 200) {
                    return res.status(404).json({ msg: 'Github profile not found' });
                }

                res.json(JSON.parse(body));// body is converted to JSON as body we get will be in string

            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });



module.exports = router;