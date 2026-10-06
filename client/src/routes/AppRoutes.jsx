import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Shop from '../pages/Shop';
import Category from '../pages/Category';
import SearchResults from '../pages/SearchResults';
import ProductDetails from '../pages/ProductDetails';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import FAQ from '../pages/FAQ';
import ShippingPolicy from '../pages/ShippingPolicy';
import ReturnPolicy from '../pages/ReturnPolicy';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import Profile from '../pages/Profile';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import MyOrders from '../pages/MyOrders';
import OrderDetails from '../pages/OrderDetails';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import ManageProducts from '../pages/admin/ManageProducts';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import ManageCategories from '../pages/admin/ManageCategories';
import ManageOrders from '../pages/admin/ManageOrders';
import AdminOrderDetails from '../pages/admin/AdminOrderDetails';
import ManageCustomers from '../pages/admin/ManageCustomers';
import AdminCustomerDetails from '../pages/admin/AdminCustomerDetails';
import ManageCoupons from '../pages/admin/ManageCoupons';
import ManageBanners from '../pages/admin/ManageBanners';
import ManageSettings from '../pages/admin/ManageSettings';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/category/:slug" element={<Category />} />
      <Route path="/product/:slug" element={<ProductDetails />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/return-policy" element={<ReturnPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsConditions />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/order-success/:id" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/:id" element={<EditProduct />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="customers" element={<ManageCustomers />} />
        <Route path="customers/:id" element={<AdminCustomerDetails />} />
        <Route path="coupons" element={<ManageCoupons />} />
        <Route path="banners" element={<ManageBanners />} />
        <Route path="settings" element={<ManageSettings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
