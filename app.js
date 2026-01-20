const express = require('express');
const app = express();
const bcrypt = require("bcrypt");
const  User = require("./models/user");
const Post = require("./models/post");
const upload = require("./config/multerconfig");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const path =require("path");    
const  isLoggedIn  = require("./middleware/userAuth");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());
app.get("", (req, res ) => {
    res.send("hey");
})



 


app.set("view engine", "ejs");
app.get("/register", (req, res) => {
    res.render("index.ejs");
});
       app.get("/profile"  , isLoggedIn , async(req, res) => {
    let user  =    await User.findOne({email: req.user.email}).populate("posts");
      res.render("Profile.ejs", {user});
       })



app.get("/like/:id", isLoggedIn, async(req, res) => {
          let post  =  await Post.findOne({_id: req.params.id}).populate("user");
    
          if(post.likes.indexOf(req.user.userid) === -1) {
              post.likes. push(req.user.userid);
         }else{
            post.likes.splice(post.likes.indexOf(req.user.userid), 1);
         }
          await post.save();
          res.redirect("/Profile");

});


  app.get("/profile/upload", (req, res) => {
     res.render("ProfileUp.ejs");
  })

   app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
   const user = await User.findOne({ email: req.user.email});
    
    user.profilepic = req.file.filename;
    await  user.save();
    res.redirect("/profile");
  })


app.get("/edit/:id", isLoggedIn, async(req, res) => {
          let post  =  await Post.findOne({_id: req.params.id}).populate("user");

          res.render("edit.ejs", { post });

});


app.post("/update/:id", isLoggedIn, async(req, res) => {
          let post  =  await Post.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});
    
          res.redirect("/Profile");

});



app.post("/register", async (req, res) => {
     let {username, name, email, password, age} = req.body;
    const user  = await User.findOne({email});
           if(user) {
                 return res.status(500).send("user alredy register");
           }
        
           bcrypt.genSalt (10, (err, salt) => {
            bcrypt.hash(password, salt, async (err, hashpassword) => {
       let newuser  = await User.create({
                    username,
                    name,
                    email,
                    age,
                    password: hashpassword,
                });
              let token = jwt.sign({email: email, newuserid: newuser._id}, 'she')
              
              res.cookie("token", token);
            res.redirect("/profile");
               

            })
         })
})

app.get("/login", (req, res) => {
    res.render("Login.ejs");
})


app.post("/login", async(req, res) => {
        const { password, email} = req.body; 
     const  user  = await User.findOne({email});

     if(!user) {
        res.redirect("/register");
     }
     bcrypt.compare(password, user.password, (err, result) => {
             if(result) {
              let token = jwt.sign({email: email,  userid: user._id}, 'she');
              res.cookie("token", token);
              res.redirect("/profile");
             }
              else {res.redirect("/login");}
     });


})


app.post("/post", isLoggedIn, async(req, res) => {
          let user  =  await User.findOne({email: req.user.email});
          let {content } = req.body;
          
     let  post = await Post.create({
            user: user._id,
            content,
           });
         user.posts.push(post._id);  
         await user.save();
         res.redirect("Profile");
})


app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/login");
})




app.listen(8080, () => {
    console.log("server is runing 8080...");
})