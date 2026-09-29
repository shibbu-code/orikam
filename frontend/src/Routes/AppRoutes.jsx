import { Routes, Route } from "react-router-dom";
import ProductListing from "../Pages/Products/ProductListing"
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
import AdminDashboard from "../Pages/Admin/AdminDashnoard";
import AdminProducts from "../Pages/Admin/Products/AdminProducts";
import AddProduct from "../Pages/Admin/Products/AddProduct";
import EditProduct from "../Pages/Admin/Products/EditProduct";
import AdminCategories from "../Pages/Admin/Categories/AdminCategories";
import AddCategory from "../Pages/Admin/Categories/AddCategory";
import EditCategory from "../Pages/Admin/Categories/EditCategory";
import AdminBrands from "../Pages/Admin/Brands/AdminBrands";
import AddBrand from "../Pages/Admin/Brands/AddBrands";
import EditBrand from "../Pages/Admin/Brands/EditBrands";
import AdminInventory from "../Pages/Admin/Inventory/AdminInventory";
import AdminOrders from "../Pages/Admin/Orders/AdminOrders";
import AdminOrderDetails from "../Pages/Admin/Orders/AdminOrderDetails";
import AdminCustomers from "../Pages/Admin/Customers/AdminCustomers";
import AdminCustomerDetails from "../Pages/Admin/Customers/AdminCustomerDetails";
import AdminProfile from "../Pages/Admin/Profile/AdminProfile";
import EditAdminProfile from "../Pages/Admin/Profile/EditAdminProfile";
import AdminReturns from "../Pages/Admin/Returns/AdminReturns";
import AdminReturnDetails from "../Pages/Admin/Returns/AdminReturnDetails";
import BrandListing from "../Pages/Brand/BrandListing";
import CategoryListing from "../Pages/Category/CategoryListing";
import About from "../Pages/About/About";
import NotFound from "../Pages/NotFound/NotFound";
import Contact from "../Pages/Contact/Contact";
import Wishlist from "../Pages/WishList/Wishlist";


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductListing />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders/:orderId" element={<OrderDetails />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/orders" element={<MyOrders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />  
      <Route path="/admin/products/add" element={<AddProduct />} />
      <Route path="/admin/products/edit/:productId" element={<EditProduct />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/categories/add" element={<AddCategory />} />
      <Route path="/admin/categories/edit/:categoryId" element={<EditCategory />} />
      <Route path="/admin/brands" element={<AdminBrands />} />
      <Route path="/admin/brands/add" element={<AddBrand />} />
      <Route path="/admin/brands/edit/:brandId" element={<EditBrand />} />
      <Route path="/admin/inventory" element={<AdminInventory />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/orders/:orderId" element={<AdminOrderDetails />} />
      <Route path="/admin/customers" element={<AdminCustomers />} />
      <Route path="/admin/customers/:customerId" element={<AdminCustomerDetails />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/profile/edit" element={<EditAdminProfile />} />
      <Route path="/admin/returns" element={<AdminReturns />} />
      <Route path="/admin/returns/:orderId" element={<AdminReturnDetails />} />
      <Route path="/brands" element={<BrandListing />} />
      <Route path="/categories" element={<CategoryListing />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;