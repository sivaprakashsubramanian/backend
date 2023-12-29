// console.log("Hello EveryOne ")
const bcrypt= require("bcrypt");
const express = require("express");
var bodyParser = require("body-parser");
const jwt=require("jsonwebtoken")
const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://sivaprakash:Siva12345@cluster0.b0a71xd.mongodb.net/sample"
  )
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));
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
// formData schema
// const formUserSchema=new schema({
  
//   formName:{type:String},
//   formData:{type:Array},
//   createdBy:{type:String},
//   createdAt:{type:Date,default:Date.now},
//   submissions:{type:Array}
  
// });
// we want to model schema
const UserModel = mongoose.model("user", userSchema);
// const formUserModal=mongoose.model("formUser",formUserSchema);
const app = express();
const cors = require("cors");
app.use(cors());

app.use(bodyParser.json({ type: "application/json" }));
// app is whole data listen is function it requires two field port 3000 for front end 5000 for backend
// get send data from this file
// post get data from another file
// patch get data and update it
// put get data and put it
// api endpoints are always asynchronus
// status rage 100-message 200-succes 300-redirect 400-client side error(response from client) 500-server side(code error)
// test refer URL
// here we want store the data from our databse
let db = [];
// whenever endpoints write inside try and catch
const midleWare=(req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    // console.log(authorizationHeader,"pppppp")

    if (authorizationHeader) {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
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
            req.user = decoded;
            // res.header({Authorization: "Bearer" + token})
            // We call next to pass execution to the subsequent middleware
            next();
        } catch (err) {
            // Throw an error just in case anything goes wrong with verification
            //throw new Error(err);
            return res.status(401).send({
                message: 'Unauthorized!'
            });
        }
    } else {
        return res.status(401).send({ message: `Authentication error. Token required.` });
    }
}
// GET Method
app.get("/get-all", async (_, response) => {
  try {
    const data = await UserModel.find();
    return response
      .status(200)
      .send({ message: "Data fetched Succesfully", data });
  } catch {
    return response.status(500).send({ message: "server error" });
  }
});
app.listen(5000, () => {
  console.log("Running at 5000");
});
// POST Method add data from user
app.post("/createNumber", async (request, response) => {
  console.log(request.body);
  try {
    const { firstName, lastName, age, email, gender, active, password, role } =
      request.body;
    // console.log(detail,"ssssss");
    const encryptPassword= await bcrypt.hash(password, 10);
    // password=encryptPassword;
    

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

    // if(!detail)
    // return response.status(500).send({message:"required field missing"})
    // if(isNaN((num)))
    // return response.status(400).send({message:"client side error"})
    // const getID = () => {
    //     const maxID = db.reduce(
    //       (max, db) => (db.id > max ? db.id : max),
    //       0
    //     );
    //     console.log(maxID,"qwert");
    //     return maxID + 1;
    //   };
    // db.push({
    //     id:getID(),
    //     firstName:detail.firstName,
    //     lastName:detail.lastName,
    //     email:detail.email,
    //     age:detail.age,
    //     gender:detail.gender,
    //     active:detail.active,

    // });
    return response.status(200).send({ message: "Data inserted Succesfully" });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});
// PUT METHOD
app.put("/put", async (request, response) => {
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
//PATCH METHOD
app.patch("/patch/:id",midleWare, async (request, response) => {
  console.log(response, "qqqqqqqqq");
  try {
    const { id = "" } = request.params;
    console.log("id",id);

    if (!id)
      return response.status(400).send({ message: "required field missing" });

    const { firstName, lastName, age, email, gender, active, password, role } =
      request.body;
    if (
      !email ||
      !firstName ||
      !lastName ||
      !gender ||
      !age ||
      active.length===0 ||
      !password ||
      !role
    )
      return response.status(400).json({ message: "Required field missing" });
    const userData = await UserModel.findById(id);
    
    // console.log(userData.firstName, "12345");
    if (!userData)
      return response.status(400).send({ message: "Data Not fetched" });
    userData.email = email;
    userData.firstName = firstName;
    userData.lastName = lastName;
    userData.gender = gender;
    userData.age = age;
    userData.active = active;
    userData.password = password;
    userData.role = role;
    console.log(userData, "12345");
    

    // if(isNaN(Number(detail)))
    // return response.status(400).send({message:"server side error",data:db})
    // db.push(Number(num));
    //    const q=db.findIndex(i=>i.id===detail)
    //    db.splice(q,1,id)
    await userData.save();
    const loginUser= await UserModel.find();
    console.log(loginUser,"userrr")
    return response.status(200).send({ message: "Data Updated Succesfully",data:loginUser });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});
//DELETE METHOD
app.delete("/delete/:id", async (request, response) => {
  try {
    console.log(request.params, "id");
    const { id = "" } = request.params;
    if (!id)
      return response.status(400).send({ message: "required field missing" });

    // if(isNaN(Number(id)))
    // return response.status(400).send({message:"client side error",data:db})
    // db.push(Number(num));
    //    const q=db.findIndex(i=>i.id===detail)
    //    console.log(db);
    //    if(q>-1)
    //    db.splice(q,1);
    await UserModel.findByIdAndDelete(id);
    const deleteUser=await UserModel.find();

    return response.status(200).send({ message: "Data Deleted Succesfully",data:deleteUser});
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});

//  app.listen(5000,()=>{
//     console.log("hello everyone")
//  })


app.post("/login", async (req, res) => {
  try {
    // we send request we again send
    const { email, password } = req.body || {};
    console.log(req.body,"hii");
    if(!email||!password)
   return res.status(400).send({message:"Data is missing"});
    const data = await UserModel.findOne({email:email});
    console.log(data,"data")
    if(!data)
    return res.status(400).send({message:"Invalid Login"})
  try{
    console.log(data.password,"pass check")
    // const checkPass=data.password===password;
    const checkPass= await bcrypt.compare( password,data.password);
   
    console.log(password,"userpass")
    if(!checkPass)
    {
       return res.status(400).send({message:"Password is incorrect"});
    }
    const token=jwt.sign({userDetail:data},"abcdef")
    console.log(token,"siva")
    res.header({Authorization: "Bearer" + token})
    res.status(200).send({meassage:"Data inserted",data:data,token:token})
    

  }
  catch(err)
  {
    console.log("Password Error",err)
  }
    // const index = data.findIndex(
    //   (i) => i.email === email && i.password === password
    // );
    // const dataUser=data.find((usr)=>usr.email===email);
    // // console.log(dataUser,"hii")
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
    return res.status(500).send({ message: "server error data" });
  }
});


// get Data from the form
app.get("/form-get",async(request,response)=>{
  try {
    const data = await formUserModal.find();
    // console.log(data,"hi")
    return response
      .status(200)
      .send({ message: "Data fetched Succesfully", data });
  } catch {
    return response.status(500).send({ message: "server error" });
  }

})
// form post
app.post("/form-post",midleWare,async(request,response)=>{
  // console.log(request.body,"qwerty");
  try {
    const {formName,formData}=request.body;
    const {firstName}=request.user;
   
    if(!formName||!formData){
    return response
      .status(400)
      .send({ message: "Data Misssing"});
  }
  const userFormData=new formUserModal({
    formName,
    formData,
    createdBy:firstName,

  })
  await userFormData.save();
    return response.status(200).send({message:"data fetched"});
  }
  catch {  console.log("hkkkkkkhqwerty");
    return response.status(500).send({ message: "server error" });
  }
})
// form-Patch method
app.patch("/form-patch/:id",async(request,response)=>{
  try {
    const { id = "" } = request.params;

    if (!id)
      return response.status(400).send({ message: "required field missing" });

    const { formName,formData} = request.body;
    // console.log(submitResponse,"siva")
    if (
      !formName||
      !formData
    )
      return response.status(400).json({ message: "Required field missing" });
    const userData = await formUserModal.findById(id);
    
    // console.log(userData.firstName, "12345");
    if (!userData)
      return response.status(400).send({ message: "Data Not fetched" });
    userData.formName = formName;
    userData.formData = formData;
    // userData.age = age;
    // userData.active = active;
    // userData.password = password;
    // userData.role = role;
    console.log(userData, "12345");
    

    // if(isNaN(Number(detail)))
    // return response.status(400).send({message:"server side error",data:db})
    // db.push(Number(num));
    //    const q=db.findIndex(i=>i.id===detail)
    //    db.splice(q,1,id)
    
    const updateData= await userData.save();
    return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
  
})
// get form response patch
// app.get("/submitFormResponse-get",async(request,response)=>{
//   try{
//     const data = await formUserModal.find();
//     console.log(data,"siva")

//   }
// })
// submit form response patch
app.patch("/submitFormResponse-patch/:id",async(request,response)=>{
  try{
    const {id}=request.params;
    // console.log(id,"vimal")
    if(!id)
    return response.status(400).send({meassage:"Id not found"})
  const {submitResponse}=request.body;
  // console.log(submitResponse,"vvvvv")
  if(!submitResponse)
  return response.status(400).send({message:"No FormData"})
 const userdata=await formUserModal.findById(id);
 if(!userdata)
 return response.status(400).send({message:"No User Data"})
 const {firstName}=request.user;

const submitData=[...userdata.submitResponse]
const submissionModal={
  submittedForm:submitResponse,
  createdBy:firstName,
}
submitData.push(...submitResponse);
console.log(submitData,"sathishhh")

  userdata.submitResponse=submitData;
  await userdata.save();
  const updateData= await formUserModal.find();
  console.log(updateData,"sssss")
  return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });

  }
  catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }

})
// form Delete
app.delete("/form-delete/:id",async (request, response) => {
  try {
    console.log(request.params, "id");
    const { id = "" } = request.params;
    if (!id)
      return response.status(400).send({ message: "required field missing" });

    // if(isNaN(Number(id)))
    // return response.status(400).send({message:"client side error",data:db})
    // db.push(Number(num));
    //    const q=db.findIndex(i=>i.id===detail)
    //    console.log(db);
    //    if(q>-1)
    //    db.splice(q,1);
    await formUserModal.findByIdAndDelete(id);
    const deleteUser=await formUserModal.find();

    return response.status(200).send({ message: "Data Deleted Succesfully",data:deleteUser});
  } catch (error) {
    console.log(error);
    return response.status(500).send({ message: "server error" });
  }
});
// // console.log("Hello EveryOne ")
// const bcrypt= require("bcrypt");
// const express = require("express");
// var bodyParser = require("body-parser");
// const jwt=require("jsonwebtoken")
// const mongoose = require("mongoose");
// mongoose
//   .connect(
//     "mongodb+srv://sivaprakash:Siva12345@cluster0.b0a71xd.mongodb.net/sample"
//   )
//   .then(() => console.log("DB Connected"))
//   .catch((err) => console.log(err));
// const schema = mongoose.Schema;
// //   in schemema we have said to mango db  which has to store this data
// // UserModel has the access for collection in database
// const userSchema = new schema({
//   firstName: { type: String },
//   lastName: { type: String },
//   email: { type: String },
//   age: { type: Number },
//   active: { type: Boolean },
//   gender: { type: String },
//   password: { type: String },
//   role: { type: String },
// });
// // formData schema
// const formUserSchema=new schema({
  
//   formName:{type:String},
//   formData:{type:Array},
//   formUserName:{type:String},
//   formTime:{type:String},
//   submitResponse:{type:Array}
  
// });
// // we want to model schema
// const UserModel = mongoose.model("user", userSchema);
// const formUserModal=mongoose.model("formUser",formUserSchema);
// const app = express();
// const cors = require("cors");
// app.use(cors());

// app.use(bodyParser.json({ type: "application/json" }));
// // app is whole data listen is function it requires two field port 3000 for front end 5000 for backend
// // get send data from this file
// // post get data from another file
// // patch get data and update it
// // put get data and put it
// // api endpoints are always asynchronus
// // status rage 100-message 200-succes 300-redirect 400-client side error(response from client) 500-server side(code error)
// // test refer URL
// // here we want store the data from our databse
// let db = [];
// // whenever endpoints write inside try and catch
// const midleWare=(req, res, next) => {
//     const authorizationHeader = req.headers.authorization;
//     // console.log(authorizationHeader,"pppppp")

//     if (authorizationHeader) {
//         const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
//         // console.log(tokzzzzzz)
//         try {
//             // verify makes sure that the token hasn't expired and has been issued by us
//             const decoded = jwt.verify(token, "abcdef");
//             console.log(decoded,"decodeed");
//             // res.locals.userId = result.user.id;
//             // res.locals.username = result.user.fullName;
//             // res.locals.email = result.user.email;
//             // res.locals.role = result.user.role;
//             // Let's pass back the decoded token to the request object
//             req.user = decoded;
//             // res.header({Authorization: "Bearer" + token})
//             // We call next to pass execution to the subsequent middleware
//             next();
//         } catch (err) {
//             // Throw an error just in case anything goes wrong with verification
//             //throw new Error(err);
//             return res.status(401).send({
//                 message: 'Unauthorized!'
//             });
//         }
//     } else {
//         return res.status(401).send({ message: `Authentication error. Token required.` });
//     }
// }
// // GET Method
// app.get("/get-all", async (_, response) => {
//   try {
//     const data = await UserModel.find();
//     return response
//       .status(200)
//       .send({ message: "Data fetched Succesfully", data });
//   } catch {
//     return response.status(500).send({ message: "server error" });
//   }
// });
// app.listen(5000, () => {
//   console.log("Running at 5000");
// });
// // POST Method add data from user
// app.post("/createNumber", async (request, response) => {
//   console.log(request.body);
//   try {
//     const { firstName, lastName, age, email, gender, active, password, role } =
//       request.body;
//     // console.log(detail,"ssssss");
//     const encryptPassword= await bcrypt.hash(password, 10);
//     // password=encryptPassword;
    

//     if (
//       !email ||
//       !firstName ||
//       !lastName ||
//       !gender ||
//       !age ||
//       !active ||
//       !password ||
//       !role
//     )
//       return response.status(400).json({ message: "Required field missing" });
//     if (firstName.length < 3)
//       return response
//         .status(400)
//         .json({ message: "First Name should be more than 3  character" });
//     if (lastName.length < 1)
//       return response
//         .status(400)
//         .json({ message: "LastName should be more than 1 character" });
//     if (password.length < 8)
//       return response
//         .status(400)
//         .json({ message: "password should be more than 8 character" });
//     const userName = await UserModel.findOne({ email });
//     if (userName)
//       return response.status(400).json({ message: "Already exist Email" });

//     // we have created a reference modal named UserModal  which is new data
//     console.log(encryptPassword,"pass")
//     const userData = new UserModel({
//       firstName,
//       lastName,
//       age,
//       email,
//       gender,
//       active,
//       password:encryptPassword,
//       role,
//     });
//     // whenever we do a database call we await method
//     await userData.save();

//     // if(!detail)
//     // return response.status(500).send({message:"required field missing"})
//     // if(isNaN((num)))
//     // return response.status(400).send({message:"client side error"})
//     // const getID = () => {
//     //     const maxID = db.reduce(
//     //       (max, db) => (db.id > max ? db.id : max),
//     //       0
//     //     );
//     //     console.log(maxID,"qwert");
//     //     return maxID + 1;
//     //   };
//     // db.push({
//     //     id:getID(),
//     //     firstName:detail.firstName,
//     //     lastName:detail.lastName,
//     //     email:detail.email,
//     //     age:detail.age,
//     //     gender:detail.gender,
//     //     active:detail.active,

//     // });
//     return response.status(200).send({ message: "Data inserted Succesfully" });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
// // PUT METHOD
// app.put("/put", async (request, response) => {
//   try {
//     console.log(request.body);
//     db = [];
//     const { detail } = request.body;

//     db.push(detail);
//     return response
//       .status(200)
//       .send({ message: "Data changed Succesfully", data: db });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
// //PATCH METHOD
// app.patch("/patch/:id",midleWare, async (request, response) => {
//   console.log(response, "qqqqqqqqq");
//   try {
//     const { id = "" } = request.params;
//     console.log("id",id);

//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     const { firstName, lastName, age, email, gender, active, password, role } =
//       request.body;
//     if (
//       !email ||
//       !firstName ||
//       !lastName ||
//       !gender ||
//       !age ||
//       active.length===0 ||
//       !password ||
//       !role
//     )
//       return response.status(400).json({ message: "Required field missing" });
//     const userData = await UserModel.findById(id);
    
//     // console.log(userData.firstName, "12345");
//     if (!userData)
//       return response.status(400).send({ message: "Data Not fetched" });
//     userData.email = email;
//     userData.firstName = firstName;
//     userData.lastName = lastName;
//     userData.gender = gender;
//     userData.age = age;
//     userData.active = active;
//     userData.password = password;
//     userData.role = role;
//     console.log(userData, "12345");
    

//     // if(isNaN(Number(detail)))
//     // return response.status(400).send({message:"server side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    db.splice(q,1,id)
//     await userData.save();
//     const loginUser= await UserModel.find();
//     console.log(loginUser,"userrr")
//     return response.status(200).send({ message: "Data Updated Succesfully",data:loginUser });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
// //DELETE METHOD
// app.delete("/delete/:id", async (request, response) => {
//   try {
//     console.log(request.params, "id");
//     const { id = "" } = request.params;
//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     // if(isNaN(Number(id)))
//     // return response.status(400).send({message:"client side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    console.log(db);
//     //    if(q>-1)
//     //    db.splice(q,1);
//     await UserModel.findByIdAndDelete(id);
//     const deleteUser=await UserModel.find();

//     return response.status(200).send({ message: "Data Deleted Succesfully",data:deleteUser});
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });

// //  app.listen(5000,()=>{
// //     console.log("hello everyone")
// //  })


// app.post("/login", async (req, res) => {
//   try {
//     // we send request we again send
//     const { email, password } = req.body || {};
//     console.log(req.body,"hii");
//     if(!email||!password)
//    return res.status(400).send({message:"Data is missing"});
//     const data = await UserModel.findOne({email:email});
//     console.log(data,"data")
//     if(!data)
//     return res.status(400).send({message:"Invalid Login"})
//   try{
//     console.log(data.password,"pass check")
//     // const checkPass=data.password===password;
//     const checkPass= await bcrypt.compare( password,data.password);
   
//     console.log(password,"userpass")
//     if(!checkPass)
//     {
//        return res.status(400).send({message:"Password is incorrect"});
//     }
//     const token=jwt.sign({userDetail:data},"abcdef")
//     console.log(token,"siva")
//     res.header({Authorization: "Bearer" + token})
//     res.status(200).send({meassage:"Data inserted",data:data,token:token})
    

//   }
//   catch(err)
//   {
//     console.log("Password Error",err)
//   }
//     // const index = data.findIndex(
//     //   (i) => i.email === email && i.password === password
//     // );
//     // const dataUser=data.find((usr)=>usr.email===email);
//     // // console.log(dataUser,"hii")
//     // if(dataUser)
//     // {
//     //   if(dataUser.password===password)
//     //   {
//     //     // it require three parameter but two confirm 1) which data to encrypt 2)
//         // const token=jwt.sign({userDetail:dataUser},"abcdef")

//     //   }
//     // }
//     // if (index === -1)
//     //   return res.status(500).send({ message: "email or password is invalid" });
//     // const ans = await UserModel.findOne({email});
//     // console.log(ans,"]]]]")
//     // return res.status(200).json({ message: "data inserted successfully",data:ans });
//   } catch (error) {
//     console.log(error, "hi");
//     return res.status(500).send({ message: "server error data" });
//   }
// });


// // get Data from the form
// app.get("/form-get",async(request,response)=>{
//   try {
//     const data = await formUserModal.find();
//     // console.log(data,"hi")
//     return response
//       .status(200)
//       .send({ message: "Data fetched Succesfully", data });
//   } catch {
//     return response.status(500).send({ message: "server error" });
//   }

// })
// // form post
// app.post("/form-post",async(request,response)=>{
//   // console.log(request.body,"qwerty");
//   try {
//     const {formName,formData,formUserName,formTime}=request.body;
   
//     if(!formName||!formData||!formUserName||!formTime){
//     return response
//       .status(400)
//       .send({ message: "Data Misssing"});
//   }
//   const userFormData=new formUserModal({
//     formName,
//     formData,
//     formUserName,
//     formTime

//   })
//   await userFormData.save();
//     return response.status(200).send({message:"data fetched"});
//   }
//   catch {  console.log("hkkkkkkhqwerty");
//     return response.status(500).send({ message: "server error" });
//   }
// })
// // form-Patch method
// app.patch("/form-patch/:id",async(request,response)=>{
//   try {
//     const { id = "" } = request.params;

//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     const { formName,formData,formUserName,formTime } = request.body;
//     // console.log(submitResponse,"siva")
//     if (
//       !formName||
//       !formData||
//       !formUserName||
//       !formTime
//     )
//       return response.status(400).json({ message: "Required field missing" });
//     const userData = await formUserModal.findById(id);
    
//     // console.log(userData.firstName, "12345");
//     if (!userData)
//       return response.status(400).send({ message: "Data Not fetched" });
//     userData.formName = formName;
//     userData.formData = formData;
//     userData.formUserName = formUserName;
//     userData.formTime = formTime;
//     // userData.age = age;
//     // userData.active = active;
//     // userData.password = password;
//     // userData.role = role;
//     console.log(userData, "12345");
    

//     // if(isNaN(Number(detail)))
//     // return response.status(400).send({message:"server side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    db.splice(q,1,id)
//     await userData.save();
//     const updateData= await formUserModal.find();
//     return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
  
// })
// // get form response patch
// // app.get("/submitFormResponse-get",async(request,response)=>{
// //   try{
// //     const data = await formUserModal.find();
// //     console.log(data,"siva")

// //   }
// // })
// // submit form response patch
// app.patch("/submitFormResponse-patch/:id",async(request,response)=>{
//   try{
//     const {id}=request.params;
//     // console.log(id,"vimal")
//     if(!id)
//     return response.status(400).send({meassage:"Id not found"})
//   const {submitResponse}=request.body;
//   // console.log(submitResponse,"vvvvv")
//   if(!submitResponse)
//   return response.status(400).send({message:"No FormData"})
//  const userdata=await formUserModal.findById(id);
//  if(!userdata)
//  return response.status(400).send({message:"No User Data"})
// const submitData=[...userdata.submitResponse]
// submitData.push(...submitResponse);
// console.log(submitData,"sathishhh")

//   userdata.submitResponse=submitData;
//   await userdata.save();
//   const updateData= await formUserModal.find();
//   console.log(updateData,"sssss")
//   return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });

//   }
//   catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }

// })
// // form Delete
// app.delete("/form-delete/:id",async (request, response) => {
//   try {
//     console.log(request.params, "id");
//     const { id = "" } = request.params;
//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     // if(isNaN(Number(id)))
//     // return response.status(400).send({message:"client side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    console.log(db);
//     //    if(q>-1)
//     //    db.splice(q,1);
//     await formUserModal.findByIdAndDelete(id);
//     const deleteUser=await formUserModal.find();

//     return response.status(200).send({ message: "Data Deleted Succesfully",data:deleteUser});
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
//inndex .js
// // console.log("Hello EveryOne ")
// const bcrypt= require("bcrypt");
// const express = require("express");
// var bodyParser = require("body-parser");
// const jwt=require("jsonwebtoken")
// const mongoose = require("mongoose");
// mongoose
//   .connect(
//     "mongodb+srv://sivaprakash:Siva12345@cluster0.b0a71xd.mongodb.net/sample"
//   )
//   .then(() => console.log("DB Connected"))
//   .catch((err) => console.log(err));
// const schema = mongoose.Schema;
// //   in schemema we have said to mango db  which has to store this data
// // UserModel has the access for collection in database
// const userSchema = new schema({
//   firstName: { type: String },
//   lastName: { type: String },
//   email: { type: String },
//   age: { type: Number },
//   active: { type: Boolean },
//   gender: { type: String },
//   password: { type: String },
//   role: { type: String },
// });
// // formData schema
// const formUserSchema=new schema({
  
//   formName:{type:String},
//   formData:{type:Array},
//   createdBy:{type:String},
//   createdAt:{type:Date,default:Date.now},
//   submissions:{type:Array}
  
// });
// // we want to model schema
// const UserModel = mongoose.model("user", userSchema);
// const formUserModal=mongoose.model("formUser",formUserSchema);
// const app = express();
// const cors = require("cors");
// app.use(cors());

// app.use(bodyParser.json({ type: "application/json" }));
// // app is whole data listen is function it requires two field port 3000 for front end 5000 for backend
// // get send data from this file
// // post get data from another file
// // patch get data and update it
// // put get data and put it
// // api endpoints are always asynchronus
// // status rage 100-message 200-succes 300-redirect 400-client side error(response from client) 500-server side(code error)
// // test refer URL
// // here we want store the data from our databse
// let db = [];
// // whenever endpoints write inside try and catch
// const midleWare=(request, response, next) => {
//     const authorizationHeader = request.headers.authorization;
//     // console.log(authorizationHeader,"pppppp")

//     if (authorizationHeader) {
//         const token = request.headers.authorization.split(' ')[1]; // Bearer <token>
//         // console.log(token,"hii")
//         try {
//             // verify makes sure that the token hasn't expired and has been issued by us
//             const decoded = jwt.verify(token, "abcdef");
//             console.log(decoded,"decodeed");
//             // res.locals.userId = result.user.id;
//             // res.locals.username = result.user.fullName;
//             // res.locals.email = result.user.email;
//             // res.locals.role = result.user.role;
//             // Let's pass back the decoded token to the request object
//             request.user = decoded;
//             // res.header({Authorization: "Bearer" + token})
//             // We call next to pass execution to the subsequent middleware
//             next();
//         } catch (err) {
//             // Throw an error just in case anything goes wrong with verification
//             //throw new Error(err);
//             return response.status(401).send({
//                 message: 'Unauthorized!'
//             });
//         }
//     } else {
//         return response.status(401).send({ message: `Authentication error. Token required.` });
//     }
// }
// // GET Method
// app.get("/get-all", async (_, response) => {
//   try {
//     const data = await UserModel.find();
//     return response
//       .status(200)
//       .send({ message: "Data fetched Succesfully", data });
//   } catch {
//     return response.status(500).send({ message: "server error" });
//   }
// });
// app.listen(5000, () => {
//   console.log("Running at 5000");
// });
// // POST Method add data from user
// app.post("/createNumber", async (request, response) => {
//   console.log(request.body);
//   try {
//     const { firstName, lastName, age, email, gender, active, password, role } =
//       request.body;
//     // console.log(detail,"ssssss");
//     const encryptPassword= await bcrypt.hash(password, 10);
//     // password=encryptPassword;
    

//     if (
//       !email ||
//       !firstName ||
//       !lastName ||
//       !gender ||
//       !age ||
//       !active ||
//       !password ||
//       !role
//     )
//       return response.status(400).json({ message: "Required field missing" });
//     if (firstName.length < 3)
//       return response
//         .status(400)
//         .json({ message: "First Name should be more than 3  character" });
//     if (lastName.length < 1)
//       return response
//         .status(400)
//         .json({ message: "LastName should be more than 1 character" });
//     if (password.length < 8)
//       return response
//         .status(400)
//         .json({ message: "password should be more than 8 character" });
//     const userName = await UserModel.findOne({ email });
//     if (userName)
//       return response.status(400).json({ message: "Already exist Email" });

//     // we have created a reference modal named UserModal  which is new data
//     console.log(encryptPassword,"pass")
//     const userData = new UserModel({
//       firstName,
//       lastName,
//       age,
//       email,
//       gender,
//       active,
//       password:encryptPassword,
//       role,
//     });
//     // whenever we do a database call we await method
//     await userData.save();

//     // if(!detail)
//     // return response.status(500).send({message:"required field missing"})
//     // if(isNaN((num)))
//     // return response.status(400).send({message:"client side error"})
//     // const getID = () => {
//     //     const maxID = db.reduce(
//     //       (max, db) => (db.id > max ? db.id : max),
//     //       0
//     //     );
//     //     console.log(maxID,"qwert");
//     //     return maxID + 1;
//     //   };
//     // db.push({
//     //     id:getID(),
//     //     firstName:detail.firstName,
//     //     lastName:detail.lastName,
//     //     email:detail.email,
//     //     age:detail.age,
//     //     gender:detail.gender,
//     //     active:detail.active,

//     // });
//     return response.status(200).send({ message: "Data inserted Succesfully" });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
// // PUT METHOD
// app.put("/put", async (request, response) => {
//   try {
//     console.log(request.body);
//     db = [];
//     const { detail } = request.body;

//     db.push(detail);
//     return response
//       .status(200)
//       .send({ message: "Data changed Succesfully", data: db });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
// //PATCH METHOD
// app.patch("/patch/:id",midleWare, async (request, response) => {
//   console.log(response, "qqqqqqqqq");
//   try {
//     const { id = "" } = request.params;
//     console.log("id",id);

//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     const { firstName, lastName, age, email, gender, active, password, role } =
//       request.body;
//     if (
//       !email ||
//       !firstName ||
//       !lastName ||
//       !gender ||
//       !age ||
//       active.length===0 ||
//       !password ||
//       !role
//     )
//       return response.status(400).json({ message: "Required field missing" });
//     const userData = await UserModel.findById(id);
    
//     // console.log(userData.firstName, "12345");
//     if (!userData)
//       return response.status(400).send({ message: "Data Not fetched" });
//     userData.email = email;
//     userData.firstName = firstName;
//     userData.lastName = lastName;
//     userData.gender = gender;
//     userData.age = age;
//     userData.active = active;
//     userData.password = password;
//     userData.role = role;
//     console.log(userData, "12345");
    

//     // if(isNaN(Number(detail)))
//     // return response.status(400).send({message:"server side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    db.splice(q,1,id)
//     await userData.save();
//     const loginUser= await UserModel.find();
//     console.log(loginUser,"userrr")
//     return response.status(200).send({ message: "Data Updated Succesfully",data:loginUser });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });
// //DELETE METHOD
// app.delete("/delete/:id", midleWare,async (request, response) => {
//   try {
//     console.log(request.params, "id");
//     const { id = "" } = request.params;
//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     // if(isNaN(Number(id)))
//     // return response.status(400).send({message:"client side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    console.log(db);
//     //    if(q>-1)
//     //    db.splice(q,1);
//     await UserModel.findByIdAndDelete(id);
//     const deleteUser=await UserModel.find();

//     return response.status(200).send({ message: "Data Deleted Succesfully",data:deleteUser});
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });

// //  app.listen(5000,()=>{
// //     console.log("hello everyone")
// //  })

// app.post("/login", async (request, response) => {
//   try {
//     // we send request we again send
//     const { email, password } = request.body || {};
//     console.log(request.body,"hii");
//     if(!email||!password)
//    return response.status(400).send({message:"Data is missing"});
//     const data = await UserModel.findOne({email:email});
//     console.log(data,"data")
//     if(!data)
//     return response.status(400).send({message:"Invalid Login"})
//   try{
//     console.log(data.password,"pass check")
//     // const checkPass=data.password===password;
//     const checkPass= await bcrypt.compare( password,data.password);
   
//     console.log(password,"userpass")
//     if(!checkPass)
//     {
//        return response.status(400).send({message:"Password is incorrect"});
//     }
//     const token=jwt.sign({userDetail:data},"abcdef")
//     console.log(token,"siva")
//     response.header({Authorization: "Bearer" + token})
//     response.status(200).send({meassage:"Data inserted",data:data,token:token})
    

//   }
//   catch(err)
//   {
//     console.log("Password Error",err)
//   }
//     // const index = data.findIndex(
//     //   (i) => i.email === email && i.password === password
//     // );
//     // const dataUser=data.find((usr)=>usr.email===email);
//     // // console.log(dataUser,"hii")
//     // if(dataUser)
//     // {
//     //   if(dataUser.password===password)
//     //   {
//     //     // it require three parameter but two confirm 1) which data to encrypt 2)
//         // const token=jwt.sign({userDetail:dataUser},"abcdef")

//     //   }
//     // }
//     // if (index === -1)
//     //   return res.status(500).send({ message: "email or password is invalid" });
//     // const ans = await UserModel.findOne({email});
//     // console.log(ans,"]]]]")
//     // return res.status(200).json({ message: "data inserted successfully",data:ans });
//   } catch (error) {
//     console.log(error, "hi");
//     return response.status(500).send({ message: "server error data" });
//   }
// });


// // get Data from the form
// app.get("/form-get",async(request,response)=>{
//   try {
//     const data = await formUserModal.find();
//     // console.log(data,"hi")
//     return response
//       .status(200)
//       .send({ message: "Data fetched Succesfully", data });
//   } catch {
//     return response.status(500).send({ message: "server error" });
//   }

// })
// // form post
// app.post("/form-post",async(request,response)=>{
//   console.log(request.body,"qwerty");
//   try {
//     const {formName,formData}=request.body;
//     // const {firstName}=request.user.userDetail;
//     // console.log(firstName,"first name")
   
//     if(!formName||!formData){
//     return response
//       .status(400)
//       .send({ message: "Data Misssing"});
//   }
//   const userFormData=new formUserModal({
//     formName,
//     formData,
//     // createdBy:firstName,

//   })
//   await userFormData.save();
//     return response.status(200).send({message:"data fetched",data:userFormData});
//   }
//   catch {  console.log("hkkkkkkhqwerty");
//     return response.status(500).send({ message: "server error" });
//   }
// })
// // form-Patch method
// app.patch("/form-patch/:id",midleWare,async(request,response)=>{
//   try {
//     const { id = "" } = request.params;

//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     const { formName,formData} = request.body;
//     // console.log(submitResponse,"siva")
//     if (
//       !formName||
//       !formData
//     )
//       return response.status(400).json({ message: "Required field missing" });
//     const userData = await formUserModal.findById(id);
    
//     // console.log(userData.firstName, "12345");
//     if (!userData)
//       return response.status(400).send({ message: "Data Not fetched" });
//     userData.formName = formName;
//     userData.formData = formData;
//     // userData.age = age;
//     // userData.active = active;
//     // userData.password = password;
//     // userData.role = role;
//     console.log(userData, "12345");
    

//     // if(isNaN(Number(detail)))
//     // return response.status(400).send({message:"server side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    db.splice(q,1,id)
    
//     const updateData= await userData.save();
//     return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
  
// })
// // get form response patch
// // app.get("/submitFormResponse-get",async(request,response)=>{
// //   try{
// //     const data = await formUserModal.find();
// //     console.log(data,"siva")

// //   }
// // })
// // submit form response patch
// app.patch("/submitFormResponse-patch/:id",midleWare,async(request,response)=>{
//   try{
//     const {id}=request.params;
//     console.log(id,"vimal")
//     if(!id)
//     return response.status(400).send({meassage:"Id not found"})
//   const {submissions}=request.body;
//   // console.log(submitResponse,"vvvvv")
//   if(!submissions)
//   return response.status(401).send({message:"No FormData"})
//  const userdata=await formUserModal.findById(id);
//  if(!userdata)
//  return response.status(402).send({message:"No User Data"})
// //  const {firstName}=request.user.userDetail;


// const submitData=[...userdata.submissions]
// // const submissionModal={
// //   submittedForm:submissions,
// //   // createdBy:firstName,
// // }
// submitData.push(...submissions);
// // console.log(submitData,"sathishhh")

//   userdata.submissions=submitData;
//   await userdata.save();
//   const updateData= await formUserModal.find();
//   console.log(updateData,"iiiiiii")
//   console.log(updateData,"sssss")
//   return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });

//   }
//   catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }

// })
// // form Delete
// app.delete("/form-delete/:id",midleWare,async (request, response) => {
//   try {
//     console.log(request.params, "id");
//     const { id = "" } = request.params;
//     if (!id)
//       return response.status(400).send({ message: "required field missing" });

//     // if(isNaN(Number(id)))
//     // return response.status(400).send({message:"client side error",data:db})
//     // db.push(Number(num));
//     //    const q=db.findIndex(i=>i.id===detail)
//     //    console.log(db);
//     //    if(q>-1)
//     //    db.splice(q,1);
//     await formUserModal.findByIdAndDelete(id);
//     const deleteUser=await formUserModal.find();

//     return response.status(200).send({ message: "Data Deleted Succesfully"});
//   } catch (error) {
//     console.log(error);
//     return response.status(500).send({ message: "server error" });
//   }
// });