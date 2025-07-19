// components/UserSessionMonitor.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { FiClock, FiUser, FiCalendar, FiRefreshCw, FiLogIn, FiLogOut } from 'react-icons/fi'; // Removed FiBarChart as it's not used
import { toast } from 'react-toastify';

// Define the beautiful color palette (copy from your SalesHistory component)
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

const UserSessionMonitor = () => {
    // sessionData will now hold the full object: { date, sessions: [] }
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to format duration from milliseconds to HHh MMm
    const formatDurationInHrsMins = (ms) => {
        if (typeof ms !== 'number' || isNaN(ms) || ms < 0) {
            return 'N/A';
        }

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        let durationString = '';
        if (hours > 0) {
            durationString += `${hours}h `;
        }
        durationString += `${minutes}m`; 

        return durationString.trim();
    };

    
     
    const getUserStatus = (session) => {
        if (session.status === 'Active') {
            return { status: 'Active', icon: <FiLogIn style={{ color: colors.secondary }} /> };
        } else if (session.status === 'Logged Out') {
            return { status: 'Logged Out', icon: <FiLogOut style={{ color: colors.errorText }} /> };
        }
        // Default for any unexpected status
        return { status: 'Unknown', icon: <FiUser style={{ color: colors.placeholderText }} /> };
    };

    const fetchSessionInfo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('accessToken');

            if (!token) {
                setError('Authentication token not found. Please log in.');
                toast.error('Authentication required to view session info.');
                setLoading(false);
                return;
            }

            const response = await fetch("https://crm-backend-mariadb.onrender.com/api/auth/user-session-info", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Failed to fetch session info: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            if (data) {
                // The API now returns { date: "YYYY-MM-DD", sessions: [{ user_email, date, totalMs, status }] }
                setSessionData(data);
                toast.success(`Session data for ${data.date ? new Date(data.date).toLocaleDateString() : 'today'} loaded successfully!`);
            } else {
                setError('No session data found.');
                toast.warn('No session data available for this date.');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred while fetching session data.');
            toast.error(`Error: ${err.message || 'Failed to fetch session data.'}`);
            console.error('Error fetching session data:', err);
        } finally {
            setLoading(false);
        }
    }, []); // useCallback to memoize the function

    useEffect(() => {
        fetchSessionInfo();
    }, [fetchSessionInfo]); // Dependency on fetchSessionInfo

    return (
        <Container className="py-5">
            <h2 className="mb-4 text-start py-3 fw-bold" style={{ color: colors.darkText }}>
                <FiClock className="me-2" style={{ color: colors.primary }} />User Session Monitor
            </h2>

            {loading && (
                <div className="text-center my-5">
                    <Spinner animation="border" style={{ color: colors.primary }} role="status">
                        <span className="visually-hidden">Loading session data...</span>
                    </Spinner>
                    <p className="mt-3" style={{ color: colors.placeholderText }}>Fetching user session data...</p>
                </div>
            )}

            {error && (
                <Alert variant="danger" className="text-center my-4" style={{ backgroundColor: colors.errorText, color: colors.cardBackground, borderColor: colors.errorText }}>
                    <p className="mb-2 fw-bold">Error Loading Session Data:</p>
                    <p className="mb-0">{error}</p>
                    <Button variant="light" className="mt-3" onClick={fetchSessionInfo}>
                        <FiRefreshCw className="me-2" />Retry
                    </Button>
                </Alert>
            )}

            {!loading && !error && sessionData && (
                <>
                    <Card className="mb-4 shadow-sm" style={{ backgroundColor: colors.cardBackground, borderColor: colors.borderColor }}>
                        <Card.Header style={{ backgroundColor: colors.lightBackground, borderBottomColor: colors.borderColor }}>
                            <h5 className="mb-0 fw-semibold" style={{ color: colors.darkText }}>
                                <FiCalendar className="me-2" style={{ color: colors.primary }} />
                                Sessions for: {sessionData.date ? new Date(sessionData.date).toLocaleDateString() : 'N/A'}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {sessionData.sessions && sessionData.sessions.length > 0 ? (
                                <Table striped bordered hover responsive className="mb-0 user-session-table">
                                    <thead style={{ backgroundColor: colors.lightBackground }}>
                                        <tr>
                                            <th style={{ color: colors.darkText }}>User Email</th>
                                            <th style={{ color: colors.darkText }}>Date</th>
                                            <th style={{ color: colors.darkText }}>Status</th>
                                            <th style={{ color: colors.darkText }}>Total Duration (H M)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessionData.sessions.map((session, index) => {
                                            const statusInfo = getUserStatus(session);
                                            return (
                                                <tr key={index} style={{ color: colors.darkText }}>
                                                    <td><FiUser className="me-1" style={{ color: colors.primary }} />{session.user_email}</td>
                                                    <td><FiCalendar className="me-1" style={{ color: colors.secondary }} />{new Date(session.date).toLocaleDateString()}</td>
                                                    <td>{statusInfo.icon} {statusInfo.status}</td>
                                                    <td><FiClock className="me-1" style={{ color: colors.errorText }} />{formatDurationInHrsMins(session.totalMs)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            ) : (
                                <p className="text-center text-muted">No user sessions recorded for this date.</p>
                            )}
                        </Card.Body>
                    </Card>
                </>
            )}

            {!loading && !error && !sessionData && (
                <p className="text-center text-muted">No session data available.</p>
            )}
        </Container>
    );
};

export default UserSessionMonitor;