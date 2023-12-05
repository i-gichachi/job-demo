import React, { useState, useEffect } from 'react';
import { FaUser, FaCheckCircle, FaTimesCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { useUserContext } from './UserContext';
import './EmployerJobseekerProfile.css'

const API_URL = process.env.REACT_APP_API_URL;

function EmployerJobseekerView() {
    const [jobseekers, setJobseekers] = useState([])
    const [selectedJobseeker, setSelectedJobseeker] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [contactMessage, setContactMessage] = useState("")
    const [csrfToken, setCsrfToken] = useState('')
    const { user } = useUserContext()

    useEffect(() => {
        fetchCsrfToken();
        if (user && user.userType === 'employer') {
            fetchJobseekers()
        }
    }, [user])

    const fetchCsrfToken = async () => {
        try {
            const response = await fetch(`${API_URL}/csrf_token`)
            const data = await response.json()
            setCsrfToken(data.csrf_token)
        } catch (error) {
            console.error('Error fetching CSRF token:', error)
        }
    };

    const fetchJobseekers = async () => {
        try {
            const response = await fetch(`${API_URL}/jobseekers/view`)
            if (response.ok) {
                const data = await response.json()
                setJobseekers(data.jobseekers)
            } else {
                console.error('Failed to fetch jobseekers')
            }
        } catch (error) {
            console.error('Error fetching jobseekers:', error)
        }
    }

    const handleViewProfile = (jobseeker) => {
        setSelectedJobseeker(jobseeker)
        setShowModal(true)
    }

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/jobseeker/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ 
                    jobseeker_id: selectedJobseeker.id,
                    message: contactMessage
                })
            });
            if (response.ok) {
                alert('Contact request sent successfully')
                setShowModal(false);
            } else {
                alert('Failed to send contact request')
            }
        } catch (error) {
            console.error('Error sending contact request:', error)
        }
    };

    const VerifiedIcon = ({ isVerified }) => (
        isVerified ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />
    );

    const handleCloseModal = () => {
        setShowModal(false);
        setContactMessage(''); // Reset the contact message
    };

    return (
        <div className="jobseeker-view-container">
            <div className="jobseeker-cards-container">
                {jobseekers.map(jobseeker => (
                    <div key={jobseeker.id} className="jobseeker-card">
                        <div className="jobseeker-image">
                            <FaUser />
                        </div>
                        <div className="jobseeker-info">
                            <h2>
                                {jobseeker.username} <VerifiedIcon isVerified={jobseeker.is_verified} />
                            </h2>
                            <p>Status: {jobseeker.profile_status}</p>
                            <p>Salary Expectations: Ksh {jobseeker.salary_expectations}</p>
                            <button className="view-profile-btn" onClick={() => handleViewProfile(jobseeker)}>
                                View Profile
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="jobseeker-profile-modal">
                    <div className="modal-content">
                    <span className="close" onClick={handleCloseModal}>&times;</span>
                        <h1>{selectedJobseeker?.username}'s Profile</h1>
                        <p>Availability: {selectedJobseeker?.availability}</p>
                        <p>Job Category: {selectedJobseeker?.job_category}</p>
                        <p>Salary Expectations: Ksh {selectedJobseeker?.salary_expectations}</p>
                        <p>
                            Resume: {selectedJobseeker?.resume ? 
                                <a href={selectedJobseeker.resume} target="_blank" rel="noopener noreferrer">
                                    View <FaExternalLinkAlt />
                                </a> : "Not Provided"
                            }
                        </p>
                        <form className="contact-form" onSubmit={handleContactSubmit}>
                            <label htmlFor="message">Message</label>
                            <textarea 
                                id="message"
                                rows="3" 
                                value={contactMessage} 
                                onChange={(e) => setContactMessage(e.target.value)} 
                                required 
                            />
                            <button className="send-contact-btn" type="submit">
                                Send Contact Request
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployerJobseekerView;