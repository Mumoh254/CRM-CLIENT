import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Badge, NavDropdown } from 'react-bootstrap'; // Import NavDropdown
import { CartProvider } from './context/cartContext';
import { useCart } from './context/cartContext';
import {
    FiPackage,
    FiBarChart2,
    FiActivity,
    FiPlusSquare,
    FiLogOut,
    FiShoppingCart,
    FiUsers, // Keep FiUsers for the main dropdown
    FiClock,
    FiUserCheck, // New icon for User Sessions (optional, but good for distinction)
    FiSettings, // New icon for User Management (optional)
} from 'react-icons/fi';
import ProductList from './components/productList';
import CartSidebar from './components/cartSide';
import Analytics from './components/analytics';
import StockAnalytics from './components/stockAnalysis';
import ProductForm from './components/productForm';
import Login from './components/login';
import Register from './components/register';
import { toast } from 'react-toastify';
import ForgotPassword from './components/forgotPassword';
import SalesHistory from './components/salesHistory';
import UserSessionMonitor from './components/sessionMonitor';
import  UserManagement  from  './components/usemangment'

import './App.css';

const colors = {
    primary: '#FF4532',
    secondary: '#00C853',
    darkText: '#1A202C',
    lightText: '#4A5568',
    lightBackground: '#F7F8FC',
    cardBackground: '#FFFFFF',
    borderColor: '#E2E8F0',
    errorText: '#EF4444',
    placeholderText: '#A0AEC0',
    buttonHover: '#E6392B',
    disabledButton: '#CBD5E1',

    // Admin Navbar Colors (keeping as is, user liked it)
    adminNavbarBg: '#FF4532', // Primary red for admin background
    adminNavLinkColor: '#F8F9FA', // Lighter color for admin nav links
    adminNavLinkHover: '#FFFFFF', // Pure white on hover
    adminActiveNavLink: '#FFDDC2', // Slightly off-white/cream for active link

    // User Navbar Colors - New Sleek & Lighter Look
    userNavbarBg: '#FFFFFF', // White, matching cardBackground for a clean look
    userNavbarBorder: '#E2E8F0', // borderColor for a subtle top border
    userNavLinkColor: '#4A5568', // lightText for default links (darker for contrast on white)
    userNavLinkHoverBg: 'rgba(255, 69, 50, 0.08)', // Subtle primary red tint on hover
    userNavLinkHoverColor: '#FF4532', // Primary red for hover text/icon
    userActiveNavLinkBg: 'rgba(0, 200, 83, 0.1)', // Subtle secondary green tint for active
    userActiveNavLinkColor: '#00C853', // Secondary green for active text/icon
};

const PrivateRoute = ({ children, allowedRoles }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (!token) {
            toast.error('You need to log in to access this page.');
            navigate('/login');
        } else if (allowedRoles && !allowedRoles.includes(userRole)) {
            toast.error('You do not have permission to access this page.');
            if (userRole === 'user') {
                navigate('/products');
            } else {
                navigate('/login');
            }
        }
    }, [token, userRole, allowedRoles, navigate]);

    if (token && (!allowedRoles || allowedRoles.includes(userRole))) {
        return children;
    }
    return null;
};

const AdminNavbar = ({ handleLogout }) => {
    const location = useLocation(); // To check active state for dropdown

    return (
        <Navbar expand="lg" fixed="top" className="shadow-lg admin-navbar" style={{ backgroundColor: colors.adminNavbarBg }}>
            <Container fluid>
                <Navbar.Brand as={NavLink} to="/products" style={{ color: colors.adminNavLinkHover, fontWeight: 'bold', fontSize: '1.4rem' }}>
                    Stock-Link <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>(Admin)</span>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav">
                    <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
                </Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto admin-nav-links">
                        <Nav.Link as={NavLink} to="/products" className="admin-nav-item">
                            <FiPackage className="me-2 nav-icon" /> Products
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/analytics" className="admin-nav-item">
                            <FiBarChart2 className="me-2 nav-icon" /> Analytics
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/stock-analytics" className="admin-nav-item">
                            <FiActivity className="me-2 nav-icon" /> Stock Analysis
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/create" className="admin-nav-item">
                            <FiPlusSquare className="me-2 nav-icon" /> Add Product
                        </Nav.Link>
                        <Nav.Link as={NavLink} to="/history" className="admin-nav-item">
                            <FiClock className="me-2 nav-icon" /> Sales History
                        </Nav.Link>

                        {/* Users Dropdown */}
                        <NavDropdown
                            title={
                                <>
                                    <FiUsers className="me-2 nav-icon" /> Users
                                </>
                            }
                            id="users-nav-dropdown"
                            className={`admin-nav-item ${location.pathname === '/monitor' || location.pathname === '/user-management' ? 'active' : ''}`}
                            menuVariant="dark" 
                            style={{ '--bs-nav-link-color': colors.adminNavLinkColor, '--bs-nav-link-hover-color': colors.adminNavLinkHover }}
                        >
                            <NavDropdown.Item as={NavLink} to="/monitor" className="admin-nav-item">
                                <FiUserCheck className="me-2 nav-icon" /> User Sessions
                            </NavDropdown.Item>
                            <NavDropdown.Item as={NavLink} to="/user-management" className="admin-nav-item">
                                <FiSettings className="me-2 nav-icon" /> User Management
                            </NavDropdown.Item>
                        </NavDropdown>

                    </Nav>
                    <Nav>
                        <Button variant="outline-light" onClick={handleLogout} className="logout-button-admin"
                            style={{ borderColor: colors.adminNavLinkHover, color: colors.adminNavLinkHover, transition: 'all 0.3s ease' }}
                        >
                            <FiLogOut className="me-1" /> Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

const UserBottomNavbar = ({ handleLogout, toggleCartSidebar }) => {
    const { cartItems } = useCart();
    const cartItemsCount = cartItems.length;

    return (
        <Navbar
            fixed="bottom"
            className="shadow-sm user-bottom-navbar" // Reduced shadow for sleekness
            style={{
                backgroundColor: colors.userNavbarBg, // White background
                borderTop: `1px solid ${colors.userNavbarBorder}` // Subtle top border
            }}
        >
            <Nav className="w-100 d-flex justify-content-around align-items-center">
                <Nav.Link
                    as={NavLink}
                    to="/products"
                    className={({ isActive }) =>
                        `user-nav-item d-flex flex-column align-items-center ${isActive ? 'active-link-bottom-user' : ''}`
                    }
                    style={{ color: colors.userNavLinkColor }}
                >
                    <span className="nav-icon-bottom"><FiPackage /></span>
                    <span className="nav-text-bottom">Products</span>
                </Nav.Link>
                <Nav.Link
                    className="user-nav-item d-flex flex-column align-items-center cart-button-bottom"
                    onClick={toggleCartSidebar}
                    style={{ color: colors.userNavLinkColor }}
                >
                    <span className="nav-icon-bottom position-relative">
                        <FiShoppingCart />
                        {cartItemsCount > 0 && (
                            <Badge pill bg="danger" className="cart-badge">
                                {cartItemsCount}
                            </Badge>
                        )}
                    </span>
                    <span className="nav-text-bottom">Cart</span>
                </Nav.Link>
                <Nav.Link
                    className="user-nav-item d-flex flex-column align-items-center logout-button-bottom-user"
                    onClick={handleLogout}
                    style={{ color: colors.userNavLinkColor }}
                >
                    <span className="nav-icon-bottom"><FiLogOut /></span>
                    <span className="nav-text-bottom">Logout</span>
                </Nav.Link>
            </Nav>
        </Navbar>
    );
};


function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [showCartSidebar, setShowCartSidebar] = useState(false);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        setIsLoggedIn(!!token);
        setUserRole(role);
    };

    useEffect(() => {
        checkAuthStatus();
        window.addEventListener('storage', checkAuthStatus);
        return () => {
            window.removeEventListener('storage', checkAuthStatus);
        };
    }, []);

    const handleLogout = async () => {
        const email = localStorage.getItem('userEmail');

        if (!email) {
            toast.error('No user email found for logout.');
            return;
        }

        try {
            await fetch('http://localhost:5001/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ email }),
            });

            localStorage.removeItem('accessToken');
            localStorage.removeItem('role');
            localStorage.removeItem('userEmail');
            setIsLoggedIn(false);
            setUserRole(null);

            toast.info('You have been logged out.');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Error logging out. Please try again.');
        }
    };

    const toggleCartSidebar = () => {
        setShowCartSidebar(!showCartSidebar);
    };

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password';

    return (
        <CartProvider>
            <div className="app-container">
                {isLoggedIn && userRole === 'admin' && !isAuthPage && <AdminNavbar handleLogout={handleLogout} />}

                <Container fluid className="main-content">
                    <Routes>
                        <Route path="/login" element={<Login onLoginSuccess={checkAuthStatus} />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/" element={<PrivateRoute allowedRoles={['admin', 'user']}><ProductList /></PrivateRoute>} />
                        <Route path="/products" element={
                            <PrivateRoute allowedRoles={['admin', 'user']}>
                                <ProductList />
                            </PrivateRoute>
                        } />
                        <Route path="/analytics" element={<PrivateRoute allowedRoles={['admin']}><Analytics /></PrivateRoute>} />
                        <Route path="/stock-analytics" element={<PrivateRoute allowedRoles={['admin']}><StockAnalytics /></PrivateRoute>} />
                        <Route path="/create" element={<PrivateRoute allowedRoles={['admin']}><ProductForm /></PrivateRoute>} />
                        <Route path="/history" element={<PrivateRoute allowedRoles={['admin']}><SalesHistory /></PrivateRoute>} />
                        <Route path="/monitor" element={<PrivateRoute allowedRoles={['admin']}><UserSessionMonitor /></PrivateRoute>} />
                        {/* Add route for User Management */}
                        <Route path="/user-management" element={<PrivateRoute allowedRoles={['admin']}>{<UserManagement /> }<div className="p-4"></div></PrivateRoute>} />
                    </Routes>
                </Container>

                <CartSidebar
                    show={showCartSidebar}
                    handleClose={toggleCartSidebar}
                />

                {isLoggedIn && userRole === 'user' && !isAuthPage && (
                    <UserBottomNavbar
                        userRole={userRole}
                        handleLogout={handleLogout}
                        toggleCartSidebar={toggleCartSidebar}
                    />
                )}

                {isLoggedIn && !isAuthPage && (
                    <footer className="system-footer bg-light border-top p-2 d-flex flex-column">
                        <Container fluid className="footer-top d-flex justify-content-between align-items-center mb-1">
                            <span className="small footer-status">
                                Logged in as: <span className="text-success fw-bold">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Guest'}</span> | System Status: <span className="text-success fw-bold">Operational</span>
                            </span>
                            <span className="small footer-version">
                                <span className="text-primary fw-bold">Stock-Link</span> | SYS-VERSION - 1.1.01
                            </span>
                        </Container>
                        <Container fluid className="footer-bottom text-center py-1">
                            <marquee className="footer-marquee" behavior="scroll" direction="left" scrollamount="5">
                                <span className="text-danger fw-bold me-3">🔥 System Failure? Get Expert Support! 🔥</span>
                                <span className="text-dark me-3">Contact Us: <strong className="text-primary">0740045355</strong> | Email: <strong className="text-primary">infowelttallis@gmail.com</strong></span>
                                <span className="text-info ms-3">Your Reliable Partner for Stock Management Solutions!</span>
                            </marquee>
                            <span className="small d-block mt-1">
                                <strong>Powered By Welt Tallis</strong>
                            </span>
                        </Container>
                    </footer>
                )}
            </div>
        </CartProvider>
    );
}

export default App;