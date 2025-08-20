import mongoose, { Mongoose } from "mongoose";
import { Schema } from "mongoose";

const loginSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {   
    type: String,
    required: true,
    unique: true,  
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["buyer", "agent"],
    default: "buyer"
  },
}, 
{ 
    timestamps: true,
});


const collection = mongoose.model("User", loginSchema);
export default collection;

