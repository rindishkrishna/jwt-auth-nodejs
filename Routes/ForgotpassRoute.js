const { check, validationResult } = require('express-validator');
const User =require('../Models/Register');
const express= require('express');
const Router = express.Router();
const asyncvalidator =require('../Middleware/Async');
const sgMail = require('@sendgrid/mail');
const bcrypt = require("bcrypt");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const myvalidationResult = validationResult.withDefaults({
    formatter: (error) => {
        return {
            msg: error.msg,
        };
    }
});
/**
 * @swagger
 *
 * /mailsend/mail:
 *   post:
 *     description: sends reset password link to the registered email.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: email
 *         description: email Id
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: sends reset password link to the registered email.
 */
Router.post('/mail',[
    check('email').isEmail().withMessage('Enter a valid email address'),
],
    asyncvalidator(async (req,res)=> {
        const errors = myvalidationResult(req);
        if (!errors.isEmpty()) return res.status(422).json(errors.array());
        User.findOne({email: req.body.email})
            .then(user => {
                if (!user) return res.status(401).json({msg: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'});
                //Generate and set password reset token
                user.generatePasswordReset();

                user.save()
                    .then(user => {
                        // send email
                        let link = "http://" + req.headers.host + "/mailsend/reset/" + user.resetPasswordToken;
                        const mailOptions = {
                            to: user.email,
                            from: "rindishkrishna@gmail.com",
                            subject: "Password change request",
                            text: `Hi ${user.name} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                        };

                        sgMail.send(mailOptions).then(() => {
                            res.status(200).json({msg: `A reset email has been sent to ${user.email}.`})
                        })
                            .catch(err => res.status(500).json({msg: err.message}))

                    }).catch(err => res.status(500).json({msg: err.message}))
            }
)}));
Router.get('/reset/:token',asyncvalidator((req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then((user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});

            //Redirect user to form with the email address
            res.render('reset');
        })
        .catch(err => res.status(500).json({message: err.message}));
}
));


Router.post('/reset/:token', [
    check('password').not().isEmpty().isLength({min: 6}).withMessage('Must be at least 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, {req}) => (value === req.body.password)),
],asyncvalidator( (req,res)=>{
    const errors = myvalidationResult(req);
    if (!errors.isEmpty()) return res.status(422).json(errors.array());
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}})
        .then(async (user) => {
            if (!user) return res.status(401).json({message: 'Password reset token is invalid or has expired.'});


            const salt =await bcrypt.genSalt(5);
            user.password =await bcrypt.hash(req.body.password ,salt);
            const salt1 =await bcrypt.genSalt(5);
            user.confirmPassword =await bcrypt.hash(req.body.confirmPassword ,salt1);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;


            // Save
           await user.save((err) => {
                if (err) return res.status(500).json(err.message);

                // send email
                const mailOptions = {
                    to: user.email,
                    from: "rindishkrish@gmail.com",
                    subject: "Your password has been changed",
                    text: `Hi ${user.username} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                };

                sgMail.send(mailOptions, (error, result) => {
                    if (error) return res.status(500).json( error.message);

                    res.status(200).send("Your password has been updated.");
                });
            });
        });
    })
);

module.exports=Router;
