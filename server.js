import express from 'express';
import bcrypt from 'bcryptjs';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connecttomongodb } from './backend/models/connect.js';
import { User } from './backend/models/UserSchema.js';
import { Product } from './backend/models/ProductSchema.js';
import { Booking } from './backend/models/Bookings.js';
import { Location } from "./backend/models/Locations.js";
import { Manager } from './backend/models/ManagerSchema.js';
import mongoose from 'mongoose';
const url = 'mongodb://localhost:27017/Rentals';
const app = express();
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

connecttomongodb(url)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
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
    });

    await newUser.save();
    res.status(201).json({ errormessage: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ errormessage: 'Error registering user' });
  }
});




//Login

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ errormessage: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(401).json({ errormessage: 'Username not Found !' });
    }
    else {
      const checkpassword = await bcrypt.compare(password, existingUser.password)
      if (!checkpassword) {
        return res.status(401).json({ errormessage: 'Password is incorrect !' });
      }
    }

    //storing in cookies

    // res.cookie('username',username, { httpOnly: false, secure: false, sameSite: 'lax',path:'/' });
    res.cookie('user_id', existingUser._id.toString(), { httpOnly: false, secure: false, sameSite: 'lax', path: '/' });
    res.status(200).json({ errormessage: 'User Login successfully' });
  } catch (error) {
    console.error('Error occured while logging in :', error);
    res.status(500).json({ errormessage: 'Error while user logging in !' });
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
    // const cookieusername = req.cookies.username;
    const cookieuserid = req.cookies.user_id;
    if (!cookieuserid) {
      return res.status(401).json({ errormessage: 'Unauthorized: No userid cookie found' });
    }

    const exist_user = await User.findOne({ _id: cookieuserid });

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
      expired: false,
    });

    const savedProduct = await newProduct.save();
    exist_user.rentals.push(savedProduct._id);
    await exist_user.save();

    res.status(201).json({ errormessage: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error occured :', error);
    res.status(500).json({ errormessage: 'Upload failed' });
  }
});


app.post('/products', async (req, res) => {
  try {
    const { productType, locationName, fromDateTime, toDateTime, price } = await req.body;
    const query = {};
    if (productType) query.productType = productType;
    if (locationName) query.locationName = locationName;
    if (fromDateTime) query.fromDateTime = { $gte: new Date(fromDateTime) };
    if (toDateTime) query.toDateTime = { $lte: new Date(toDateTime) };
    if (price) query.price = { $lte: price };
    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ errormessage: 'Failed to fetch products' });
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

app.post('/booking', async (req, res) => {
  try {
    const { product_id, fromDateTime, toDateTime, price } = req.body;
    const bookingDate = new Date();

    const buyerid = req.cookies.user_id;
    if (!buyerid || !/^[0-9a-fA-F]{24}$/.test(buyerid)) {
      return res.status(400).json({ message: "Invalid buyer ID format!" });
    }

    const newbooking = new Booking({
      product_id,
      buyerid,
      fromDateTime,
      toDateTime,
      price,
      bookingDate,
    });

    const y = await newbooking.save();
    const newbookingid = newbooking._id.toString();

    const x = await User.findOneAndUpdate(
      { _id: buyerid },
      { $push: { bookings: newbookingid } },
      { new: true }
    );

    if (!y) {
      console.log("Booking not successful");
      return res.status(401).json({ message: "Booking not successful!" });
    } else if (!x) {
      console.log("Couldn't update booking");
      return res.status(401).json({ message: "Couldn't update the booking!" });
    }

    const product = await Product.findById(product_id);
    product.bookingdates.push([new Date(fromDateTime), new Date(toDateTime)]);
    product.bookingIds.push(newbookingid);
    await product.save();

    res.status(200).json({ message: "Booking successful!" });
    console.log("Booking successful!");
  } catch (error) {
    console.error("Error while processing the booking:", error);
    res.status(500).json({ message: "Server error!" });
  }
});


app.get('/admindashboard/registeredusers', async (req, res) => {
  try {
    const users = await User.find({});
    const usercount = await User.countDocuments({});
    if (!users) {
      return res.status(404).json({ error: 'Users not found !' });
    }
    return res.status(200).json({ registercount: usercount, users: users, });

  } catch (error) {
    res.status(500).json({ error: "server error !" });
  }
})

app.post('/admindashboard/deleteusers', async (req, res) => {
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
    const deletedUser = await User.findByIdAndDelete(user_id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found in database!' });
    }

    return res.status(200).json({ message: 'User and their bookings/products deleted successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error!' });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.get("/grabBookings", async (req, res) => {
  try {
    if (req.cookies.user_id) {
      const userid = req.cookies.user_id;

      // Find the user by their user_id
      const exist_user = await User.findOne({ _id: userid });

      if (exist_user) {
        // Get all booking IDs from the user's bookings field
        const bookingIds = exist_user.bookings;

        // Fetch all bookings for the user based on their booking IDs
        const bookings = await Booking.find({ _id: { $in: bookingIds } });

        if (bookings.length > 0) {
          // Extract all product IDs from the bookings
          const productIds = bookings.map(booking => booking.product_id);

          // Fetch all products associated with those product IDs
          const products = await Product.find({ _id: { $in: productIds } });

          // Return the booking details along with the related product details
          res.json({
            BookingDetails: bookings,
            ProductDetails: products,
          });
        } else {
          res.status(404).json({ message: "No booking details found for this user" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(400).json({ message: "No userid cookie found" });
    }
  } catch (err) {
    res.status(500).json({ message: "An error occurred", error: err.message });
  }

});


app.post("/settings", async (req, res) => {
  try {
    const { editUsername, password, email } = req.body;

    // Check if username exists in cookies
    const currentUserid = req.cookies.user_id;

    if (!currentUserid) {
      return res.status(401).json({ message: "Unauthorized: No user logged in" });
    }

    // Find the user by their current username
    const existingUser = await User.findOne({ _id: currentUserid });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the new email is already in use
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      existingUser.email = email; // Update email if it's new
    }

    // Check if the new username is already in use
    if (editUsername && editUsername !== currentUserid) {
      const usernameExists = await User.findOne({ username: editUsername });
      if (usernameExists) {
        return res.status(409).json({ message: "Username already in use" });
      }
      existingUser.username = editUsername; // Update the username
    }

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      existingUser.password = hashedPassword;
    }

    // Save the updated user details
    await existingUser.save();
    console.log(existingUser)

    // If username is changed, update the cookie
    // if (editUsername && editUsername !== currentUserid) {
    //   res.clearCookie('user_id');
    //   res.cookie('user_id', editUsername, { httpOnly: false, secure: false, sameSite: 'lax' });
    // }

    res.status(200).json({ message: "User details updated successfully" });
  } catch (err) {
    console.error("Error updating user details:", err);
    res.status(500).json({ message: "An error occurred while updating user details" });
  }
});



app.get("/grabDetails", async (req, res) => {
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

app.get("/grabRentals", async (req, res) => {
  try {
    if (req.cookies.user_id) {
      const userid = req.cookies.user_id;
      const exist_user = await User.findOne({ _id: userid });

      if (exist_user) {
        const productIds = exist_user.rentals;
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length > 0) {
          const obj = { rentedProducts: products };
          res.json(obj);
        } else {
          res.status(404).json({ message: "No rented products found" });
        }
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } else {
      res.status(400).json({ message: "No username cookie found" });
    }
  } catch (err) {
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

    res.status(200).json({ message: 'Successfully signed out' });
  } catch (err) {
    console.error('Error during sign out:', err);
    res.status(500).json({ message: 'Error signing out' });
  }
});

// API for daily bookings (last 7 days)
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

// API for monthly bookings
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

// API for monthly uploads
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

const branch = "BHAVANIPURAM";
app.get("/api/dashboard/daily-bookings-cat", async (req, res) => {
  try {
    const today = new Date();
    
    // Step 1: Fetch product IDs from Booking in the last 7 days
    const bookings = await Booking.find({
      bookingDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) }
    }).select("product_id");

    console.log("Bookings:", bookings); // Log bookings retrieved

    const productIds = bookings.map(booking => booking.product_id);

    // Check if we found any product IDs
    if (productIds.length === 0) {
      return res.json([]); // No bookings found
    }

    // Step 2: Fetch products that match the collected productIds and filter by location
    const products = await Product.find({
      _id: { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) }, // Use 'new' to instantiate ObjectId
      locationName: branch // Assuming 'branch' is passed properly as a query param or constant
    });

    console.log("Products:", products); // Log products retrieved

    // Check if we found any products
    if (products.length === 0) {
      return res.json([]); // No products found for the location
    }

    // Step 3: Collect the filtered product IDs
    const filteredProductIds = products.map(product => product._id.toString());

    // Step 4: Aggregate bookings using the filtered product IDs
    const aggregatedBookings = await Booking.aggregate([
      {
        $match: {
          product_id: { $in: filteredProductIds }, // Match product_id to filtered product IDs
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

    console.log("Aggregated Bookings:", aggregatedBookings); // Log aggregated bookings

    res.json(aggregatedBookings);
  } catch (err) {
    console.error("Error fetching daily bookings:", err); // Log the error for debugging
    res.status(500).json({ message: "Error fetching daily bookings", error: err.message });
  }
});



// Monthly Bookings by Location
app.get("/api/dashboard/monthly-bookings-cat", async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $match: {
          ...(branch && { locationName: branch }) // Match locationName if branch is provided
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$bookingDate" },
            month: { $month: "$bookingDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly bookings", error: err.message });
  }
});

// Daily Revenue by Location
app.get("/api/dashboard/daily-revenue-cat", async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          bookingDate: { $gte: startOfWeek },
          ...(branch && { locationName: branch }) // Match locationName if branch is provided
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" }
          },
          totalRevenue: { $sum: "$price" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(dailyRevenue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily revenue", error: err.message });
  }
});

// Monthly Revenue by Location
app.get("/api/dashboard/monthly-revenue-cat", async (req, res) => {
  try {
    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          ...(branch && { locationName: branch }) // Match locationName if branch is provided
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
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(monthlyRevenue);
  } catch (err) {
    res.status(500).json({ message: "Error fetching monthly revenue", error: err.message });
  }
});

// Daily Uploads by Location
app.get("/api/dashboard/daily-uploads-cat", async (req, res) => {
  try {
    const today = new Date();

    const uploads = await Product.aggregate([
      {
        $match: {
          uploadDate: { $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6) },
          ...(branch && { locationName: branch }) // Match locationName if branch is provided
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

// Monthly Uploads by Location
app.get("/api/dashboard/monthly-uploads-cat", async (req, res) => {
  try {
    const uploads = await Product.aggregate([
      {
        $match: {
          ...(branch && { locationName: branch }) // Match locationName if branch is provided
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

// Categories by Location
app.get("/api/dashboard/categories-cat", async (req, res) => {
  try {
    const today = new Date();

    const categories = await Product.aggregate([
      {
        $match: {
          toDateTime: { $gte: today },
          ...(branch && { locationName: branch }) // Match locationName if branch is provided
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


app.post('/admindashboard/createmanager',async(req,res)=>{
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
      return res.status(409).json({ errormessage: 'Manager for branch already exists !'});
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


app.get('/admindashboard/registeredmanagers', async (req, res) => {
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


app.post('/admindashboard/deletemanagers',async(req,res)=>{

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