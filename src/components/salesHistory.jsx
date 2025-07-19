// components/SalesHistory.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Accordion, Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiMail,
  FiPhone,
  FiPackage,
  FiUsers,
  FiInfo,
  FiBarChart,
  FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

// Define the beautiful color palette
const colors = {
  primary: '#FF4532', // Jikoni Red - A vibrant, warm red for primary actions/accents
  secondary: '#00C853', // Jikoni Green - A fresh green for success/positive indicators
  darkText: '#1A202C', // Dark text - Deep charcoal for main text and headings
  lightBackground: '#F0F2F5', // Light background - Soft grey for overall page background
  cardBackground: '#FFFFFF', // Card background - Crisp white for cards and elements
  borderColor: '#D1D9E6', // Border color - A subtle, cool grey for borders and lines
  errorText: '#EF4444', // Error text - A clear, strong red for error messages
  placeholderText: '#A0AEC0', // Muted grey for hints and secondary info
  buttonHover: '#E6392B', // Button hover - Slightly darker primary for hover states
  disabledButton: '#CBD5E1', // Light grey for disabled elements
  accentBlue: '#007bff', // Added for map button, a standard vibrant blue
  accentBlueHover: '#0056b3', // Darker blue for hover
};

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

        const token = localStorage.getItem('accessToken');


      if (!token) {
        setError('Authentication token not found. Please log in.');
        toast.error('Authentication required to view sales history.');
        setLoading(false);
        return;
      }

      const response = await fetch("https://crm-backend-mariadb.onrender.com/api/sales/sales", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
          credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || `Failed to fetch sales: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success) {
        const sortedSales = data.sales.sort((a, b) => new Date(b.sale_date) - new Date(a.sale_date));
        setSales(sortedSales);
        toast.success('Sales data loaded successfully!');
      } else {
        setError(data.message || 'Failed to load sales data.');
        toast.error(data.message || 'Failed to load sales data.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while fetching sales data.');
      toast.error(`Error: ${err.message || 'Failed to fetch sales data.'}`);
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleGoToMap = (latitude, longitude, customerName) => {
    if (latitude && longitude) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      window.open(mapUrl, '_blank');
    } else {
      toast.warn(`Location not available for ${customerName}.`);
    }
  };

  return (
    <Container className=" py-4">
      <h2 className="mb-4 text-start fw-bold" style={{ color: colors.darkText }}>
        <FiBarChart className="me-2" style={{ color: colors.primary }} />Sales History
      </h2>

      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" style={{ color: colors.primary }} role="status">
            <span className="visually-hidden">Loading sales...</span>
          </Spinner>
          <p className="mt-3" style={{ color: colors.placeholderText }}>Fetching sales data...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="text-center my-4" style={{ backgroundColor: colors.errorText, color: colors.cardBackground, borderColor: colors.errorText }}>
          <p className="mb-2 fw-bold">Error Loading Sales:</p>
          <p className="mb-0">{error}</p>
          <Button variant="light" className="mt-3" onClick={fetchSales}>
            <FiRefreshCw className="me-2" />Retry
          </Button>
        </Alert>
      )}

      {!loading && !error && sales.length === 0 && (
        <p className="text-center text-muted">No sales records found.</p>
      )}

      {!loading && !error && sales.length > 0 && (
        <Row className="justify-content-center">
          {sales.map((sale) => (
            <Col key={sale.id} md={8} lg={6} className="">
              <Card className="shadow-sm sales-card h-100" style={{ backgroundColor: colors.cardBackground, borderColor: colors.borderColor }}>
                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: colors.lightBackground, borderBottomColor: colors.borderColor }}>
                  <h5 className="mb-0 fw-semibold" style={{ color: colors.darkText }}>
                    <FiInfo className="me-1" style={{ color: colors.primary }} /> Sale ID: {sale.id}
                  </h5>
                  <Badge className="p-2" style={{ backgroundColor: colors.primary, color: colors.cardBackground }}>
                    <FiDollarSign className="me-1" /> KSH {parseFloat(sale.total).toFixed(2)}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <Row className="">
                    <Col xs={12} className="mb-2">
                      <p className="mb-1" style={{ color: colors.darkText }}>
                        <FiCalendar className="me-2" style={{ color: colors.secondary }} /> {/* Green icon */}
                        <strong>Date:</strong> {new Date(sale.sale_date).toLocaleString()}
                      </p>
                    </Col>
                    <Col xs={12} className="mb-2">
                      <p className="mb-1" style={{ color: colors.darkText }}>
                        <FiUsers className="me-2" style={{ color: colors.secondary }} /> {/* Green icon */}
                        <strong>Customer:</strong> {sale.customer_name}
                      </p>
                    </Col>
                    <Col xs={12} className="mb-2">
                      <p className="mb-1" style={{ color: colors.darkText }}>
                        <FiMail className="me-2" style={{ color: colors.secondary }} /> {/* Green icon */}
                        <strong>Email:</strong> {sale.customer_email}
                      </p>
                    </Col>
                    <Col xs={12} className="mb-2">
                      <p className="mb-1" style={{ color: colors.darkText }}>
                        <FiPhone className="me-2" style={{ color: colors.secondary }} /> {/* Green icon */}
                        <strong>Phone:</strong> {sale.customer_phone}
                      </p>
                    </Col>
                    <Col xs={12} className="mb-2">
                    <p className="mb-1" style={{ color: colors.darkText }}>
  <FiUser className="me-2" style={{ color: colors.secondary }} />
  <strong style={{ color: colors.primary }}>Item Sold By:</strong>{' '}
  <span style={{ color: colors.accent }}>{sale.user_email}</span>
</p>

                    </Col>
                    <Col xs={12} className="mb-2">
                      <p className="mb-1" style={{ color: colors.darkText }}>
                        <FiDollarSign className="me-2" style={{ color: colors.secondary }} /> {/* Green icon */}
                        <strong>Payment Method:</strong> {sale.payment_method.toUpperCase()}
                      </p>
                    </Col>
                    {sale.customer_latitude && sale.customer_longitude && (
                      <Col xs={12} className="mt-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleGoToMap(sale.customer_latitude, sale.customer_longitude, sale.customer_name)}
                          className="w-100 sales-map-button"
                          style={{ borderColor: colors.accentBlue, color: colors.accentBlue }}
                        >
                          <FiMapPin className="me-1" /> View Customer Location on Map
                        </Button>
                      </Col>
                    )}
                  </Row>

                  <Accordion flush className="sales-accordion">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header className="sales-accordion-header">
                        <FiPackage className="me-2" style={{ color: colors.primary }} /> Items Sold (
                        <Badge style={{ backgroundColor: colors.secondary, color: colors.cardBackground }}>{sale.items.length}</Badge>)
                      </Accordion.Header>
                      <Accordion.Body className="p-0">
                        <Table striped hover responsive size="sm" className="mb-0 sales-items-table">
                          <thead style={{ backgroundColor: colors.lightBackground }}>
                            <tr>
                              <th style={{ color: colors.darkText }}>Product</th>
                              <th style={{ color: colors.darkText }}>Price</th>
                              <th style={{ color: colors.darkText }}>Qty</th>
                              <th style={{ color: colors.darkText }}>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.map((item, itemIndex) => (
                              <tr key={itemIndex} style={{ color: colors.darkText }}>
                                <td>{item.name}</td>
                                <td>KSH {parseFloat(item.price).toFixed(2)}</td>
                                <td>{item.qty}</td>
                                <td>KSH {parseFloat(item.total).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SalesHistory;