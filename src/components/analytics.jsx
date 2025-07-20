import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Spinner, Row, Col, Form, Alert, Carousel, Table, Modal, Button, Badge, Pagination, InputGroup
} from 'react-bootstrap';
import axios from 'axios';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, ArcElement, Filler } from 'chart.js';
import {
  ShoppingCart, Clock, LineChart, Users, Tag,
  CreditCard, Package, Repeat, DollarSign, Send, Star, Download, Layout
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  Filler
);

// Color palette from your request
const colors = {
  primary: '#FF4532', // Jikoni Red
  secondary: '#00C853', // Jikoni Green
  darkText: '#1A202C',
  lightBackground: '#F0F2F5',
  cardBackground: '#FFFFFF',
  borderColor: '#D1D9E6',
  errorText: '#EF4444',
  placeholderText: '#A0AEC0',
  buttonHover: '#E6392B', // Slightly darker red for hover
  disabledButton: '#CBD5E1',
};

// Updated MODERN_CHART_COLORS to primarily use Jikoni Red and Green derivatives,
// along with complementary vibrant colors
const MODERN_CHART_COLORS = [
  colors.primary, // Jikoni Red
  colors.secondary, // Jikoni Green
  "#60A5FA", // A vibrant blue
  "#A78BFA", // A vibrant purple
  "#FB923C", // A vibrant orange
  "#F87171", // A lighter red
  "#3B82F6", // A stronger blue
  "#C084FC", // A stronger purple
  "#34D399", // A vibrant aqua-green
  "#FCD34D", // A vibrant yellow
  "#10B981", // A deeper green
  "#EAB308"  // A golden yellow
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --primary-red: ${colors.primary};
    --secondary-green: ${colors.secondary};
    --dark-text: ${colors.darkText};
    --light-background: ${colors.lightBackground};
    --card-background: ${colors.cardBackground};
    --border-color: ${colors.borderColor};
    --error-text: ${colors.errorText};
    --placeholder-text: ${colors.placeholderText};
    --button-hover: ${colors.buttonHover};
    --disabled-button: ${colors.disabledButton};
    --primary-gradient: linear-gradient(135deg, var(--primary-red) 0%, color-mix(in srgb, var(--primary-red) 80%, black) 100%);
    --success-gradient: linear-gradient(135deg, var(--secondary-green) 0%, color-mix(in srgb, var(--secondary-green) 80%, black) 100%);
    --danger-gradient: linear-gradient(135deg, var(--error-text) 0%, color-mix(in srgb, var(--error-text) 80%, black) 100%);
    --primary-red-rgb: 255, 69, 50; /* For rgba colors based on primary red */
  }

  .dashboard-container {
    background: var(--light-background);
    min-height: 100vh;
    padding: 1rem;
    font-family: 'Inter', sans-serif;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 1.5rem;
    box-shadow: 0 8px 32px rgba(31,38,135,0.1);
    border: 1px solid rgba(255,255,255,0.18);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%; /* Ensure cards in flex/grid rows are equal height */
    display: flex;
    flex-direction: column;
  }
  .glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(31,38,135,0.15);
  }
  .metric-highlight {
    font-size: 1.8rem;
    font-weight: 700;
    background: var(--primary-gradient); /* Use Jikoni Red gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .compact-carousel {
    height: 280px;
    border-radius: 1rem;
    overflow: hidden;
  }
  .carousel-image {
    height: 280px;
    object-fit: cover;
    width: 100%;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }
  .carousel-image:hover {
    transform: scale(1.02);
  }
  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-color: rgba(0,0,0,0.5);
    border-radius: 50%;
    padding: 15px;
    background-size: 60%;
  }
  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }
  .fast-moving {
    background: ${colors.secondary}30; /* Light green */
    color: ${colors.secondary};
  }
  .slow-moving {
    background: ${colors.primary}30; /* Light red */
    color: ${colors.primary};
  }
  .icon-wrapper {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 1rem;
  }
  .icon-wrapper.gradient-blue {
    background: var(--primary-gradient); /* Use Jikoni Red gradient for primary actions */
  }
  .icon-wrapper.gradient-green {
    background: var(--success-gradient); /* Use Jikoni Green gradient for success */
  }
  .icon-wrapper.gradient-orange {
    background: linear-gradient(135deg, #F97316, #FB923C); /* Keep a vibrant orange */
  }
  .icon-wrapper.gradient-red {
    background: var(--danger-gradient); /* Use error red gradient */
  }
  .table-hover-modern tbody tr:hover {
    background: rgba(var(--primary-red-rgb), 0.03); /* Hover effect using Jikoni Red */
  }
  .analytics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  }
  .time-selector {
    width: 200px;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    padding: 0.5rem 1rem;
  }
  .analytics-header h2 .text-primary-gradient {
    background: var(--primary-gradient); /* Use Jikoni Red gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-primary {
    background: var(--primary-gradient); /* Use Jikoni Red gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-success {
    background: var(--success-gradient); /* Use Jikoni Green gradient */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .text-gradient-warning {
    background: linear-gradient(45deg, #F97316, #FB923C); /* Keep a vibrant orange */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    max-height: 400px;
    overflow-y: auto;
  }
  .product-card {
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s ease-in-out;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .product-card.selected {
    border-color: var(--primary-red); /* Highlight selected with Jikoni Red */
    box-shadow: 0 0 0 3px rgba(var(--primary-red-rgb), 0.25);
  }
  .product-image {
    height: 100px;
    object-fit: cover;
    width: 100%;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  .discount-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--primary-red);
    color: white;
    padding: 5px 10px;
    border-radius: 0.5rem;
    font-weight: bold;
    font-size: 0.8em;
  }

  .modal-content {
    border-radius: 1rem;
    border: none;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .modal-header {
    border-bottom: none;
    padding: 1.5rem 1.5rem 0.5rem 1.5rem;
    background-color: var(--light-background);
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
  }
  .modal-title {
    font-weight: 700;
    color: var(--dark-text);
    font-size: 1.5rem;
  }
  .modal-body {
    padding: 1.5rem;
    background-color: var(--card-background);
  }
  .modal-footer {
    border-top: none;
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    background-color: var(--light-background);
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }
  .modal-footer .btn {
    border-radius: 0.75rem;
    font-weight: 600;
  }

  .doughnut-chart-container {
    position: relative;
    height: 200px;
    width: 200px;
    margin: 0 auto;
    display: flex; /* Use flexbox to center content */
    align-items: center;
    justify-content: center;
  }

  .chart-center-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  /* Custom styling for primary button to match Jikoni Red */
  .btn-primary.modern-button {
    background-color: var(--primary-red);
    border-color: var(--primary-red);
    color: white;
    font-weight: 600;
    border-radius: 0.75rem;
    padding: 0.6rem 1.2rem;
    transition: all 0.2s ease-in-out;
  }

  .btn-primary.modern-button:hover {
    background-color: var(--button-hover);
    border-color: var(--button-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(var(--primary-red-rgb), 0.3);
  }

  /* Specific style for success badge to match Jikoni Green */
  .badge.bg-success {
    background-color: ${colors.secondary} !important;
  }

  /* Specific style for primary badge to match Jikoni Red */
  .badge.bg-primary {
    background-color: ${colors.primary} !important;
  }

  /* Style for warning badge to maintain good contrast */
  .badge.bg-warning {
    background-color: #FCD34D !important; /* Keep a bright yellow */
    color: ${colors.darkText} !important;
  }

  .battery-container {
    border: 2px solid ${colors.darkText};
    padding: 4px;
    border-radius: 4px;
    position: relative;
    display: flex;
    align-items: center;
  }

  .battery-segment {
    width: 8px;
    height: 16px;
    margin-right: 2px;
    border-radius: 2px;
  }

  @media (max-width: 1200px) {
    .analytics-header {
      flex-direction: column;
      align-items: flex-start;
    }
    .analytics-header .time-selector {
      width: 100%;
      margin-top: 1rem;
    }
    .analytics-header .btn {
      width: 100%;
      margin-top: 0.5rem;
    }
    .compact-carousel {
      height: 250px;
    }
    .carousel-image {
      height: 250px;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }
    .metric-highlight {
      font-size: 1.5rem;
    }
    .compact-carousel {
      height: 200px;
    }
    .carousel-image {
      height: 200px;
    }
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    .analytics-header {
      padding: 0.75rem;
    }
  }

  @media (max-width: 576px) {
    .analytics-header {
      flex-direction: column;
      align-items: stretch;
    }
    .analytics-header h2 {
      font-size: 1.8rem;
      margin-bottom: 1rem;
    }
    .analytics-header .time-selector,
    .analytics-header .btn {
      width: 100%;
      margin-top: 0.5rem;
    }
    .doughnut-chart-container {
      height: 180px;
      width: 180px;
    }
    .chart-center-text .h3 {
      font-size: 1.2rem;
    }
    .table-responsive {
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
    }
    .table-hover-modern thead {
      display: none;
    }
    .table-hover-modern tbody tr {
      display: block;
      margin-bottom: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
    }
    .table-hover-modern tbody td {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border-color);
    }
    .table-hover-modern tbody td:last-child {
      border-bottom: none;
    }
    .table-hover-modern tbody td::before {
      content: attr(data-label);
      font-weight: 600;
      margin-right: 1rem;
    }
  }
`;

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('weekly');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'New Discount Alert!',
    body: 'Check out these amazing deals just for you!'
  });
  const [productCategorySales, setProductCategorySales] = useState([]); // New state for category sales

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const url = `https://crm-backend-mariadb.onrender.com/api/sales/analytics?range=${timeRange}`;
        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
        setAnalytics(data);

        // Process cost analysis data for pie chart
        if (data.costAnalysis && data.costAnalysis.length > 0) {
          const categorySales = data.costAnalysis.map(item => ({
            category: item.category_name === "Heels" ? "Shoes" : item.category_name, // Corrected "Heels" to "Shoes"
            revenue: Number(item.totalRevenue)
          }));
          setProductCategorySales(categorySales);
        } else {
          setProductCategorySales([]);
        }

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please ensure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    } else {
      setError('No access token found. Please log in again.');
    }
  }, [timeRange]);

  useEffect(() => {
    const loadDiscounts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5001/api/discounts');
        setDiscounts(data);
      } catch (err) {
        console.error('Error loading discounts:', err);
      }
    };
    loadDiscounts();
  }, []);

  // Ensure repeatCustomers is always an array
  const repeatCustomers = Array.isArray(analytics?.repeatCustomers)
    ? analytics.repeatCustomers
    : [];

  // Loyal Customer Pagination
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = repeatCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalCustomerPages = Math.ceil(repeatCustomers.length / customersPerPage);

  // Fuel Gauge Chart for Peak Hour
  const peakHourGaugeData = {
    datasets: [{
      data: [
        Math.min(analytics?.peakHour?.revenue || 0, 100000),
        Math.max(0, 100000 - (Math.min(analytics?.peakHour?.revenue || 0, 100000)))
      ],
      backgroundColor: [colors.secondary, colors.lightBackground], // Jikoni Green for fill
      circumference: 270,
      rotation: 225,
      borderWidth: 0
    }]
  };

  const customerGrowthData = {
    labels: analytics?.customerGrowth?.map(item => item.period) || [], // Use 'period' as labels
    datasets: [
      {
        label: 'Customer Growth',
        data: analytics?.customerGrowth?.map(item => item.count) || [],
        borderColor: colors.primary, // Use Jikoni Red for border
        backgroundColor: colors.primary, // Use Jikoni Red for bars
        barThickness: 30, // Adjust bar thickness for better appearance
      },
    ],
  };

  const customerGrowthOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index' },
    },
    scales: {
      x: { grid: { display: false }, title: { display: true, text: 'Week' } }, // Changed title to 'Week'
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Customer Count' },
        ticks: {
          stepSize: 1, // Ensure whole numbers for customer count
        },
      },
    },
    maintainAspectRatio: false, // Allow chart to adjust size
    aspectRatio: 2, // Width to height ratio (e.g., 2:1 for wider than tall)
  };

  const productSalesData = {
    labels: [...new Set((analytics?.productSalesTrends || []).flatMap(p => p.salesData.map(d => d.date)))],
    datasets: (analytics?.productSalesTrends || []).map((product, index) => ({
      label: product.name,
      data: product.salesData.map(d => d.units_sold),
      borderColor: MODERN_CHART_COLORS[index % MODERN_CHART_COLORS.length],
      backgroundColor: `${MODERN_CHART_COLORS[index % MODERN_CHART_COLORS.length]}40`, // Slightly transparent
      tension: 0.3,
      pointRadius: 3,
      fill: false, // Ensure it's a line graph
    }))
  };

  // New Pie Chart Data for Product Category Sales
  const productCategoryPieData = {
    labels: productCategorySales.map(item => item.category),
    datasets: [
      {
        data: productCategorySales.map(item => item.revenue),
        backgroundColor: MODERN_CHART_COLORS, // Use the vibrant modern colors
        hoverOffset: 4,
      },
    ],
  };

  const exportToExcel = async () => {
    try {
      const { data } = await axios.get('http://localhost:5001/api/sales/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      alert('Sales report exported successfully!');
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data. Please ensure the backend supports Excel export.');
    }
  };

  const revenueChartData = {
    labels: analytics?.revenueTrends?.map(item => item.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Revenue',
        data: analytics?.revenueTrends?.map(item => item.revenue) || [1000, 1200, 1100, 900, 1500, 1300, 1400],
        borderColor: colors.primary, // Use Jikoni Red for revenue line
        backgroundColor: `${colors.primary}20`, // Transparent Jikoni Red for fill
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const businessHealthPercent = useMemo(() => {
    if (analytics?.costAnalysis?.length > 0) {
      // Calculate overall COGS (assuming 70% of total revenue is COGS for calculation if not provided)
      const overallCOGS = analytics.costAnalysis.reduce((sum, item) => sum + (Number(item.totalCOGS) || 0), 0);
      const overallRevenue = analytics.costAnalysis.reduce((sum, item) => sum + (Number(item.totalRevenue) || 0), 0);

      // If no COGS data is provided, estimate it as 70% of revenue for calculation purposes
      const calculatedCOGS = overallCOGS === 0 && overallRevenue > 0 ? overallRevenue * 0.7 : overallCOGS;

      if (overallRevenue === 0) return 0;

      let health = ((overallRevenue - calculatedCOGS) / overallRevenue) * 100;
      return Math.min(Math.max(health, 0), 100);
    }
    return 0;
  }, [analytics]);

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const sendDiscountEmails = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to send discounts for.');
      return;
    }
    try {
      const { data } = await axios.post('http://localhost:5001/api/discounts/notify', {
        productIds: selectedProducts.map(p => p.id),
        emailSubject: emailTemplate.subject,
        emailBody: emailTemplate.body
      });
      alert(`Emails sent to ${data.sentCount} customers!`);
      setShowDiscountModal(false);
      setSelectedProducts([]);
    } catch (err) {
      console.error('Email send error:', err);
      alert('Failed to send emails. Check console for details.');
    }
  };

  const formatCurrency = (value) => {
    return `Ksh ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading)
    return (
      <div className="dashboard-container text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className='mt-2 text-muted'>Loading Dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="dashboard-container">
        <Alert variant="danger" className="m-4 glass-card">{error}</Alert>
      </div>
    );

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      {/* Header */}
      <div className="analytics-header">
        <h2 className="mb-0 d-flex align-items-center gap-2">
          <LineChart size={38} className="text-primary-gradient" />
          <p className='text-dark-text fw-bold mb-0'>Your Daily Analytics</p>
        </h2>
        <div className='d-flex align-items-center gap-3 flex-wrap mt-3 mt-md-0'>
          <Form.Select
            className="time-selector"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Form.Select>
          <Button variant="primary" className="modern-button" onClick={exportToExcel}>
            <Download className="me-2" /> Export Report
          </Button>
        </div>
      </div>

      <Row className="g-4 mb-4 d-flex align-items-stretch"> {/* Added align-items-stretch */}
        {/* Revenue */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-wrapper gradient-blue">
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Revenue Per Day</h5>
                <div className="metric-highlight">
                  {formatCurrency(analytics?.todaySales?.totalSales || 0)}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Transactions */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-3">
              <div className="icon-wrapper gradient-green">
                <ShoppingCart size={24} color="white" />
              </div>
              <div>
                <h5 className="text-muted mb-1">Transactions</h5>
                <div className="metric-highlight">
                  {analytics?.todaySales?.transactions || 0}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Business Health */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3 d-flex flex-column align-items-center justify-content-center">
            <p className="text-muted mb-1">Business Health</p>
            <div className="battery-container d-flex align-items-center">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="battery-segment"
                  style={{
                    backgroundColor: businessHealthPercent > (index * 25)
                      ? (businessHealthPercent < 30 ? colors.errorText :
                          businessHealthPercent < 70 ? '#F59E0B' : colors.secondary) // Jikoni Green for good health
                      : colors.lightBackground
                  }}
                />
              ))}
              <div style={{ width: '3px', height: '10px', backgroundColor: colors.darkText, position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', borderRadius: '2px' }}></div>
            </div>
            <div className="metric-highlight mt-2">
              {businessHealthPercent.toFixed(0)}%
            </div>
          </Card>
        </Col>
      </Row>

      {/* Peak Hour Fuel Gauge, Customer Growth Chart & Category Sales Pie Chart */}
      <Row className="g-4 mb-4 d-flex align-items-stretch"> {/* Added align-items-stretch */}
        <Col xl={4} lg={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Clock size={24} />
              <h4 className="text-gradient-primary mb-0">Peak Hour Performance</h4>
            </div>
            <div className="doughnut-chart-container">
              <Doughnut
                data={peakHourGaugeData}
                options={{
                  cutout: '80%',
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                  }
                }}
              />
              <div className="chart-center-text">
                <div className="h3 mb-0" style={{ color: colors.darkText }}>{analytics?.peakHour?.hour || '--'}:00</div>
                <small className="text-muted">Peak Hour</small>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Badge bg="success" className="me-2"> {/* Uses Jikoni Green from custom style */}
                Transactions: {analytics?.peakHour?.transactions || 0}
              </Badge>
              <Badge bg="warning"> {/* Uses custom warning color */}
                Revenue: {formatCurrency(analytics?.peakHour?.revenue || 0)}
              </Badge>
            </div>
          </Card>
        </Col>

        {/* Customer Growth Chart */}
        <Col xl={5} lg={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Users size={24} />
              <h4 className="text-gradient-primary mb-0">Customer Growth (Weekly)</h4>
            </div>
            {customerGrowthData.labels.length > 0 ? (
              <div style={{ height: '300px' }}>
                <Bar
                  data={customerGrowthData}
                  options={customerGrowthOptions}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <p>No customer growth data available for this period.</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Category Sales Distribution Pie Chart */}
        <Col xl={3} lg={12}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Layout size={24} />
              <h4 className="text-gradient-primary mb-0">Category Sales</h4>
            </div>
            {productCategoryPieData.labels.length > 0 ? (
              <div style={{ height: '200px', width: '200px', margin: '0 auto' }}>
                <Pie
                  data={productCategoryPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right' },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += formatCurrency(context.parsed);
                            }
                            return label;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <p>No category sales data available.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Loyal Customers with Pagination */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Star size={24} />
          <h4 className="text-gradient-primary mb-0">Loyal Customers</h4>
        </div>
        {repeatCustomers.length > 0 ? (
          <>
            <div className="table-responsive">
              <Table hover className="table-hover-modern mb-0" style={{ color: colors.darkText }}>
                <thead className="table-light">
                  <tr>
                    <th>Customer</th>
                    <th>Visits</th>
                    <th>Total Spent</th>
                    <th>Products Bought</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((cust, idx) => (
                    <tr key={idx}>
                      <td data-label="Customer">
                        <span className="me-2">📧</span>
                        {cust.customer_email}
                      </td>
                      <td data-label="Visits">
                        <Badge bg="primary"> {/* Uses Jikoni Red from custom style */}
                          {cust.transactionCount}
                        </Badge>
                      </td>
                      <td data-label="Total Spent" className="text-gradient-success"> {/* Uses Jikoni Green gradient */}
                        {formatCurrency(cust.lifetimeValue)}
                      </td>
                      <td data-label="Products Bought">
                        <Badge bg="warning"> {/* Uses custom warning color */}
                          {cust.totalProducts || 0}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                {[...Array(totalCustomerPages).keys()].map(number => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => setCurrentPage(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-muted">
            <Users size={32} className="mb-2" style={{ color: colors.borderColor }} />
            <p>No repeat customers yet.</p>
          </div>
        )}
      </Card>

      {/* Product Sales Trends & Manage Discounts */}
      <Row className="g-4 mb-4 d-flex align-items-stretch"> {/* Added align-items-stretch */}
        <Col xl={8}>
          <Card className="glass-card sales-chart-container p-3">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <h4 className="text-gradient-primary mb-2 mb-md-0">
                <LineChart size={24} className="me-2" />
                Product Sales Trends
              </h4>
              <Button variant="primary" className="modern-button" onClick={() => setShowDiscountModal(true)}>
                <Tag className="me-2" /> Manage Discounts
              </Button>
            </div>
            {productSalesData.labels.length > 0 ? (
              <div style={{ flexGrow: 1, minHeight: '300px' }}> {/* Ensures chart takes available space */}
                <Line
                  data={productSalesData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false, // Important for height control
                    plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
                    interaction: { mode: 'nearest', axis: 'x' },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: colors.darkText } },
                      y: { beginAtZero: true, ticks: { color: colors.darkText } }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <p>No product sales trend data available for this period.</p>
              </div>
            )}
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="glass-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3" style={{ color: colors.darkText }}>
              <h5 className="mb-0 fw-bold">Top Products</h5>
              <small className="text-muted">Weekly Performance</small>
            </div>
            {analytics?.topProducts && analytics.topProducts.length > 0 ? (
              <Carousel className="compact-carousel" indicators={false}>
                {(analytics.topProducts || []).map(product => (
                  <Carousel.Item key={product.id}>
                    <div className="position-relative">
                      <img
                        src={
                          product.image
                            ? `https://crm-backend-mariadb.onrender.com/uploads/${encodeURIComponent(product.image)}`
                            : 'https://placehold.co/400x280/F0F0F0/ADADAD?text=No+Image'
                        }
                        alt={product.name}
                        className="carousel-image"
                      />
                      <div className="carousel-caption d-none d-md-block text-start p-3" style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '0 0 0.75rem 0.75rem' }}>
                        <h5 className="text-white mb-1">{product.name}</h5>
                        <p className="text-white-50 mb-0">Revenue: {formatCurrency(product.revenue)}</p>
                        <p className="text-white-50 mb-0">Sold: {product.totalSold}</p>
                      </div>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <Package size={32} className="mb-2" style={{ color: colors.borderColor }} />
                <p>No top products available.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Sales Forecast Chart */}
      <Card className="glass-card mb-4 p-3">
        <div className="d-flex align-items-center gap-2 mb-3">
          <LineChart size={24} />
          <h4 className="text-gradient-primary mb-0">Sales Forecast</h4>
        </div>
        {analytics?.salesForecast?.length > 0 ? (
          <div style={{ height: '350px' }}>
            <Line
              data={{
                labels: analytics.salesForecast.map(item => item.period),
                datasets: [
                  {
                    label: 'Actual Sales',
                    data: analytics.salesForecast.map(item => item.actualSales),
                    borderColor: colors.secondary, // Jikoni Green for actual sales
                    backgroundColor: `${colors.secondary}20`,
                    fill: true,
                    tension: 0.3,
                  },
                  {
                    label: 'Forecasted Sales',
                    data: analytics.salesForecast.map(item => item.forecastedSales),
                    borderColor: colors.primary, // Jikoni Red for forecasted sales
                    backgroundColor: `${colors.primary}20`,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        ) : (
          <div className="text-center py-4 text-muted">
            <p>No sales forecast data available.</p>
          </div>
        )}
      </Card>

      {/* Payment Methods & Product Movement & Cost Analysis */}
      <Row className="g-4 mb-4 d-flex align-items-stretch">
        {/* Payment Methods */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <CreditCard size={24} />
              <h4 className="text-gradient-primary mb-0">Payment Methods</h4>
            </div>
            {analytics?.paymentMethods && Object.keys(analytics.paymentMethods).length > 0 ? (
              <div style={{ height: '200px', width: '200px', margin: '0 auto' }}>
                <Pie
                  data={{
                    labels: Object.keys(analytics.paymentMethods),
                    datasets: [{
                      data: Object.values(analytics.paymentMethods),
                      backgroundColor: MODERN_CHART_COLORS,
                      hoverOffset: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right' },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed !== null) {
                              label += formatCurrency(context.parsed);
                            }
                            return label;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <p>No payment method data available.</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Movement */}
        <Col xl={4} md={6}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Repeat size={24} />
              <h4 className="text-gradient-primary mb-0">Product Movement</h4>
            </div>
            {analytics?.productMovement && analytics.productMovement.length > 0 ? (
              <Table responsive striped className="table-hover-modern" style={{ color: colors.darkText }}>
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.productMovement.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Product">{item.productName}</td>
                      <td data-label="Status">
                        <Badge className={`status-badge ${item.status === 'Fast-Moving' ? 'fast-moving' : 'slow-moving'}`}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <p>No product movement data available.</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Cost Analysis */}
        <Col xl={4} md={12}>
          <Card className="glass-card p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <DollarSign size={24} />
              <h4 className="text-gradient-primary mb-0">Cost Analysis</h4>
            </div>
            {analytics?.costAnalysis && analytics.costAnalysis.length > 0 ? (
              <Table responsive striped className="table-hover-modern" style={{ color: colors.darkText }}>
                <thead className="table-light">
                  <tr>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>COGS</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.costAnalysis.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Category">{item.category_name}</td>
                      <td data-label="Revenue" className="text-gradient-success">{formatCurrency(item.totalRevenue)}</td>
                      <td data-label="COGS" className="text-gradient-warning">{formatCurrency(item.totalCOGS)}</td>
                      <td data-label="Profit" className="text-gradient-primary">{formatCurrency(item.totalRevenue - item.totalCOGS)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <p>No cost analysis data available.</p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Discount Management Modal */}
      <Modal show={showDiscountModal} onHide={() => setShowDiscountModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Tag className="me-2" /> Manage Discounts & Customer Communication
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">Select products to send discount offers to loyal customers.</p>
          <Form.Group className="mb-3">
            <Form.Label>Email Subject:</Form.Label>
            <InputGroup>
              <InputGroup.Text><Send size={18} /></InputGroup.Text>
              <Form.Control
                type="text"
                value={emailTemplate.subject}
                onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Email Body:</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={emailTemplate.body}
              onChange={(e) => setEmailTemplate({ ...emailTemplate, body: e.target.value })}
            />
          </Form.Group>

          <h5>Available Products:</h5>
          {discounts.length > 0 ? (
            <div className="product-grid">
              {discounts.map(product => (
                <Card
                  key={product.id}
                  className={`product-card ${selectedProducts.some(p => p.id === product.id) ? 'selected' : ''}`}
                  onClick={() => toggleProductSelection(product)}
                >
                  <div className="position-relative">
                    <img
                      src={
                        product.image
                          ? `http://localhost:5001/uploads/${encodeURIComponent(product.image)}`
                          : 'https://placehold.co/100x100/F0F0F0/ADADAD?text=No+Image'
                      }
                      alt={product.name}
                      className="product-image"
                    />
                    <Badge className="discount-badge">
                      {product.discount}% OFF
                    </Badge>
                  </div>
                  <Card.Body className="p-2">
                    <Card.Title className="h6 mb-1 text-dark-text">{product.name}</Card.Title>
                    <Card.Text className="text-muted small mb-0">
                      <span className="text-decoration-line-through me-1">{formatCurrency(product.price)}</span>
                      <span className="fw-bold" style={{ color: colors.primary }}>{formatCurrency(product.price * (1 - product.discount / 100))}</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="text-center">No products available for discounts.</Alert>
          )}

          {selectedProducts.length > 0 && (
            <Alert variant="info" className="mt-4">
              Selected Products: {selectedProducts.map(p => p.name).join(', ')}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDiscountModal(false)}>Close</Button>
          <Button variant="primary" className="modern-button" onClick={sendDiscountEmails} disabled={selectedProducts.length === 0}>
            <Send className="me-2" /> Send Discount Emails
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AnalyticsDashboard;