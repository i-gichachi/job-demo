import React, { useState, useEffect } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import { useUserContext } from './UserContext';
import './AdminUserManagement.css';


function AdminUserManagement() {
    const [users, setUsers] = useState([])
    const [csrfToken, setCsrfToken] = useState('')
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const { user } = useUserContext()

    useEffect(() => {
        if (user && user.userType === 'admin') {
            fetchCsrfToken()
            fetchUsers()
        }
    }, [user]); 

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch('/csrf_token')
            const data = await response.json()
            setCsrfToken(data.csrf_token)
        } catch (error) {
            console.error('Error fetching CSRF token:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch('/admin/users')
            if (response.ok) {
                const data = await response.json()
                setUsers(data.users || [])
            } else {
                console.error('Failed to fetch users')
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const response = await fetch(`/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    }
                });
                if (response.ok) {
                    setAlertMessage('User deleted successfully.')
                    setShowAlert(true)
                    fetchUsers()
                } else {
                    setAlertMessage('Failed to delete user. Please try again.')
                    setShowAlert(true);
                }
            } catch (error) {
                console.error('Error deleting user:', error)
            }
        }
    }

    return (
        <div>
            <h1>Admin User Management</h1>
            {showAlert && (
            <div className="custom-alert">
                <div className="alert-content">{alertMessage}</div>
                <button type="button" className="close-alert" onClick={() => setShowAlert(false)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            )}
            <div className="table-container">
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.type}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
        </div>
    );
}

export default AdminUserManagement