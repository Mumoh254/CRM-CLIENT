// components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Modal, Form, InputGroup } from 'react-bootstrap';
import { FiUserPlus, FiUser, FiTrash2, FiEdit, FiLock, FiMail, FiUsers, FiKey } from 'react-icons/fi'; // Added FiKey for password change
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const colors = {
    primary: '#FF4532', // Jikoni Red
    secondary: '#00C853', // Jikoni Green
    darkText: '#1A202C',
    lightBackground: '#F0F2F5',
    cardBackground: '#FFFFFF',
    borderColor: '#D1D9E6',
    errorText: '#EF4444',
    placeholderText: '#A0AEC0',
    buttonHover: '#E6392B',
    disabledButton: '#CBD5E1',
    accentBlue: '#007bff',
    accentBlueHover: '#0056b3',
};

const UserManagement = () => { // Renamed component
    const navigate = useNavigate(); // Initialize navigate
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // State for Password Change Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordChangeProcessing, setPasswordChangeProcessing] = useState(false);


    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found. Please log in.');
                toast.error('Authentication required to view users.');
                setLoading(false);
                return;
            }

            const response = await fetch("http://localhost:5001/api/auth/allusers", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
            toast.error(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async () => {
        if (!selectedUser) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/auth/users/${selectedUser.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            toast.success('User deleted successfully!');
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers(); // Refresh the user list
        } catch (err) {
            toast.error(`Error: ${err.message}`);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) {
            toast.error('Please select a user and enter a new password.');
            return;
        }

        setPasswordChangeProcessing(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming your backend endpoint for changing password expects userId and newPassword
            const response = await fetch(`http://localhost:5001/api/auth/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ userId: selectedUser.id, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            toast.success(`Password for ${selectedUser.email} changed successfully!`);
            setShowPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (err) {
            toast.error(`Error changing password: ${err.message}`);
        } finally {
            setPasswordChangeProcessing(false);
        }
    };

    return (
        <Container className="my-4">
            <h2 className="mb-4 text-center fw-bold" style={{ color: colors.darkText }}>
                <FiUsers className="me-2" style={{ color: colors.primary }} /> User Management
            </h2>

            <div className="d-flex justify-content-end mb-4">
                <Button
                    variant="primary"
                    onClick={() => navigate('/register')} // Navigate to the existing register component
                    style={{
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <FiUserPlus className="me-2" /> Register New User
                </Button>
            </div>

            {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" style={{ color: colors.primary }} />
                    <p className="mt-3" style={{ color: colors.placeholderText }}>Loading users...</p>
                </div>
            )}

            {error && (
                <Alert variant="danger" className="text-center my-4">
                    {error}
                    <Button variant="light" className="mt-3" onClick={fetchUsers}>
                        Retry
                    </Button>
                </Alert>
            )}

            {!loading && !error && (
                <Card className="shadow-sm" style={{ backgroundColor: colors.cardBackground, borderColor: colors.borderColor }}>
                    <Card.Header style={{ backgroundColor: colors.lightBackground }}>
                        <h5 className="mb-0 fw-semibold" style={{ color: colors.darkText }}>
                            <FiUsers className="me-2" /> All Registered Users
                        </h5>
                    </Card.Header>
                    <Card.Body>
                        {users.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <thead style={{ backgroundColor: colors.lightBackground }}>
                                    <tr>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <FiMail className="me-2" style={{ color: colors.accentBlue }} />
                                                {user.email}
                                            </td>
                                            <td>
                                                <FiUser className="me-2" style={{ color: colors.primary }} />
                                                {user.role}
                                            </td>
                                            <td>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <Button
                                                    variant="info" // Changed to info for password change
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewPassword(''); // Clear password field
                                                        setShowPasswordModal(true);
                                                    }}
                                                    className="me-2" // Add margin to the right
                                                    style={{ backgroundColor: colors.accentBlue, borderColor: colors.accentBlue }}
                                                >
                                                    <FiLock /> Change Password
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowDeleteModal(true);
                                                    }}
                                                >
                                                    <FiTrash2 /> Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted">No users found</p>
                        )}
                    </Card.Body>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton style={{ backgroundColor: colors.lightBackground }}>
                    <Modal.Title>
                        <FiTrash2 className="me-2" /> Confirm Deletion
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedUser && (
                        <p>
                            Are you sure you want to delete user <strong>{selectedUser.email}</strong>?
                            This action cannot be undone.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete User
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Password Change Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
                <Modal.Header closeButton style={{ backgroundColor: colors.lightBackground }}>
                    <Modal.Title>
                        <FiLock className="me-2" /> Change Password for {selectedUser?.email}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleChangePassword}>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FiKey style={{ color: colors.placeholderText }} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                />
                            </InputGroup>
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={passwordChangeProcessing}
                                style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
                            >
                                {passwordChangeProcessing ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default UserManagement;