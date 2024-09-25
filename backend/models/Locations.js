import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  locations: {
    type: [String], 
  },
});

const Location = mongoose.model('locations', locationSchema);
export {Location};
