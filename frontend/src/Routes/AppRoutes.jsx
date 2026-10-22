import { Routes, Route } from "react-router-dom";

import ScrollToTop from "../components/ScrollToTop";
import ProductListing from "../Pages/Products/ProductListing";
import Login from "../Pages/Auth/Login";
import Register from "../Pages/Auth/Register";
import Home from "../Pages/Home";
import ProductDetails from "../Pages/Products/ProductDetails";
import Cart from "../Pages/Cart/Cart";
import Checkout from "../Pages/Checkout/Checkout";
import OrderSuccess from "../Pages/Orders/OrderSuccess";
import OrderDetails from "../Pages/Orders/OrderDetails";
import MyOrders from "../Pages/Orders/MyOrders";
import Profile from "../Pages/Profile";

// Admin pages
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../Pages/Admin/AdminDashnoard";

import AdminProducts from "../Pages/Admin/Products/AdminProducts";
import AddProduct from "../Pages/Admin/Products/AddProduct";
import EditProduct from "../Pages/Admin/Products/EditProduct";
import ViewProduct from "../Pages/Admin/Products/ViewProduct";

import AdminCategories from "../Pages/Admin/Categories/AdminCategories";
import AddCategory from "../Pages/Admin/Categories/AddCategory";
import EditCategory from "../Pages/Admin/Categories/EditCategory";
import ViewCategory from "../Pages/Admin/Categories/ViewCategory";

import AdminBrands from "../Pages/Admin/Brands/AdminBrands";
import AddBrand from "../Pages/Admin/Brands/AddBrands";
import EditBrand from "../Pages/Admin/Brands/EditBrands";
import ViewBrand from "../Pages/Admin/Brands/ViewBrand";

import AdminInventory from "../Pages/Admin/Inventory/AdminInventory";

import AdminOrders from "../Pages/Admin/Orders/AdminOrders";
import AdminOrderDetails from "../Pages/Admin/Orders/AdminOrderDetails";

import AdminCustomers from "../Pages/Admin/Customers/AdminCustomers";
import AdminCustomerDetails from "../Pages/Admin/Customers/AdminCustomerDetails";

import AdminProfile from "../Pages/Admin/Profile/AdminProfile";
import EditAdminProfile from "../Pages/Admin/Profile/EditAdminProfile";

import AdminReturns from "../Pages/Admin/Returns/AdminReturns";
import AdminReturnDetails from "../Pages/Admin/Returns/AdminReturnDetails";

import Warehouses from "../Pages/Admin/Warehouse/Warehouse";

// Other pages
import BrandListing from "../Pages/Brand/BrandListing";
import CategoryListing from "../Pages/Category/CategoryListing";
import About from "../Pages/About/About";
import NotFound from "../Pages/NotFound/NotFound";
import Contact from "../Pages/Contact/Contact";
import Wishlist from "../Pages/WishList/Wishlist";
// membership
import Membership from "../Pages/Membership/Membership";


const AppRoutes = () => {
return ( <Routes>
{/* Authentication */}
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />


  {/* Customer pages */}
  <Route path="/" element={<Home />} />
  <Route path="/products" element={<ProductListing />} />
  <Route path="/products/:productId" element={<ProductDetails />} />

  <Route path="/cart" element={<Cart />} />
  <Route path="/checkout" element={<Checkout />} />

  <Route path="/orders/:orderId" element={<OrderDetails />} />
  <Route path="/order-success" element={<OrderSuccess />} />
  <Route path="/orders" element={<MyOrders />} />

  <Route path="/profile" element={<Profile />} />
  <Route path="/brands" element={<BrandListing />} />
  <Route path="/categories" element={<CategoryListing />} />
  <Route path="/about" element={<About />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/wishlist" element={<Wishlist />} />
  <Route path="/membership" element={<Membership />} />
  
  {/* Admin layout with shared sidebar */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />

    {/* Products */}
    <Route path="products" element={<AdminProducts />} />
    <Route path="products/add" element={<AddProduct />} />
    <Route
      path="products/edit/:productId"
      element={<EditProduct />}
    />
  <Route
  path="products/:productId"
  element={<ViewProduct />}
/>

    {/* Categories */}
    <Route path="categories" element={<AdminCategories />} />
    <Route path="categories/add" element={<AddCategory />} />
    <Route
      path="categories/edit/:categoryId"
      element={<EditCategory />}
    />
    <Route
  path="categories/:categoryId"
  element={<ViewCategory />}
/>

    {/* Brands */}
    <Route path="brands" element={<AdminBrands />} />
    <Route path="brands/add" element={<AddBrand />} />
    <Route
      path="brands/edit/:brandId"
      element={<EditBrand />}
    />
    <Route
  path="brands/:brandId"
  element={<ViewBrand />}
/>

    {/* Inventory */}
    <Route path="inventory" element={<AdminInventory />} />

    
{/* Warehouses */}
    <Route path="warehouses" element={<Warehouses />} />
    {/* Orders */}
    <Route path="orders" element={<AdminOrders />} />
    <Route
      path="orders/:orderId"
      element={<AdminOrderDetails />}
    />

    {/* Customers */}
    <Route path="customers" element={<AdminCustomers />} />
    <Route
      path="customers/:customerId"
      element={<AdminCustomerDetails />}
    />

    {/* Profile */}
    <Route path="profile" element={<AdminProfile />} />
    <Route
      path="profile/edit"
      element={<EditAdminProfile />}
    />

    {/* Returns */}
    <Route path="returns" element={<AdminReturns />} />
    <Route
      path="returns/:orderId"
      element={<AdminReturnDetails />}
    />
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>


);
};

export default AppRoutes;
