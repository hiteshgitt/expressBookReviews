const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({secret:"fingerprint_customer", resave: true, saveUninitialized: true}))

// Debug middleware to log headers and session
app.use((req, res, next) => {
  console.log('Request path:', req.path);
  console.log('Auth header:', req.headers.authorization);
  console.log('Session:', req.session);
  next();
});

app.use("/customer/auth/*", function auth(req, res, next) {
  console.log("Authentication middleware triggered");
  
  // Try to get token from Authorization header first
  const authHeader = req.headers.authorization;
  let token;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    console.log("Using token from Authorization header");
  } else if (req.session && req.session.authorization) {
    // Fallback to session if no auth header
    token = req.session.authorization;
    console.log("Using token from session");
  }
  
  console.log("Token:", token);
  
  if (!token) {
    console.log("No token found");
    return res.status(401).json({
      success: false,
      message: "No access token provided"
    });
  }
  
  try {
    console.log("Attempting to verify token with secret:", "fingerprint_customer");
    const decoded = jwt.verify(token, "fingerprint_customer");
    console.log("Token verified successfully. Decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("Token verification failed:", error.message);
    return res.status(403).json({
      success: false,
      message: "Failed to authenticate token"
    });
  }
});
 
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));