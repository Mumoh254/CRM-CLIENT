import React, { useState, useEffect } from 'react';
import {
    Card, Button, Row, Col, Form, Pagination, Alert, Badge,
    Spinner, Modal, Dropdown, InputGroup, Table
} from 'react-bootstrap';
import { useCart } from '../context/cartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import ProductForm from './productForm';
import { useNavigate } from 'react-router-dom';

// Your color palette
const colors = {
    primary: '#FF4532',
    secondary: '#00C853',
    darkText: '#1A202C',
    lightBackground: '#F0F2F5',
    cardBackground: '#FFFFFF',
    borderColor: '#D1D9E6',
    errorText: '#EF4444',
    placeholderText: '#A0AEC0',
    buttonHover: '#E6392B',
    disabledButton: '#CBD5E1',
};

// Icon components (unchanged)
const IconSearch = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.088.121l4.353 4.353a1 1 0 0 0 1.414-1.414l-4.353-4.353q-.06-.044-.121-.088zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" /></svg>;
const IconCategory = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h13A1.5 1.5 0 0 1 16 2.5v11A1.5 1.5 0 0 1 14.5 15h-13A1.5 1.5 0 0 1 0 13.5zM1.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5z" /><path d="M2 5.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H5V8H2.5zm4.5-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H10V8H7.5zm4.5-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H15V8h-2.5zM2 9.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H5V12H2.5zM7 9.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H10V12H7.5zm4.5-.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5zm.5-.5H15V12h-2.5z" /></svg>;
const IconCart = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.13 4l1.25 5h8.52L13.73 4zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" /></svg>;
const IconSort = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L3.5 11.293zm3.5 0a.5.5 0 0 1 0-1h6a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h4a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h2a.5.5 0 0 1 0 1zm0 3a.5.5 0 0 1 0-1h1a.5.5 0 0 1 0 1z" /></svg>;
const IconPlus = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" /></svg>;
const IconChevronDown = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 0 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" /></svg>;
const IconChevronUp = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708z" /></svg>;
const IconFilter = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5" /></svg>;
const IconDotsVerticalRounded = ({ size = 22, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" /></svg>;
const IconEdit = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" /><path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" /></svg>;
const IconTrash = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4H1.5a1 1 0 0 1 0-1H4V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1h1.5a1 1 0 0 1 1 1M5 2v1h6V2a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5M3 4H13v9a1 1 0 0 0 1 1H5a1 1 0 0 0 1-1V4z" /></svg>;
const IconInfoCircle = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" /><path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2-.176-.492-.246-.714-.246-.121 0-.279.06-.35.1l-.485 2.15zM8 5.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2" /></svg>;
const IconShoppingCartPlus = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 2H3a.5.5 0 0 0 0 1h11a.5.5 0 0 0 0-1h-2a2 2 0 1 0 0-2h-1.11l-.401-1.607 1.498-7.985A.5.5 0 0 0 12 4h1.11L15.61 1H14a.5.5 0 0 0 0 1zM6 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2M9 5.5a.5.5 0 0 0-1 0V7H6.5a.5.5 0 0 0 0 1H8v1.5a.5.5 0 0 0 1 0V8h1.5a.5.5 0 0 0 0-1H9z"/></svg>;
const IconLogout = ({ size = 18, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" className={className} viewBox="0 0 16 16"><path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/><path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/></svg>;

// Base64 encoded transparent placeholder image
const transparentPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState(['all']);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const { addToCart } = useCart();
    const pageSize = 8;
    const navigate = useNavigate();
    const [editPrice, setEditPrice] = useState('');
    const [editStock, setEditStock] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('https://96b79e8529ca.ngrok-free.app/api/products', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const prodList = Array.isArray(response.data) ? response.data : [];
            setProducts(prodList);

            const cats = Array.from(new Set(prodList.map(p => p.category))).filter(Boolean);
            setCategories(['all', ...cats]);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            if (error.response && error.response.status === 401) {
                toast.error('Session expired or unauthorized. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                toast.error('Failed to load data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const filteredProducts = products
        .filter(p =>
            (selectedCategory === 'all' || p.category === selectedCategory) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'price') {
                comparison = (a.price || 0) - (b.price || 0);
            } else if (sortBy === 'stock') {
                comparison = (a.stock || 0) - (b.stock || 0);
            } else if (sortBy === 'category') {
                comparison = (a.category || '').localeCompare(b.category || '');
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleUpdatePriceStock = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Authentication required. Please log in.');
                navigate('/login');
                return;
            }

            await axios.put(
                `http://localhost:5001/api/products/${selectedProduct.id}`,
                { price: parseFloat(editPrice), stock: parseInt(editStock) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Product updated successfully');
            fetchProducts();
            setShowEditModal(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error("Error updating product:", error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.error || 'Error updating product');
            }
        }
    };

    const handleDelete = async () => {
        try {
               const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Authentication required. Please log in.');
                navigate('/login');
                return;
            }

            await axios.delete(
                `http://localhost:5001/api/products/${selectedProduct.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Product deleted successfully');
            fetchProducts();
            setShowDeleteModal(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error("Error deleting product:", error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                toast.error(error.response?.data?.error || 'Error deleting product');
            }
        }
    };

    const getProductImageUrl = (imagePath) => {
        if (imagePath) {
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
            }
            return `http://localhost:5001/uploads/${imagePath}`;
        }
        return transparentPlaceholder;
    };

    const handleImageError = (e) => {
        const img = e.target;
        if (img.getAttribute('data-tried-default') === 'false') {
            img.src = transparentPlaceholder;
            img.setAttribute('data-tried-default', 'true');
        }
    };

    const handleEditClick = (product) => {
        setSelectedProduct(product);
        setEditPrice(product.price);
        setEditStock(product.stock);
        setShowEditModal(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.info('You have been logged out.');
        navigate('/login');
    };

    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';

    return (
        <div className="min" style={{ backgroundColor: colors.lightBackground, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <style>
                {`
                /* Updated styles using your color palette */
                .stylish-card {
                    border: none;
                    border-radius: 15px;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    overflow: hidden;
                    background-color: ${colors.cardBackground};
                }
                .stylish-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
                }

                .btn-custom-primary {
                    background-color: ${colors.primary};
                    border-color: ${colors.primary};
                    transition: all 0.3s ease;
                    color: white;
                    border-radius: 8px;
                    font-weight: 600;
                }
                .btn-custom-primary:hover {
                    background-color: ${colors.buttonHover};
                    border-color: ${colors.buttonHover};
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                }

                .input-group-stylish .input-group-text,
                .input-group-stylish .form-control {
                    border-radius: 10px !important;
                    border-color: ${colors.borderColor};
                    background-color: ${colors.cardBackground};
                    color: ${colors.darkText};
                }
                .input-group-stylish .form-control:focus {
                    border-color: ${colors.primary};
                    box-shadow: 0 0 0 0.25rem rgba(255, 69, 50, 0.25);
                }

                .dropdown-toggle-stylish {
                    border-radius: 10px !important;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: ${colors.darkText};
                    background-color: ${colors.cardBackground};
                    border: 1px solid ${colors.borderColor};
                    width: 100%;
                    justify-content: space-between;
                    font-weight: 500;
                }
                .dropdown-toggle-stylish:hover {
                    background-color: ${colors.lightBackground};
                }
                .dropdown-menu-stylish {
                    border-radius: 10px;
                    border: 1px solid ${colors.borderColor};
                    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
                    width: 100%;
                    padding: 0.5rem 0;
                }
                .dropdown-item-stylish {
                    color: ${colors.darkText};
                    transition: background-color 0.2s ease, color 0.2s ease;
                    padding: 0.75rem 1.25rem;
                }
                .dropdown-item-stylish:active, .dropdown-item-stylish:hover {
                    background-color: ${colors.lightBackground};
                    color: ${colors.primary};
                }

                .modal-content-stylish {
                    border-radius: 15px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                    border: none;
                }

                .modal-header-stylish {
                    background-color: ${colors.primary};
                    color: white;
                    border-top-left-radius: 15px;
                    border-top-right-radius: 15px;
                    padding: 1.5rem;
                    border-bottom: none;
                }

                .modal-title-stylish {
                    font-weight: bold;
                    font-size: 1.6rem;
                }

                .modal-body-stylish {
                    padding: 2rem;
                    background-color: ${colors.lightBackground};
                    color: ${colors.darkText};
                }

                .modal-footer-stylish {
                    border-top: 1px solid ${colors.borderColor};
                    padding: 1.5rem;
                    background-color: ${colors.cardBackground};
                    border-bottom-left-radius: 15px;
                    border-bottom-right-radius: 15px;
                }

                .modal-image-preview {
                    width: 100%;
                    max-height: 250px;
                    object-fit: contain;
                    border-radius: 10px;
                    margin-bottom: 1.5rem;
                    border: 1px solid ${colors.borderColor};
                    background-color: ${colors.lightBackground};
                    padding: 10px;
                }

                .product-card-item {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .product-card-item .card-body {
                    flex-grow: 1; 
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }

                .product-card-image-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: ${colors.lightBackground};
                    border-bottom: 1px solid ${colors.borderColor};
                    min-height: 100px;
                }
                .product-card-image-container img {
                    width: 100%;
                    max-height: 180px;
                    object-fit: cover;
                    border-radius: 8px;
                }

                .product-card-info {
                    padding: 1rem 1.2rem;
                    display: flex;
                    flex-direction: column;
                    flex-grow: 1;
                }

                .product-card-title {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: ${colors.darkText};
                    margin-bottom: 0.5rem;
                    line-height: 1.3;
                }

                .product-card-category {
                    font-size: 0.85rem;
                    color: ${colors.placeholderText};
                    margin-bottom: 0.75rem;
                    font-weight: 500;
                }

                .product-card-price-stock {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: auto;
                    padding: 0 1.2rem 1.2rem 1.2rem;
                    border-top: 1px dashed ${colors.borderColor};
                    padding-top: 1rem;
                }

                .product-card-price {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: ${colors.primary};
                }

                .product-card-stock {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: ${colors.placeholderText};
                    padding: 0.25rem 0.6rem;
                    border-radius: 5px;
                    background-color: ${colors.lightBackground};
                }

                .product-card-actions {
                    padding: 1.2rem;
                    border-top: 1px solid ${colors.borderColor};
                    display: flex;
                    gap: 10px;
                    justify-content: space-around;
                    flex-wrap: wrap;
                }
                .product-card-actions .btn {
                    flex-grow: 1;
                    font-size: 0.9rem;
                    padding: 0.7rem 0.5rem;
                }
                .product-card-actions .btn-sm {
                    padding: 0.5rem 0.75rem;
                    font-size: 0.85rem;
                }

                .product-table-responsive {
                    overflow-x: auto;
                }

                .product-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                .product-table th, .product-table td {
                    padding: 1rem 1.2rem;
                    vertical-align: middle;
                    border-bottom: 1px solid ${colors.borderColor};
                    color: ${colors.darkText};
                }

                .product-table th {
                    background-color: ${colors.primary};
                    color: white;
                    font-weight: 600;
                    text-align: left;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .product-table tr:last-child td {
                    border-bottom: none;
                }

                .product-table tbody tr:hover {
                    background-color: ${colors.lightBackground};
                }

                .product-table .product-image-thumb {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 1px solid ${colors.borderColor};
                }

                .product-table .btn-table-action {
                    padding: 0.4rem 0.75rem;
                    font-size: 0.85rem;
                    border-radius: 6px;
                }

                @media (max-width: 767.98px) {
                    .product-table-container {
                        display: none;
                    }
                    .product-card-grid {
                        display: flex;
                        flex-wrap: wrap;
                    }
                    .hide-on-mobile {
                        display: none !important;
                    }
                    .add-product-btn-mobile-hidden {
                        width: 100%;
                    }
                }

                @media (min-width: 768px) {
                    .product-card-grid {
                        display: none;
                    }
                    .product-table-container {
                        display: block;
                    }
                    .product-table th:first-child {
                        border-top-left-radius: 10px;
                    }
                    .product-table th:last-child {
                        border-top-right-radius: 10px;
                    }
                    .product-table tr:last-child td:first-child {
                        border-bottom-left-radius: 10px;
                    }
                    .product-table tr:last-child td:last-child {
                        border-bottom-right-radius: 10px;
                    }

                    .product-card-item {
                        flex-direction: row;
                        max-height: 250px;
                    }
                    .product-card-image-container {
                        flex: 0 0 40%;
                        max-width: 40%;
                        border-right: 1px solid ${colors.borderColor};
                        border-bottom: none;
                        min-height: auto;
                    }
                    .product-card-image-container img {
                        max-height: 200px;
                    }
                    .product-card-info {
                        flex: 1;
                        padding-bottom: 0.5rem;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .product-card-price-stock {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: auto;
                        padding: 0 1.2rem 1rem 1.2rem;
                        border-top: none;
                    }
                    .product-card-actions {
                        border-top: 1px dashed ${colors.borderColor};
                        padding-top: 1rem;
                        padding-bottom: 0.5rem;
                        flex-wrap: nowrap;
                    }
                }
                
                @media (max-width: 575.98px) {
                    .product-card-title {
                        font-size: 1.2rem;
                    }
                    .product-card-price {
                        font-size: 1.4rem;
                    }
                    .product-card-image-container img {
                        max-height: 150px;
                    }
                    .product-card-actions .btn {
                        font-size: 0.8rem;
                        padding: 0.6rem 0.4rem;
                    }
                }
                `}
            </style>

            <div className="d-flex py-2 flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <Badge
                    className="py-3 d-flex align-items-center justify-content-center flex-grow-1 flex-md-grow-0 hide-on-mobile"
                    style={{ 
                        color: 'white', 
                        fontSize: '1.1rem', 
                        fontWeight: '700', 
                        borderRadius: '8px', 
                        backgroundColor: colors.primary 
                    }}
                >
                    Total Products: <span className="ms-2">{products.length}</span>
                </Badge>
                <div className="d-flex flex-column flex-md-row gap-3 w-100 w-md-auto">
                    {isAdmin && (
                        <Button
                            variant="primary"
                            onClick={() => { setSelectedProduct(null); setShowEditModal(true); }}
                            className="btn-custom-primary d-flex align-items-center justify-content-center flex-grow-1 add-product-btn-mobile-hidden"
                        >
                            <IconPlus className="me-2" /> Add New Product
                        </Button>
                    )}
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        className="btn-custom-primary d-flex align-items-center justify-content-center flex-grow-1 hide-on-mobile"
                        style={{ backgroundColor: colors.errorText, borderColor: colors.errorText }}
                    >
                        <IconLogout className="me-2" /> Logout
                    </Button>
                </div>
            </div>

            <Card className="px-4 stylish-card">
                <h2 className="h4 mb-2" style={{ color: colors.darkText, fontWeight: 'bold' }}>Product Showcase ✨</h2>

                <Row className="mb-5 align-items-end">
                    <Col xs={12} md={12}>
                        <InputGroup className="input-group-stylish">
                            <InputGroup.Text><IconSearch /></InputGroup.Text>
                            <Form.Control
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            />
                        </InputGroup>
                    </Col>
                    <Col xs={12} md={3}>
                        <Dropdown className="w-100">
                            <Dropdown.Toggle variant="outline-secondary" className="dropdown-toggle-stylish">
                                <IconCategory />
                                {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                                <IconChevronDown className="ms-auto" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-stylish">
                                {categories.map(cat => (
                                    <Dropdown.Item
                                        key={cat}
                                        onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                        active={selectedCategory === cat}
                                        className="dropdown-item-stylish"
                                    >
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col xs={12} md={4}>
                        <Dropdown className="w-100">
                            <Dropdown.Toggle variant="outline-secondary" className="dropdown-toggle-stylish">
                                <IconSort />
                                Sort By: {sortBy === 'name' ? 'Name' : sortBy === 'price' ? 'Price' : 'Stock'} {sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />}
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-stylish">
                                <Dropdown.Item onClick={() => handleSort('name')} className="dropdown-item-stylish">
                                    Name {sortBy === 'name' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSort('price')} className="dropdown-item-stylish">
                                    Price {sortBy === 'price' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleSort('stock')} className="dropdown-item-stylish">
                                    Stock {sortBy === 'stock' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                        <Spinner animation="border" style={{ color: colors.primary }} role="status">
                            <span className="visually-hidden">Loading products...</span>
                        </Spinner>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <Alert variant="info" className="text-center py-4" style={{ 
                        borderRadius: '10px', 
                        backgroundColor: `${colors.primary}10`, 
                        borderColor: colors.primary, 
                        color: colors.darkText 
                    }}>
                        <IconInfoCircle size={24} className="mb-2" style={{ color: colors.primary }} />
                        <p className="mb-0">No products found matching your criteria.</p>
                    </Alert>
                ) : (
                    <>
                        {/* Desktop View: Table */}
                        <div className="py-4 product-table-container">
                            <div className="table-responsive">
                                <Table hover className="product-table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th onClick={() => handleSort('name')}>Name {sortBy === 'name' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}</th>
                                            <th onClick={() => handleSort('category')}>Category {sortBy === 'category' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}</th>
                                            <th>Description</th>
                                            <th onClick={() => handleSort('price')}>Price {sortBy === 'price' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}</th>
                                            <th onClick={() => handleSort('stock')}>Stock {sortBy === 'stock' && (sortDirection === 'asc' ? <IconChevronUp /> : <IconChevronDown />)}</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <img
                                                        src={getProductImageUrl(product.image)}
                                                        alt={product.name}
                                                        className="product-image-thumb"
                                                        onError={handleImageError}
                                                        data-tried-default="false"
                                                    />
                                                </td>
                                                <td>{product.name}</td>
                                                <td>{product.category}</td>
                                                <td>{product.description?.substring(0, 50) || 'No description'}</td>
                                                <td>
                                                    {product.price != null && !isNaN(product.price) ? 
                                                        `Ksh ${Number(product.price).toFixed(2)}` : 'N/A'}
                                                </td>
                                                <td>
                                                    <Badge bg={product.stock > 0 ? "success" : "danger"}>
                                                        {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                    </Badge>
                                                </td>
                                                <td className="d-flex gap-2">
                                                    <Button
                                                        variant="outline-primary"
                                                        className="btn-table-action"
                                                        style={{ borderColor: colors.secondary, color: colors.secondary }}
                                                        onClick={() => addToCart(product)}
                                                        disabled={product.stock === 0}
                                                    >
                                                        <IconShoppingCartPlus size={14} /> Add
                                                    </Button>
                                                    {isAdmin && (
                                                        <>
                                                        
                                                            <Button
                                                                variant="outline-danger"
                                                                className="btn-table-action"
                                                                onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                                                            >
                                                                <IconTrash size={14} /> Del
                                                            </Button>
                                                            <Button
                                                                variant="outline-info"
                                                                className="btn-table-action"
                                                                onClick={() => { setSelectedProduct(product); setShowViewModal(true); }}
                                                            >
                                                                <IconInfoCircle size={14} /> View
                                                            </Button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </div>

                        {/* Mobile View: Cards */}
                        <div className="product-card-grid d-block d-md-none">
                            <Row xs={1} sm={2} className="g-2">
                                {paginatedProducts.map((product) => (
                                    <Col key={product.id}>
                                        <Card className="h-100 stylish-card product-card-item">
                                            <div className="product-card-image-container">
                                                <Card.Img
                                                    variant="top"
                                                    src={getProductImageUrl(product.image)}
                                                    alt={product.name}
                                                    onError={handleImageError}
                                                    data-tried-default="false"
                                                />
                                            </div>
                                            <Card.Body className="product-card-info">
                                                <div>
                                                    <Card.Title className="product-card-title">{product.name}</Card.Title>
                                                    <Card.Subtitle className="product-card-category">{product.category}</Card.Subtitle>
                                                    <Card.Text style={{ color: colors.darkText }}>
                                                        {product.description ? product.description.substring(0, 80) + '...' : 'No description'}
                                                    </Card.Text>
                                                </div>
                                                <div className="product-card-price-stock">
                                                   <span className="product-card-price">
  {product.price != null && !isNaN(product.price)
    ? `Ksh ${parseFloat(product.price).toFixed(2)}`
    : 'N/A'}
</span>

                                                    <span className="product-card-stock">
                                                        <Badge pill bg={product.stock > 0 ? "success" : "danger"}>
                                                            {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            </Card.Body>
                                            <Card.Footer className="product-card-actions">
                                                <Button
                                                    variant="primary"
                                                    className="btn-custom-primary"
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stock === 0}
                                                >
                                                    <IconShoppingCartPlus className="me-1" /> Add to Cart
                                                </Button>
                                                {isAdmin && (
                                                    <Dropdown align="end">
                                                        <Dropdown.Toggle variant="light" id="dropdown-basic" className="btn-sm">
                                                            <IconDotsVerticalRounded />
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => handleEditClick(product)}>
                                                                <IconEdit className="me-2" /> Edit
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}>
                                                                <IconTrash className="me-2" /> Delete
                                                            </Dropdown.Item>
                                                            <Dropdown.Item onClick={() => { setSelectedProduct(product); setShowViewModal(true); }}>
                                                                <IconInfoCircle className="me-2" /> View Details
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                )}
                                            </Card.Footer>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        {totalPages > 1 && (
                            <Pagination className="mt-4 justify-content-center">
                                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                                {[...Array(totalPages)].map((_, index) => (
                                    <Pagination.Item
                                        key={index + 1}
                                        active={index + 1 === currentPage}
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                            </Pagination>
                        )}
                    </>
                )}
            </Card>

            {/* Edit/Add Product Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered dialogClassName="modal-content-stylish">
                <Modal.Header closeButton className="modal-header-stylish">
                    <Modal.Title className="modal-title-stylish">{selectedProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-stylish">
                    <ProductForm
                        product={selectedProduct}
                        onSave={() => { fetchProducts(); setShowEditModal(false); setSelectedProduct(null); }}
                        onClose={() => setShowEditModal(false)}
                    />
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered dialogClassName="modal-content-stylish">
                <Modal.Header closeButton className="modal-header-stylish" style={{ backgroundColor: colors.errorText }}>
                    <Modal.Title className="modal-title-stylish">Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-stylish">
                    <Alert variant="danger" className="d-flex align-items-center" style={{ 
                        backgroundColor: `${colors.errorText}10`, 
                        borderColor: colors.errorText, 
                        color: colors.darkText 
                    }}>
                        <IconInfoCircle className="me-3" size={24} style={{ color: colors.errorText }} />
                        Are you sure you want to delete product: <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
                    </Alert>
                </Modal.Body>
                <Modal.Footer className="modal-footer-stylish">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} className="btn-custom-primary" style={{ 
                        backgroundColor: colors.errorText, 
                        borderColor: colors.errorText 
                    }}>
                        <IconTrash className="me-2" /> Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* View Product Details Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} centered dialogClassName="modal-content-stylish">
                <Modal.Header closeButton className="modal-header-stylish">
                    <Modal.Title className="modal-title-stylish">Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-stylish">
                    {selectedProduct && (
                        <div>
                            <div className="d-flex justify-content-center mb-4">
                                <img
                                    src={getProductImageUrl(selectedProduct.image)}
                                    alt={selectedProduct.name}
                                    className="modal-image-preview"
                                    onError={handleImageError}
                                    data-tried-default="false"
                                />
                            </div>
                            <h4 className="mb-3" style={{ color: colors.darkText, fontWeight: '700' }}>{selectedProduct.name}</h4>
                            <p><strong>Category:</strong> {selectedProduct.category}</p>
                            <p><strong>Description:</strong> {selectedProduct.description}</p>
                            <p>
                                <strong>Price:</strong>
                                <span style={{ color: colors.primary, fontWeight: 'bold' }}>
                                    {typeof selectedProduct.price === 'number'
                                        ? `Ksh ${selectedProduct.price.toFixed(2)}`
                                        : 'N/A'}
                                </span>
                            </p>
                            <p><strong>Stock:</strong>
                                <Badge pill bg={selectedProduct.stock > 0 ? "success" : "danger"} className="ms-2">
                                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} In Stock` : 'Out of Stock'}
                                </Badge>
                            </p>
                            {isAdmin && (
                                <Form onSubmit={handleUpdatePriceStock} className="mt-4 p-3 border rounded" style={{ 
                                    backgroundColor: colors.cardBackground, 
                                    borderColor: colors.borderColor 
                                }}>
                                    <h5 className="mb-3" style={{ color: colors.darkText }}>Quick Edit Price/Stock:</h5>
                                    <Form.Group className="mb-3" controlId="editPrice">
                                        <Form.Label>Price</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            required
                                            className="input-group-stylish form-control"
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="editStock">
                                        <Form.Label>Stock</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={editStock}
                                            onChange={(e) => setEditStock(e.target.value)}
                                            required
                                            className="input-group-stylish form-control"
                                        />
                                    </Form.Group>
                                    <Button type="submit" className="btn-custom-primary w-100">
                                        Update Product
                                    </Button>
                                </Form>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="modal-footer-stylish">
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ProductList;