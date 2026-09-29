const express = require('express');
const connectDB = require('./database/connection')
const app = express();
const port = 3000;
const cors = require('cors');
const dotenv = require("dotenv");
const {addToWishlist} = require('./Controller/wishlistController')
const wishlistRoutes = require('./routes/wishlistRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const brandRoutes = require('./routes/brandRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const adminDashboardRoutes = require("./routes/adminRoutes");
const inventoryRoutes = require('./routes/inventoryRoutes')
const customerRoutes = require('./routes/customerRoutes')


dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(port, () => {
  console.log(`Orikam app listening on port ${port}`);
});