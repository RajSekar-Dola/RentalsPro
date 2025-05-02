import express from 'express';
import bcrypt from 'bcryptjs';

import { User } from '../models/UserSchema.js';
import {Product} from '../models/ProductSchema.js';
import {Booking} from '../models/Bookings.js';
import { Manager } from '../models/ManagerSchema.js';

const router = express.Router();

router.get('/registeredusers',async(req,res)=>{
    try{
      const users=await User.find({expired:false});
      const usercount = await User.countDocuments({expired:false});
      if(!users)
      {
        return res.status(200).json({error :'Users not found !'});
      }
      return res.status(200).json({registercount:usercount,users:users,});
      
    }catch(error)
    {
      res.status(500).json({error:"server error !"});
    }
  })
  
  router.post('/deleteusers', async (req, res) => {
    const { user_id, forceDelete } = req.body;
    try {
      // Check if user has bookings
      const bookings = await Booking.findOne({ buyerid: user_id });
      if (bookings && !forceDelete) {
        // If bookings exist and forceDelete is false, return an alert
        return res.status(200).json({ alert: true, });
      }
  
      // If forceDelete is true or there are no bookings, proceed with deletion
      await Product.updateMany({ userid: user_id }, { $set: { expired: true } }, { new: true });
      const deletedUser = await User.findOneAndUpdate({_id:user_id},{$set:{expired :true}},{new:true});
  
      if (!deletedUser) {
        return res.status(200).json({ message: 'User not found in database!' });
      }
  
      return res.status(200).json({ message: 'User and their bookings/products deleted successfully!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error!' });
    }
  });
  
  router.post('/createmanager',async(req,res)=>{
    console.log(req.body);
    const { username, email,password ,branch} = req.body;
    if (!username || !email || !branch || !password) {
      return res.status(409).json({ errormessage: 'All fields are required' });
    }
  
    try {
      const existingUser = await Manager.findOne({ username });
      const existingEmail = await Manager.findOne({ email });
      const existingbranch= await Manager.findOne({branch});
      if(existingbranch)
      {
        return res.status(404).json({ errormessage: 'Manager for branch already exists !'});
      }
      if (existingEmail) {
        return res.status(404).json({ errormessage: 'Email already exists' });
      }
      if (existingUser) {
        return res.status(404).json({ errormessage: 'Username already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newManager = new Manager({
        username,
        email,
        password: hashedPassword,
        branch:branch,
        notifications:[],
      });
  
      await newManager.save();
      res.status(201).json({ errormessage: 'Manager created successfully !' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ errormessage: 'Error creating Manager' });
    }
  
  })
  
  router.get('/registeredmanagers', async (req, res) => {
    try {
      const users = await Manager.find({});
      const usercount = await Manager.countDocuments({});
      if (users.length === 0) {
        return res.status(200).json({ error: 'No managers found!' });
      }
      return res.status(200).json({ registercount: usercount, managers: users });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error!' });
    }
  });
  
  router.post('/deletemanagers',async(req,res)=>{
  
    const { manager_id, forceDelete } = req.body;
  
    try {
      if (!forceDelete) {
        return res.status(200).json({ alert: true, });
      }
      const deletedUser = await Manager.findByIdAndDelete(manager_id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'Manager not found in database!' });
      }
      return res.status(200).json({ message: 'Manager deleted successfully!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error!' });
    }
  
  })
  
  router.post('/createmanager', async (req, res) => {
    console.log(req.body);
    const { username, email, password, branch } = req.body;
    if (!username || !email || !branch || !password) {
      return res.status(409).json({ errormessage: 'All fields are required' });
    }
  
    try {
      const existingUser = await Manager.findOne({ username });
      const existingEmail = await Manager.findOne({ email });
      const existingbranch = await Manager.findOne({ branch });
      if (existingbranch) {
        return res.status(409).json({ errormessage: 'Manager for branch already exists !' });
      }
      if (existingEmail) {
        return res.status(409).json({ errormessage: 'Email already exists' });
      }
      if (existingUser) {
        return res.status(409).json({ errormessage: 'Username already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newManager = new Manager({
        username,
        email,
        password: hashedPassword,
        branch: branch,
        notifications: [],
      });
  
      await newManager.save();
      res.status(201).json({ errormessage: 'Manager created successfully !' });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ errormessage: 'Error creating Manager' });
    }
  
  })
  
  router.get('/registeredmanagers', async (req, res) => {
    try {
      const users = await Manager.find({});
      const usercount = await Manager.countDocuments({});
      if (users.length === 0) {
        return res.status(200).json({ error: 'No managers found!' });
      }
      return res.status(200).json({ registercount: usercount, managers: users });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error!' });
    }
  });
  
  router.post('/deletemanagers', async (req, res) => {
  
    const { manager_id, forceDelete } = req.body;
  
    try {
      if (!forceDelete) {
        return res.status(200).json({ alert: true, });
      }
      const deletedUser = await Manager.findByIdAndDelete(manager_id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'Manager not found in database!' });
      }
      return res.status(200).json({ message: 'Manager deleted successfully!' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error!' });
    }
  
  })

  export default router;