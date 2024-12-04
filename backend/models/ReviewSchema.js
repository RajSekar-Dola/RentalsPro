import mongoose from "mongoose";
const ReviewSchema = new mongoose.Schema({
  username:{type:String,require:true},
  text: { type: String, required: true },
  rating: { type: Number, required: true },
});

const  Review= mongoose.model("Review", ReviewSchema);
export { Review }