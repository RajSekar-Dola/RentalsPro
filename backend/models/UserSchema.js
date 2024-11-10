import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  dateofbirth: {
    type: Date,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bookings: {
    type: [String],
  },
  rentals:{
    type: [String],
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

const User = mongoose.model("Users", UserSchema);
export { User }