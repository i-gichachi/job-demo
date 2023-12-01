import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Badge, Dropdown } from 'react-bootstrap';
import { FaUserShield, FaBell } from 'react-icons/fa';
import AccountSettings from './AccountSetting';
import AdminContentModeration from './AdminContentModeration';
import AdminFileApproval from './AdminFileApproval';
import AdminUserManagement from './AdminUserManagement';
import Notifications from './Notification';
import Logout from './Logout';
import { useUserContext } from './UserContext';

function AdminDashboard() {
    const [activeComponent, setActiveComponent] = useState('userManagement')
    const { user } = useUserContext()
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        console.log("User Data: ", user)
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/notifications', { method: 'GET' })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    const markNotificationAsRead = (notificationId) => {
        setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
    }

    const renderComponent = () => {
        switch (activeComponent) {
            case 'accountSettings':
                return <AccountSettings />
            case 'contentModeration':
                return <AdminContentModeration />
            case 'fileApproval':
                return <AdminFileApproval />
            case 'userManagement':
                return <AdminUserManagement />
            case 'notifications':
                return <Notifications />
            default:
                return <div>Select a component</div>
        }
    }

    const unreadNotificationsCount = notifications.filter(n => !n.is_read).length

    return (
        <Container fluid>
            <div className="navbar-container">
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">
                    {user && user.userType === 'admin' && <FaUserShield />}
                    {user ? user.username : 'Loading...'}
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link onClick={() => setActiveComponent('accountSettings')}>Account Settings</Nav.Link>
                    <Nav.Link onClick={() => setActiveComponent('contentModeration')}>Content Moderation</Nav.Link>
                    <Nav.Link onClick={() => setActiveComponent('fileApproval')}>File Approval</Nav.Link>
                    <Nav.Link onClick={() => setActiveComponent('userManagement')}>User Management</Nav.Link>
                </Nav>
                <Nav>
                    <Dropdown>
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                            <FaBell />
                            {unreadNotificationsCount > 0 && (
                                <Badge pill variant="danger">{unreadNotificationsCount}</Badge>
                            )}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {notifications.map(notification => (
                                <Dropdown.Item 
                                    key={notification.id}
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    {notification.message}
                                    {!notification.is_read && <Badge pill variant="danger">New</Badge>}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
                <Logout />
            </Navbar>
            <div>
                {renderComponent()}
            </div>
            </div>
        </Container>
    );
}

export default AdminDashboard;