import express from 'express';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import client from './redisClient.js';
import dotenv from 'dotenv';
dotenv.config();
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.config.js';

import { connecttomongodb } from './backend/models/connect.js';
import { User } from './backend/models/UserSchema.js';
import { Product } from './backend/models/ProductSchema.js';
import { Booking } from './backend/models/Bookings.js';
import { Manager } from './backend/models/ManagerSchema.js';
import { Location } from './backend/models/Location.js';
import { Admin } from './backend/models/Admin.js';
import { Review } from './backend/models/ReviewSchema.js';

import adminRoutes from './backend/controllers/adminRoutes.js';
import managerRoutes from './backend/controllers/managerRoutes.js';
import userRoutes from './backend/controllers/userRoutes.js';

import nodemailer from "nodemailer";
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';

import { createStream } from 'rotating-file-stream';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/Rentals';
const app = express();
connecttomongodb(MONGODB_URL)
  .then(() => console.log('Connected to MongoDB Atlas !'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });


// Run only once for index syncing after modifications 
// await User.syncIndexes();
// await Booking.syncIndexes();
// await Manager.syncIndexesc();
// await Admin.syncIndexes();
//   await Product.syncIndexes();
//middlewares


const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: 'https://rentalspro-react.onrender.com',  // your frontend URL
  credentials: true
}));

// Also handle preflight
app.options('*', cors({
  origin: 'https://rentalspro-react.onrender.com',
  credentials: true
}));

//custom application level middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next(); // Moves to the next middleware
});
// built-in middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

//third -party middleware
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(helmet());



// app.use(bodyParser.json({ limit: '50mb' }));
morgan.token("username", (req) => req.username || "Unknown");
morgan.token("role", (req) => req.role || "Unknown");

const loginLogStream = createStream((time, index) => {
  if (!time) return "login.log";
  const date = new Date(time);
  return `login-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}.log`;
}, {
  interval: '1d', // Rotate every hour
  path: path.join(__dirname, 'log')
});




//intentionally throws an error

app.get('/error-test', (req, res, next) => {
  try {
    throw new Error("Forced error for testing ! ");
  } catch (err) {
    next(err);
  }
});

app.get('/xx', (req, res) => {
  try { res.send('Hello World!') }
  catch (err) { next(err) }
});

// error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    in: "error-handling-middleware",
    success: false,
    message: err.message || 'Internal Server Error'
  });
});


app.use((req, res, next) => {
  req.username = req.cookies?.user_id || "Guest";  // Fetch user from cookie
  req.role = req.cookies?.role || "Guest";
  next();
});


// router -level middleware

const adminMiddleware = async (req, res, next) => {
  console.log(`\nAdmin entered ${req.originalUrl} !`);
  next();
}

const managerMiddleware = async (req, res, next) => {
  console.log(`\nManager entered ${req.originalUrl} !`);
  next();
}

app.use('/admindashboard', adminMiddleware, adminRoutes);
app.use('/manager', managerMiddleware, managerRoutes);
app.use('/user', userRoutes);

app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json({ locations: locations[0].locations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

//Signup
app.post('/signup', async (req, res) => {
  const { username, email, dateofbirth, password } = req.body;
  if (!username || !email || !dateofbirth || !password) {
    return res.status(409).json({ errormessage: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({ errormessage: 'Email already exists' });
    }
    if (existingUser) {
      return res.status(409).json({ errormessage: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      dateofbirth,
      password: hashedPassword,
      expired: false,
    });

    await newUser.save();
    res.status(201).json({ errormessage: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ errormessage: 'Error registering user' });
  }
});


app.post('/login', async (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ errormessage: 'All fields are required' });
  }

  try {
    let user_id;

    if (role === "Manager") {
      const existingManager = await Manager.findOne({ username });
      if (existingManager) {
        const checkManagerPassword = await bcrypt.compare(password, existingManager.password);
        if (!checkManagerPassword) {
          return res.status(401).json({ errormessage: 'Password is incorrect for Manager!' });
        }
        user_id = existingManager._id.toString(); // Set user_id for Manager
      } else {
        return res.status(401).json({ errormessage: 'Manager not found!' });
      }
    } else if (role === "User") {
      const existingUser = await User.findOne({ username });
      if (!existingUser) {
        return res.status(401).json({ errormessage: 'Username not found!' });
      }
      if (role == 'User' && existingUser.expired) {
        return res.status(401).json({ errormessage: "Account not found !" })
      }
      const checkpassword = await bcrypt.compare(password, existingUser.password);
      if (!checkpassword) {
        return res.status(401).json({ errormessage: 'Password is incorrect!' });
      }
      user_id = existingUser._id.toString(); // Set user_id for User
    } else {
      const existingUser = await Admin.findOne({ username });
      if (!existingUser) {
        return res.status(401).json({ errormessage: 'Username not found!' });
      }
      const checkpassword = password === existingUser.password;
      if (!checkpassword) {
        return res.status(401).json({ errormessage: 'Password is incorrect!' });
      }
      user_id = existingUser._id.toString();
    }

    // Attach user details for Morgan middleware (used in logs)
    req.user_id = user_id;
    req.username = username;
    req.role = role;


    // Set cookie for user (either Manager or User)
    res.cookie('user_id', user_id, {
      httpOnly: true,
      secure: true,             // required for cross-site cookies on HTTPS
      sameSite: 'None',         // must be 'None' to allow cross-site cookies
      path: '/',
    });

    res.cookie('role', role, {
      httpOnly: true,
      secure: true,             // required for cross-site cookies on HTTPS
      sameSite: 'None',         // must be 'None' to allow cross-site cookies
      path: '/',
    });

    morgan(':date[iso] | User: :username | Role: :role | IP: :remote-addr | Status: :status | :method :url - :response-time ms',
      { stream: loginLogStream })(req, res, () => { });

    res.status(200).json({ successmessage: `${role} Login successfully ` });

  } catch (error) {
    console.error('Error occurred while logging in:', error);
    res.status(500).json({ errormessage: 'Error while user logging in!' });
  }
});

//RentForm
app.post('/RentForm', async (req, res) => {
  const { productType,
    productName,
    locationName,
    fromDate,
    toDate,
    price,
    image, } = req.body;
  if (!productType || !productName || !locationName || !fromDate || !toDate || !price || !image) {
    return res.status(409).json({ errormessage: 'All fields are required' });
  }

  try {
    const cookieuserid = req.cookies.user_id;
    if (!cookieuserid) {
      return res.status(401).json({ errormessage: 'Unauthorized: No userid cookie found' });
    }

    const exist_user = await User.findOne({ _id: cookieuserid });
    if (!exist_user) {
      return res.status(404).json({ errormessage: 'User not found' });
    }
    const newProduct = new Product({
      userid: cookieuserid, // Use 'username' to match schema
      productType,
      productName,
      locationName,
      fromDateTime: new Date(fromDate), // Convert to Date object
      toDateTime: new Date(toDate),     // Convert to Date object
      price,
      photo: image, // Use 'photo' to match schema
      uploadDate: new Date(),
      bookingdates: [],
      bookingids: [],
      expired: true,
    });

    const savedProduct = await newProduct.save();
    exist_user.rentals.push(savedProduct._id);
    await exist_user.save();
    const notifyupdate = await Manager.findOneAndUpdate({ branch: savedProduct.locationName }, { $push: { notifications: { message: savedProduct._id, seen: false } } }, { new: true });
    const redisKey = `products:${productType}`;
    let cached = await client.get(redisKey);

    if (cached) {
      const productList = JSON.parse(cached);
      productList.push(savedProduct); // assuming `savedProduct` is lean-compatible or transformed
      await client.set(redisKey, JSON.stringify(productList), { EX: 3600 });
    }

    res.status(201).json({ errormessage: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error occured :', error);
    res.status(500).json({ errormessage: 'Upload failed' });
  }
});

// correct one
// app.post('/products', async (req, res) => {
//   try {
//     const { productType, locationName, fromDateTime, toDateTime, price } = req.body;

//     const query = { expired: false };
//     if (productType) query.productType = productType;
//     if (locationName) query.locationName = locationName;
//     if (fromDateTime) query.fromDateTime = { $lte: new Date(fromDateTime) };
//     if (toDateTime) query.toDateTime = { ...query.toDateTime, $gte: new Date(toDateTime) };
//     if (price) query.price = { $lte: price };

//     const cacheKey = JSON.stringify(query);

//     // Check Redis for cached IDs
//     const cachedIds = await client.get(cacheKey);
//     if (cachedIds) {
//       console.log('🧠 Cache hit! Fetching products by ID');
//       const productIds = JSON.parse(cachedIds);
//       const products = await Product.find({ _id: { $in: productIds } });
//       return res.status(200).json(products);
//     }

//     // If not in cache, query DB
//     const products = await Product.find(query);
//     const productIds = products.map(p => p._id);

//     // Cache IDs only
//     await client.set(cacheKey, JSON.stringify(productIds), { EX: 3600 });
//     console.log('💾 DB hit. Cached product IDs');

//     res.status(200).json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ errormessage: 'Failed to fetch products' });
//   }
// });

app.get('/autocomplete', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const cacheKey = `autocomplete:${query.toLowerCase()}`;

    // Try to get from cache
    const cachedResults = await client.get(cacheKey);
    if (cachedResults) {
      console.log('🧠 Autocomplete cache hit');
      return res.json(JSON.parse(cachedResults));
    }

    // Query database
    const suggestions = await Product.find({
      productName: { $regex: `^${query}`, $options: 'i' },
      expired: false
    })
      .select('productName _id')
      .limit(10)
      .sort({ uploadDate: -1 });

    // Cache results for 15 minutes
    await client.set(cacheKey, JSON.stringify(suggestions), { EX: 900 });
    console.log('💾 Cached autocomplete results');

    res.json(suggestions);
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// app.post('/products', async (req, res) => {
//   try {
//     const { productType, locationName, fromDateTime, toDateTime, price, searchQuery } = req.body;

//     // Build base query
//     const query = { expired: false };
//     if (productType) query.productType = productType;
//     if (locationName) query.locationName = locationName;
//     if (fromDateTime) query.fromDateTime = { $lte: new Date(fromDateTime) };
//     if (toDateTime) query.toDateTime = { $gte: new Date(toDateTime) };
//     if (price) query.price = { $lte: parseFloat(price) };

//     // Add text search if searchQuery exists
//     if (searchQuery) {
//       query.$text = { $search: searchQuery };  // 🔄 replaced regex with text search
//     }

//     // const cacheKey = JSON.stringify(query);

//     // Check Redis cache
//     // const cachedIds = await client.get(cacheKey);
//     // if (cachedIds) {
//     //   console.log('🧠 Cache hit! Fetching products by ID');
//     //   const productIds = JSON.parse(cachedIds);

//     //   // Fixed: removed extra semicolon and moved allowDiskUse to correct position
//     //   const products = await Product.find({ _id: { $in: productIds } })
//     //     .sort({ uploadDate: -1 })
//     //     .allowDiskUse(true);

//     //   return res.status(200).json(products);
//     // }

//     // If not in cache, query DB
//     console.log('💽 Cache miss! Querying database directly');

//     // Use aggregation pipeline with allowDiskUse for better performance with sorting
//     const products = await Product.aggregate([
//       { $match: query },
//       { $sort: { uploadDate: -1 } },
//       { $limit: 50 },
//       { $project: { 
//           productName: 1, 
//           price: 1, 
//           uploadDate: 1, 
//           photo: 1, 
//           locationName: 1,
//           productType: 1,
//           fromDateTime: 1,
//           toDateTime: 1
//         } 
//       }
//     ], { allowDiskUse: true });

//     if (products.length === 0) {
//       return res.status(200).json([]);
//     }

//     // const productIds = products.map(p => p._id);

//     // Cache results for 1 hour
//     // await client.set(cacheKey, JSON.stringify(productIds), { EX: 3600 });
//     // console.log('💾 DB hit. Cached product IDs');

//     res.status(200).json(products);
//   } catch (error) {
//     console.error('Error fetching products:', error);
//     res.status(500).json({ errormessage: 'Failed to fetch products', details: error.message });
//   }
// });

app.post('/products', async (req, res) => {
  try {
    const { productType, locationName, fromDateTime, toDateTime, price, searchQuery } = req.body;

    if (!productType) {
      return res.status(400).json({ errormessage: 'productType is required.' });
    }

    const redisKey = `products:${productType}`;
    let products = await client.get(redisKey);

    if (products) {
      console.log(`🧠 Redis cache hit: ${redisKey}`);
      products = JSON.parse(products);
    } else {
      console.log(`💽 Redis cache miss: ${redisKey}. Querying MongoDB...`);

      // Fetch and cache all valid products of this type
      products = await Product.find({
        expired: false,
        productType,
        toDateTime: { $gte: new Date() }
      }).lean();

      await client.set(redisKey, JSON.stringify(products), { EX: 3600 }); // Cache for 1 hour
    }

    // 🧠 In-memory filtering
    const filtered = products.filter(p => {
      if (locationName && p.locationName !== locationName) return false;
      if (fromDateTime && new Date(p.fromDateTime) > new Date(fromDateTime)) return false;
      if (toDateTime && new Date(p.toDateTime) < new Date(toDateTime)) return false;
      if (price && p.price > parseFloat(price)) return false;
      if (searchQuery && !p.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    res.status(200).json(filtered);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ errormessage: 'Failed to fetch products', details: error.message });
  }
});


app.post('/checkconflict', async (req, res) => {
  try {
    const { product_id, fromDateTime, toDateTime } = req.body;
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const from = new Date(fromDateTime);
    const to = new Date(toDateTime);

    const conflict = await Booking.findOne({
      product_id,
      $or: [
        { fromDateTime: { $lt: to }, toDateTime: { $gt: from } }
      ],
    });
    if (conflict) {
      console.log("true");
      return res.status(200).json({ conflict: true });
    } else {
      console.log("false");
      return res.status(200).json({ conflict: false });
    }

  } catch (error) {
    console.error("Error checking conflicts:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.post('/product/:product_id', async (req, res) => {
  const { product_id } = req.params;
  try {
    const reqproduct = await Product.findById(product_id);
    if (!reqproduct) {
      return res.status(404).json({ error: 'product not found !' });
    }
    return res.status(200).json(reqproduct);

  } catch (error) {
    res.status(500).json({ error: "server error !" });
  }
})

// app.post('/booking',async (req,res)=>{
//   try{
//   const {product_id,fromDateTime,toDateTime,price}=await req.body;
//   const bookingDate=new Date();

//   const buyerid=req.cookies.user_id;
//   if (!buyerid || !/^[0-9a-fA-F]{24}$/.test(buyerid)) {
//     return res.status(400).json({ message: "Invalid buyer ID format!" });
//   }

//   const from = new Date(fromDateTime);
//   const to = new Date(toDateTime);

//   const conflict = await Booking.findOne({
//     product_id,
//     $or: [
//         { fromDateTime: { $lt: to }, toDateTime: { $gt: from } }
//     ],
// });
// if(conflict)
// {
//     return res.status(401).json({message:"Not available"});
// }
//   const newbooking = new Booking({
//     product_id,
//     buyerid,
//     fromDateTime,
//     toDateTime,
//     price,
//     bookingDate,
//   });
//   const y=await newbooking.save();
//   const newbookingid=newbooking._id.toString(); 
//   const x=await User.findOneAndUpdate({_id:buyerid},{$push:{bookings:newbookingid}},{new:true});
//   if(!y)
//   {console.log("booking ot successful")
//     return res.status(401).json({message:"booking not successful !"})
//   }
//   else if(!x)
//   { console.log("couldnt update booking")
//     return res.status(401).json({ message: "Couldn't update the booking!" });
//   }
//   const product = await Product.findById(product_id);
//   product.bookingdates.push([new Date(fromDateTime),new Date(toDateTime)]);
//   await product.save();

//   const z=await User.findOneAndUpdate({_id:product.userid},{$push:{notifications:{message:newbookingid,seen:false}}},{new:true})
//   await z.save();

//   const Managernotify=await Manager.findOneAndUpdate({branch:product.locationName},{$push:{bookingnotifications:{bookingid:y._id}}},{new:true});
//   res.status(200).json({message:"Booking successful !"});
//   console.log("booking successful !");
//   }
//   catch(error){
//     console.log(error);
//     res.status(500).json({message:"server error !"});
//   }
// })
app.post('/booking', async (req, res) => {
  try {
    const { product_id, fromDateTime, toDateTime, price } = req.body;
    const bookingDate = new Date();
    const buyerid = req.cookies.user_id;

    if (!buyerid || !/^[0-9a-fA-F]{24}$/.test(buyerid)) {
      return res.status(400).json({ message: "Invalid buyer ID format!" });
    }

    const from = new Date(fromDateTime);
    const to = new Date(toDateTime);

    const conflict = await Booking.findOne({
      product_id,
      $or: [{ fromDateTime: { $lt: to }, toDateTime: { $gt: from } }],
    });

    if (conflict) {
      return res.status(401).json({ message: "Not available" });
    }

    const newbooking = new Booking({
      product_id,
      buyerid,
      fromDateTime,
      toDateTime,
      price,
      bookingDate,
    });

    const savedBooking = await newbooking.save();
    const newBookingId = savedBooking._id.toString();

    const updatedUser = await User.findByIdAndUpdate(
      buyerid,
      { $push: { bookings: newBookingId } },
      { new: true }
    );

    if (!savedBooking || !updatedUser) {
      return res.status(401).json({ message: "Booking not successful!" });
    }

    const product = await Product.findById(product_id);
    product.bookingdates.push([from, to]);
    await product.save();

    // 🔔 Push notification to seller (product.userid)
    const notificationObj = { message: newBookingId, seen: false };
    await User.findByIdAndUpdate(product.userid, {
      $push: { notifications: notificationObj },
    });

    // 🧠 Update Redis cache for seller's notifications (if exists)
    const notifCacheKey = `user:${product.userid}:notifications`;
    const cachedNotif = await client.get(notifCacheKey);
    if (cachedNotif) {
      const parsed = JSON.parse(cachedNotif);
      parsed.push(notificationObj);
      await client.set(notifCacheKey, JSON.stringify(parsed), { EX: 300 }); // keep TTL as before
      console.log('🔄 Redis cache updated for seller notifications');
    }

    await Manager.findOneAndUpdate(
      { branch: product.locationName },
      { $push: { bookingnotifications: { bookingid: savedBooking._id } } }
    );

    // ✅ Update Redis cache for the buyer's bookings/products
    const cacheKey = `user_bookings_ids:${buyerid}`;
    const cached = await client.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      const updatedCache = {
        bookingIds: [...new Set([...parsed.bookingIds, newBookingId])],
        productIds: [...new Set([...parsed.productIds, product_id.toString()])]
      };
      await client.set(cacheKey, JSON.stringify(updatedCache), { EX: 3600 });
      console.log('🧠 Redis cache updated for user:', buyerid);
    }

    res.status(200).json({ message: "Booking successful!" });
    console.log("✅ Booking successful!");

  } catch (error) {
    console.error("❌ Booking error:", error);
    res.status(500).json({ message: "Server error!" });
  }
});


app.get("/grabAdmin", async (req, res) => {
  const userId = req.cookies.user_id;
  console.log("User ID from cookie:", userId); // Log user ID

  if (!userId) {
    return res.status(400).json({ message: "No user ID found in cookies" });
  }

  try {
    const admin = await Admin.findById(userId);
    console.log("admin", admin);
    if (!admin) {
      console.log("No Admin found for user ID:", userId); // Log if no admin found
      return res.status(404).json({ message: "Admin not found" });
    }
    const name = admin.username;
    res.json({ name }); // Return the name inside an object
  } catch (err) {
    console.error("Error fetching Name", err);
    res.status(500).json({ message: "Error fetching Name", error: err.message });
  }
});

app.post('/api/addBranch', async (req, res) => {
  const { name } = req.body;

  try {
    let locationDoc = await Location.findOne();

    if (locationDoc) {
      if (locationDoc.locations.includes(name)) {
        return res.status(400).json({ message: 'Branch is already in existence' });
      }

      locationDoc.locations.push(name);
      await locationDoc.save();
    } else {
      locationDoc = new Location({ locations: [name] });
      await locationDoc.save();
    }

    res.status(201).json({ message: 'Location added successfully', locations: locationDoc.locations });
  } catch (error) {
    res.status(500).json({ message: 'Error adding location', error });
  }
});

// app.get('/admindashboard/registeredusers',async(req,res)=>{
//   try{
//     const users=await User.find({expired:false});
//     const usercount = await User.countDocuments({expired:false});
//     if(!users)
//     {
//       return res.status(200).json({error :'Users not found !'});
//     }
//     return res.status(200).json({registercount:usercount,users:users,});

//   }catch(error)
//   {
//     res.status(500).json({error:"server error !"});
//   }
// })

// app.post('/admindashboard/deleteusers', async (req, res) => {
//   const { user_id, forceDelete } = req.body;

//   try {
//     // Check if user has bookings
//     const bookings = await Booking.findOne({ buyerid: user_id });
//     if (bookings && !forceDelete) {
//       // If bookings exist and forceDelete is false, return an alert
//       return res.status(200).json({ alert: true, });
//     }

//     // If forceDelete is true or there are no bookings, proceed with deletion
//     await Product.updateMany({ userid: user_id }, { $set: { expired: true } }, { new: true });
//     const deletedUser = await User.findOneAndUpdate({_id:user_id},{$set:{expired :true}},{new:true});

//     if (!deletedUser) {
//       return res.status(200).json({ message: 'User not found in database!' });
//     }

//     return res.status(200).json({ message: 'User and their bookings/products deleted successfully!' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error!' });
//   }
// });

// app.post('/admindashboard/createmanager',async(req,res)=>{
//   console.log(req.body);
//   const { username, email,password ,branch} = req.body;
//   if (!username || !email || !branch || !password) {
//     return res.status(409).json({ errormessage: 'All fields are required' });
//   }

//   try {
//     const existingUser = await Manager.findOne({ username });
//     const existingEmail = await Manager.findOne({ email });
//     const existingbranch= await Manager.findOne({branch});
//     if(existingbranch)
//     {
//       return res.status(404).json({ errormessage: 'Manager for branch already exists !'});
//     }
//     if (existingEmail) {
//       return res.status(404).json({ errormessage: 'Email already exists' });
//     }
//     if (existingUser) {
//       return res.status(404).json({ errormessage: 'Username already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newManager = new Manager({
//       username,
//       email,
//       password: hashedPassword,
//       branch:branch,
//       notifications:[],
//     });

//     await newManager.save();
//     res.status(201).json({ errormessage: 'Manager created successfully !' });
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ errormessage: 'Error creating Manager' });
//   }

// })

// app.get('/admindashboard/registeredmanagers', async (req, res) => {
//   try {
//     const users = await Manager.find({});
//     const usercount = await Manager.countDocuments({});
//     if (users.length === 0) {
//       return res.status(200).json({ error: 'No managers found!' });
//     }
//     return res.status(200).json({ registercount: usercount, managers: users });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Server error!' });
//   }
// });

// app.post('/admindashboard/deletemanagers',async(req,res)=>{

//   const { manager_id, forceDelete } = req.body;

//   try {
//     if (!forceDelete) {
//       return res.status(200).json({ alert: true, });
//     }
//     const deletedUser = await Manager.findByIdAndDelete(manager_id);
//     if (!deletedUser) {
//       return res.status(404).json({ message: 'Manager not found in database!' });
//     }
//     return res.status(200).json({ message: 'Manager deleted successfully!' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error!' });
//   }

// })


app.get("/grabBookings", async (req, res) => {
  try {
    const userId = req.cookies.user_id;
    if (!userId) {
      return res.status(400).json({ message: "No userid cookie found" });
    }

    const cacheKey = `user_bookings_ids:${userId}`;
    // const cached = await client.get(cacheKey);

    let bookingIds = [];
    let productIds = [];

    // if (cached) {
    //   console.log('✅ Serving Booking IDs from Redis cache');
    //   const parsed = JSON.parse(cached);
    //   bookingIds = parsed.bookingIds;
    //   productIds = parsed.productIds;
    // } else
    {
      console.log('💾 Fetching Booking/Product IDs from DB');
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      bookingIds = user.bookings;
      const bookings = await Booking.find({ _id: { $in: bookingIds } });
      productIds = bookings.map(b => b.product_id);

      // Save just the IDs to cache
      // await client.set(cacheKey, JSON.stringify({ bookingIds, productIds }), { EX: 3600 });
    }

    // Fetch full documents from DB using IDs
    const bookings = await Booking.find({ _id: { $in: bookingIds } });
    const products = await Product.find({ _id: { $in: productIds } });

    if (!bookings.length) {
      return res.status(404).json({ message: "No booking details found for this user" });
    }

    res.json({
      BookingDetails: bookings,
      ProductDetails: products,
    });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});
// app.get("/grabBookings", async (req, res) => {
//   try {
//     if (req.cookies.user_id) {
//       const userid = req.cookies.user_id;

//       const exist_user = await User.findOne({ _id: userid });

//       if (exist_user) {
//         const bookingIds = exist_user.bookings;
//         const bookings = await Booking.find({ _id: { $in: bookingIds } });

//         if (bookings.length > 0) {
//           const productIds = bookings.map(booking => booking.product_id);
//           const products = await Product.find({ _id: { $in: productIds } });

//           res.json({
//             BookingDetails: bookings,
//             ProductDetails: products,
//           });
//         } else {
//           res.status(404).json({ message: "No booking details found for this user" });
//         }
//       } else {
//         res.status(404).json({ message: "User not found" });
//       }
//     } else {
//       res.status(400).json({ message: "No userid cookie found" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: "An error occurred", error: err.message });
//   }

// });

app.post("/settings", async (req, res) => {
  try {
    const { editUsername, email, password } = req.body;
    const currentUserid = req.cookies.user_id;
    if (!currentUserid) {
      return res.status(401).json({ message: "Unauthorized: No user logged in" });
    }

    const existingUser = await User.findOne({ _id: currentUserid });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      existingUser.email = email;
    }
    if (editUsername && editUsername !== existingUser.username) {
      const usernameExists = await User.findOne({ username: editUsername });
      if (usernameExists) {
        return res.status(409).json({ message: "Username already in use" });
      }
      existingUser.username = editUsername;
    }
    if (password) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.password = hashedPassword;
      } catch (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }
    }
    const x = await existingUser.save();
    if (x) {
      res.status(200).json({ message: "User details updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to save user details" });
    }
  } catch (err) {
    console.error("Error updating user details:", err);
    res.status(500).json({ message: "An error occurred while updating user details" });
  }
});

app.get("/grabDetails", async (req, res, next) => {
  try {
    if (req.cookies.user_id) {
      const userid = req.cookies.user_id;
      const exist_user = await User.findOne({ _id: userid });

      if (exist_user) {
        res.json(exist_user);
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(400).json({ message: "No username cookie found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }

});

// app.get("/grabRentals", async (req, res) => {
//   try {
//     if (req.cookies.user_id) {
//       const userid = req.cookies.user_id;
//       const exist_user = await User.findOne({ _id: userid });

//       if (exist_user) {
//         const productIds = exist_user.rentals;
//         const products = await Product.find({ _id: { $in: productIds },expired:false });
//         // products = products.filter((product)=>product.expired);

//         if (products.length > 0) {
//           const obj = { rentedProducts: products };
//           res.json(obj);
//         } else {
//           res.status(200).json({ message: "No rented products found" });
//         }
//       } else {
//         res.status(404).json({ message: "User not found" });
//       }
//     } else {
//       res.status(400).json({ message: "No username cookie found" });
//     }
//   } catch (err) {
//     res.status(500).json({ message: "An error occurred", error: err.message });
//   }
// });


app.get("/grabRentals", async (req, res) => {
  try {
    if (!req.cookies.user_id) {
      return res.status(400).json({ message: "No user_id cookie found" });
    }

    const userid = req.cookies.user_id;
    const cacheKey = `user:${userid}:rentals`;

    // // Try to get rental product IDs from Redis
    // const cachedRentalIds = await client.get(cacheKey);

    let productIds;

    // if (cachedRentalIds) {
    //   // Cache HIT
    //   console.log("🔁 Rentals served from Redis");
    //   productIds = JSON.parse(cachedRentalIds);
    // } else
    {
      // Cache MISS: fetch from DB
      const user = await User.findById(userid);
      if (!user) return res.status(404).json({ message: "User not found" });

      productIds = user.rentals || [];

      // Save rental product IDs in Redis
      // await client.set(cacheKey, JSON.stringify(productIds), { EX: 3600 }); // cache for 1 hour
    }

    // Fetch the actual products from DB
    const products = await Product.find({ _id: { $in: productIds }, expired: false });

    if (!products || products.length === 0) {
      return res.status(200).json({ message: "No rented products found" });
    }

    res.status(200).json({ rentedProducts: products });

  } catch (err) {
    console.error("Error in /grabRentals:", err);
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});


app.post('/signOut', async (req, res) => {
  try {
    const userid = req.cookies.user_id;
    if (!userid) {
      return res.status(400).json({ message: 'No user is signed in.' });
    }

    // Clear the cookie to sign the user out
    res.clearCookie('user_id', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });

    res.clearCookie('role', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({ message: 'Successfully signed out' });
  } catch (err) {
    console.error('Error during sign out:', err);
    res.status(500).json({ message: 'Error signing out' });
  }
});


///Manager Page related ........

// Route: Fetch booking notifications
// app.post('/manager/fetchBookingnotifications', async (req, res) => {
//   const  managerid  = req.cookies.user_id;

//   if (!managerid) {
//       return res.status(400).json({ message: "Manager ID is required" });
//   }

//   try {
//       const manager = await Manager.findById(managerid);

//       if (!manager) {
//           return res.status(404).json({ message: "Manager not found" });
//       }

//       const notifications = manager.bookingnotifications || [];
//       res.status(200).json({notifications: notifications });
//   } catch (error) {
//       console.error("Error fetching booking notifications:", error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Route: Fetch detailed results for bookings
// app.post('/manager/bookingnotifications/results', async (req, res) => {
//   const { bids } = req.body;
//   if (!bids || !Array.isArray(bids) || bids.length === 0) {
//       return res.status(400).json({ message: "Invalid or empty bids array" });
//   }

//   try {
//       const results = await Promise.all(
//           bids.map(async (id) => {
//               try {
//                   const booking = await Booking.findById(id);
//                   if (!booking) {
//                       throw new Error(`Booking not found for ID: ${id}`);
//                   }

//                   const buyer = await User.findById(booking.buyerid);
//                   const product = await Product.findById(booking.product_id);
//                   const owner = await User.findById(product.userid);

//                   return {
//                       ownerid: owner?._id,
//                       ownername: owner?.username,
//                       owneremail: owner?.email,
//                       buyerid: buyer?._id,
//                       buyername: buyer?.username,
//                       buyeremail: buyer?.email,
//                       productid: product?._id,
//                       productname: product?.productName,
//                       productphoto: product?.photo[0],
//                       booking,
//                   };
//               } catch (error) {
//                   console.error("Error fetching booking details:", error);
//                   return null; // Return null for failed items
//               }
//           })
//       );

//       // Filter out null entries in the results array
//       const filteredResults = results.filter((result) => result !== null);
//       res.status(200).json({ results: filteredResults });
//   } catch (error) {
//     console.log(error);
//       console.error("Error fetching booking results:", error);
//       res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.post('/manager/bookingnotifications/updatelevel',async(req,res)=>{
//   const {bid,level,id}=req.body;
//   try{
//     console.log(bid);
//     const booking = await Booking.findByIdAndUpdate(bid,{level:level},{new:true});
//     if(level==3)
//     {
//       const removednotification=await Manager.findByIdAndUpdate(id,{ $pull: { bookingnotifications: { _id: bid } } },{new:true} );
//     }
//     if(booking)
//     {
//       res.status(200).json({result:true});
//     }
//     else
//     { 
//       res.status(400).json({result:false});
//     }
//   }
//   catch(e)
//   {
//     res.status(400).json({result:false});
//   }
// })


// app.get('/manager/uploadnotifications',async(req,res)=>{
//   try {
//     const managerid = req.cookies.user_id;
//     if (managerid) {
//       const exist_manager = await Manager.findById(managerid);
//       const notifications=exist_manager.notifications;
//       const productids=notifications.map(x=>x.message);
//       if (exist_manager) {
//         res.json({notifications:notifications,productids:productids});
//       } else {
//         res.status(404).json({ message: "manager not found" });
//       }
//     } else {
//       res.status(400).json({ message: "No manager cookie found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// })

// app.post('/manager/uploadnotifications/markAsSeen',async(req,res)=>{
//   try{
//       const managerid = req.cookies.user_id;
//       const {notificationid,productid,rejected}=req.body;
//       if(rejected)
//         { 
//           const x=await Product.findByIdAndDelete(productid);
//           console.log(x);
//         }
//         else{
//           const y=await Product.findByIdAndUpdate(productid,{$set:{expired:false}},{new:true});
//         }
//       const removednotification=await Manager.findByIdAndUpdate(managerid,{ $pull: { notifications: { _id: notificationid } } },{new:true} );
//       if(!removednotification)
//       {
//         return res.status(400).json({message:"notification not removed .error occured !"});
//       }
//       else{
//         return res.status(200).json({message:"notification removed successfully!"});
//       }
//   }
//   catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// })

// app.get('/manager/notifications/countUnseen',async(req,res)=>{
//   try {
//     const userid = req.cookies.user_id;
//     if (userid) {
//       const exist_user = await Manager.findById(userid);
//       const notifications=exist_user.notifications;
//       if (exist_user) {
//         res.json({notifications:notifications});
//       } else {
//         res.status(404).json({ message: "booking not found" });
//       }
//     } else {
//       res.status(400).json({ message: "No user cookie found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// })

// app.post('/manager/notifications/markallAsSeen', async (req, res) => {
//   try {
//     const userid = req.cookies.user_id;

//     // Update all notifications with seen: false to seen: true
//     const updatedUser = await Manager.findOneAndUpdate(
//       { _id: userid, "notifications.seen": false }, // Match notifications with seen: false
//       { $set: { "notifications.$[].seen": true } }, // Update all notifications' seen field
//       { new: true } // Return the updated user
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found or no unseen notifications" });
//     }

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// app.get('/manager/products/:product_id',async(req,res)=>{
//   const {product_id}=req.params;
//   console.log(product_id);
//   try{
//     const reqproduct=await Product.findById(product_id);
//     if(!reqproduct)
//     {    console.log(reqproduct);
//       return res.status(404).json({error :'product not found !'});
//     }
//     return res.status(200).json(reqproduct);

//   }catch(error)
//   {
//     res.status(500).json({error:"server error !"});
//   }
// })

// app.post('/admindashboard/createmanager', async (req, res) => {
//   console.log(req.body);
//   const { username, email, password, branch } = req.body;
//   if (!username || !email || !branch || !password) {
//     return res.status(409).json({ errormessage: 'All fields are required' });
//   }

//   try {
//     const existingUser = await Manager.findOne({ username });
//     const existingEmail = await Manager.findOne({ email });
//     const existingbranch = await Manager.findOne({ branch });
//     if (existingbranch) {
//       return res.status(409).json({ errormessage: 'Manager for branch already exists !' });
//     }
//     if (existingEmail) {
//       return res.status(409).json({ errormessage: 'Email already exists' });
//     }
//     if (existingUser) {
//       return res.status(409).json({ errormessage: 'Username already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newManager = new Manager({
//       username,
//       email,
//       password: hashedPassword,
//       branch: branch,
//       notifications: [],
//     });

//     await newManager.save();
//     res.status(201).json({ errormessage: 'Manager created successfully !' });
//   } catch (error) {
//     console.error('Error registering user:', error);
//     res.status(500).json({ errormessage: 'Error creating Manager' });
//   }

// })

// app.get('/admindashboard/registeredmanagers', async (req, res) => {
//   try {
//     const users = await Manager.find({});
//     const usercount = await Manager.countDocuments({});
//     if (users.length === 0) {
//       return res.status(200).json({ error: 'No managers found!' });
//     }
//     return res.status(200).json({ registercount: usercount, managers: users });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Server error!' });
//   }
// });

// app.post('/admindashboard/deletemanagers', async (req, res) => {

//   const { manager_id, forceDelete } = req.body;

//   try {
//     if (!forceDelete) {
//       return res.status(200).json({ alert: true, });
//     }
//     const deletedUser = await Manager.findByIdAndDelete(manager_id);
//     if (!deletedUser) {
//       return res.status(404).json({ message: 'Manager not found in database!' });
//     }
//     return res.status(200).json({ message: 'Manager deleted successfully!' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Server error!' });
//   }

// })


app.get("/api/dashboard/daily-bookings", async (req, res) => {
  try {
    const today = new Date();

    // Fetch bookings from the last 7 days
    const bookings = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) } // Last 7 days
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date ascending
    ]);

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily bookings", error: err.message });
  }
});

app.get("/api/dashboard/monthly-bookings", async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort by year and month
    ]);

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly bookings", error: err.message });
  }
});

app.get("/api/dashboard/daily-revenue", async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" }
          },
          totalRevenue: { $sum: "$price" }  // Sum the price field for revenue
        }
      },
      { $sort: { _id: 1 } }  // Sort by date
    ]);

    res.json(dailyRevenue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily revenue", error: err.message });
  }
});

app.get("/api/dashboard/monthly-revenue", async (req, res) => {
  try {
    const monthlyRevenue = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" }
          },
          totalRevenue: { $sum: "$price" }  // Sum of price for each month
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }  // Sort by year and month
    ]);

    res.json(monthlyRevenue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly revenue", error: err.message });
  }
});

app.get("/api/dashboard/daily-uploads", async (req, res) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(today.setHours(-24, 0, 0, 0));

    const uploads = await Product.aggregate([
      {
        $match: {
          uploadDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) } // Last 7 days
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$uploadDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by date ascending
    ]);

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily uploads", error: err.message });
  }
});

app.get("/api/dashboard/monthly-uploads", async (req, res) => {
  try {
    const uploads = await Product.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$uploadDate" },
            month: { $month: "$uploadDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort by year and month
    ]);

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly uploads", error: err.message });
  }
});

app.get("/api/dashboard/categories", async (req, res) => {
  try {
    const today = new Date(); // Get the current date and time
    const categories = await Product.aggregate([
      { $match: { toDateTime: { $gte: today } } }, // Exclude products with expired toDateTime
      { $group: { _id: "$productType", count: { $sum: 1 } } }, // Group by productType
    ]);
    console.log(categories);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find({});
    res.json({ locations: locations[0].locations }); // Assuming there's only one document
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const findBranch = async (userId) => {
  let branch;
  try {
    const manager = await Manager.findById(userId);
    branch = manager.branch
    branch = manager ? manager.branch : null;
  } catch (err) {
    return "Error fetching Details";
  }
  return branch;
}

app.get("/grabBranch", async (req, res) => {
  try {
    const branch = await findBranch(req.cookies.user_id);
    res.json(branch); // Use res instead of response
  } catch (err) {
    console.error("Error fetching branch:", err); // Log the error for debugging
    res.status(500).json({ message: "Error fetching branch", error: err.message }); // Send error response
  }
});

app.get("/grabManager", async (req, res) => {
  const userId = req.cookies.user_id;
  console.log("User ID from cookie:", userId); // Log user ID

  if (!userId) {
    return res.status(400).json({ message: "No user ID found in cookies" });
  }

  try {
    const manager = await Manager.findById(userId);
    if (!manager) {
      console.log("No manager found for user ID:", userId); // Log if no manager found
      return res.status(404).json({ message: "Manager not found" });
    }
    const name = manager.username;
    res.json(name);
  } catch (err) {
    console.error("Error fetching Name", err);
    res.status(500).json({ message: "Error fetching Name", error: err.message });
  }
});

app.get("/api/dashboard/daily-bookings-cat", async (req, res) => {
  try {
    const today = new Date();
    const branch = await findBranch(req.cookies.user_id)
    const bookings = await Booking.find({
      bookingDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) }
    }).select("product_id");

    const productIds = bookings.map(booking => booking.product_id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const products = await Product.find({
      _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) },
      locationName: branch
    });

    if (products.length === 0) {
      return res.json([]);
    }

    const filteredProductIds = products.map(product => product._id.toString());

    const aggregatedBookings = await Booking.aggregate([
      {
        $match: {
          product_id: { $in: filteredProductIds },
          bookingDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(aggregatedBookings);
  } catch (err) {
    console.error("Error fetching daily bookings:", err);
    res.status(500).json({ message: "Error fetching daily bookings", error: err.message });
  }
});

app.get("/api/dashboard/monthly-bookings-cat", async (req, res) => {
  try {
    const today = new Date();
    const lastYearStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const branch = await findBranch(req.cookies.user_id)
    if (!branch) {
      return res.status(400).json({ message: "Branch is required" });
    }

    const bookings = await Booking.find({
      bookingDate: { $gte: lastYearStart }
    }).select("product_id");

    const productIds = bookings.map(booking => booking.product_id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const products = await Product.find({
      _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) },
      locationName: branch
    });

    if (products.length === 0) {
      return res.json([]);
    }

    const filteredProductIds = products.map(product => product._id.toString());

    const aggregatedBookings = await Booking.aggregate([
      {
        $match: {
          product_id: { $in: filteredProductIds },
          bookingDate: { $gte: lastYearStart }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" },
            branch: branch
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(aggregatedBookings);
  } catch (err) {
    console.error("Error fetching monthly bookings:", err);
    res.status(500).json({ message: "Error fetching monthly bookings", error: err.message });
  }
});

app.get("/api/dashboard/daily-revenue-cat", async (req, res) => {
  try {
    const today = new Date();
    const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6); // Start from 7 days ago
    const branch = await findBranch(req.cookies.user_id)

    if (!branch) {
      return res.status(400).json({ message: "Branch is required" });
    }

    const bookings = await Booking.find({
      bookingDate: { $gte: lastWeekStart }
    }).select("product_id");

    const productIds = bookings.map(booking => booking.product_id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const products = await Product.find({
      _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) },
      locationName: branch
    });

    if (products.length === 0) {
      return res.json([]);
    }

    const filteredProductIds = products.map(product => product._id.toString());

    const aggregatedRevenue = await Booking.aggregate([
      {
        $match: {
          product_id: { $in: filteredProductIds },
          bookingDate: { $gte: lastWeekStart }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" },
          },
          totalRevenue: { $sum: "$price" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(aggregatedRevenue);
  } catch (err) {
    console.error("Error fetching daily revenue:", err);
    res.status(500).json({ message: "Error fetching daily revenue", error: err.message });
  }
});

app.get("/api/dashboard/monthly-revenue-cat", async (req, res) => {
  try {
    const today = new Date();
    const lastYearStart = new Date(today.getFullYear(), today.getMonth() - 11, 1);
    const branch = await findBranch(req.cookies.user_id)
    if (!branch) {
      return res.status(400).json({ message: "Branch is required" });
    }

    const bookings = await Booking.find({
      bookingDate: { $gte: lastYearStart }
    }).select("product_id price bookingDate");

    const productIds = bookings.map(booking => booking.product_id);

    if (productIds.length === 0) {
      return res.json([]);
    }

    const products = await Product.find({
      _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) },
      locationName: branch
    });

    if (products.length === 0) {
      return res.json([]);
    }

    const filteredProductIds = products.map(product => product._id.toString());

    const aggregatedRevenue = await Booking.aggregate([
      {
        $match: {
          product_id: { $in: filteredProductIds },
          bookingDate: { $gte: lastYearStart }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" }
          },
          totalRevenue: { $sum: "$price" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.json(aggregatedRevenue);
  } catch (err) {
    console.error("Error fetching monthly revenue:", err);
    res.status(500).json({ message: "Error fetching monthly revenue", error: err.message });
  }
});

app.get("/api/dashboard/daily-uploads-cat", async (req, res) => {
  try {
    const today = new Date();
    const branch = await findBranch(req.cookies.user_id)
    const uploads = await Product.aggregate([
      {
        $match: {
          uploadDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) },
          ...(branch && { locationName: branch })
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$uploadDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily uploads", error: err.message });
  }
});

app.get("/api/dashboard/monthly-uploads-cat", async (req, res) => {
  try {
    const branch = await findBranch(req.cookies.user_id)
    const uploads = await Product.aggregate([
      {
        $match: {
          ...(branch && { locationName: branch })
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$uploadDate" },
            month: { $month: "$uploadDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(uploads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly uploads", error: err.message });
  }
});

app.get("/api/dashboard/categories-cat", async (req, res) => {
  try {
    const today = new Date();
    const branch = await findBranch(req.cookies.user_id)
    const categories = await Product.aggregate([
      {
        $match: {
          toDateTime: { $gte: today },
          ...(branch && { locationName: branch })
        }
      },
      {
        $group: { _id: "$productType", count: { $sum: 1 } }
      }
    ]);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});


///userbooking notification
// app.get('/user/notifications',async(req,res)=>{
//   try {
//     const userid = req.cookies.user_id;
//     if (userid) {
//       const exist_user = await User.findById(userid);
//       const notifications=exist_user.notifications;
//       const bookingids=notifications.map(x=>x.message);
//       if (exist_user) {
//         res.json({notifications:notifications,bookingids:bookingids});
//       } else {
//         res.status(404).json({ message: "booking not found" });
//       }
//     } else {
//       res.status(400).json({ message: "No user cookie found" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// })

// app.get('/user/notifications/:bookingid',async(req,res)=>{
//   const {bookingid}=req.params;
//   console.log(bookingid);
//   try{
//     const reqbooking=await Booking.findById(bookingid);
//     const reqproduct=await Product.findById(reqbooking.product_id);
//     const reqbuyer=await User.findById(reqbooking.buyerid);
//     if(!reqbooking)
//     {    console.log(reqbooking);
//       return res.status(404).json({error :'booking not found !'});
//     }
//     return res.status(200).json({reqbooking:reqbooking,reqproduct:reqproduct,reqbuyer:reqbuyer});

//   }catch(error)
//   {
//     res.status(500).json({error:"server error !"});
//   }
// })

// app.post('/user/notifications/markAsSeen', async (req, res) => {
//   try {
//     const userid = req.cookies.user_id;
//     const { notificationid } = req.body;

//     // Update the notification's seen field to true only if it is currently false
//     const updatedNotification = await User.findOneAndUpdate(
//       { _id: userid, "notifications._id": notificationid, "notifications.seen": false },
//       { $set: { "notifications.$.seen": true } },
//       { new: true }
//     );

//     // if (!updatedNotification) {
//     //   return res.status(400).json({ message: "Notification was not updated. It may already be marked as seen or not found." });
//     // } else {
//     //   return res.status(200).json({ message: "Notification marked as seen successfully!" });
//     // }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


// app.post('/user/notifications/products', async (req, res) => {
//   const { bookingids } = req.body;  // Extract bookingids from the request body
//   try {
//     const products = [];

//     for (const bookingid of bookingids) {
//       const reqbooking = await Booking.findById(bookingid);
//       if (!reqbooking) continue;

//       const reqproduct = await Product.findById(reqbooking.product_id);
//       if (!reqproduct) continue;

//       const reqbuyer = await User.findById(reqbooking.buyerid);
//       if (!reqbuyer) continue;

//       products.push({ reqbooking, reqproduct, reqbuyer });
//     }
//     if (products.length === 0) {
//       return res.status(404).json({ error: 'No bookings found!' });
//     }

//     return res.status(200).json({ products });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Server error!' });
//   }
// });


// app.post("/home/postreview",async(req,res)=>{
//   try {
//     const userid = req.cookies.user_id;
//     if (userid) {
//     const {text, rating } = req.body;
//     const x= await User.findById(userid);
//     if (!text || !rating) return res.status(400).send("Missing required fields");
//     const username=x.username;
//     const newReview = new Review({username, text, rating });
//     await newReview.save();
//     res.status(200).json({message:"review suceesfully sent !"});
//     }else {
//       // Send a 401 response if user is not authenticated
//       return res.status(401).json({message: "User not authenticated"});
//     }
//   } catch (err) {
//     res.status(500).json({message:err.message});
//   }
// })
app.post("/home/postreview", async (req, res) => {
  try {
    const userid = req.cookies.user_id;
    if (!userid) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { text, rating } = req.body;
    if (!text || !rating) return res.status(400).send("Missing required fields");

    const user = await User.findById(userid);
    const username = user.username;
    const newReview = new Review({ username, text, rating });
    await newReview.save();

    // 🔄 Smart cache invalidation
    const cacheKey = "top_5_unique_reviews";
    const cached = await client.get(cacheKey);

    if (cached) {
      const currentTop = JSON.parse(cached);
      const userExists = currentTop.some(r => r.username === username);
      const minRating = Math.min(...currentTop.map(r => r.rating));

      if (!userExists || rating > minRating) {
        await client.del(cacheKey);
        console.log("🧹 Top review cache invalidated");
      }
    }

    res.status(200).json({ message: "Review successfully sent!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// app.get("/home/getreviews",async(req,res)=>{
//   try {
//     const reviews = await Review.find();
//     res.status(200).json({reviews:reviews});
//   } catch (err) {
//     res.status(500).json({message:err.message});}
// })

app.get("/home/getreviews", async (req, res) => {
  const cacheKey = "top_5_unique_reviews";
  try {
    const cached = await client.get(cacheKey);
    if (cached !== null && cached.length !== 0) {
      console.log("Serving top reviews from cache");
      return res.status(200).json({ reviews: JSON.parse(cached) });
    }
    console.log("Fetching top reviews from database");
    const reviews = await Review.find().sort({ rating: -1 });
    const topReviews = [];
    const seenUsers = new Set();

    for (const review of reviews) {
      if (!seenUsers.has(review.username)) {
        topReviews.push(review);
        seenUsers.add(review.username);
      }
      if (topReviews.length === 5) break;
    }

    await client.set(cacheKey, JSON.stringify(topReviews), { EX: 3600 });
    console.log("💾 Cached top reviews");
    res.status(200).json({ reviews: topReviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      service: 'false', // Specify your email service provider
      auth: {
        user: 'rentalspro001@gmail.com',
        pass: 'roox edlv kuvh elyo', // Use your app-specific password
      },
    });

    const mailOptions = {
      from: "rentalspro001@gmail.com",
      to: to,
      subject: subject,
      text: text,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});
app.get("/grabCustomernameProductId", async (req, res) => {
  try {
    const { userid, product_id } = req.query; // Use query for GET requests

    // Fetch user and booking details
    const user = await User.findById(userid);
    const booking = await Booking.findOne({ product_id });

    if (!user || !booking) {
      return res.status(404).json({ error: "User or Booking not found" });
    }

    // Extract buyer details
    const buyerName = user.username;
    const buyerEmail = user.email;
    const bookingDate = booking.bookingDate;
    const fromDate = booking.fromDateTime;
    const toDate = booking.toDateTime;

    // Fetch product and owner details
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const owner = await User.findById(product.userid); // Use product's userid to find owner
    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const ownerName = owner.username;
    const ownerEmail = owner.email;
    const productName = product.productName;
    const productType = product.productType;

    // Respond with all necessary details
    res.json({
      buyerName,
      buyerEmail,
      bookingDate,
      fromDate,
      toDate,
      ownerName,
      ownerEmail,
      productName,
      productType
    });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
export default app;