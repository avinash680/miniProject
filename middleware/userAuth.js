
const jwt = require("jsonwebtoken");
function isLoggedIn(req, res, next) {
    if(req.cookies.token ===  "")res.redirect("/login");else {
       const data =  jwt.verify(req.cookies.token, "she");
       req.user = data;
    }  
    
     next();
    
}


module.exports  = isLoggedIn;