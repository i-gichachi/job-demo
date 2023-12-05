import React, { useState, useEffect } from 'react';
import { Button, Table, Alert } from 'react-bootstrap';
import './AdminFileApproval.css';

const API_URL = process.env.REACT_APP_API_URL;

function AdminFileApproval() {
    const [jobseekers, setJobseekers] = useState([])
    const [showAlert, setShowAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState('')
    const [csrfToken, setCsrfToken] = useState('')

    useEffect(() => {
        fetchCsrfToken()
        fetchPendingJobseekers()
    }, []);

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch(`${API_URL}/csrf_token`)
            const data = await response.json()
            setCsrfToken(data.csrf_token)
        } catch (error) {
            console.error('Error fetching CSRF token:', error)
        }
    };

    const fetchPendingJobseekers = async () => {
        try {
            const response = await fetch(`${API_URL}/admin/jobseekers`)
            if (response.ok) {
                const data = await response.json();
                setJobseekers(data.jobseekers.filter(j => j.file_approval_status === 'pending' || j.file_approval_status === 'rejected'))
            } else {
                console.error('Failed to fetch jobseekers')
            }
        } catch (error) {
            console.error('Error fetching jobseekers:', error)
        }
    }

    const handleApproval = async (jobseekerId, status) => {
        try {
            const response = await fetch(`${API_URL}/jobseeker/file-approval/${jobseekerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ approval_status: status })
            });
            if (response.ok) {
                setAlertMessage(`Jobseeker's file has been ${status}.`)
                setShowAlert(true)
                fetchPendingJobseekers()
            } else {
                setAlertMessage('Failed to update status. Please try again.')
                setShowAlert(true)
            }
        } catch (error) {
            console.error('Error updating file approval status:', error)
        }
    }

    return (
        <div>
            <h1>Admin File Approval</h1>
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
                        <th>Username</th>
                        <th>Resume</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobseekers.map(jobseeker => (
                        <tr key={jobseeker.id}>
                            <td>{jobseeker.username}</td>
                            <td>
                                <a href={jobseeker.resume} target="_blank" rel="noopener noreferrer">View Resume</a>
                            </td>
                            <td>{jobseeker.file_approval_status}</td>
                            <td>
                                <Button variant="success" onClick={() => handleApproval(jobseeker.id, 'approved')}>Approve</Button>
                                {' '}
                                <Button variant="danger" onClick={() => handleApproval(jobseeker.id, 'rejected')}>Reject</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
        </div>
    );
}

export default AdminFileApproval