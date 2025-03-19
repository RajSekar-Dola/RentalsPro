import express from 'express';
import { User } from '../models/UserSchema.js';
import {Product} from '../models/ProductSchema.js';
import {Booking} from '../models/Bookings.js';


const router = express.Router();

router.get('/notifications',async(req,res)=>{
    try {
      const userid = req.cookies.user_id;
      if (userid) {
        const exist_user = await User.findById(userid);
        const notifications=exist_user.notifications;
        const bookingids=notifications.map(x=>x.message);
        if (exist_user) {
          res.json({notifications:notifications,bookingids:bookingids});
        } else {
          res.status(404).json({ message: "booking not found" });
        }
      } else {
        res.status(400).json({ message: "No user cookie found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
  
  router.get('/notifications/:bookingid',async(req,res)=>{
    const {bookingid}=req.params;
    console.log(bookingid);
    try{
      const reqbooking=await Booking.findById(bookingid);
      const reqproduct=await Product.findById(reqbooking.product_id);
      const reqbuyer=await User.findById(reqbooking.buyerid);
      if(!reqbooking)
      {    console.log(reqbooking);
        return res.status(404).json({error :'booking not found !'});
      }
      return res.status(200).json({reqbooking:reqbooking,reqproduct:reqproduct,reqbuyer:reqbuyer});
      
    }catch(error)
    {
      res.status(500).json({error:"server error !"});
    }
  })
  
  router.post('/notifications/markAsSeen', async (req, res) => {
    try {
      const userid = req.cookies.user_id;
      const { notificationid } = req.body;
  
      // Update the notification's seen field to true only if it is currently false
      const updatedNotification = await User.findOneAndUpdate(
        { _id: userid, "notifications._id": notificationid, "notifications.seen": false },
        { $set: { "notifications.$.seen": true } },
        { new: true }
      );
  
      // if (!updatedNotification) {
      //   return res.status(400).json({ message: "Notification was not updated. It may already be marked as seen or not found." });
      // } else {
      //   return res.status(200).json({ message: "Notification marked as seen successfully!" });
      // }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  
  router.post('/notifications/products', async (req, res) => {
    const { bookingids } = req.body;  // Extract bookingids from the request body
    try {
      const products = [];
  
      for (const bookingid of bookingids) {
        const reqbooking = await Booking.findById(bookingid);
        if (!reqbooking) continue;
  
        const reqproduct = await Product.findById(reqbooking.product_id);
        if (!reqproduct) continue;
  
        const reqbuyer = await User.findById(reqbooking.buyerid);
        if (!reqbuyer) continue;
  
        products.push({ reqbooking, reqproduct, reqbuyer });
      }
      if (products.length === 0) {
        return res.status(404).json({ error: 'No bookings found!' });
      }
  
      return res.status(200).json({ products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error!' });
    }
  });
  
  export default router;