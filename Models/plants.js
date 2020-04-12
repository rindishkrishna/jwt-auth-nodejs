const mongoose= require('mongoose');

const Schema = new mongoose.Schema({
    name: {type:String,
        required:true,
    },
    image: {type:String,
        required:true,
    },
    description: {type:String,
        required:true,
    },
    howto: {type:String,
        required:true,
    },
});
const  plants= mongoose.model('plants',Schema);
module.exports =plants;
