// components/UserManagement.js
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { Container, Row, Col, Card, Button, Spinner, Alert, Table, Modal, Form, InputGroup } from 'react-bootstrap';
import { FiUserPlus, FiUser, FiTrash2, FiEdit, FiLock, FiMail, FiUsers, FiKey, FiRefreshCw } from 'react-icons/fi'; // Added FiRefreshCw
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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




const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false); // For delete loading state

    // State for Password Change Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordChangeProcessing, setPasswordChangeProcessing] = useState(false);

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken'); // Corrected to accessToken

            if (!token) {
                setError('Authentication token not found. Please log in.');
                toast.error('Authentication required to view users.');
                setLoading(false);
                return;
            }

            const response = await fetch("https://crm-backend-mariadb.onrender.com/api/auth/allusers", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    setError('Unauthorized: You do not have permission to view users. Redirecting to login...');
                    toast.error('Unauthorized access. Please log in.');
                    setTimeout(() => navigate('/login'), 3000); // Redirect to login after a delay
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch users: ${response.status}`);
            }

            const data = await response.json();
            // Assuming data.users is the array of users based on your provided test client response
            setUsers(data.users || []); 
            toast.success('Users loaded successfully!');
        } catch (err) {
            setError(err.message);
            toast.error(`Error: ${err.message}`);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [navigate]); // Added navigate to dependencies

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle user deletion
    const handleDelete = async () => {
        if (!selectedUser) return;

        setDeleteProcessing(true);
        try {
            const token = localStorage.getItem('accessToken'); // Corrected to accessToken
            if (!token) {
                throw new Error('Authentication token not found.');
            }

            const response = await fetch(`https://crm-backend-mariadb.onrender.com/api/auth/delete/${selectedUser.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                credentials:  'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete user: ${response.status}`);
            }

            toast.success(`User ${selectedUser.email} deleted successfully!`);
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers(); // Refresh the user list
        } catch (err) {
            toast.error(`Error deleting user: ${err.message}`);
            console.error('Error deleting user:', err);
        } finally {
            setDeleteProcessing(false);
        }
    };

    // Handle password change for a user
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!selectedUser || !newPassword) {
            toast.error('Please select a user and enter a new password.');
            return;
        }

        setPasswordChangeProcessing(true);
        try {
            const token = localStorage.getItem('accessToken'); // Corrected to accessToken
            if (!token) {
                throw new Error('Authentication token not found.');
            }
const response = await fetch(`https://crm-backend-mariadb.onrender.com/api/auth/reset-password/${selectedUser.id}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  credentials: 'include', // <-- ensures cookies are sent
  body: JSON.stringify({ newPassword }),
});


            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to change password: ${response.status}`);
            }

            toast.success(`Password for ${selectedUser.email} changed successfully!`);
            setShowPasswordModal(false);
            setSelectedUser(null);
            setNewPassword('');
        } catch (err) {
            toast.error(`Error changing password: ${err.message}`);
            console.error('Error changing password:', err);
        } finally {
            setPasswordChangeProcessing(false);
        }
    };

    return (
        <Container className="my-4">
            <h2 className="mb-4 text-start fw-bold" style={{ color: colors.darkText }}>
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
                    <p className="mb-2 fw-bold">Error Loading Users:</p>
                    <p className="mb-0">{error}</p>
                    <Button variant="light" className="mt-3" onClick={fetchUsers}>
                        <FiRefreshCw className="me-2" /> Retry
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
                                                    variant="info"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewPassword(''); // Clear password field
                                                        setShowPasswordModal(true);
                                                    }}
                                                    className="me-2"
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
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleteProcessing}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleteProcessing}>
                        {deleteProcessing ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            'Delete User'
                        )}
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