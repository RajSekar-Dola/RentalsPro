// tests/auth.test.js

import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Import models using your specific paths
import { connecttomongodb } from '../../backend/models/connect.js';
import { User } from '../../backend/models/UserSchema.js';
import { Product } from '../../backend/models/ProductSchema.js';
import { Booking } from '../../backend/models/Bookings.js';
import { Manager } from '../../backend/models/ManagerSchema.js';
import { Location } from '../../backend/models/Location.js';
import { Admin } from '../../backend/models/Admin.js';
import { Review } from '../../backend/models/ReviewSchema.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

// Import routes (assuming they're in separate files)
// For testing purposes, we'll recreate the routes here

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
        user_id = existingManager._id.toString();
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
      user_id = existingUser._id.toString();
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

    // Attach user details for Morgan middleware
    req.user_id = user_id;
    req.username = username;
    req.role = role;

    // Set cookies
    res.cookie('user_id', user_id, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    res.cookie('role', role, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });

    // Morgan middleware is mocked for tests
    res.status(200).json({ successmessage: `${role} Login successfully ` });

  } catch (error) {
    console.error('Error occurred while logging in:', error);
    res.status(500).json({ errormessage: 'Error while user logging in!' });
  }
});

app.post('/RentForm', async (req, res) => {
  const { productType, productName, locationName, fromDate, toDate, price, image } = req.body;
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
      userid: cookieuserid,
      productType,
      productName,
      locationName,
      fromDateTime: new Date(fromDate),
      toDateTime: new Date(toDate),
      price,
      photo: image,
      uploadDate: new Date(),
      bookingdates: [],
      bookingids: [],
      expired: true,
    });

    const savedProduct = await newProduct.save();
    exist_user.rentals.push(savedProduct._id);
    await exist_user.save();
    
    // Notification update for manager
    const notifyupdate = await Manager.findOneAndUpdate(
      { branch: savedProduct.locationName },
      { $push: { notifications: { message: savedProduct._id, seen: false } } },
      { new: true }
    );

    res.status(201).json({ errormessage: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error occured :', error);
    res.status(500).json({ errormessage: 'Upload failed' });
  }
});
app.post('/booking',async (req,res)=>{
  try{
  const {product_id,fromDateTime,toDateTime,price}=await req.body;
  const bookingDate=new Date();

  const buyerid=req.cookies.user_id;
  if (!buyerid || !/^[0-9a-fA-F]{24}$/.test(buyerid)) {
    return res.status(400).json({ message: "Invalid buyer ID format!" });
  }

  const from = new Date(fromDateTime);
  const to = new Date(toDateTime);

  const conflict = await Booking.findOne({
    product_id,
    $or: [
        { fromDateTime: { $lt: to }, toDateTime: { $gt: from } }
    ],
});
if(conflict)
{
    return res.status(401).json({message:"Not available"});
}
  const newbooking = new Booking({
    product_id,
    buyerid,
    fromDateTime,
    toDateTime,
    price,
    bookingDate,
  });
  const y=await newbooking.save();
  const newbookingid=newbooking._id.toString(); 
  const x=await User.findOneAndUpdate({_id:buyerid},{$push:{bookings:newbookingid}},{new:true});
  if(!y)
  {console.log("booking ot successful")
    return res.status(401).json({message:"booking not successful !"})
  }
  else if(!x)
  { console.log("couldnt update booking")
    return res.status(401).json({ message: "Couldn't update the booking!" });
  }
  const product = await Product.findById(product_id);
  product.bookingdates.push([new Date(fromDateTime),new Date(toDateTime)]);
  await product.save();

  const z=await User.findOneAndUpdate({_id:product.userid},{$push:{notifications:{message:newbookingid,seen:false}}},{new:true})
  await z.save();

  const Managernotify=await Manager.findOneAndUpdate({branch:product.locationName},{$push:{bookingnotifications:{bookingid:y._id}}},{new:true});
  res.status(200).json({message:"Booking successful !"});
  }
  catch(error){
    res.status(500).json({message:"server error !"});
  }
})

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

app.post("/home/postreview",async(req,res)=>{
  try {
    const userid = req.cookies.user_id;
    if (!userid) {
      // Send a 401 response if user is not authenticated
      return res.status(401).json({message: "User not authenticated"});
    }
    else{
    const {text, rating } = req.body;
    const x= await User.findById(userid);
    if (!text || !rating) return res.status(400).send("Missing required fields");
    const username=x.username;
    const newReview = new Review({username, text, rating });
    await newReview.save();
    res.status(200).json({message:"review suceesfully sent !"});
    }
  } catch (err) {
    res.status(500).json({message:err.message});
  }
})
app.get("/home/getreviews",async(req,res)=>{
  try {
    const reviews = await Review.find();
    res.status(200).json({reviews:reviews});
  } catch (err) {
    res.status(500).json({message:err.message});}
})

app.post('/products', async (req, res) => {
  try {
    const {productType, locationName, fromDateTime, toDateTime, price}=await req.body;
    const query={};
    if(productType) query.productType=productType;
    if(locationName) query.locationName=locationName;
    if(fromDateTime) query.fromDateTime={ $lte: new Date(fromDateTime) };
    if(toDateTime) query.toDateTime= { $gte: new Date(toDateTime) };
    if(price) query.price={$lte : price};
    query.expired=false;
    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ errormessage: 'Failed to fetch products'});
  }
});

app.post('/product/:product_id',async(req,res)=>{
    const {product_id}=req.params;
    try{
      const reqproduct=await Product.findById(product_id);
      if(!reqproduct)
      {
        return res.status(404).json({error :'product not found !'});
      }
      return res.status(200).json(reqproduct);
      
    }catch(error)
    {
      res.status(500).json({error:"server error !"});
    }
})

app.get('/locations', async (req, res) => {
  try {
    const locations = await Location.find({});
    
    // Check if locations array is empty or if the structure is missing
    if (locations.length === 0 || !locations[0].locations) {
      return res.status(200).json({ locations: [] });  // Return empty array if no locations
    }

    res.json({ locations: locations[0].locations });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get("/grabDetails", async (req, res,next) => {
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

app.post("/settings", async (req, res) => {
  try {
    const { editUsername,  email,password } = req.body;
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
    const x=await existingUser.save();
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

app.get("/grabManager", async (req, res) => {
  const userId = req.cookies.user_id;// Log user ID

  if (!userId) {
    return res.status(400).json({ message: "No user ID found in cookies" });
  }

  try {
    const manager = await Manager.findById(userId);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    const name = manager.username;
    res.json(name);
  } catch (err) {
    res.status(500).json({ message: "Error fetching Name", error: err.message });
  }
});

// Tests start here

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
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});



describe('Auth Routes', () => {
  let mongoServer;
  
  // Setup
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Use your connection function instead of direct mongoose connect
    await connecttomongodb(uri);
  });

  // Cleanup
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Clear database between tests
  beforeEach(async () => {
    await User.deleteMany({});
    await Manager.deleteMany({});
    await Admin.deleteMany({});
    await Product.deleteMany({});
    await Booking.deleteMany({});
    await Location.deleteMany({});
    await Review.deleteMany({});
  });



  // Testing signup route
  describe('POST /signup', () => {
    test('should create a new user with valid data', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        dateofbirth: '1990-01-01',
        password: 'password123',
      };

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(201);

      expect(response.body.errormessage).toBe('User registered successfully');
      
      // Verify user was created in database
      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeTruthy();
      expect(user.email).toBe('test@example.com');
      expect(user.expired).toBe(false);
      
      // Verify password was hashed
      expect(user.password).not.toBe('password123');
      const isPasswordMatch = await bcrypt.compare('password123', user.password);
      expect(isPasswordMatch).toBe(true);
    });

    test('should return 409 if username already exists', async () => {
      // Create a user first
      const existingUser = new User({
        username: 'existinguser',
        email: 'existing@example.com',
        dateofbirth: '1990-01-01',
        password: await bcrypt.hash('password123', 10),
        expired: false,
      });
      await existingUser.save();

      // Try to create a user with the same username
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        dateofbirth: '1990-01-01',
        password: 'password123',
      };

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(409);

      expect(response.body.errormessage).toBe('Username already exists');
    });

    test('should return 409 if email already exists', async () => {
      // Create a user first
      const existingUser = new User({
        username: 'user1',
        email: 'duplicate@example.com',
        dateofbirth: '1990-01-01',
        password: await bcrypt.hash('password123', 10),
        expired: false,
      });
      await existingUser.save();

      // Try to create a user with the same email
      const userData = {
        username: 'user2',
        email: 'duplicate@example.com',
        dateofbirth: '1990-01-01',
        password: 'password123',
      };

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(409);

      expect(response.body.errormessage).toBe('Email already exists');
    });

    test('should return 409 if required fields are missing', async () => {
      const userData = {
        username: 'testuser',
        // Missing email, dateofbirth, and password
      };

      const response = await request(app)
        .post('/signup')
        .send(userData)
        .expect(409);

      expect(response.body.errormessage).toBe('All fields are required');
    });
  });

  // Testing login route
 // Testing login route
describe('POST /login', () => {
  // Setup test users
  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Manager.deleteMany({});
    await Admin.deleteMany({});
    
    // Create a regular user
    const user = new User({
      username: 'testuser1',
      email: 'user@gmail.com',
      dateofbirth: '1990-01-01',
      password: await bcrypt.hash('password123', 10),
      expired: false,
      rentals: [],
    });
    await user.save();
  
    // Create an expired user
    const expiredUser = new User({
      username: 'expireduser',
      email: 'expireduser@example.com',
      dateofbirth: '1990-01-01',
      password: await bcrypt.hash('expiredpass', 10),
      expired: true,
      rentals: [],
    });
    await expiredUser.save();
  
    // Create a manager - now including the required email field
    const manager = new Manager({
      username: 'testmanager',
      email: 'manager@example.com', // Added email field
      password: await bcrypt.hash('managerpass', 10),
      branch: 'Downtown',
      notifications: [],
    });
    await manager.save();
  
    // Create an admin
    const admin = new Admin({
      username: 'testadmin',
      password: 'adminpass', // Plain text as per the code
    });
    await admin.save();
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await User.deleteMany({});
    await Manager.deleteMany({});
    await Admin.deleteMany({});
  });

  test('should login user successfully with correct credentials', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testuser1',
        password: 'password123',
        role: 'User',
      });
    
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.successmessage).toBe('User Login successfully ');
    expect(loginResponse.headers['set-cookie']).toBeDefined();
  });

  test('should login manager successfully with correct credentials', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testmanager',
        password: 'managerpass',
        role: 'Manager',
      });
    
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.successmessage).toBe('Manager Login successfully ');
    expect(loginResponse.headers['set-cookie']).toBeDefined();
  });

  test('should login admin successfully with correct credentials', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testadmin',
        password: 'adminpass',
        role: 'Admin',
      });
    
    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.successmessage).toBe('Admin Login successfully ');
    expect(loginResponse.headers['set-cookie']).toBeDefined();
  });

  test('should return 401 for expired user account', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'expireduser',
        password: 'expiredpass',
        role: 'User',
      });
    
    expect(loginResponse.statusCode).toBe(401);
    expect(loginResponse.body.errormessage).toBe('Account not found !');
  });

  test('should return 401 for incorrect password', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testuser1',
        password: 'wrongpassword',
        role: 'User',
      });
    
    expect(loginResponse.statusCode).toBe(401);
    expect(loginResponse.body.errormessage).toBe('Password is incorrect!');
  });

  test('should return 401 for non-existent user', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'nonexistentuser',
        password: 'anypassword',
        role: 'User',
      });
    
    expect(loginResponse.statusCode).toBe(401);
    expect(loginResponse.body.errormessage).toBe('Username not found!');
  });

  test('should return 400 if required fields are missing', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testuser1',
        // Missing password
        role: 'User',
      });
    
    expect(loginResponse.statusCode).toBe(400);
    expect(loginResponse.body.errormessage).toBe('All fields are required');
  });
});

  // Testing RentForm route
  describe('POST /RentForm', () => {
    let validUserId;
    let authCookie;
  
    // Setup test user and auth cookie
    beforeEach(async () => {
      // Clear collections before each test
      await User.deleteMany({});
      await Location.deleteMany({});
      await Manager.deleteMany({});
      await Product.deleteMany({});
      
      // Create a test user
      const user = new User({
        username: 'renteruser',
        email: 'renter@example.com',
        dateofbirth: '1990-01-01',
        password: await bcrypt.hash('renterpass', 10),
        expired: false,
        rentals: [],
      });
      const savedUser = await user.save();
      validUserId = savedUser._id.toString();
      
      // Create a location for testing
      const location = new Location({
        name: 'Downtown',
        address: '123 Main St',
        city: 'Example City',
        zipcode: '12345',
      });
      await location.save();
      
      // Create a manager for the notification test
      const manager = new Manager({
        username: 'locationmanager',
        email: 'manager@example.com', // Added required email field
        password: await bcrypt.hash('managerpass', 10),
        branch: 'Downtown',
        notifications: [],
      });
      await manager.save();
      
      // Create auth cookie
      authCookie = `user_id=${validUserId}; role=User`;
    });
  
    test('should create a new rental product successfully', async () => {
      const productData = {
        productType: 'Electronics',
        productName: 'Camera',
        locationName: 'Downtown',
        fromDate: '2025-05-01T10:00:00Z',
        toDate: '2025-05-10T10:00:00Z',
        price: '50',
        image: 'base64encodedimage',
      };
  
      const response = await request(app)
        .post('/RentForm')
        .set('Cookie', authCookie)
        .send(productData);
      
      expect(response.statusCode).toBe(201);
      expect(response.body.errormessage).toBe('Uploaded successfully');
      
      // Verify product was created
      const product = await Product.findOne({ productName: 'Camera' });
      expect(product).toBeTruthy();
      expect(product.userid).toBe(validUserId);
      expect(product.locationName).toBe('Downtown');
      expect(product.expired).toBe(true);
      expect(Array.isArray(product.photo)).toBe(true); // Check that photo is an array
      expect(product.photo[0]).toBe('base64encodedimage'); // Check the first element of the array
      
      // Verify user's rentals array was updated
      const updatedUser = await User.findById(validUserId);
      expect(updatedUser.rentals.map(id => id.toString())).toContain(product._id.toString());
      
      // Verify manager notification
      const manager = await Manager.findOne({ branch: 'Downtown' });
      expect(manager.notifications.length).toBe(1);
      expect(manager.notifications[0].message.toString()).toBe(product._id.toString());
      expect(manager.notifications[0].seen).toBe(false);
    });
  
    test('should return 409 if required fields are missing', async () => {
      const productData = {
        productType: 'Electronics',
        productName: 'Camera',
        // Missing other fields
      };
  
      const response = await request(app)
        .post('/RentForm')
        .set('Cookie', authCookie)
        .send(productData);
      
      expect(response.statusCode).toBe(409);
      expect(response.body.errormessage).toBe('All fields are required');
    });
  
    test('should return 401 if no user_id cookie is provided', async () => {
      const productData = {
        productType: 'Electronics',
        productName: 'Camera',
        locationName: 'Downtown',
        fromDate: '2025-05-01T10:00:00Z',
        toDate: '2025-05-10T10:00:00Z',
        price: '50',
        image: 'base64encodedimage',
      };
  
      const response = await request(app)
        .post('/RentForm')
        .send(productData); // No cookie set
      
      expect(response.statusCode).toBe(401);
      expect(response.body.errormessage).toBe('Unauthorized: No userid cookie found');
    });
  
    test('should return 404 if user_id in cookie is invalid', async () => {
      const invalidCookie = `user_id=${new mongoose.Types.ObjectId()}; role=User`;
      
      const productData = {
        productType: 'Electronics',
        productName: 'Camera',
        locationName: 'Downtown',
        fromDate: '2025-05-01T10:00:00Z',
        toDate: '2025-05-10T10:00:00Z',
        price: '50',
        image: 'base64encodedimage',
      };
  
      const response = await request(app)
        .post('/RentForm')
        .set('Cookie', invalidCookie)
        .send(productData);
      
      expect(response.statusCode).toBe(404);
      expect(response.body.errormessage).toBe('User not found');
    });
  });

  // Testing Booking route

  describe('POST /booking', () => {
    let validUserId;
    let validProductId;
    let validManagerId;
    let validBranch = 'Test Branch';
  
    beforeEach(async () => {
      // Create test user
      const user = new User({
        username: 'TestUser',
        email: 'test@example.com',
        dateofbirth: new Date('1990-01-01'),
        password: 'testpassword123',
        bookings: [],
        expired: false,
      });
      await user.save();
      validUserId = user._id.toString();
    
      // Create product owner
      const owner = new User({
        username: 'ProductOwner',
        email: 'owner@example.com',
        dateofbirth: new Date('1985-05-05'),
        password: 'ownerpassword123',
        notifications: [],
        expired: false,
      });
      await owner.save();
    
      // Create test product with all required fields
      const product = new Product({
        productName: 'Test Product',
        productType: 'Electronics',  // Example product type
        uploadDate: new Date(),  // Current date
        price: 200,  // Example price
        fromDateTime: new Date(),
        toDateTime: new Date(),
        userid: owner._id.toString(),
        locationName: validBranch,
        bookingdates: [],  // Start with no bookings
        bookingIds: [],
        expired: false,
        photo: ['photoUrl1', 'photoUrl2'],
      });
      await product.save();
      validProductId = product._id.toString();
    
      // Create test manager for the branch with all required fields
      const manager = new Manager({
        username: 'TestManager',  // Add username
        email: 'manager@example.com',  // Add email
        password: 'managerpassword123',  // Add password
        name: 'Test Manager',
        branch: validBranch,
        bookingnotifications: [],
      });
      await manager.save();
      validManagerId = manager._id.toString();
    });
    
  
    test('should successfully create a booking with valid inputs', async () => {
      const fromDateTime = new Date();
      fromDateTime.setDate(fromDateTime.getDate() + 1);  // Tomorrow
      const toDateTime = new Date();
      toDateTime.setDate(toDateTime.getDate() + 2);  // Day after tomorrow
      
      // Send booking request
      const response = await request(app)
        .post('/booking')
        .set('Cookie', [`user_id=${validUserId}`])
        .send({
          product_id: validProductId,
          fromDateTime: fromDateTime.toISOString(),
          toDateTime: toDateTime.toISOString(),
          price: 100,
        });
    
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('Booking successful !');
    
      const bookings = await Booking.find({});
      expect(bookings.length).toBe(1);
      expect(bookings[0].product_id.toString()).toBe(validProductId);
      expect(bookings[0].buyerid.toString()).toBe(validUserId);
    
      const updatedUser = await User.findById(validUserId);
      expect(updatedUser.bookings.length).toBe(1);
    
      const updatedProduct = await Product.findById(validProductId);
      expect(updatedProduct.bookingdates.length).toBe(1);
    
      // Convert to ISO string for comparison
      const fromDateISO = fromDateTime.toISOString();
      const toDateISO = toDateTime.toISOString();
    
      // Compare the dates as ISO strings
      expect(updatedProduct.bookingdates[0][0].toISOString()).toBe(fromDateISO);
      expect(updatedProduct.bookingdates[0][1].toISOString()).toBe(toDateISO);
    
      // Verify owner notification was added
      const owner = await User.findById(updatedProduct.userid);
      expect(owner.notifications.length).toBe(1);
      expect(owner.notifications[0].seen).toBe(false);
    
      const manager = await Manager.findOne({ branch: validBranch });
      expect(manager.bookingnotifications.length).toBe(1);
    });
    
  
    test('should return 400 for invalid user ID', async () => {
      const fromDateTime = new Date();
      fromDateTime.setDate(fromDateTime.getDate() + 1);
      const toDateTime = new Date();
      toDateTime.setDate(toDateTime.getDate() + 2);
  
      const response = await request(app)
        .post('/booking')
        .set('Cookie', ['user_id=invalid_id'])
        .send({
          product_id: validProductId,
          fromDateTime: fromDateTime.toISOString(),
          toDateTime: toDateTime.toISOString(),
          price: 100,
        });
  
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid buyer ID format!');
    });
  
    test('should return 401 for conflicting booking dates', async () => {
      const fromDateTime = new Date();
      fromDateTime.setDate(fromDateTime.getDate() + 1);  // Tomorrow
      const toDateTime = new Date();
      toDateTime.setDate(toDateTime.getDate() + 3);  // Day after tomorrow
  
      const existingBooking = new Booking({
        product_id: validProductId,
        buyerid: validUserId,
        fromDateTime,
        toDateTime,
        price: 100,
        bookingDate: new Date(),
      });
      await existingBooking.save();
  
      const newFrom = new Date();
      newFrom.setDate(newFrom.getDate() + 2);  // Overlapping booking
      const newTo = new Date();
      newTo.setDate(newTo.getDate() + 4);
  
      const response = await request(app)
        .post('/booking')
        .set('Cookie', [`user_id=${validUserId}`])
        .send({
          product_id: validProductId,
          fromDateTime: newFrom.toISOString(),
          toDateTime: newTo.toISOString(),
          price: 150,
        });
  
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Not available');
    });
  
    test('should handle server errors gracefully', async () => {
      jest.spyOn(Booking, 'findOne').mockImplementationOnce(() => {
        throw new Error('Database error');
      });
  
      const fromDateTime = new Date();
      fromDateTime.setDate(fromDateTime.getDate() + 1);
      const toDateTime = new Date();
      toDateTime.setDate(toDateTime.getDate() + 2);
  
      const response = await request(app)
        .post('/booking')
        .set('Cookie', [`user_id=${validUserId}`])
        .send({
          product_id: validProductId,
          fromDateTime: fromDateTime.toISOString(),
          toDateTime: toDateTime.toISOString(),
          price: 100,
        });
  
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('server error !');
  
      Booking.findOne.mockRestore();
    });
  
    test('should handle missing user_id cookie', async () => {
      const fromDateTime = new Date();
      fromDateTime.setDate(fromDateTime.getDate() + 1);
      const toDateTime = new Date();
      toDateTime.setDate(toDateTime.getDate() + 2);
  
      const response = await request(app)
        .post('/booking')
        .send({
          product_id: validProductId,
          fromDateTime: fromDateTime.toISOString(),
          toDateTime: toDateTime.toISOString(),
          price: 100,
        });
  
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid buyer ID format!');
    });
  
    test('should handle product not found', async () => {
      const fromDateTime = new Date();
      fromDateTime.setDate(fromDateTime.getDate() + 1);
      const toDateTime = new Date();
      toDateTime.setDate(toDateTime.getDate() + 2);
  
      jest.spyOn(Product, 'findById').mockResolvedValueOnce(null);
  
      const response = await request(app)
        .post('/booking')
        .set('Cookie', [`user_id=${validUserId}`])
        .send({
          product_id: new mongoose.Types.ObjectId().toString(),
          fromDateTime: fromDateTime.toISOString(),
          toDateTime: toDateTime.toISOString(),
          price: 100,
        });
  
      expect(response.statusCode).toBe(500);
  
      Product.findById.mockRestore();
    });
  });

  // testing Sign out route   
  describe('POST /signOut', () => {
  let user;
  
  beforeAll(async () => {

    // Create a test user
    user = new User({
      username: 'estUser',
      email: 'est@example.com',
      dateofbirth: new Date('1990-01-01'),
      password: 'testpassword123',
      bookings: [],
      rentals: [],
      notifications: [],
      expired: false,
    });

    await user.save();
  });


  test('should successfully sign out with valid cookie', async () => {
    const response = await request(app)
      .post('/signOut')
      .set('Cookie', [`user_id=${user._id.toString()}`]) // Simulate the user being signed in with the cookie
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Successfully signed out');
  });

  test('should return 400 when no user is signed in (no cookie)', async () => {
    const response = await request(app)
      .post('/signOut')
      .send();

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('No user is signed in.');
  });

  test('should clear user_id and role cookies after sign out', async () => {
    const response = await request(app)
      .post('/signOut')
      .set('Cookie', [`user_id=${user._id.toString()}`]) // Simulate the user being signed in
      .send();

    // Check that the cookies have been cleared
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('user_id=;'),
        expect.stringContaining('role=;'),
      ])
    );
  });
});

  // Testing post review
describe('POST /home/postreview', () => {
  let user;
  
  beforeEach(async () => {
    // Clear collections
    await User.deleteMany({});
    await Review.deleteMany({});
    
    // Create a test user
    const uniqueUsername = `TestUser_${Date.now()}`;
    user = new User({
      username: uniqueUsername,
      email: 'test@example.com',
      dateofbirth: new Date('1990-01-01'),
      password: 'testpassword123',
      bookings: [],
      rentals: [],
      notifications: [],
      expired: false,
    });
    await user.save();
  });
  
  test('should successfully post a review with valid fields', async () => {
    const response = await request(app)
      .post('/home/postreview')
      .set('Cookie', [`user_id=${user._id.toString()}`]) // Simulate the user being signed in
      .send({
        text: 'This is a test review',
        rating: 5,
      });
    
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('review suceesfully sent !');
    
    const review = await Review.findOne({ username: user.username });
    expect(review).toBeTruthy();
    expect(review.text).toBe('This is a test review');
    expect(review.rating).toBe(5);
  });
  
  test('should return 400 when missing required fields', async () => {
    const response = await request(app)
      .post('/home/postreview')
      .set('Cookie', [`user_id=${user._id.toString()}`]) // Simulate the user being signed in
      .send({
        text: '', // Missing text
        rating: 5,
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Missing required fields');
  });
  
  test('should return 400 when rating is missing', async () => {
    const response = await request(app)
      .post('/home/postreview')
      .set('Cookie', [`user_id=${user._id.toString()}`]) // Simulate the user being signed in
      .send({
        text: 'This is a test review',
        rating: undefined, // Missing rating
      });
    
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Missing required fields');
  });
  
  test('should return 401 if user is not signed in (no cookie)', async () => {
    const response = await request(app)
      .post('/home/postreview')
      .send({
        text: 'This is a test review',
        rating: 5,
      });
    
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe('User not authenticated');
  });
});
  // Testing get reviews
describe('GET /home/getreviews', () => {
  let user;

  beforeEach(async () => {
    const uniqueUsername = `TestUser_${Date.now()}`;
    user = new User({
      username: uniqueUsername,
      email: 'test@example.com',
      dateofbirth: new Date('1990-01-01'),
      password: 'testpassword123',
      bookings: [],
      rentals: [],
      notifications: [],
      expired: false,
    });
    await user.save();

    // Post a review to test get reviews
    const review = new Review({
      username: user.username,
      text: 'This is a review',
      rating: 5,
    });
    await review.save();
  });

  afterEach(async () => {
    await User.deleteMany({}); // Clean up after each test
    await Review.deleteMany({}); // Clean up reviews after each test
  });

  test('should get all reviews successfully', async () => {
    const response = await request(app)
      .get('/home/getreviews')
      .set('Cookie', [`user_id=${user._id.toString()}`]); // Simulate the user being signed in

    expect(response.statusCode).toBe(200);
    expect(response.body.reviews.length).toBeGreaterThan(0);
    expect(response.body.reviews[0].username).toBe(user.username);
    expect(response.body.reviews[0].text).toBe('This is a review');
    expect(response.body.reviews[0].rating).toBe(5);
  });

  test('should return an empty array if no reviews exist', async () => {
    await Review.deleteMany({}); // Delete any reviews for a fresh start

    const response = await request(app)
      .get('/home/getreviews')
      .set('Cookie', [`user_id=${user._id.toString()}`]); // Simulate the user being signed in

    expect(response.statusCode).toBe(200);
    expect(response.body.reviews).toEqual([]);
  });

  test('should return 500 on error', async () => {
    jest.spyOn(Review, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    const response = await request(app)
      .get('/home/getreviews')
      .set('Cookie', [`user_id=${user._id.toString()}`]);

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Database error');
  });
});
  // Testing filter products

  describe('POST /products', () => {
    let user;
  
    beforeEach(async () => {
      // Create a unique user for the tests
      const uniqueUserId = `TestUser_${Date.now()}`;
      user = {
        _id: uniqueUserId,
        username: 'testuser',
      };
  
      // Create and save products for testing
      const matchingProduct = new Product({
        userid: user._id,
        productName: 'Effective JavaScript',
        productType: 'book',
        locationName: 'New York',
        fromDateTime: new Date('2024-12-01T00:00:00Z'),
        toDateTime: new Date('2025-06-01T00:00:00Z'),
        price: 50,
        photo: ['photo1.jpg'],
        uploadDate: new Date(),
        expired: false,
      });
  
      const nonMatchingProduct = new Product({
        userid: user._id,
        productName: 'Chicago Tools',
        productType: 'book',
        locationName: 'Chicago',
        fromDateTime: new Date('2023-01-01T00:00:00Z'),
        toDateTime: new Date('2023-06-01T00:00:00Z'),
        price: 150,
        photo: ['photo2.jpg'],
        uploadDate: new Date(),
        expired: false,
      });
  
      await matchingProduct.save();
      await nonMatchingProduct.save();
    });
  
    afterEach(async () => {
      await Product.deleteMany({}); // Clean up after each test
    });
  
    test('should return filtered products based on provided criteria', async () => {
      const response = await request(app)
        .post('/products')
        .send({
          productType: 'book',
          locationName: 'New York',
          fromDateTime: '2024-12-01T00:00:00Z', // Adjusted date filter
          toDateTime: '2025-06-01T00:00:00Z',  // Adjusted date filter
          price: 100,
        });
      // Check if the status code is OK
      expect(response.statusCode).toBe(200);
    
      // Check that only 1 product matches the criteria
      expect(response.body.length).toBe(1);
    
      // Ensure that the product matches the expected values
      const product = response.body[0];
      expect(product.productType).toBe('book');
      expect(product.locationName).toBe('New York');
      expect(new Date(product.fromDateTime).getTime()).toBeGreaterThanOrEqual(new Date('2024-12-01T00:00:00Z').getTime());
      expect(new Date(product.toDateTime).getTime()).toBeLessThanOrEqual(new Date('2025-06-01T00:00:00Z').getTime());
      expect(product.price).toBeLessThanOrEqual(100);
    });
    
    test('should return an empty array if no products match filters', async () => {
      await Product.deleteMany({}); // Clean up all products before running this test
  
      const response = await request(app)
        .post('/products')
        .send({
          productType: 'book',
          locationName: 'New York',
          fromDateTime: '2024-01-01T00:00:00Z',
          toDateTime: '2025-01-01T00:00:00Z',
          price: 50,
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]); // No products should match
    });
  
    test('should return 500 on internal server error', async () => {
      // Mock the Product.find method to throw an error
      jest.spyOn(Product, 'find').mockRejectedValueOnce(new Error('DB error'));
    
      const response = await request(app)
        .post('/products')
        .send({});
    
      // Check if the response status code is 500
      expect(response.statusCode).toBe(500);
    
      // Ensure the error message matches the expected error
      expect(response.body.errormessage).toBe('Failed to fetch products');
    
      // Restore the original Product.find method
      Product.find.mockRestore();
    });
    
  });
  

  //Testing product/product id
  describe('POST /product/:product_id', () => {
    let product;
    let productId;
  
    beforeEach(async () => {
      // Create a product for testing
      const testProduct = new Product({
        productName: 'Effective JavaScript',
        productType: 'book',
        locationName: 'New York',
        fromDateTime: new Date('2024-12-01T00:00:00Z'),
        toDateTime: new Date('2025-06-01T00:00:00Z'),
        price: 50,
        photo: ['photo1.jpg'],
        uploadDate: new Date(),
        expired: false,
      });
  
      product = await testProduct.save(); // Save the product to the database
      productId = product._id.toString(); // Save the product's ID for later use
    });
  
    afterEach(async () => {
      await Product.deleteMany({}); // Clean up after each test
    });
  
    test('should return the product when the product_id exists', async () => {
      const response = await request(app)
        .post(`/product/${productId}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.productName).toBe('Effective JavaScript');
      expect(response.body.productType).toBe('book');
      expect(response.body.locationName).toBe('New York');
      expect(response.body.price).toBe(50);
      expect(new Date(response.body.fromDateTime).getTime()).toBeGreaterThanOrEqual(new Date('2024-12-01T00:00:00Z').getTime());
      expect(new Date(response.body.toDateTime).getTime()).toBeLessThanOrEqual(new Date('2025-06-01T00:00:00Z').getTime());
    });
  
    test('should return 404 if the product_id does not exist', async () => {
      const nonExistentId = '60b1d3e9e3b5d3b94f7bc77f'; // Some random non-existent product ID
      const response = await request(app)
        .post(`/product/${nonExistentId}`);
  
      expect(response.statusCode).toBe(404);
      expect(response.body.error).toBe('product not found !');
    });
  
    test('should return 500 if there is a server error', async () => {
      // Simulate a server error by mocking the Product.findById method
      jest.spyOn(Product, 'findById').mockRejectedValueOnce(new Error('DB error'));
  
      const response = await request(app)
        .post(`/product/${productId}`);
  
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toBe('server error !');
  
      // Restore the original method
      Product.findById.mockRestore();
    });
  });

  //Testing Locations
  
  describe('GET /locations', () => {
    let location;
  
    beforeEach(async () => {
      // Create a location document for testing
      const testLocation = new Location({
        locations: ['New York', 'Los Angeles', 'Chicago']
      });
      location = await testLocation.save(); // Save the location to the database
    });
  
    afterEach(async () => {
      await Location.deleteMany({}); // Clean up after each test
    });
  
    test('should return locations successfully', async () => {
      const response = await request(app)
        .get('/locations');
  
      expect(response.statusCode).toBe(200);
      expect(response.body.locations).toEqual(['New York', 'Los Angeles', 'Chicago']);
    });
  
    test('should return 500 if there is a server error', async () => {
      // Simulate a server error by mocking the Location.find method
      jest.spyOn(Location, 'find').mockRejectedValueOnce(new Error('DB error'));
  
      const response = await request(app)
        .get('/locations');
  
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
  
      // Restore the original method
      Location.find.mockRestore();
    });
  
    test('should return an empty array if no locations exist', async () => {
      await Location.deleteMany({}); // Clean up all locations before running this test
    
      const response = await request(app)
        .get('/locations');
    
      expect(response.statusCode).toBe(200);
      expect(response.body.locations).toEqual([]); // No locations should be returned
    });
  });
  
  describe('GET /grabDetails', () => {
    let user;
  
    beforeEach(async () => {
      // Create a test user before each test with required fields
      user = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password123', 10),
        expired: false,  // Add the required field
        dateofbirth: new Date('1990-01-01')  // Add the required field
      });
      await user.save();
    });
  
    afterEach(async () => {
      await User.deleteMany({}); // Clean up after each test
    });
  
    test('should return user details if logged in', async () => {
      const response = await request(app)
        .get('/grabDetails')
        .set('Cookie', [`user_id=${user._id}`]);
  
      expect(response.statusCode).toBe(200);
      expect(response.body.username).toBe(user.username);
      expect(response.body.email).toBe(user.email);
    });
  
    test('should return 400 if no user is logged in', async () => {
      const response = await request(app)
        .get('/grabDetails');
  
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('No username cookie found');
    });
  
    test('should return 404 if user is not found', async () => {
      const nonExistingUserId = '609b5fbb8fa6a00c4cbe7f5b';  // Assuming this user doesn't exist
      const response = await request(app)
        .get('/grabDetails')
        .set('Cookie', [`user_id=${nonExistingUserId}`]);
  
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /settings', () => {
    let user;
  
    beforeEach(async () => {
      // Create a test user before each test with required fields
      user = new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: await bcrypt.hash('password123', 10),
        expired: false,  // Add the required field
        dateofbirth: new Date('1990-01-01')  // Add the required field
      });
      await user.save();
    });
  
    afterEach(async () => {
      await User.deleteMany({}); // Clean up after each test
    });
  
    test('should successfully update user details', async () => {
      const response = await request(app)
        .post('/settings')
        .set('Cookie', [`user_id=${user._id}`])
        .send({
          editUsername: 'updatedUsername',
          email: 'updated@example.com',
          password: 'newPassword123'
        });
  
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe('User details updated successfully');
  
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.username).toBe('updatedUsername');
      expect(updatedUser.email).toBe('updated@example.com');
    });
  
    test('should return 401 if no user is logged in', async () => {
      const response = await request(app)
        .post('/settings')
        .send({
          editUsername: 'updatedUsername',
          email: 'updated@example.com',
          password: 'newPassword123'
        });
  
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Unauthorized: No user logged in');
    });
  
    test('should return 404 if user is not found', async () => {
      const nonExistingUserId = '609b5fbb8fa6a00c4cbe7f5b';  // Assuming this user doesn't exist
      const response = await request(app)
        .post('/settings')
        .set('Cookie', [`user_id=${nonExistingUserId}`])
        .send({
          editUsername: 'updatedUsername',
          email: 'updated@example.com',
          password: 'newPassword123'
        });
  
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  
    test('should return 409 if email is already in use', async () => {
      const existingUser = new User({
        username: 'existingUser',
        email: 'existing@example.com',
        password: await bcrypt.hash('password123', 10),
        expired: false,
        dateofbirth: new Date('1990-01-01')
      });
      await existingUser.save();
  
      const response = await request(app)
        .post('/settings')
        .set('Cookie', [`user_id=${user._id}`])
        .send({
          email: 'existing@example.com'
        });
  
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Email already in use');
    });
  
    test('should return 409 if username is already in use', async () => {
      const existingUser = new User({
        username: 'existingUsername',
        email: 'existingemail@example.com',
        password: await bcrypt.hash('password123', 10),
        expired: false,
        dateofbirth: new Date('1990-01-01')
      });
      await existingUser.save();
  
      const response = await request(app)
        .post('/settings')
        .set('Cookie', [`user_id=${user._id}`])
        .send({
          editUsername: 'existingUsername'
        });
  
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Username already in use');
    });
  
    test('should return 500 if error hashing password', async () => {
      jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
        throw new Error('Hashing error');
      });
  
      const response = await request(app)
        .post('/settings')
        .set('Cookie', [`user_id=${user._id}`])
        .send({
          password: 'newPassword123'
        });
  
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Error hashing password');
    });
  });
  
  describe('GET /grabManager', () => {
    let manager;
    beforeEach(async () => {
      manager = new Manager({
        _id: new mongoose.Types.ObjectId(),
        username: 'manager123',
        email: 'manager@example.com',
        password: 'dummyPass123',
        expired: false,
        dateofbirth: new Date('1990-01-01'),
        branch: 'Main Branch' // ✅ Add this line
      });
    
      await manager.save();
    });
    
    afterEach(async () => {
      await Manager.deleteMany({});
    });
  
    test('should return the manager’s username if user ID is valid', async () => {
      const response = await request(app)
        .get('/grabManager')
        .set('Cookie', [`user_id=${manager._id}`]);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(manager.username);
    });
  
    test('should return 400 if no user ID cookie is provided', async () => {
      const response = await request(app).get('/grabManager');
  
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('No user ID found in cookies');
    });
  
    test('should return 404 if manager not found', async () => {
      const nonExistingId = new mongoose.Types.ObjectId();
  
      const response = await request(app)
        .get('/grabManager')
        .set('Cookie', [`user_id=${nonExistingId}`]);
  
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Manager not found');
    });
  
    test('should return 500 on server error', async () => {
      // Force an error by mocking Manager.findById
      jest.spyOn(Manager, 'findById').mockImplementationOnce(() => {
        throw new Error('Database read error');
      });
  
      const response = await request(app)
        .get('/grabManager')
        .set('Cookie', [`user_id=${manager._id}`]);
  
      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Error fetching Name');
      expect(response.body.error).toBe('Database read error');
    });
  });


describe('GET /api/dashboard/daily-bookings', () => {
  it('should return daily bookings from the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-bookings');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe('GET /api/dashboard/monthly-bookings', () => {
  it('should return monthly bookings', async () => {
    const res = await request(app).get('/api/dashboard/monthly-bookings');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe('GET /api/dashboard/daily-revenue', () => {
  it('should return daily revenue for the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-revenue');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe('GET /api/dashboard/monthly-revenue', () => {
  it('should return monthly revenue', async () => {
    const res = await request(app).get('/api/dashboard/monthly-revenue');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe('GET /api/dashboard/daily-uploads', () => {
  it('should return daily uploads for the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-uploads');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe('GET /api/dashboard/monthly-uploads', () => {
  it('should return monthly uploads', async () => {
    const res = await request(app).get('/api/dashboard/monthly-uploads');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});

describe('GET /api/dashboard/categories', () => {
  it('should return categories of active products', async () => {
    const res = await request(app).get('/api/dashboard/categories');
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});


describe('GET /api/dashboard/daily-bookings', () => {
  it('should return daily bookings from the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/monthly-bookings', () => {
  it('should return monthly bookings', async () => {
    const res = await request(app).get('/api/dashboard/monthly-bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/daily-revenue', () => {
  it('should return daily revenue for the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-revenue');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/monthly-revenue', () => {
  it('should return monthly revenue', async () => {
    const res = await request(app).get('/api/dashboard/monthly-revenue');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/daily-uploads', () => {
  it('should return daily uploads for the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-uploads');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/monthly-uploads', () => {
  it('should return monthly uploads', async () => {
    const res = await request(app).get('/api/dashboard/monthly-uploads');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/categories', () => {
  it('should return categories of active products', async () => {
    const res = await request(app).get('/api/dashboard/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/daily-bookings', () => {
  it('should return daily bookings from the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/monthly-bookings', () => {
  it('should return monthly bookings', async () => {
    const res = await request(app).get('/api/dashboard/monthly-bookings');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/daily-revenue', () => {
  it('should return daily revenue for the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-revenue');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/monthly-revenue', () => {
  it('should return monthly revenue', async () => {
    const res = await request(app).get('/api/dashboard/monthly-revenue');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/daily-uploads', () => {
  it('should return daily uploads for the last 7 days', async () => {
    const res = await request(app).get('/api/dashboard/daily-uploads');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/monthly-uploads', () => {
  it('should return monthly uploads', async () => {
    const res = await request(app).get('/api/dashboard/monthly-uploads');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/dashboard/categories', () => {
  it('should return categories of active products', async () => {
    const res = await request(app).get('/api/dashboard/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});




 

});
