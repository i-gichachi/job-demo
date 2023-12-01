import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './UserContext'; 
import './JobpostingManagement.css';

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
                const response = await fetch(`/employer/${user.userId}/jobpostings`)
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
            const csrfResponse = await fetch('/csrf_token')
            const csrfData = await csrfResponse.json()

            const requestOptions = {
                method: 'DELETE',
                headers: { 'X-CSRFToken': csrfData.csrf_token },
            }
            const response = await fetch(`/jobposting/delete/${jobpostingId}`, requestOptions)
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
        const csrfResponse = await fetch('/csrf_token')
        const csrfData = await csrfResponse.json()

        const requestOptions = {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfData.csrf_token 
            },
            body: JSON.stringify(values)
        }

        const response = await fetch(`/jobposting/update/${selectedJobPosting.id}`, requestOptions);
        if (response.ok) {
            alert('Job posting updated successfully');
            setJobPostings(jobPostings.map(posting => (posting.id === selectedJobPosting.id ? values : posting)))
            handleModalClose()
        } else {
            alert('Failed to update job posting')
        }
        actions.setSubmitting(false)
    }

    return (
        <div>
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
                                <Button onClick={() => handleUpdate(posting)}>Update</Button>
                                <Button onClick={() => handleDelete(posting.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Job Posting</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Formik
                    initialValues={selectedJobPosting || {}}
                    validationSchema={jobPostingSchema}
                    onSubmit={handleUpdateSubmit}
                    enableReinitialize
                >
                    {({ handleSubmit, isSubmitting, handleChange, values }) => (
                            <Form onSubmit={handleSubmit}>
                                {/* Company Name as a label */}
                                <Form.Group>
                                    <Form.Label>Company Name</Form.Label>
                                    <Form.Label className="ml-2">{selectedJobPosting?.employer?.company_name}</Form.Label>
                                </Form.Group>

                                {/* Title */}
                                <Form.Group>
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control name="title" value={values.title} onChange={handleChange} />
                                </Form.Group>

                                {/* Description */}
                                <Form.Group>
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" name="description" value={values.description} onChange={handleChange} />
                                </Form.Group>

                                {/* Responsibilities */}
                                <Form.Group>
                                    <Form.Label>Responsibilities</Form.Label>
                                    <Form.Control as="textarea" name="responsibilities" value={values.responsibilities} onChange={handleChange} />
                                </Form.Group>

                                {/* Qualifications */}
                                <Form.Group>
                                    <Form.Label>Qualifications</Form.Label>
                                    <Form.Control as="textarea" name="qualifications" value={values.qualifications} onChange={handleChange} />
                                </Form.Group>

                                {/* Job Type */}
                                <Form.Group>
                                    <Form.Label>Job Type</Form.Label>
                                    <Form.Control as="select" name="job_type" value={values.job_type} onChange={handleChange}>
                                        <option value="">Select Job Type</option>
                                        <option value="full-time">Full-Time</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="contract">Contract</option>
                                    </Form.Control>
                                </Form.Group>

                                {/* Instructions */}
                                <Form.Group>
                                    <Form.Label>Instructions</Form.Label>
                                    <Form.Control as="textarea" name="instructions" value={values.instructions} onChange={handleChange} />
                                </Form.Group>

                                {/* Location */}
                                <Form.Group>
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control name="location" value={values.location} onChange={handleChange} />
                                </Form.Group>

                                {/* Salary Range */}
                                <Form.Group>
                                    <Form.Label>Salary Range Ksh:</Form.Label>
                                    <Form.Control name="salary_range" value={values.salary_range} onChange={handleChange} />
                                </Form.Group>

                                <Button variant="secondary" onClick={handleModalClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    Save Changes
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default JobPostingManagement
