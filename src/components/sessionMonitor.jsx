// components/UserSessionMonitor.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Table } from 'react-bootstrap';
import { FiClock, FiUser, FiCalendar, FiRefreshCw, FiLogIn, FiLogOut, FiBarChart } from 'react-icons/fi';
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
  const [sessionData, setSessionData] = useState(null); // Will hold { date, users: [] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to calculate duration from start and end times
  const calculateDuration = (startTimeStr, endTimeStr) => {
    if (!startTimeStr) return 'N/A';
    const start = new Date(startTimeStr);
    let end;

    // Check if end_time is the epoch time or truly not provided
    if (!endTimeStr || endTimeStr === "1970-01-01T00:00:00.000Z") {
      // If end_time is not provided or is epoch, assume session is still active
      end = new Date(); // Current time
      const diffMs = end.getTime() - start.getTime();
      
      // Handle cases where start time is in the future or invalid
      if (isNaN(diffMs) || diffMs < 0) {
        return 'Invalid Time';
      }

      const diffSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;
      return (
        <span style={{ color: colors.secondary, fontWeight: 'bold' }}>
          Active: {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}m ` : ''}{seconds}s
        </span>
      );
    } else {
      end = new Date(endTimeStr);
    }

    const diffMs = end.getTime() - start.getTime();
    if (isNaN(diffMs) || diffMs < 0) {
      return 'Invalid Time';
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
  };

  const fetchSessionInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        toast.error('Authentication required to view session info.');
        setLoading(false);
        return;
      }

      const response = await fetch("http://localhost:5001/api/auth/user-session-info", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || `Failed to fetch session info: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data) { // Assuming the API returns the {date, users} object directly
        setSessionData(data);
        toast.success(`Session data for ${data.date} loaded successfully!`);
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
    <Container className="my-4">
      <h2 className="mb-4 text-center fw-bold" style={{ color: colors.darkText }}>
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
              {sessionData.users && sessionData.users.length > 0 ? (
                <Table striped bordered hover responsive className="mb-0 user-session-table">
                  <thead style={{ backgroundColor: colors.lightBackground }}>
                    <tr>
                      <th style={{ color: colors.darkText }}>User Email</th>
                      <th style={{ color: colors.darkText }}>Login Time</th>
                      <th style={{ color: colors.darkText }}>Logout Time</th>
                      <th style={{ color: colors.darkText }}>Time Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionData.users.map((userSession, index) => (
                      <tr key={index} style={{ color: colors.darkText }}>
                        <td><FiUser className="me-1" style={{ color: colors.primary }} />{userSession.user_email}</td>
                        <td><FiLogIn className="me-1" style={{ color: colors.secondary }} />{new Date(userSession.start_time).toLocaleString()}</td>
                        <td>
                          <FiLogOut className="me-1" style={{ color: colors.errorText }} />
                          {userSession.end_time && userSession.end_time !== "1970-01-01T00:00:00.000Z" 
                            ? new Date(userSession.end_time).toLocaleString() 
                            : 'Active'}
                        </td>
                        <td>
                          {calculateDuration(userSession.start_time, userSession.end_time)}
                        </td>
                      </tr>
                    ))}
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