
# RentalsPro

## Description

RentalsPro is a web-based platform designed to simplify the process of renting products, including vehicles, electronics, and outdoor equipment. This project was motivated by the growing demand for flexible, short-term access to products without ownership commitments. RentalsPro was created to solve the problem of high rental costs by offering a centralized solution where users can find affordable rental options for various needs.

Through this project, we developed skills in building a full-stack application with separate frontend and backend functionality, using frameworks like React for the frontend and Node.js with Express for the backend.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Credits](#credits)
- [License](#license)

## Installation

To set up the development environment for RentalsPro, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/RentalsPro.git
   cd RentalsPro-main
   ```

2. **Install Project Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**  
   - Create a `.env` file in the `RentalsPro-main` directory with the required environment variables:
     ```bash
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the Application**
   - In one terminal, start the backend server:
     ```bash
     npm start
     ```
   - In another terminal, start the frontend development server:
     ```bash
     npm run dev
     ```

5. **Access the Application**  
   Open your browser and go to `http://localhost:3000` to view the site.

## Usage

1. **Sign Up and Login**: Users can sign up and log in to their accounts for personalized rental management.
2. **Browse Categories**: Products are organized into categories like vehicles, electronics, and more.
3. **Filter and Search**: Use filters to find products by location, price, and availability.
4. **Rent Products**: Users can book rentals directly from product pages.
5. **Manage Bookings**: Users have access to manage their past and active rentals.

For screenshots, navigate to the `assets/images` folder where key sections of the project are illustrated.

## Features

- **Multi-user Support**: Separate roles for customers, Managers, and administrators, each with unique permissions.
- **Booking Management**: Users can view and manage their bookings.
- **Dynamic Filters**: Advanced filtering and search options for efficient browsing.

## Credits

- **Contributors**: List your collaborators with links to their GitHub profiles.
- **Third-Party Libraries**: Some of the libraries used include [React](https://reactjs.org/), [Express](https://expressjs.com/), and [MongoDB](https://www.mongodb.com/).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
