import React, { useState, useEffect } from 'react';
import { useUserContext } from './UserContext';
import AccountSettings from './AccountSetting';
import JobseekerProfile from './JobseekerProfile';
import JobpostingListing from './JobpostingList';
import SeekerProfileManagement from './SeekerProfileManagement';
import Notifications from './Notification';
import Logout from './Logout';
import { Navbar, Nav, Container, Row, Col, Badge } from 'react-bootstrap';
import { FaUser, FaBell } from 'react-icons/fa';

function JobseekerDashboard() {
    const [hasProfile, setHasProfile] = useState(false)
    const [activeComponent, setActiveComponent] = useState('')
    const { user } = useUserContext()
    const [notifications, setNotifications] = useState([])

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/notifications', { method: 'GET' })
            if (response.ok) {
                const data = await response.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    useEffect(() => {
        const checkJobseekerProfile = async () => {
            try {
                if (user && user.userId) {
                    const response = await fetch(`/jobseeker/profile/${user.userId}`)
                    if (response.ok) {
                        setHasProfile(true)
                        setActiveComponent('jobPostings')
                    } else {
                        setHasProfile(false)
                        setActiveComponent('createProfile')
                    }
                }
            } catch (error) {
                console.error('Error checking jobseeker profile:', error)
            }
        }

        checkJobseekerProfile()
        fetchNotifications()
    }, [user])

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/notifications/read/${notificationId}`, { method: 'PUT' })
            if (response.ok) {
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const handleAllNotificationsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    }

    const renderComponent = () => {
        switch (activeComponent) {
            case 'createProfile':
                return hasProfile ? null : <JobseekerProfile onProfileCreated={() => setHasProfile(true)} />
            case 'manageProfile':
                return <SeekerProfileManagement />
            case 'accountSettings':
                return <AccountSettings />
            case 'notifications':
                return <Notifications onAllRead={handleAllNotificationsRead} />
            case 'jobPostings':
            default:
                return <JobpostingListing />
        }
    }

    const unreadNotificationsCount = notifications.filter(n => !n.is_read).length;

    return (
        <Container>
            <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home">
                    {user && user.userType === 'jobseeker' && <FaUser />}
                    {' '}
                    {user ? user.username : 'Loading...'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="jobseeker-navbar-nav" />
                <Navbar.Collapse id="jobseeker-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link onClick={() => setActiveComponent('jobPostings')}>Job Postings</Nav.Link>
                            {!hasProfile && (
                        <Nav.Link onClick={() => setActiveComponent('createProfile')}>Create Profile</Nav.Link>
                            )}
                            {hasProfile && (
                        <Nav.Link onClick={() => setActiveComponent('manageProfile')}>Manage Profile</Nav.Link>
                            )}
                        <Nav.Link onClick={() => setActiveComponent('accountSettings')}>Account Settings</Nav.Link>
                        <Nav.Link onClick={() => setActiveComponent('notifications')}>
                            <FaBell />
                            {unreadNotificationsCount > 0 && (
                                <Badge pill variant="danger">{unreadNotificationsCount}</Badge>
                            )}
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        <Logout />
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            <Row>
                <Col md={12}>
                    {renderComponent()}
                </Col>
            </Row>
        </Container>
    )
}

export default JobseekerDashboard