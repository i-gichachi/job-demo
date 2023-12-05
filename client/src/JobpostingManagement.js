import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './UserContext';
import './JobpostingManagement.css';

const API_URL = process.env.REACT_APP_API_URL;

const jobPostingSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    responsibilities: Yup.string().required('Responsibilities are required'),
    instructions: Yup.string().required('Instructions are required'),
    location: Yup.string().required('Location is required'),
    salary_range: Yup.string().required('Salary range is required'),
    qualifications: Yup.string().required('Qualifications are required'),
    job_type: Yup.string().required('Job Type is required'),
})

function JobPostingManagement() {
    const [jobPostings, setJobPostings] = useState([])
    const [selectedJobPosting, setSelectedJobPosting] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const { user } = useUserContext()

    useEffect(() => {
        const fetchJobPostings = async () => {
            if (user && user.userType === 'employer') {
                const response = await fetch(`${API_URL}/employer/${user.userId}/jobpostings`)
                if (response.ok) {
                    const data = await response.json()
                    setJobPostings(data.postings)
                }
            }
        }

        fetchJobPostings()
    }, [user])

    const handleUpdate = (posting) => {
        setSelectedJobPosting(posting)
        setShowModal(true)
    }

    const handleDelete = async (jobpostingId) => {
        if (window.confirm('Are you sure you want to delete this job posting?')) {
            const csrfResponse = await fetch(`${API_URL}/csrf_token`)
            const csrfData = await csrfResponse.json()

            const requestOptions = {
                method: 'DELETE',
                headers: { 'X-CSRFToken': csrfData.csrf_token },
            }
            const response = await fetch(`${API_URL}/jobposting/delete/${jobpostingId}`, requestOptions)
            if (response.ok) {
                alert('Job posting deleted successfully')
                setJobPostings(jobPostings.filter(posting => posting.id !== jobpostingId))
            } else {
                alert('Failed to delete job posting')
            }
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setSelectedJobPosting(null)
    }

    const handleUpdateSubmit = async (values, actions) => {
        const csrfResponse = await fetch(`${API_URL}/csrf_token`)
        const csrfData = await csrfResponse.json()

        const requestOptions = {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfData.csrf_token 
            },
            body: JSON.stringify(values)
        }

    const response = await fetch(`${API_URL}/jobposting/update/${selectedJobPosting.id}`, requestOptions);
        if (response.ok) {
            alert('Job posting updated successfully');
            setJobPostings(jobPostings.map(posting => (posting.id === selectedJobPosting.id ? values : posting)))
            handleModalClose()
        } else {
            alert('Failed to update job posting')
        }
        actions.setSubmitting(false)
    }

    const renderUpdateModal = (selectedJobPosting) => {
        if (!selectedJobPosting) return null; // Render nothing if no posting is selected
    
        return (
            <div className="overlay">
                <div className="modal-content">
                    <span className="close" onClick={handleModalClose}>&times;</span>
                    <h2>Update Job Posting</h2>
                    <Formik
                        initialValues={selectedJobPosting}
                        validationSchema={jobPostingSchema}
                        onSubmit={handleUpdateSubmit}
                        enableReinitialize
                    >
                        {({ handleSubmit, isSubmitting, handleChange, values }) => (
                            <Form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="title">Title</label>
                                    <Field name="title" type="text" />
                                    <ErrorMessage name="title" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <Field name="description" as="textarea" />
                                    <ErrorMessage name="description" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="responsibilities">Responsibilities</label>
                                    <Field name="responsibilities" as="textarea" />
                                    <ErrorMessage name="responsibilities" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="qualifications">Qualifications</label>
                                    <Field name="qualifications" as="textarea" />
                                    <ErrorMessage name="qualifications" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="instructions">How to Apply</label>
                                    <Field name="instructions" as="textarea" />
                                    <ErrorMessage name="instructions" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="job_type">Job Type</label>
                                    <Field name="job_type" as="select">
                                        <option value="">Select Job Type</option>
                                        <option value="full-time">Full-Time</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="contract">Contract</option>
                                    </Field>
                                    <ErrorMessage name="job_type" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="location">Location</label>
                                    <Field name="location" type="text" />
                                    <ErrorMessage name="location" component="div" />
                                </div>
    
                                <div className="form-group">
                                    <label htmlFor="salary_range">Salary Range (Ksh)</label>
                                    <Field name="salary_range" type="text" />
                                    <ErrorMessage name="salary_range" component="div" />
                                </div>
    
                                <div className="form-buttons">
                                    <button type="button" onClick={handleModalClose}>Cancel</button>
                                    <button type="submit" disabled={isSubmitting}>Save Changes</button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        );
    };
    
    return (
        <div className="job-posting-management">
            <h1>Job Posting Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                        {jobPostings.map((posting) => (
                            <tr key={posting.id}>
                            <td>{posting.title}</td>
                            <td>{posting.description}</td>
                            <td>
                        <button onClick={() => handleUpdate(posting)}>Update</button>
                        <button onClick={() => handleDelete(posting.id)}>Delete</button>
                    </td>
                    </tr>
                    ))}
                    </tbody>

                {showModal && renderUpdateModal(selectedJobPosting)}
            </table>

            {renderUpdateModal()}
        </div>
    );
}

export default JobPostingManagement;
