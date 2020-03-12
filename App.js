const express = require("express");
const app =express();
const logger =require('./Startup/Logging');
require('./Startup/Router')(app);
require('./Startup/Db')();
require('./Startup/Config')();
require('./Startup/Prod')(app);
const port = process.env.PORT;
app.listen(port,()=>{
logger.info(`listening on ${port}`)
});
