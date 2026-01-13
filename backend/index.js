require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// =======================
// MongoDB Connection
// =======================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// =======================
// Basic Test API
// =======================
app.get("/", (req, res) => {
  res.send("Express App is Running");
});

// =======================
// Image Upload Setup
// =======================
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// Serve images
app.use("/images", express.static("upload/images"));

// Upload API
app.post("/upload", upload.single("product"), (req, res) => {
  res.json({
    success: 1,
    image_url: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
});

// =======================
// Product Schema
// =======================
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// Add product
app.post("/addproduct", async (req, res) => {
  let products = await Product.find({});
  let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

  const product = new Product({
    id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });

  await product.save();
  res.json({ success: true, name: req.body.name });
});

// Remove product
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

// Get all products
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

// =======================
// User Schema
// =======================
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

// =======================
// Auth APIs
// =======================
app.post("/signup", async (req, res) => {
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res
      .status(400)
      .json({ success: false, errors: "User already exists" });
  }

  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });

  await user.save();

  const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user)
    return res.json({ success: false, errors: "Wrong Email Id" });

  if (req.body.password !== user.password)
    return res.json({ success: false, errors: "Wrong Password" });

  const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET);
  res.json({ success: true, token });
});

// =======================
// Collections APIs
// =======================
app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  res.send(products.slice(-8));
});

app.get("/popularinwomen", async (req, res) => {
  const products = await Product.find({ category: "women" });
  res.send(products.slice(0, 4));
});

// =======================
// Auth Middleware
// =======================
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res
      .status(401)
      .send({ errors: "Please authenticate using a valid token" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch {
    res.status(401).send({ errors: "Invalid token" });
  }
};

// =======================
// Cart APIs
// =======================
app.post("/addtocart", fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  userData.cartData[req.body.itemId] += 1;
  await userData.save();
  res.send("Added");
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
  await userData.save();
  res.send("Removed");
});

app.post("/getcart", fetchUser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  res.json(userData.cartData);
});

// =======================
// Start Server
// =======================
app.listen(port, () => {
  console.log("Server running on port " + port);
});