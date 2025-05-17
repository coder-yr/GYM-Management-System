# GYM Management System

## Overview
A web-based system that helps gym admins and members manage billing, diet plans, and notifications digitally. Built using Node.js, Express, and MongoDB.

## Problem Statement
Traditional gyms rely on paper receipts and manual messaging, which leads to issues in tracking and communication. This system provides a secure, digital alternative.

## Features
- Admin and Member Login
- Add/Update/Delete Members
- Generate and View Billing Receipts
- Assign Diet Plans and Fee Packages
- Send Notifications (e.g., Working/Non-working Days)

## Technologies Used
- Node.js, Express.js
- MongoDB (Mongoose)
- EJS Templates
- HTML, CSS, JavaScript
- bcrypt, express-session

## Modules
- Admin Panel
- Member Dashboard
- Billing System
- Diet Management
- Notifications

## System Justification
MongoDB was chosen over Firebase for better backend control and complex querying capabilities. It also integrates seamlessly with Express and Mongoose.

## Deployment Plan
The app is suitable for cloud deployment via Render, Railway, or local deployment using Node.js and MongoDB Atlas.

## Logging
Basic logging is implemented using `console.log()` for key actions like authentication and data updates. This helps during development and testing. A production-ready version will integrate a proper logging library such as Winston for scalable, persistent logging and monitoring.


## GitHub
👉 [Your GitHub Link Here]

## Future Scope
- Supplement store integration
- Personal trainer module
- Member attendance tracking


