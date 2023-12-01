import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaLock, FaHome } from 'react-icons/fa';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from './UserContext';
import './Login.css';

const Login = () => {
    const [loginError, setLoginError] = useState('')
    const [csrfToken, setCsrfToken] = useState('')
    const navigate = useNavigate()
    const { setUser } = useUserContext()

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch('/csrf_token')
                const data = await response.json()
                setCsrfToken(data.csrf_token)
            } catch (error) {
                console.error('Error fetching CSRF token:', error)
            }
        }

        fetchCsrfToken()
    }, [])

    const formik = useFormik({
        initialValues: {
            userIdentifier: '',
            password: ''
        },
        validationSchema: Yup.object({
            userIdentifier: Yup.string().required('Required'),
            password: Yup.string().required('Required')
        }),
        onSubmit: async (values) => {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({
                        user_identifier: values.userIdentifier,
                        password: values.password
                    })
                })
                const data = await response.json();
                console.log(data)
                if (data.message === 'Logged in successfully') {

                    setUser({ 
                        userType: data.user_type, 
                        username: data.username, 
                        userId: data.user_id 
                    });

                    alert('You have successfully logged in!')
                    redirectToDashboard(data.user_type)
                } else {
                    setLoginError(data.message)
                }
            } catch (error) {
                console.error('Error:', error)
                setLoginError('Failed to login')
            }
        }
    })

    const redirectToDashboard = (userType) => {
        switch (userType) {
            case 'admin':
                navigate('/admin-dashboard')
                break;
            case 'employer':
                navigate('/employer-dashboard')
                break;
            case 'jobseeker':
                navigate('/jobseeker-dashboard')
                break;
            default:
                setLoginError('Invalid user type')
        }
    }
    
    return (
        <div className="login-form">
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home"><FaHome /> Home</Navbar.Brand>
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                </Nav>
            </Navbar>
            <h2>Login</h2>
            <form onSubmit={formik.handleSubmit}>
                <div className="form-group">
                    <FaUser />
                    <input
                        type="text"
                        name="userIdentifier"
                        placeholder="Email/Username/Phone"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.userIdentifier}
                    />
                    {formik.touched.userIdentifier && formik.errors.userIdentifier ? (
                        <div className="error">{formik.errors.userIdentifier}</div>
                    ) : null}
                </div>
                <div className="form-group">
                    <FaLock />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div className="error">{formik.errors.password}</div>
                    ) : null}
                </div>
                <button type="submit" className="login-button">Login</button>
                {loginError && <div className="error-message">{loginError}</div>}
            </form>
        </div>
    )
}

export default Login