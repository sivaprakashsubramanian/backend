
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const router = express.Router();
const cors = require("cors");
router.use(cors());
router.use(bodyParser.json({ type: "application/json" }));
const schema = mongoose.Schema;
const formUserSchema=new schema({
  
  formName:{type:String},
  formData:{type:Array},
  createdBy:{type:String},
  createdAt:{type:Date,default:Date.now},
  submissions:{type:Array}
  
});
const formUserModal = mongoose.model("formUser", formUserSchema);

const midleWare = (request, response, next) => {
  
    const authorizationHeader = request.headers.authorization;
    

    if (authorizationHeader) {
        const token = request.headers.authorization.split(' ')[1]; // Bearer <token>
       
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


router.get("/get-userForm",midleWare,async(request,response)=>{
  try {
    const data = await formUserModal.find();
    
    return response
      .status(200)
      .send({ message: "Data fetched Succesfully", data });
  } catch {
    return response.status(500).send({ message: "server error" });
  }
})

// POST Method for creating user form
router.post("/create-userForm",midleWare, async (request, response) => {
    
    console.log(request.body,"qwerty");
    try {
      const {formName,formData}=request.body;
      const {firstName}=request.user.userDetail;
      // console.log(firstName,"first name")
     
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
      return response.status(200).send({message:"New Form is Created",data:userFormData});
    }
    catch {
      return response.status(500).send({ message: "server error" });
    }
});

// PATCH Method for updating user form
router.patch("/update-userForm/:id", midleWare, async (request, response) => {
    
    try {
      const { id = "" } = request.params;
  
      if (!id)
        return response.status(400).send({ message: "required field missing" });
  
      const { formName,formData} = request.body;
     
      if (
        !formName||
        !formData
      )
        return response.status(400).json({ message: "Required field missing" });
      const userData = await formUserModal.findById(id);
      
     
      if (!userData)
        return response.status(400).send({ message: "Data Not fetched" });
      userData.formName = formName;
      userData.formData = formData;
      
      const updateData= await userData.save();
      
      return response.status(200).send({ message: "Data Updated Succesfully",data:updateData });
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: "server error" });
    }
});

// PATCH Method for submitting form response
router.patch("/update-userFormResponse/:id", midleWare, async (request, response) => {
   
    try{
      const {id}=request.params;
      console.log(id,"vimal")
      if(!id)
      return response.status(400).send({meassage:"Id not found"})
    const {submissions}=request.body;
   
    if(!submissions)
    return response.status(401).send({message:"No FormData"})
   const userdata=await formUserModal.findById(id);
   if(!userdata)
   return response.status(402).send({message:"No User Data"})
  //  const {firstName}=request.user.userDetail;
  
  
  const submitData=[...userdata.submissions]
  // const submissionModal={
  //   submittedForm:submissions,
  //   // createdBy:firstName,
  // }
  submitData.push(...submissions);
  
  
    userdata.submissions=submitData;
    await userdata.save();
    const updateData= await formUserModal.find();
    console.log(updateData,"iiiiiii")
    console.log(updateData,"sssss")
    return response.status(200).send({ message: "Response added Succesfully",data:updateData });
  
    }
    catch (error) {
      // console.log(error);
      return response.status(500).send({ message: "server error" });
    }
});

// DELETE Method for deleting user form
router.delete("/delete-userForm/:id", midleWare, async (request, response) => {
    try {
      console.log(request.params, "id");
      const { id = "" } = request.params;
      if (!id)
        return response.status(400).send({ message: "required field missing" });
      await formUserModal.findByIdAndDelete(id);
      const deleteUser=await formUserModal.find();
  
      return response.status(200).send({ message: "Data Deleted Succesfully"});
    } catch (error) {
      console.log(error);
      return response.status(500).send({ message: "server error" });
    }
});

module.exports = router;
