const jwt =require('jsonwebtoken');
function authenticate(req,res,next){
    const token= req.header('auth');
    if (!token) return res.status(401).send(" token invalid");
    try{
        req.decoded =jwt.verify(token,process.env.PRIVATEKEY);
        next();
    }
    catch(err){
        res.status(400).send({msg:"invalid token"});
    }

}
module.exports=authenticate;
