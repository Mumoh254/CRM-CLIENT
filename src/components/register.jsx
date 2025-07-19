import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUserPlus,
  FiLock,
  FiMail,
  FiCheckCircle,
  FiUser, // Keep for general user icon if needed, but not for "Name" field anymore
  FiLoader,
  FiUserCheck // For role selection
} from 'react-icons/fi';
import axios from 'axios';
import styled, { keyframes } from 'styled-components';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

// --- Stock Link Color Palette ---
const colors = {
  primary: '#FF4532', // Stock Link Red
  secondary: '#00C853', // Stock Link Green (used for success messages)
  darkText: '#1A202C', // Dark text for headings
  lightBackground: '#F0F2F5', // Light background for the page
  cardBackground: '#FFFFFF', // White for the form card
  borderColor: '#D1D9E6', // Light border for inputs
  errorText: '#EF4444', // Red for errors
  placeholderText: '#A0AEC0', // Muted text for placeholders
  buttonHover: '#E6392B', // Darker red on button hover
  disabledButton: '#CBD5E1', // Gray for disabled buttons
};

// --- Animations ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components (Updated) ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.lightBackground};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const AuthContainer = styled.div`
  max-width: 450px;
  width: 100%;
  padding: 2.5rem;
  background: ${colors.cardBackground};
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 2.5rem;
  .icon {
    font-size: 3.5rem;
    color: ${colors.primary};
    margin-bottom: 1rem;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    color: ${colors.darkText};
  }
  p {
    font-size: 1rem;
    color: ${colors.placeholderText};
    margin-top: 0.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  color: ${colors.placeholderText};
  font-size: 1.2rem;
`;

const InputField = styled(Field)`
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  transition: all 0.3s ease;

  &::placeholder {
    color: ${colors.placeholderText};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.9rem 1.2rem 0.9rem 3rem;
  border: 1px solid ${colors.borderColor};
  border-radius: 10px;
  font-size: 1.05rem;
  color: ${colors.darkText};
  background-color: ${colors.lightBackground};
  appearance: none;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 69, 50, 0.2);
    background-color: ${colors.cardBackground};
  }
`;

const ErrorText = styled.div`
  color: ${colors.errorText};
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: left;
`;

const SuccessText = styled.div`
  color: ${colors.secondary}; /* Use secondary color (green) for success */
  font-size: 0.95rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem; /* Added margin to separate from button */
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: ${colors.primary};
  color: ${colors.cardBackground};
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;

  &:hover {
    background: ${colors.buttonHover};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.disabledButton};
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: ${colors.darkText};

  a {
    color: ${colors.secondary};
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
    &:hover {
      color: #00B247;
      text-decoration: underline;
    }
  }
`;

// --- Validation Schema (Updated) ---
const validationSchema = Yup.object().shape({
  Email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  Role: Yup.string()
    .required('Role is required')
    .oneOf(['admin', 'user'], 'Invalid role selection'), // Added role validation
  Password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  ConfirmPassword: Yup.string()
    .oneOf([Yup.ref('Password'), null], 'Passwords must match')
    .required('Confirm Password is required')
});

const BASE_URL = "https://96b79e8529ca.ngrok-free.app/api";

const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setServerError('');
      setRegistrationSuccess(false);

      const response = await axios.post(`${BASE_URL}/auth/register`, {
        email: values.Email,
        role: values.Role, // Send the selected role
        password: values.Password,
      });

      if (response.status === 201 || response.status === 200) {
        localStorage.setItem('token', response.data.token);
        setRegistrationSuccess(true);
        resetForm();
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setServerError(response.data?.message || 'Registration failed with an unexpected status.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setServerError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <AuthContainer>
        <Header>
          <FiUserPlus className="icon" />
          <h1>Join Stock Link</h1>
          <p>Create your account to start managing your inventory efficiently.</p>
        </Header>

        <Formik
          initialValues={{
            Email: '',
            Role: '', // Added Role to initial values
            Password: '',
            ConfirmPassword: ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Email Field */}
              <FormGroup>
                <IconWrapper><FiMail /></IconWrapper>
                <InputField name="Email" type="email" placeholder="Email" />
                <ErrorMessage name="Email" component={ErrorText} />
              </FormGroup>

              {/* Role Field */}
              <FormGroup>
                <IconWrapper><FiUserCheck /></IconWrapper>
                <Field name="Role" as={SelectField}>
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Field>
                <ErrorMessage name="Role" component={ErrorText} />
              </FormGroup>

              {/* Password Field */}
              <FormGroup>
                <IconWrapper><FiLock /></IconWrapper>
                <InputField name="Password" type="password" placeholder="Password" />
                <ErrorMessage name="Password" component={ErrorText} />
              </FormGroup>

              {/* Confirm Password Field */}
              <FormGroup>
                <IconWrapper><FiCheckCircle /></IconWrapper>
                <InputField name="ConfirmPassword" type="password" placeholder="Confirm Password" />
                <ErrorMessage name="ConfirmPassword" component={ErrorText} />
              </FormGroup>

              {serverError && <ErrorText style={{ marginBottom: '1rem' }}>{serverError}</ErrorText>}
              {registrationSuccess && (
                <SuccessText>
                  <FiCheckCircle /> Successfully registered! Redirecting to login...
                </SuccessText>
              )}

              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Create Stock Link Account'
                )}
              </SubmitButton>

              <LinkText>
                Already have an account?{' '}
                <Link to="/login">
                  Login here
                </Link>
              </LinkText>
            </Form>
          )}
        </Formik>
      </AuthContainer>
    </PageWrapper>
  );
};

export default Register;
