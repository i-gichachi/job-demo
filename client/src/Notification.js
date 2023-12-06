import React, { useState, useEffect } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import './Notification.css';

function Notifications({ onAllRead }) {
    const [notifications, setNotifications] = useState([])
    const [csrfToken, setCsrfToken] = useState('')

    useEffect(() => {
        fetchCsrfToken()
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, [])

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch('/csrf_token')
            if (response.ok) {
                const data = await response.json()
                setCsrfToken(data.csrf_token)
            }
        } catch (error) {
            console.error('Error fetching CSRF token:', error)
        }
    }

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/notifications', { method: 'GET' })
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const response = await fetch(`/notifications/read/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
            });
            if (response.ok) {
                fetchNotifications()
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        for (const notification of unreadNotifications) {
            await markAsRead(notification.id);
        }
        onAllRead(); // This will update the state in the parent component
    };
    
    return (
        <div>
            <h2>Notifications</h2>
            {notifications.length === 0 && <p>No new notifications at the moment.</p>}
            <ListGroup>
                {notifications.map(notification => (
                    <ListGroup.Item key={notification.id} variant={notification.is_read ? "light" : "info"}>
                        {notification.message}
                        {!notification.is_read && (
                            <Button variant="primary" size="sm" onClick={() => markAsRead(notification.id)} style={{ float: 'right' }}>
                                Mark as Read
                            </Button>
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            {notifications.some(n => !n.is_read) && (
                <Button variant="secondary" onClick={onAllRead} style={{ marginTop: '10px' }}>
                    Mark All as Read
                </Button>
            )}
        </div>
    )
}


export default Notifications