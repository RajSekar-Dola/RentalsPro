import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../css/ProductbookingPage.css';
const ProductbookingPage = () => {
    const [reqproduct, setreqproduct] = useState({});
    const [message,setmessage]=useState("");
    const { product_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryparams = new URLSearchParams(location.search);
    const frombookingdate = queryparams.get('frombookingdate');
    const tobookingdate = queryparams.get('tobookingdate');
    const fromDate = new Date(frombookingdate);
    const toDate = new Date(tobookingdate);
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return {
            date: `${year}-${month}-${day}`,
            time: `${hours}:${minutes}`
        };
    };

    const { date: fromDateFormatted, time: fromTimeFormatted } = formatDateTime(fromDate);
    const { date: toDateFormatted, time: toTimeFormatted } = formatDateTime(toDate);


    const timeDiff = Math.abs(toDate - fromDate);
    const hoursDiff = Math.ceil(timeDiff / (1000 * 60 * 60));
    const baseFare = reqproduct.price * hoursDiff;
    const taxes = (baseFare * 0.10).toFixed(2);
    const total = (parseFloat(baseFare) + parseFloat(taxes)).toFixed(2);

    const getCookieValue = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };
      

      const sendMailToOwner = async (to, subject, text) => {
        try {
            const response = await fetch(`http://localhost:3000/send-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to, subject, text }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
            } else {
                console.error("Failed to send email");
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const formatDate = (date) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit', 
            hour12: true 
        };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    };
    
    const grabDetailsOfProduct = async () => {
        const buyerId = getCookieValue("user_id");
        try {
            const response = await fetch(
                `http://localhost:3000/grabCustomernameProductId?userid=${buyerId}&product_id=${product_id}`,
                {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const data = await response.json();
            console.log("Data fetched:", data);
            // Process fetched data as needed

            const formattedFromDate = formatDate(data.fromDate);
            const formattedToDate = formatDate(data.toDate);
            const formattedBookingDate = formatDate(data.bookingDate);

            const subjectForOwner = "Your Product Has Been Booked!";

            const textForOwner = `Dear ${data.ownerName},

            We are excited to inform you that your product has been successfully booked by ${data.buyerName} on ${formattedBookingDate}. 

            Here are the booking details:
            - Product Name: ${data.productName}(${data.productType})
            - From: ${formattedFromDate}
            - To: ${formattedToDate}
            - Exchange Location: XYZ address
            - Exchange Date & Time: ${formattedBookingDate} 

            The total amount to be received: ₹${total}.

            Please ensure you are present at the specified location along with your "Aadhar card" and "pan card xeror" on the exchange date and time to hand over the product.

            If you have any questions, feel free to contact us.

            Best regards,
            [RENTALS PRO]
            `;
            sendMailToOwner(data.ownerEmail, subjectForOwner, textForOwner);

            const subjectForBuyer = "Your Booking Confirmation";

            const textForBuyer = `Dear ${data.buyerName},

            Thank you for booking a product through our platform! Your booking is confirmed. 

            Here are the details of your booking:
            - Product Name: ${data.productName}(${data.productType})
            - From: ${formattedFromDate}
            - To: ${formattedToDate}
            - Exchange Location: XYZ address
            - Exchange Date & Time: ${formattedBookingDate}

            The total amount paid: ₹${total}.

            Please arrive at the specified location along with your "Aadhar card" and "PAN card xerox" on the exchange date and time to collect your product.
            If you have any questions or concerns, feel free to contact us.

            We hope you enjoy using your product!

            Best regards,  
            [RENTALS PRO]
            `;

            sendMailToOwner(data.buyerEmail, subjectForBuyer, textForBuyer);
        } catch (err) {
            console.error("Error in sendMailToBothUsers:", err);
        }
    };

      const handlepayment = async () => {
        const userid = getCookieValue('user_id');
        if(!userid)
        {   sessionStorage.setItem('lastpage','bookingpage');
            navigate('/login');
        }
        else{
                try{
                    const response=await fetch(`http://localhost:3000/booking`,{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({
                            product_id:product_id,
                            fromDateTime:fromDate,
                            toDateTime:toDate,
                            price:total,
                        }),
                        credentials:'include'
                    });
                    if(!response.ok){
                        const errorresponse=await response.json();
                        setmessage(errorresponse.message);
                    }
                    else{
                        setmessage('Booking Successful !');
                        grabDetailsOfProduct();
                        setTimeout(() => {
                            navigate('/');
                          }, 1000); 
                        console.log("Payment done");

                    }
                }
                catch(error){
                    console.log(error);
                }
        }
      };

    useEffect(() => {
        const fetchreqproduct = async (product_id) => {
            try {
                const response = await fetch(`http://localhost:3000/product/${product_id}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    console.log(response);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const product = await response.json();
                setreqproduct(product);
            } catch (error) {
                console.log(error);
            }
        };
        fetchreqproduct(product_id);
    }, [product_id]);

    return (
        <div className="container">
          {/* <div className="review-checkout-container">
            <h2>Review and Checkout</h2>
          </div> */}
          <div className="box-container">
            <div className="left-box">
              <div className="summary">
                {reqproduct.photo && reqproduct.photo.length > 0 ? (
                  <img src={reqproduct.photo[0]} alt={reqproduct.productName} />
                ) : (
                  <p>No image available</p>
                )}
                <div id="summarytext">
                  <h3>{reqproduct.productName}</h3>
                  <p><strong>Pickup Date:</strong> {fromDateFormatted}</p>
                  <p><strong>Pickup Time:</strong> {fromTimeFormatted}</p>
                  <p><strong>Drop-off Date:</strong> {toDateFormatted}</p>
                  <p><strong>Drop-off Time:</strong> {toTimeFormatted}</p>
                  <p><strong>Duration:</strong> {hoursDiff} hours</p>
                  <p><strong>Location:</strong> {reqproduct.locationName}</p>
                  <p><strong>Price per hour:</strong> ₹{reqproduct.price}</p>
                  <p className="rental-note"><strong>Note:</strong> Rental charges do not include fuel.</p>
                </div>
              </div>
            </div>
      
            <div className="right-box">
              <h3>Price Details</h3> {/* Updated title */}
              <p><strong>Fare:</strong> ₹{reqproduct.price} * {hoursDiff} hr = ₹{baseFare}</p>
              <p><strong>Service Charges (10%):</strong> ₹{taxes}</p>
              <p><strong>Total:</strong> ₹{total}</p>
              <button className="payment-button" onClick={handlepayment}>Pay Now</button> {/* Updated button text */}
              {message && <p>{message}</p>}
            </div>
          </div>
        </div>
      );
      
};

export default ProductbookingPage;