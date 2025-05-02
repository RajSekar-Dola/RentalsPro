import express from 'express';
import { User } from '../models/UserSchema.js';
import { Product } from '../models/ProductSchema.js';
import { Booking } from '../models/Bookings.js';
import { Manager } from '../models/ManagerSchema.js';

import client from '../../redisClient.js';

const router = express.Router();

// Route: Fetch booking notifications
router.post('/fetchBookingnotifications', async (req, res) => {
    const managerid = req.cookies?.user_id;

    if (!managerid) {
        return res.status(400).json({ message: "Manager ID is required" });
    }

    try {
        const manager = await Manager.findById(managerid);

        if (!manager) {
            return res.status(404).json({ message: "Manager not found" });
        }

        const notifications = manager.bookingnotifications || [];
        res.status(200).json({ notifications: notifications });
    } catch (error) {
        console.error("Error fetching booking notifications:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route: Fetch detailed results for bookings
router.post('/bookingnotifications/results', async (req, res) => {
    const { bids } = req.body;
    if (!bids || !Array.isArray(bids) || bids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty bids array" });
    }

    try {
        const results = await Promise.all(
            bids.map(async (id) => {
                try {
                    const booking = await Booking.findById(id);
                    if (!booking) {
                        throw new Error(`Booking not found for ID: ${id}`);
                    }

                    const buyer = await User.findById(booking.buyerid);
                    const product = await Product.findById(booking.product_id);
                    const owner = await User.findById(product.userid);

                    return {
                        ownerid: owner?._id,
                        ownername: owner?.username,
                        owneremail: owner?.email,
                        buyerid: buyer?._id,
                        buyername: buyer?.username,
                        buyeremail: buyer?.email,
                        productid: product?._id,
                        productname: product?.productName,
                        productphoto: product?.photo[0],
                        booking,
                    };
                } catch (error) {
                    console.error("Error fetching booking details:", error);
                    return null; // Return null for failed items
                }
            })
        );

        // Filter out null entries in the results array
        const filteredResults = results.filter((result) => result !== null);
        res.status(200).json({ results: filteredResults });
    } catch (error) {
        console.log(error);
        console.error("Error fetching booking results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/bookingnotifications/updatelevel', async (req, res) => {
    const { bid, level, id } = req.body;
    try {
        console.log(bid);
        const booking = await Booking.findByIdAndUpdate(bid, { level: level }, { new: true });
        if (level == 3) {
            const removednotification = await Manager.findByIdAndUpdate(id, { $pull: { bookingnotifications: { _id: bid } } }, { new: true });
        }
        if (booking) {
            res.status(200).json({ result: true });
        } else {
            res.status(400).json({ result: false });
        }
    } catch (e) {
        res.status(400).json({ result: false });
    }
})

router.get('/uploadnotifications', async (req, res) => {
    try {
        const managerid = req.cookies.user_id;
        if (managerid) {
            const exist_manager = await Manager.findById(managerid);
            const notifications = exist_manager.notifications;
            const productids = notifications.map(x => x.message);
            if (exist_manager) {
                res.json({ notifications: notifications, productids: productids });
            } else {
                res.status(404).json({ message: "manager not found" });
            }
        } else {
            res.status(400).json({ message: "No manager cookie found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// router.post('/uploadnotifications/markAsSeen', async (req, res) => {
//     try {
//         const managerid = req.cookies.user_id;
//         const { notificationid, productid, rejected } = req.body;
//         if (rejected) {
//             const x = await Product.findByIdAndDelete(productid);
//             console.log(x);
//         }
//         else {
//             const y = await Product.findByIdAndUpdate(productid, { $set: { expired: false } }, { new: true });
//         }
//         const removednotification = await Manager.findByIdAndUpdate(managerid, { $pull: { notifications: { _id: notificationid } } }, { new: true });
//         if (!removednotification) {
//             return res.status(400).json({ message: "notification not removed .error occured !" });
//         }
//         else {
//             return res.status(200).json({ message: "notification removed successfully!" });
//         }
//     }
//     catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// })


router.post('/uploadnotifications/markAsSeen', async (req, res) => {
    try {
      const managerid = req.cookies.user_id;
      const { notificationid, productid, rejected } = req.body;
  
      if (rejected) {
        await Product.findByIdAndDelete(productid);
      } else {
        const updatedProduct = await Product.findByIdAndUpdate(
          productid,
          { $set: { expired: false } },
          { new: true }
        );
  
        // 🔥 Invalidate entire product cache
        const keys = await client.keys('*');
        const deletePromises = keys.map(key => client.del(key));
        await Promise.all(deletePromises);
  
        console.log('🧹 Redis cache cleared');
  
        // ✅ Update rental cache for owner
        if (updatedProduct?.userid) {
          const userKey = `user:${updatedProduct.userid}:rentals`;
          const existing = await client.get(userKey);
          if (existing) {
            const ids = JSON.parse(existing);
            if (!ids.includes(updatedProduct._id.toString())) {
              ids.push(updatedProduct._id.toString());
              await client.set(userKey, JSON.stringify(ids));
              console.log(`🧠 Updated Redis rental cache for user ${updatedProduct.userid}`);
            }
          }
        }
      }
  
      const removednotification = await Manager.findByIdAndUpdate(
        managerid,
        { $pull: { notifications: { _id: notificationid } } },
        { new: true }
      );
  
      if (!removednotification) {
        return res.status(400).json({ message: "notification not removed. error occurred!" });
      } else {
        return res.status(200).json({ message: "notification removed successfully!" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// router.post('/uploadnotifications/markAsSeen', async (req, res) => {
//     try {
//       const managerid = req.cookies.user_id;
//       const { notificationid, productid, rejected } = req.body;
  
//       if (rejected) {
//         await Product.findByIdAndDelete(productid);
//       } else {
//         const updatedProduct = await Product.findByIdAndUpdate(
//           productid,
//           { $set: { expired: false } },
//           { new: true }
//         );
  
//         // 🔥 Invalidate entire product cache
//         const keys = await client.keys('*');
//         const deletePromises = keys.map(key => client.del(key));
//         await Promise.all(deletePromises);
  
//         console.log('🧹 Redis cache cleared');
//       }
  
//       const removednotification = await Manager.findByIdAndUpdate(
//         managerid,
//         { $pull: { notifications: { _id: notificationid } } },
//         { new: true }
//       );
  
//       if (!removednotification) {
//         return res.status(400).json({ message: "notification not removed. error occurred!" });
//       } else {
//         return res.status(200).json({ message: "notification removed successfully!" });
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

router.get('/notifications/countUnseen', async (req, res) => {
    try {
        const userid = req.cookies.user_id;
        if (userid) {
            const exist_user = await Manager.findById(userid);
            const notifications = exist_user.notifications;
            if (exist_user) {
                res.json({ notifications: notifications });
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

router.post('/notifications/markallAsSeen', async (req, res) => {
    try {
        const userid = req.cookies.user_id;

        // Update all notifications with seen: false to seen: true
        const updatedUser = await Manager.findOneAndUpdate(
            { _id: userid, "notifications.seen": false }, // Match notifications with seen: false
            { $set: { "notifications.$[].seen": true } }, // Update all notifications' seen field
            { new: true } // Return the updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or no unseen notifications" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/products/:product_id', async (req, res) => {
    const { product_id } = req.params;
    console.log(product_id);
    try {
        const reqproduct = await Product.findById(product_id);
        if (!reqproduct) {
            console.log(reqproduct);
            return res.status(404).json({ error: 'product not found !' });
        }
        return res.status(200).json(reqproduct);

    } catch (error) {
        res.status(500).json({ error: "server error !" });
    }
})

export default router;