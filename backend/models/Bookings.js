import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
    product_id: {
        type: String,
        required: true,
    },
    buyerid:{
        type:String,
        required:true,
    },
    fromDateTime: {
        type: Date,
        required: true,
    },
    toDateTime: {
        type: Date,
        required: true,
    },
    price: { type: Number, required: true },
    bookingDate:{type:Date ,required:true},
});

const Booking = mongoose.model("bookings", BookingSchema);
export { Booking };