import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function Logout() {
    const [csrfToken, setCsrfToken] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch(`${API_URL}/csrf_token`)
                const data = await response.json()
                setCsrfToken(data.csrf_token)
            } catch (error) {
                console.error('Error fetching CSRF token:', error)
            }
        }

        fetchCsrfToken()
    }, [])

    const handleLogout = async () => {
        const confirmation = window.confirm("Are you sure you want to log out?")
        if (confirmation) {
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                };
                const response = await fetch(`${API_URL}/logout`, requestOptions)
                if (response.ok) {
                    alert('You have successfully logged out.')
                    navigate('/');
                } else {
                    alert('Logout failed. Please try again.')
                }
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Logout