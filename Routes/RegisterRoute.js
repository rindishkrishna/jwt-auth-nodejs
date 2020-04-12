const register =require('../Models/Register');
const bcrypt =require('bcrypt');
const express= require('express');
const Router = express.Router();
const asyncvalidator =require('../Middleware/Async');
const jwt = require("jsonwebtoken");
const { check, validationResult } = require('express-validator');
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
 * /register:
 *   post:
 *     description: Register to the application
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Username
 *         in: formData
 *         required: true
 *         type: string
 *       - name: email
 *         description: email
 *         in: formData
 *         required: true
 *         type: string
 *       - name: roomno
 *         description: room number
 *         in: formData
 *         required: true
 *         type: string
 *       - name: year
 *         description: year of study
 *         in: formData
 *         required: true
 *         type: string
 *       - name: password
 *         description: password
 *         in: formData
 *         required: true
 *         type: string
 *       - name: confirmPassword
 *         description: confirm Password
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Registers a user
 */
Router.post('/',[
    check('email','Email is Required').isEmail(),
    check('name','username should have min. 5 characters').isLength({min:5}),
    check('password','password must be min. 6 characters.').isLength({min:6}),
    check('confirmPassword',' confirm password must be min. 6 characters.').isLength({min:6}),
    check('roomno').isLength({min:3,max:3}).withMessage('room number should have 3 numbers only'),
    check('year','year is required')
],asyncvalidator(async (req,res)=>{
    const errors = myvalidationResult(req);
    if(!errors.isEmpty()) return res.status(422).json(errors.array() );
    let user = await register.findOne({email:req.body.email});
    if(user) return res.status(400).send([{msg:"Already have account"}]);

    user= new register({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        roomno :req.body.roomno,
        year:req.body.year,
    });
    if(req.body.password !==req.body.confirmPassword) return res.status(400).send([{msg:"confirm password does not match"}]);
    const salt =await bcrypt.genSalt(5);
    user.password =await bcrypt.hash(user.password ,salt);
    const salt1 =await bcrypt.genSalt(5);
    user.confirmPassword =await bcrypt.hash(user.confirmPassword ,salt1);
    await user.save();
    const token = jwt.sign({id: user._id,name:user.name,roomno:user.roomno},process.env.PRIVATEKEY);
    res.send({token:token});

}));
module.exports=Router;
