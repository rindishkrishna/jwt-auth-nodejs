const logger =require('../Startup/Logging');
module.exports= function(err,req,res,next){

    logger.error(err.message);
res.status(500).send({msg:'Server Error'});
};
