import React, { useState, useEffect, useCallback } from 'react';
import {
    Offcanvas, Button, Form, Stack, ListGroup,
    Modal, Spinner, InputGroup, Alert, Col, Row
} from "react-bootstrap";
import {
    Mail, Plus, Minus, Trash2, ShoppingCart, CheckCircle, Phone, User, MapPin,
    ShoppingBasket, Wallet, Smartphone, RefreshCw, DivideCircle
} from 'lucide-react';
import { useCart } from '../context/cartContext';

// --- Color Palette (Unchanged) ---
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
    disabledButton: '#CBD5E1'
};

const CartSidebar = ({ show, handleClose, updateCartItemsCount }) => {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart
    } = useCart();

    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentData, setPaymentData] = useState({
        method: 'cash', // 'cash', 'mpesa', 'split'
        name: '',
        email: '',
        phoneNumber: '', // Customer's general phone number
        mpesaPhoneNumber: '', // M-Pesa specific phone number
        cashAmount: '', // For 'cash' or 'split'
        mpesaAmount: '', // For 'mpesa' or 'split'
        geographicLocation: null,
    });
    const [processing, setProcessing] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [locationSuccess, setLocationSuccess] = useState(false);

    const [loggedInUserEmail, setLoggedInUserEmail] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('userEmail');
        console.log('CartSidebar got from localStorage:', stored);
        if (stored) setLoggedInUserEmail(stored);
    }, []);

    console.log({
        message: "Got stored email",
        email: loggedInUserEmail
    })

    // Update cart item count when it changes
    useEffect(() => {
        if (typeof updateCartItemsCount === 'function') {
            updateCartItemsCount(cartItems.length);
        } else {
            console.warn('updateCartItemsCount is not a function');
        }
    }, [cartItems, updateCartItemsCount]);

    // --- Geolocation Logic (Original Placement) ---
    const fetchGeolocation = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setLocationError("Geolocation is not supported by this browser.");
            return;
        }

        setLocationLoading(true);
        setLocationError('');
        setLocationSuccess(false);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setPaymentData(prev => ({
                    ...prev,
                    geographicLocation: { latitude, longitude }
                }));
                setLocationSuccess(true);
                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);
                setLocationSuccess(false);
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationError("Location access was denied. Please enable it in browser settings.");
                } else {
                    setLocationError("Failed to fetch location. Please try again.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // This useEffect controls when geolocation is fetched.
    // It should ideally be tied to when the cart sidebar (or the checkout process within it) is initially shown.
    // Reverting to only run when 'show' (the Offcanvas) becomes true.
    useEffect(() => {
        if (show) { // Only fetch when the cart sidebar opens
            fetchGeolocation();
        }
    }, [show, fetchGeolocation]); // Dependency on 'show' and 'fetchGeolocation'


    // --- Process Order Logic ---
    const handleProcessOrder = async () => {
        const totalAmount = calculateTotal();

        if (!paymentData.name || !paymentData.email || !paymentData.phoneNumber) {
            alert('Please fill in all customer information: Full Name, Email, and Phone Number.');
            return;
        }

        if (!locationSuccess || !paymentData.geographicLocation) {
            alert('Please ensure your delivery location is set. Click "Refresh Location" if needed.');
            return;
        }

        if (!loggedInUserEmail) {
            alert('Could not identify logged-in user. Please sign in again.');
            return;
        }

        setProcessing(true);

        const basePayload = {
            items: cartItems.map(item => ({
                id: item.id,
                qty: item.quantity
            })),
            total: totalAmount,
            customerEmail: paymentData.email,
            customerName: paymentData.name,
            customerPhone: paymentData.phoneNumber,
            customerLatitude: paymentData.geographicLocation.latitude,
            customerLongitude: paymentData.geographicLocation.longitude,
            userEmail: loggedInUserEmail // user logged in
        };

        try {
            if (paymentData.method === 'cash') {

                // get    token  local storage  
                const token = localStorage.getItem('accessToken');

                console.log({
                    message: "Stored Tokens",
                    Token: token
                })


                const refreshToken = localStorage.getItem('refreshToken');

                console.log({
                    message: 'refresh tokens',
                    refresh: refreshToken
                })

                const tendered = parseFloat(paymentData.cashAmount);
                if (isNaN(tendered) || tendered < totalAmount) {
                    alert(`For cash payment, tendered amount must be at least Ksh ${totalAmount.toFixed(2)}.`);
                    setProcessing(false);
                    return;
                }
                const cashPayload = { ...basePayload, paymentMethod: 'cash', amountTendered: tendered };
                console.log("Processing Cash Payment:", cashPayload);

                const response = await fetch('http://localhost:5001/api/sales', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(cashPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to confirm cash payment.');
                }
                alert('Cash payment confirmed and order processed successfully! 🎉');

            } else if (paymentData.method === 'mpesa') {
                const mpesaAmount = parseFloat(paymentData.mpesaAmount);
                if (isNaN(mpesaAmount) || mpesaAmount <= 0 || mpesaAmount < totalAmount) {
                    alert(`For M-Pesa payment, amount must be at least Ksh ${totalAmount.toFixed(2)}.`);
                    setProcessing(false);
                    return;
                }
                if (!paymentData.mpesaPhoneNumber || paymentData.mpesaPhoneNumber.length < 9) {
                    alert('Please enter a valid M-Pesa phone number.');
                    setProcessing(false);
                    return;
                }

                const stkPushPayload = {
                    ...basePayload,
                    paymentMethod: 'mpesa',
                    amount: mpesaAmount, // Amount for STK push
                    mpesaPhoneNumber: paymentData.mpesaPhoneNumber,
                };
                console.log("Initiating M-Pesa STK Push:", stkPushPayload);

                const response = await fetch('http://localhost:5001/api/stkpush', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(stkPushPayload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to initiate M-Pesa STK push.');
                }
                alert('M-Pesa STK push initiated successfully! Please complete the payment on your phone. 📲');

            } else if (paymentData.method === 'split') {
                const cashPortion = parseFloat(paymentData.cashAmount) || 0;
                const mpesaPortion = parseFloat(paymentData.mpesaAmount) || 0;

                if (cashPortion + mpesaPortion < totalAmount) {
                    alert(`Combined payment (Cash + M-Pesa) must be at least Ksh ${totalAmount.toFixed(2)}.`);
                    setProcessing(false);
                    return;
                }

                // Handle M-Pesa portion first if it exists
                if (mpesaPortion > 0) {
                    if (!paymentData.mpesaPhoneNumber || paymentData.mpesaPhoneNumber.length < 9) {
                        alert('Please enter a valid M-Pesa phone number for the M-Pesa portion.');
                        setProcessing(false);
                        return;
                    }
                    const stkPushPayload = {
                        ...basePayload,
                        paymentMethod: 'mpesa-split',
                        amount: mpesaPortion,
                        mpesaPhoneNumber: paymentData.mpesaPhoneNumber,
                    };
                    console.log("Initiating M-Pesa STK Push for split payment:", stkPushPayload);
                    const mpesaResponse = await fetch('http://localhost:5001/api/stkpush', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(stkPushPayload),
                    });
                    if (!mpesaResponse.ok) {
                        const errorData = await mpesaResponse.json();
                        throw new Error(errorData.message || 'Failed to initiate M-Pesa STK push for split payment.');
                    }
                    alert(`M-Pesa STK push initiated for Ksh ${mpesaPortion.toFixed(2)}. Please complete the payment on your phone. 📲`);
                }

                // Then handle cash porton
                if (cashPortion > 0) {
                    const cashPayload = {
                        ...basePayload,
                        paymentMethod: 'cash-split',
                        amountTendered: cashPortion,
                        total: totalAmount // Still send total, backend handles split logic
                    };
                    console.log("Confirming Cash Portion for split payment:", cashPayload);
                    const cashResponse = await fetch('http://localhost:5001/api/sales', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cashPayload),
                    });
                    if (!cashResponse.ok) {
                        const errorData = await cashResponse.json();
                        throw new Error(errorData.message || 'Failed to confirm cash payment for split order.');
                    }
                    alert(`Cash payment of Ksh ${cashPortion.toFixed(2)} confirmed for split order.`);
                }

                alert('Split payment processed successfully! 🎉');

            } else {
                alert('Please select a valid payment method.');
                setProcessing(false);
                return;
            }

            clearCart();
            handleClose();
            setShowCheckout(false);
        } catch (error) {
            console.error('Error processing order:', error);
            alert(`Error processing order: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };


    // Dynamic CSS 
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = `
            /* Animations & General Styles */
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

            .btn-primary {
                background: linear-gradient(45deg, ${colors.primary}, ${colors.buttonHover});
                border: none; color: #fff; font-weight: 600; padding: 0.8rem 1.6rem;
                border-radius: 50px; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 7px 20px rgba(255, 69, 50, 0.25); }
            .btn-primary:disabled { background: ${colors.disabledButton}; box-shadow: none; transform: none; }

            /* Cart Drawer */
            .cart-drawer { max-width: 460px; background-color: ${colors.lightBackground}; box-shadow: -5px 0 30px rgba(0,0,0,0.1); border-left: 1px solid ${colors.borderColor}; }
            .cart-drawer .offcanvas-header { background-color: ${colors.cardBackground}; border-bottom: 1px solid ${colors.borderColor}; padding: 1.25rem 1.5rem; }
            .cart-drawer .offcanvas-title { color: ${colors.darkText}; font-weight: 700; }
            .cart-drawer .offcanvas-body { display: flex; flex-direction: column; padding: 1rem; }
            .cart-drawer .list-group-item {
                background-color: ${colors.cardBackground}; border: 1px solid ${colors.borderColor}; border-radius: 15px;
                margin-bottom: 1rem; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                transition: transform 0.2s ease, box-shadow 0.2s ease; animation: fadeIn 0.5s ease-out forwards;
            }
            .cart-drawer .list-group-item:hover { transform: translateY(-4px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }

            /* --- THIS IS THE QUANTITY CONTROL STYLE YOU LIKED --- */
            .quantity-controls .btn {
                background-color: ${colors.lightBackground}; border: 1px solid ${colors.borderColor}; color: ${colors.darkText};
                width: 32px; height: 32px; border-radius: 50% !important; display: flex; align-items: center; justify-content: center;
                transition: all 0.2s ease;
            }
            .quantity-controls .btn:hover { background-color: ${colors.primary}; border-color: ${colors.primary}; color: ${colors.cardBackground}; }
            .quantity-controls .btn:disabled { background-color: ${colors.borderColor}; border-color: ${colors.borderColor}; color: ${colors.placeholderText}; }
            .quantity-controls .form-control {
                width: 40px; text-align: center; border: none; background: transparent; color: ${colors.darkText}; font-weight: 600;
                -moz-appearance: textfield;
            }
            .quantity-controls .form-control::-webkit-outer-spin-button, .quantity-controls .form-control::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

            /* Checkout Summary */
            .checkout-summary {
                background-color: ${colors.cardBackground}; padding: 1.5rem; border-top: 1px solid ${colors.borderColor};
                border-radius: 20px 20px 0 0; box-shadow: 0 -5px 25px rgba(0,0,0,0.08); margin: 1rem -1rem -1rem -1rem;
            }

            /* Checkout Modal */
            .checkout-modal .modal-content {
                border-radius: 20px; overflow: hidden; border: none; box-shadow: 0 15px 40px rgba(0,0,0,0.15); animation: slideInUp 0.4s ease-out forwards;
            }
            .checkout-modal .modal-header, .checkout-modal .modal-footer { background-color: ${colors.lightBackground}; border-color: ${colors.borderColor}; padding: 1.5rem 2rem; }
            .checkout-modal .modal-body { padding: 2rem; }
            .checkout-modal .form-control:focus { border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primary}30; }
            
            /* Custom Radio Buttons */
            .payment-method-group .form-check {
                flex: 1 1 auto; /* Allow items to grow and shrink */
                margin-right: 0.5rem; /* Small gap between items */
            }
            .payment-method-group .form-check:last-child {
                margin-right: 0;
            }

            @media (max-width: 767.98px) { /* For small devices, stack vertically */
                .payment-method-group {
                    flex-direction: column;
                    gap: 1rem; /* Space out stacked items */
                }
                 .payment-method-group .form-check {
                    margin-right: 0; /* Remove horizontal margin when stacked */
                }
            }

            .payment-method-group .form-check-input { display: none; }
            .payment-method-group .form-check-label {
                display: flex; align-items: center; width: 100%; padding: 1rem;
                border: 2px solid ${colors.borderColor}; border-radius: 12px; cursor: pointer; transition: all 0.2s ease;
                min-height: 60px; /* Ensure consistent height for all payment method boxes */
            }
            .payment-method-group .form-check-label:hover { border-color: ${colors.primary}; background-color: ${colors.primary}10; }
            .payment-method-group .form-check-input:checked + .form-check-label {
                border-color: ${colors.primary}; background-color: ${colors.primary}15; box-shadow: 0 0 0 3px ${colors.primary}30;
            }
        `;
        document.head.appendChild(styleSheet);
        return () => { document.head.removeChild(styleSheet); };
    }, []);

    return (
        <>
            <Offcanvas show={show} onHide={handleClose} placement="end" className="cart-drawer">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title as="h5" className="d-flex align-items-center gap-2">
                        <ShoppingCart size={24} style={{ color: colors.primary }} /> Shopping Cart
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {cartItems.length === 0 ? (
                        <div className="text-center m-auto">
                            <ShoppingBasket size={70} strokeWidth={1.5} className="text-muted opacity-50" />
                            <h5 className="mt-4" style={{ color: colors.darkText }}>Your Cart is Empty</h5>
                            <p className="mt-2" style={{ color: colors.lightText }}>Looks like you haven't added anything yet.</p>
                        </div>
                    ) : (
                        <>
                            <ListGroup variant="flush" className="flex-grow-1 mb-3">
                                {cartItems.map((item, index) => (
                                    <ListGroup.Item key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                                        <Stack direction="horizontal" gap={3} className="align-items-center">
                                            <img src={item.imageUrl || `https://via.placeholder.com/60`} alt={item.name} className="rounded-circle" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 fw-bold" style={{ color: colors.darkText }}>{item.name}</h6>
                                                <p className="mb-2 small" style={{ color: colors.placeholderText }}>Ksh {Number(item.price).toFixed(2)}</p>
                                                <Stack direction="horizontal" className="quantity-controls align-items-center gap-2">
                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="qty-btn"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus size={14} />
                                                    </Button>

                                                    <Form.Control
                                                        type="number"
                                                        className="qty-input"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                                        min="1"
                                                    />

                                                    <Button
                                                        variant="outline-secondary"
                                                        size="sm"
                                                        className="qty-btn"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus size={14} />
                                                    </Button>
                                                </Stack>

                                            </div>
                                            <div className="text-end">
                                                <h6 className="fw-bold" style={{ color: colors.primary }}>Ksh {(item.price * item.quantity).toFixed(2)}</h6>
                                                <Button variant="light" size="sm" onClick={() => removeFromCart(item.id)} className="rounded-circle d-flex align-items-center justify-content-center p-0 mt-2" style={{ width: '32px', height: '32px', background: `${colors.errorText}15` }}>
                                                    <Trash2 size={16} color={colors.errorText} />
                                                </Button>
                                            </div>
                                        </Stack>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                            <div className="checkout-summary">
                                <Stack direction="horizontal" className="mb-3">
                                    <h5 className="mb-0 fw-bold" style={{ color: colors.darkText }}>Total:</h5>
                                    <h5 className="mb-0 fw-bold ms-auto" style={{ color: colors.primary }}>Ksh {calculateTotal().toFixed(2)}</h5>
                                </Stack>
                                <Button variant="primary" className="w-100" onClick={() => setShowCheckout(true)}>Proceed to Checkout</Button>
                            </div>
                        </>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered className="checkout-modal">
                <Modal.Header closeButton><Modal.Title>Complete Your Order</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form>
                        <h6 className="mb-2 fw-bold" style={{ color: colors.darkText }}>Delivery Location</h6>
                        <Alert variant={locationSuccess ? 'success' : 'light'} className="d-flex align-items-center">
                            <MapPin size={20} className="me-3 flex-shrink-0" style={{ color: locationSuccess ? colors.secondary : colors.primary }} />
                            <div className="flex-grow-1">
                                {locationLoading && <><Spinner size="sm" className="me-2" /> Fetching your location...</>}
                                {locationError && <span className="text-danger">{locationError}</span>}
                                {locationSuccess && <span className="text-success">Location locked!</span>}
                            </div>
                            {locationError && !locationLoading && (
                                <Button variant="light" size="sm" className="p-1" onClick={fetchGeolocation} title="Retry">
                                    <RefreshCw size={16} />
                                </Button>
                            )}
                        </Alert>

                        <h6 className="mt-4 mb-3 fw-bold" style={{ color: colors.darkText }}>Customer Information</h6>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <InputGroup><InputGroup.Text><User size={18} /></InputGroup.Text><Form.Control type="text" placeholder="e.g., Jane Doe" value={paymentData.name} onChange={(e) => setPaymentData({ ...paymentData, name: e.target.value })} /></InputGroup>
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <InputGroup><InputGroup.Text><Mail size={18} /></InputGroup.Text><Form.Control type="email" placeholder="email@example.com" value={paymentData.email} onChange={(e) => setPaymentData({ ...paymentData, email: e.target.value })} /></InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number (e.g., 07XXXXXXXX)</Form.Label>
                                    <InputGroup><InputGroup.Text><Phone size={18} /></InputGroup.Text><Form.Control type="tel" placeholder="07XXXXXXXX" value={paymentData.phoneNumber} onChange={(e) => setPaymentData({ ...paymentData, phoneNumber: e.target.value })} /></InputGroup>
                                </Form.Group>
                            </Col>
                        </Row>

                        <h6 className="mt-3 mb-3 fw-bold" style={{ color: colors.darkText }}>Payment Method</h6>
                        <div className="d-flex flex-wrap payment-method-group"> {/* Use flex-wrap for responsiveness */}
                            <Form.Check type="radio" id="pay-cash" className="mb-2"> {/* Added mb-2 for spacing */}
                                <Form.Check.Input type="radio" name="paymentMethod" checked={paymentData.method === 'cash'} onChange={() => setPaymentData(prev => ({ ...prev, method: 'cash', mpesaPhoneNumber: '', cashAmount: calculateTotal().toFixed(2), mpesaAmount: '' }))} /> {/* Pre-fill cash amount */}
                                <Form.Check.Label><Wallet size={20} className="me-3" style={{ color: colors.primary }} /><span className="fw-bold">Pay with Cash</span></Form.Check.Label>
                            </Form.Check>
                            <Form.Check type="radio" id="pay-mpesa" className="mb-2"> {/* Added mb-2 for spacing */}
                                <Form.Check.Input type="radio" name="paymentMethod" checked={paymentData.method === 'mpesa'} onChange={() => setPaymentData(prev => ({ ...prev, method: 'mpesa', mpesaPhoneNumber: prev.phoneNumber, cashAmount: '', mpesaAmount: calculateTotal().toFixed(2) }))} />
                                <Form.Check.Label><Smartphone size={20} className="me-3" style={{ color: colors.secondary }} /><span className="fw-bold">Pay with M-Pesa</span></Form.Check.Label>
                            </Form.Check>
                            <Form.Check type="radio" id="pay-split" className="mb-2"> {/* Added mb-2 for spacing */}
                                <Form.Check.Input type="radio" name="paymentMethod" checked={paymentData.method === 'split'} onChange={() => setPaymentData(prev => ({ ...prev, method: 'split', mpesaPhoneNumber: prev.phoneNumber, cashAmount: '', mpesaAmount: '' }))} />
                                <Form.Check.Label><DivideCircle size={20} className="me-3" style={{ color: colors.darkText }} /><span className="fw-bold">Split Payment</span></Form.Check.Label>
                            </Form.Check>
                        </div>

                        {paymentData.method === 'cash' && (
                            <Form.Group className="mb-3 mt-3">
                                <Form.Label>Amount Tendered (Cash)</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text>Ksh</InputGroup.Text>
                                    <Form.Control
                                        type="number"
                                        placeholder={`Minimum ${calculateTotal().toFixed(2)}`}
                                        value={paymentData.cashAmount}
                                        onChange={(e) => setPaymentData({ ...paymentData, cashAmount: e.target.value })}
                                        min={calculateTotal().toFixed(2)}
                                    />
                                </InputGroup>
                            </Form.Group>
                        )}

                        {paymentData.method === 'mpesa' && (
                            <Form.Group className="mb-3 mt-3">
                                <Form.Label>M-Pesa Phone Number</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text><Phone size={18} /></InputGroup.Text>
                                    <Form.Control
                                        type="tel"
                                        placeholder="07XXXXXXXX"
                                        value={paymentData.mpesaPhoneNumber}
                                        onChange={(e) => setPaymentData({ ...paymentData, mpesaPhoneNumber: e.target.value })}
                                    />
                                </InputGroup>
                                <Form.Text className="text-muted">
                                    The STK push will be sent to this number. Amount: Ksh {calculateTotal().toFixed(2)}
                                </Form.Text>
                            </Form.Group>
                        )}

                        {paymentData.method === 'split' && (
                            <div className="mt-3 mb-3"> {/* Added mb-3 here for overall spacing */}
                                <Row className="mb-3"> {/* Use Row and Col for better layout on split inputs */}
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Cash Portion</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>Ksh</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Enter cash amount"
                                                    value={paymentData.cashAmount}
                                                    onChange={(e) => setPaymentData({ ...paymentData, cashAmount: e.target.value })}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>M-Pesa Portion</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>Ksh</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    placeholder="Enter M-Pesa amount"
                                                    value={paymentData.mpesaAmount}
                                                    onChange={(e) => setPaymentData({ ...paymentData, mpesaAmount: e.target.value })}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>M-Pesa Phone Number for Split</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><Phone size={18} /></InputGroup.Text>
                                        <Form.Control
                                            type="tel"
                                            placeholder="07XXXXXXXX"
                                            value={paymentData.mpesaPhoneNumber}
                                            onChange={(e) => setPaymentData({ ...paymentData, mpesaPhoneNumber: e.target.value })}
                                        />
                                    </InputGroup>
                                    <Form.Text className="text-muted">
                                        The M-Pesa portion STK push will be sent to this number.
                                    </Form.Text>
                                </Form.Group>
                                <Alert variant="info">
                                    Total Payable: <span className="fw-bold">Ksh {calculateTotal().toFixed(2)}</span><br />
                                    Cash Entered: <span className="fw-bold">Ksh {Number(paymentData.cashAmount).toFixed(2) || '0.00'}</span><br />
                                    M-Pesa Entered: <span className="fw-bold">Ksh {Number(paymentData.mpesaAmount).toFixed(2) || '0.00'}</span><br />
                                    Remaining: <span className="fw-bold text-danger">Ksh {(calculateTotal() - (parseFloat(paymentData.cashAmount) || 0) - (parseFloat(paymentData.mpesaAmount) || 0)).toFixed(2)}</span>
                                </Alert>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCheckout(false)}>Back to Cart</Button>
                    <Button variant="primary" onClick={handleProcessOrder} disabled={processing || locationLoading || cartItems.length === 0}>
                        {processing ? <Spinner size="sm" animation="border" className="me-2" /> : <CheckCircle size={20} className="me-2" />}
                        {processing ? 'Processing...' : `Pay Ksh ${calculateTotal().toFixed(2)}`}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CartSidebar;