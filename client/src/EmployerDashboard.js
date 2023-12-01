import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Row, Col, Badge } from 'react-bootstrap';
import { FaUserTie, FaBell } from 'react-icons/fa';
import EmployerJobseekerView from './EmployerJobseekerProfile';
import EmployerProfile from './EmployerProfile';
import EmployerProfileManagement from './EmployerProfileManagement';
import JobPosting from './Jobposting';
import JobPostingManagement from './JobpostingManagement';
import AccountSettings from './AccountSetting';
import Notifications from './Notification';
import Logout from './Logout';
import PaymentVerification from './PaymentVerification';
import { useUserContext } from './UserContext';
import './EmployerDashboard.css';

function EmployerDashboard() {
    const [hasProfile, setHasProfile] = useState(false)
    const [activeComponent, setActiveComponent] = useState('jobseekerView')
    const { user } = useUserContext()
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const checkEmployerProfile = async () => {
            if (user && user.userId) {
                try {
                    const response = await fetch(`/employer/profile/${user.userId}`)
                    if (response.ok) {
                        setHasProfile(true)
                    } else {
                        setHasProfile(false)
                    }
                } catch (error) {
                    console.error('Error checking employer profile:', error)
                }
            }
        };

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

        checkEmployerProfile()
        fetchNotifications()
    }, [user])

    const handleAllNotificationsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    };

    const unreadNotificationsCount = notifications.filter(n => !n.is_read).length

    const renderComponent = () => {
        switch (activeComponent) {
            case 'employerProfile':
                return <EmployerProfile onProfileCreated={() => setHasProfile(true)} />
            case 'employerProfileManagement':
                return <EmployerProfileManagement />
            case 'jobPosting':
                return <JobPosting />
            case 'jobPostingManagement':
                return <JobPostingManagement />
            case 'accountSettings':
                return <AccountSettings />
            case 'paymentVerification':
                return <PaymentVerification />
            case 'notifications':
                return <Notifications onAllRead={handleAllNotificationsRead} />
            case 'jobseekerView':
            default:
                return <EmployerJobseekerView />
        }
    };

    return (
        <Container>
            <Navbar bg="light" expand="lg">
            <Navbar.Brand href="#home">
                    {user && user.userType === 'employer' && <FaUserTie />}
                    {' '}
                    {user ? user.username : 'Loading...'}
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="employer-navbar-nav" />
                <Navbar.Collapse id="employer-navbar-nav">
                    <Nav className="ml-auto">
                    <Nav.Link onClick={() => setActiveComponent('jobseekerView')}>Jobseeker Profiles</Nav.Link>
                       {!hasProfile && (
                        <Nav.Link onClick={() => setActiveComponent('employerProfile')}>Create Profile</Nav.Link>
                    )}
                    {hasProfile && (
                        <>
                            <Nav.Link onClick={() => setActiveComponent('employerProfileManagement')}>Manage Profile</Nav.Link>
                                <Nav.Link onClick={() => setActiveComponent('jobPosting')}>Create Job Posting</Nav.Link>
                                <Nav.Link onClick={() => setActiveComponent('jobPostingManagement')}>Manage Job Postings</Nav.Link>
                            </>
                        )}
                        <Nav.Link onClick={() => setActiveComponent('accountSettings')}>Account Settings</Nav.Link>
                        <Nav.Link onClick={() => setActiveComponent('paymentVerification')}>Payment Verification</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link onClick={() => setActiveComponent('notifications')}>
                            <FaBell />
                            {unreadNotificationsCount > 0 && (
                                <Badge pill variant="danger">{unreadNotificationsCount}</Badge>
                            )}
                        </Nav.Link>
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
    );
}

export default EmployerDashboard