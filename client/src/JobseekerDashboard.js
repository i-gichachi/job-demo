import React, { useState, useEffect } from 'react';
import { useUserContext } from './UserContext';
import AccountSettings from './AccountSetting';
import JobseekerProfile from './JobseekerProfile';
import JobpostingListing from './JobpostingList';
import SeekerProfileManagement from './SeekerProfileManagement';
import Notifications from './Notification';
import Logout from './Logout';
import { FaUser, FaBell, FaCheckCircle } from 'react-icons/fa';
import './JobseekerDashboard.css';

function JobseekerDashboard() {
    const [hasProfile, setHasProfile] = useState(false)
    const [activeComponent, setActiveComponent] = useState('')
    const [isVerified, setIsVerified] = useState(false);
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
            if (user && user.userId) {
                try {
                    const response = await fetch(`/jobseeker/profile/${user.userId}`);
                    const profileData = await response.json();
                    if (response.ok) {
                        setHasProfile(true);
                        setActiveComponent('jobPostings');
                        setIsVerified(profileData.is_verified);
                        console.log('Is verified:', isVerified); // Set verified status
                    } else {
                        setHasProfile(false);
                        setActiveComponent('createProfile');
                    }
                } catch (error) {
                    console.error('Error checking jobseeker profile:', error);
                }
            }
        };

        checkJobseekerProfile()
        fetchNotifications()
    }, [user])

    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/notifications/read/${notificationId}`, { method: 'PUT' });
            if (response.ok) {
                fetchNotifications();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

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
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="brand">
                    <FaUser className="brand-icon" />
                    <span className="brand-name">
                        {user ? user.username : 'Loading...'}
                        {isVerified && <FaCheckCircle className="verified-icon" />} 
                    </span>
                </div>
                <nav className="dashboard-nav">
                    <ul>
                        <li onClick={() => setActiveComponent('jobPostings')}>Job Postings</li>
                        {!hasProfile && (
                            <li onClick={() => setActiveComponent('createProfile')}>Create Profile</li>
                        )}
                        {hasProfile && (
                            <li onClick={() => setActiveComponent('manageProfile')}>Manage Profile</li>
                        )}
                        <li onClick={() => setActiveComponent('accountSettings')}>Account Settings</li>
                        <li onClick={() => {
                            setActiveComponent('notifications');
                            handleAllNotificationsRead();
                        }}>
                            <FaBell className="notification-icon" />
                            {unreadNotificationsCount > 0 && (
                                <span className="notification-count">{unreadNotificationsCount}</span>
                            )}
                        </li>
                    </ul>
                </nav>
                <Logout />
            </header>
            <main className="dashboard-main">
                {renderComponent()}
            </main>
        </div>
    );
}

export default JobseekerDashboard;