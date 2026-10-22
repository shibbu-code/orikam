import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
LayoutDashboard,
Package,
Tags,
Award,
Boxes,
ShoppingCart,
Users,
RotateCcw,
UserCircle,
LogOut,
Warehouse
} from "lucide-react";
import "./AdminLayout.css";

const AdminLayout = () => {
const navigate = useNavigate();

const handleLogout = () => {
localStorage.removeItem("userId");
localStorage.removeItem("userName");
localStorage.removeItem("userEmail");
localStorage.removeItem("userRole");
localStorage.removeItem("isLoggedIn");


navigate("/login");


};

return ( <div className="admin-layout"> <aside className="admin-sidebar"> <div className="admin-logo"> <div className="admin-logo-icon">O</div>


      <div className="admin-logo-text">
        <strong>ORIKAM</strong>
        <span>ADMIN PANEL</span>
      </div>
    </div>

    <nav className="admin-nav">
      <NavLink to="/admin" end className={({ isActive }) => isActive ? "active" : ""}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </NavLink>

      <NavLink to="/admin/products" className={({ isActive }) => isActive ? "active" : ""}>
        <Package size={18} />
        <span>Products</span>
      </NavLink>

      <NavLink to="/admin/categories" className={({ isActive }) => isActive ? "active" : ""}>
        <Tags size={18} />
        <span>Categories</span>
      </NavLink>

      <NavLink to="/admin/brands" className={({ isActive }) => isActive ? "active" : ""}>
        <Award size={18} />
        <span>Brands</span>
      </NavLink>
       
      <NavLink to="/admin/warehouses" className={({ isActive }) => isActive ? "active" : ""}>
<Warehouse size={18} />
<span>Warehouses</span>
</NavLink>

      <NavLink to="/admin/inventory" className={({ isActive }) => isActive ? "active" : ""}>
        <Boxes size={18} />
        <span>Inventory</span>
      </NavLink>

      <NavLink to="/admin/orders" className={({ isActive }) => isActive ? "active" : ""}>
        <ShoppingCart size={18} />
        <span>Orders</span>
      </NavLink>

      <NavLink to="/admin/customers" className={({ isActive }) => isActive ? "active" : ""}>
        <Users size={18} />
        <span>Customers</span>
      </NavLink>

      <NavLink to="/admin/returns" className={({ isActive }) => isActive ? "active" : ""}>
        <RotateCcw size={18} />
        <span>Returns</span>
      </NavLink>

      <NavLink to="/admin/profile" className={({ isActive }) => isActive ? "active" : ""}>
        <UserCircle size={18} />
        <span>Profile</span>
      </NavLink>
    </nav>

    <button className="admin-logout" onClick={handleLogout}>
      <LogOut size={18} />
      <span>Logout</span>
    </button>
  </aside>

  <main className="admin-main">
    <Outlet />
  </main>
</div>


);
};

export default AdminLayout;
