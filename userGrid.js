const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const router = express.Router();
const cors = require("cors");
router.use(cors());
router.use(bodyParser.json({ type: "application/json" }));
const schema = mongoose.Schema;
//   in schemema we have said to mango db  which has to store this data
// UserModel has the access for collection in database
const userSchema = new schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  age: { type: Number },
  active: { type: Boolean },
  gender: { type: String },
  password: { type: String },
  role: { type: String },
});
const UserModel = mongoose.model("user", userSchema);

const midleWare = (request, response, next) => {
  
  const authorizationHeader = request.headers.authorization;
   

    if (authorizationHeader) {
        const token = request.headers.authorization.split(' ')[1]; // Bearer <token>
        // console.log(token,"hii")
        try {
            // verify makes sure that the token hasn't expired and has been issued by us
            const decoded = jwt.verify(token, "abcdef");
            console.log(decoded,"decodeed");
            // res.locals.userId = result.user.id;
            // res.locals.username = result.user.fullName;
            // res.locals.email = result.user.email;
            // res.locals.role = result.user.role;
            // Let's pass back the decoded token to the request object
            request.user = decoded;
            // res.header({Authorization: "Bearer" + token})
            // We call next to pass execution to the subsequent middleware
            next();
        } catch (err) {
            // Throw an error just in case anything goes wrong with verification
            //throw new Error(err);
            return response.status(401).send({
                message: 'Unauthorized!'
            });
        }
    } else {
        return response.status(401).send({ message: `Authentication error. Token required.` });
    }
};



// GET Method for fetching all user data
router.get("/get-userData", async (_, response) => {
  
  try {
    const data = await UserModel.find();
    return response
      .status(200)
      .send({ message: "Data fetched Succesfully", data });
  } catch {
    return response.status(500).send({ message: "server error" });
  }
});

// POST Method for adding user data
router.post("/create-userData", async (request, response) => {
  
  console.log(request.body,"abiiiiiii");
  try {
    const { firstName, lastName, age, email, gender, active, password, role } =
      request.body;
    const encryptPassword= await bcrypt.hash(password, 10);
    
    

    if (
      !email ||
      !firstName ||
      !lastName ||
      !gender ||
      !age ||
      !active ||
      !password ||
      !role
    )
      return response.status(400).json({ message: "Required field missing" });
    if (firstName.length < 3)
      return response
        .status(400)
        .json({ message: "First Name should be more than 3  character" });
    if (lastName.length < 1)
      return response
        .status(400)
        .json({ message: "LastName should be more than 1 character" });
    if (password.length < 8)
      return response
        .status(400)
        .json({ message: "password should be more than 8 character" });
    const userName = await UserModel.findOne({ email });
    if (userName)
      return response.status(400).json({ message: "Already exist Email" });

    // we have created a reference modal named UserModal  which is new data
    console.log(encryptPassword,"pass")
    const userData = new UserModel({
      firstName,
      lastName,
      age,
      email,
      gender,
      active,
      password:encryptPassword,
      role,
    });
    // whenever we do a database call we await method
    await userData.save();
    return response.status(200).send({ message: "Data inserted Succesfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});

// PUT Method for updating user data
router.put("/put-userData", async (request, response) => {
  
  try {
    console.log(request.body);
    db = [];
    const { detail } = request.body;

    db.push(detail);
    return response
      .status(200)
      .send({ message: "Data changed Succesfully", data: db });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});

// PATCH Method for updating user data
router.patch("/update-userData/:id", midleWare, async (request, response) => {
  try {
    const { id = "" } = request.params;
    console.log("id",id);

    if (!id)
      return response.status(400).send({ message: "required field missing" });

    const { firstName, lastName, age, email, gender, active, role } =
      request.body;
      console.log("id",request.body);
    if (
      !email ||
      !firstName ||
      !lastName ||
      !gender ||
      !age ||
      active.length===0 ||
      !role
    )
      return response.status(400).json({ message: "Required field missing" });
    const userData = await UserModel.findById(id);
    if (!userData)
      return response.status(400).send({ message: "Data Not fetched" });
    userData.email = email;
    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.gender = gender;
    userData.age = age;
    userData.active = active;
    userData.password = userData.password;
    userData.role = role;
    await userData.save();
    // console.log(userData,"key");
    const loginUser= await UserModel.find();
    console.log(loginUser,"kkkkkk")
   
    return response.status(200).send({ message: "Data Updated Succesfully",data:loginUser });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});

// DELETE Method for deleting user data6
router.delete("/delete-userData/:id", midleWare, async (request, response) => {
  
  try {
    console.log(request.params, "id");
    const { id = "" } = request.params;
    if (!id)
      return response.status(400).send({ message: "required field missing" });
    await UserModel.findByIdAndDelete(id);
    const deleteUser=await UserModel.find();

    return response.status(200).send({ message: "Data Deleted Succesfully",data:deleteUser});
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }

});

// POST Method for user login
router.post("/login", async (request, response) => {
  
  try {
    // we send request we again send
    const { email, password } = request.body || {};
    console.log(request.body,"hii");
    if(!email||!password)
   return response.status(400).send({message:"Data is missing"});
    const data = await UserModel.findOne({email:email});
    console.log(data,"data")
    if(!data)
    return response.status(400).send({message:"Invalid Login"})
  try{
    // const checkPass=data.password===password;
    const checkPass= await bcrypt.compare( password,data.password);
   
    console.log(password,"userpass")
    if(!checkPass)
    {
       return response.status(400).send({message:"Password is incorrect"});
    }
    const token=jwt.sign({userDetail:data},"abcdef")
    console.log(token,"siva")
    response.header({Authorization: "Bearer" + token})
    response.status(200).send({meassage:"Data inserted",data:data,token:token})
    

  }
  catch(err)
  {
    console.log("Password Error",err)
  }
    // const index = data.findIndex(
    //   (i) => i.email === email && i.password === password
    // );
   
   
    // if(dataUser)
    // {
    //   if(dataUser.password===password)
    //   {
    //     // it require three parameter but two confirm 1) which data to encrypt 2)
        // const token=jwt.sign({userDetail:dataUser},"abcdef")

    //   }
    // }
    // if (index === -1)
    //   return res.status(500).send({ message: "email or password is invalid" });
    // const ans = await UserModel.findOne({email});
    // console.log(ans,"]]]]")
    // return res.status(200).json({ message: "data inserted successfully",data:ans });
  } catch (error) {
    console.log(error, "hi");
    return response.status(500).send({ message: "server error data" });
  }
});

module.exports = router;