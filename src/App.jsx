import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Badge, NavDropdown } from 'react-bootstrap';
import { CartProvider } from './context/cartContext';
import { useCart } from './context/cartContext';
import {
    FiPackage,
    FiBarChart2,
    FiActivity,
    FiPlusSquare,
    FiLogOut,
    FiShoppingCart,
    FiUsers,
    FiClock,
    FiUserCheck,
    FiSettings,
    FiUser,
} from 'react-icons/fi';
import ProductList from './components/productList';
import CartSidebar from './components/cartSide';
import Analytics from './components/analytics';
import StockAnalytics from './components/stockAnalysis';

import Login from './components/login';
import Register from './components/register';
import { toast } from 'react-toastify';
import ForgotPassword from './components/forgotPassword';
import SalesHistory from './components/salesHistory';
import UserSessionMonitor from './components/sessionMonitor';
import UserManagement from './components/usemangment';
import Download from './components/downloader/download';
import ProductForm from './components/productForm';

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
    adminNavbarBg: '#FF4532',
    adminNavLinkColor: '#F8F9FA',
    adminNavLinkHover: '#FFFFFF',
    adminActiveNavLink: '#FFDDC2',
    userNavbarBg: '#FFFFFF',
    userNavbarBorder: '#E2E8F0',
    userNavLinkColor: '#4A5568',
    userNavLinkHoverBg: 'rgba(255, 69, 50, 0.08)',
    userNavLinkHoverColor: '#FF4532',
    userActiveNavLinkBg: 'rgba(0, 200, 83, 0.1)',
    userActiveNavLinkColor: '#00C853',
};

// Loader Component
const SimpleLoader = () => (
  <div className="simple-loader-overlay">
    <div className="loader-content">
      <div className="spinner"></div>
      <p className="loading-text">
    
      </p>
      <p className="processing-text">
        Processing Stock Data<span className="dots">...</span>
      </p>
    </div>
  </div>
);


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

const AdminNavbar = ({ handleLogout, loggedInUserEmail }) => {
    const location = useLocation();

    return (
        <Navbar expand="lg" fixed="top" className="shadow-lg admin-navbar" style={{ backgroundColor: colors.adminNavbarBg }}>
            <Container fluid>
                <Navbar.Brand as={NavLink} to="/products" style={{ color: colors.adminNavLinkHover, fontWeight: 'bold', fontSize: '1.4rem' }}>
                    Stock-Link <span style={{ fontSize: '0.9rem', opacity: 0.8 ,
                        color: 'green'
                    }}> *Admin</span>
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
                    <Nav className="d-flex align-items-center">
                             {loggedInUserEmail && (
                                <Navbar.Text className="me-3 d-none d-lg-block" style={{ color: colors.adminNavLinkHover, fontSize: '0.9rem' }}>
                                    <FiUser className="me-1" /> <strong></strong>
                                </Navbar.Text>
                            )}
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

const UserBottomNavbar = ({ handleLogout, toggleCartSidebar, loggedInUserEmail }) => {
    const { cartItems } = useCart();
    const cartItemsCount = cartItems.length;

    return (
        <Navbar
            fixed="bottom"
            className="shadow-sm user-bottom-navbar"
            style={{
                backgroundColor: colors.userNavbarBg,
                borderTop: `1px solid ${colors.userNavbarBorder}`
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
    const [userEmail, setUserEmail] = useState(null);
    const [showCartSidebar, setShowCartSidebar] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Initialize as true to show loader on app start

    const checkAuthStatus = () => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        const email = localStorage.getItem('userEmail');
        setIsLoggedIn(!!token);
        setUserRole(role);
        setUserEmail(email);
        // Do NOT set isLoading to false here directly.
        // It will be set to false after the delay in the useEffect.
    };

    useEffect(() => {
        // Simulate a loading delay
        const loaderTimer = setTimeout(() => {
            checkAuthStatus(); // Call checkAuthStatus after the delay
            setIsLoading(false); // Hide loader after the delay
        }, 2000); // 2-second delay

        window.addEventListener('storage', checkAuthStatus);

        return () => {
            clearTimeout(loaderTimer); // Clean up the timer
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
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({ email }),
            });

            localStorage.removeItem('accessToken');
            localStorage.removeItem('role');
            localStorage.removeItem('userEmail');
            setIsLoggedIn(false);
            setUserRole(null);
            setUserEmail(null);

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

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/download-app';

    let contentPaddingTop = '0px';
    let contentPaddingBottom = '0px';

    if (isLoggedIn && !isAuthPage) {
        if (userRole === 'admin') {
            contentPaddingTop = '60px';
        } else if (userRole === 'user') {
            contentPaddingBottom = '60px';
        }
    }


    return (
        <CartProvider>
            <div className="app-container">
                {isLoading && <SimpleLoader />}

                {!isLoading && (
                    <>
                        {isLoggedIn && userRole === 'admin' && !isAuthPage && <AdminNavbar handleLogout={handleLogout} loggedInUserEmail={userEmail} />}

                        <Container fluid className="main-content" style={{ paddingTop: contentPaddingTop, paddingBottom: contentPaddingBottom }}>
                            <Routes>
                                <Route path="/login" element={<Login onLoginSuccess={checkAuthStatus} />} />
                                <Route path="/forgot-password" element={<ForgotPassword />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/download-app" element={<Download />} />

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
                                <Route path="/user-management" element={<PrivateRoute allowedRoles={['admin']}><UserManagement /></PrivateRoute>} />
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
                                loggedInUserEmail={userEmail}
                            />
                        )}

                        {isLoggedIn && !isAuthPage && (
                            <footer className="system-footer bg-light border-top d-flex flex-column" style={{ paddingBottom: userRole === 'user' ? '60px' : '0px' }}>
                                <Container fluid className="footer-top d-flex justify-content-between align-items-center mb-1 py-2">
                                   <span className="small footer-status d-flex align-items-center">
                                        <FiUser className="me-1" style={{ color: 'red' }} />
                                        Logged in as:
                                        <span className="text-success fw-bold ms-1 me-2">
                                            {userEmail || (userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Guest')}
                                        </span>
                                        |
                                        <span className="ms-2">
                                            System Status:
                                            <span className="text-success fw-bold ms-1">Operational</span>
                                        </span>
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
                    </>
                )}
            </div>
        </CartProvider>
    );
}

export default App;
