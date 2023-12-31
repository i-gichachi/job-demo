import React, { useState, useEffect } from 'react';
import { FaUserTie, FaBell } from 'react-icons/fa';
import EmployerJobseekerView from './EmployerJobseekerProfile';
import EmployerProfile from './EmployerProfile';
import EmployerProfileManagement from './EmployerProfileManagement';
import JobPosting from './Jobposting';
import JobPostingManagement from './JobpostingManagement';
import AccountSettings from './AccountSetting';
import Notifications from './Notification';
import Logout from './Logout';
import EmployerSearch from './EmployerSearch'; 
import PaymentVerification from './PaymentVerification';
import { useUserContext } from './UserContext';
import './EmployerDashboard.css';

function EmployerDashboard() {
    const [hasProfile, setHasProfile] = useState(false);
    const [activeComponent, setActiveComponent] = useState('jobseekerView');
    const [selectedJobseekerId, setSelectedJobseekerId] = useState(null);
    const { user } = useUserContext();
    const [isVerified, setIsVerified] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const checkEmployerProfile = async () => {
            if (user && user.userId) {
                try {
                    const response = await fetch(`/employer/profile/${user.userId}`)
                    const profileData = await response.json();
                    if (response.ok) {
                        setHasProfile(true)
                        setIsVerified(profileData.is_verified);
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

    const handleViewProfile = (jobseekerId) => {
        setSelectedJobseekerId(jobseekerId);
        setActiveComponent('jobseekerProfile');
    };


    const onProfileCreated = () => {
        setHasProfile(true);
        setActiveComponent('paymentVerification');
    };

    const onPaymentSuccess = () => {
        setIsVerified(true);
        // Optionally redirect the user to a different component after successful payment
    };

    const renderComponent = () => {
        switch (activeComponent) {
            case 'employerProfile':
                return <EmployerProfile onProfileCreated={onProfileCreated} />;
            case 'employerProfileManagement':
                return <EmployerProfileManagement />;
            case 'jobPosting':
                return <JobPosting />;
            case 'jobPostingManagement':
                return <JobPostingManagement />;
            case 'accountSettings':
                return <AccountSettings />;
            case 'paymentVerification':
                return <PaymentVerification onPaymentSuccess={onPaymentSuccess} />;
            case 'notifications':
                return <Notifications onAllRead={handleAllNotificationsRead} />;
            case 'employerSearch':
                return <EmployerSearch onViewProfile={handleViewProfile} />;
            case 'jobseekerView':
            default:
                return <EmployerJobseekerView />;
        }
    };
    return (
        <div className="employer-dashboard">
            <header className="employer-navbar">
                <div className="brand-container">
                    {user && user.userType === 'employer' && <FaUserTie className="brand-icon"/>}
                    <span className="brand-name">{user ? user.username : 'Loading...'}</span>
                </div>
                <nav className="employer-nav">
                    <ul>
                        <li onClick={() => setActiveComponent('jobseekerView')}>Jobseeker Profiles</li>
                        {!hasProfile && (
                            <li onClick={() => setActiveComponent('employerProfile')}>Create Profile</li>
                        )}
                        {hasProfile && (
                            <>
                                <li onClick={() => setActiveComponent('employerProfileManagement')}>Manage Profile</li>
                                <li onClick={() => setActiveComponent('jobPosting')}>Create Job Posting</li>
                                <li onClick={() => setActiveComponent('jobPostingManagement')}>Manage Job Postings</li>
                            </>
                        )}
                        <li onClick={() => setActiveComponent('accountSettings')}>Account Settings</li>
                        <li onClick={() => setActiveComponent('paymentVerification')}>Payment Verification</li>
                        <li onClick={() => setActiveComponent('employerSearch')}>Search Jobseekers</li>
                    </ul>
                </nav>
                <div className="nav-right">
                    <div className="notification-icon" onClick={() => setActiveComponent('notifications')}>
                        <FaBell />
                        {unreadNotificationsCount > 0 && (
                            <span className="notification-count">{unreadNotificationsCount}</span>
                        )}
                    </div>
                    <Logout />
                </div>
            </header>
            <main>
                {renderComponent()}
            </main>
        </div>
    );
}

export default EmployerDashboard;