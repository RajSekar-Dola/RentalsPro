import mongoose from "mongoose";
const ManagerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
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
  branch:{
    type:String,
    required:true,
  },
  notifications:{
    type:[{
      message: { type: String, required: true },
      seen: { type: Boolean, default: false },
    },
  ],
  default:[],
  }
});

const Manager = mongoose.model("Managers", ManagerSchema);
export { Manager }