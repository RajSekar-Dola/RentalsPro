import mongoose from "mongoose";
const ProductSchema= new mongoose.Schema({
    userid:{type:String,require:true},
    productType:{type:String,required:true,},
    productName: {type:String,required:true,},
    locationName:{type:String,required:true,},
    fromDateTime:  {
        type: Date,
        required:true,
      },
    toDateTime: {
        type: Date,
        required:true,
      },
    price: {type:Number,required:true,},
    photo:{type:[String],required:true},
    uploadDate:{type:Date,required:true},
    bookingdates:{type:[[Date,Date]]},
    bookingIds:{type:[String]},
    expired:{type:Boolean,require:true,}
});

ProductSchema.index({
  expired: 1,
  productType: 1,
  locationName: 1,
  fromDateTime: 1,
  toDateTime: 1,
  price: 1,
  uploadDate: -1
});

// Text search index for productName and locationName
ProductSchema.index({
  productName: "text",
  locationName: "text"
});

// Optional: if most queries are on expired: false
ProductSchema.index({
  productType: 1,
  locationName: 1,
  fromDateTime: 1,
  toDateTime: 1,
  price: 1,
  uploadDate: -1
}, { partialFilterExpression: { expired: false } });

const Product = mongoose.model("Products", ProductSchema);
export { Product };