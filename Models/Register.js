const mongoose= require('mongoose');
const crypto = require('crypto');
/**
 * @swagger
 *  components:
 *    schemas:
 *      User:
 *        type: object
 *        required:
 *          - name
 *          - email
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *            format: email
 *            description: Email for the user, needs to be unique.
 *        example:
 *           name: Alexander
 *           email: fake@email.com
 */
const Schema = new mongoose.Schema({
    name: {type:String,
        required:true},

    email:{type:String,
        required:true,
        unique:true,
    },
    roomno:{
        type:Number,
        minLength:3,
        maxlength:3,
        required:true,
        default:123
    },
    year:{
        type:String,
        required:true
    },
    password:{type:String,
        required:true,
    },
    confirmPassword:{type:String,
    required:true},

    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    }

});
Schema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};
const Register = mongoose.model('Register',Schema);
module.exports =Register;
