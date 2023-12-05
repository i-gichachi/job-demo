import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './UserContext';
import './SeekerProfileManagement.css';

const API_URL = process.env.REACT_APP_API_URL;

const JobseekerProfileSchema = Yup.object().shape({
    resume: Yup.string().required('Resume link is required'),
    profile_status: Yup.string().required('Profile status is required'),
    availability: Yup.string().required('Availability is required'),
    job_category: Yup.string().required('Job category is required'),
    salary_expectations: Yup.string().required('Salary expectations are required')
})

function SeekerProfileManagement() {
    const [editMode, setEditMode] = useState(false)
    const [profileData, setProfileData] = useState({
        resume: '',
        profile_status: '',
        availability: '',
        job_category: '',
        salary_expectations: ''
    })
    const [csrfToken, setCsrfToken] = useState('')
    const { user } = useUserContext()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const csrfResponse = await fetch(`${API_URL}/csrf_token`)
                if (csrfResponse.ok) {
                    const csrfData = await csrfResponse.json()
                    setCsrfToken(csrfData.csrf_token)
                } else {
                    console.error('Failed to fetch CSRF token')
                }

                if (user && user.userId) {
                    const profileResponse = await fetch(`${API_URL}/jobseeker/profile/${user.userId}`)
                    if (profileResponse.ok) {
                        const data = await profileResponse.json()
                        setProfileData(data)
                    } else {
                        console.error('Failed to fetch profile data')
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        fetchData()
    }, [user])

    const handleSubmit = async (values) => {
        if (values.profile_status === 'Inactive') {
            const confirmInactive = window.confirm("Setting your profile to 'Inactive' will make it invisible to employers. Are you sure you want to continue?");
            if (!confirmInactive) {
                return
            }
        }

        try {
            const requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(values)
            };

            if (user && user.userId) {
                const response = await fetch(`${API_URL}/jobseeker/profile/update/${user.userId}`, requestOptions)
                if (response.ok) {
                    alert('You have successfully updated your profile!')
                    setEditMode(false);
                    const updatedData = await response.json()
                    setProfileData(updatedData)
                } else {
                    alert('Update failed. Please try again.')
                }
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Update failed. Please try again.')
        }
    }

    const handleSalaryChange = (event, setFieldValue) => {
        const salary = event.target.value
        setFieldValue('salary_expectations', salary)
    }

    const editModeToggle = () => {
        setEditMode(!editMode)
    }

    return (
        <div className="jobseeker-profile-management-container">
            <h1>Jobseeker Profile Management</h1>
            <Formik
                initialValues={profileData}
                validationSchema={JobseekerProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ isSubmitting, setFieldValue }) => (
                    <Form>
                        {/* Profile Status */}
                        {/* Resume Link */}
                        <label htmlFor="resume">Resume:</label>
                        <Field type="text" name="resume" disabled={!editMode}/>
                        <ErrorMessage name="resume" component="div" />

                        <label htmlFor="profile_status">Profile Status:</label>
                        <Field as="select" name="profile_status" disabled={!editMode}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Field>
                        <ErrorMessage name="profile_status" component="div" />

                        {/* Availability */}
                        <label htmlFor="availability">Availability:</label>
                        <Field as="select" name="availability" disabled={!editMode}>
                            <option value="Available">Available</option>
                            <option value="Not-Available">Not-Available</option>
                        </Field>
                        <ErrorMessage name="availability" component="div" />

                        {/* Job Category */}
                        <label htmlFor="job_category">Job Category:</label>
                        <Field as="select" name="job_category" disabled={!editMode}>
                        <option value="">Select Job Category</option>
                                <option value="Healthcare and Medicine">Healthcare and Medicine</option>
                                <option value="Information Technology and Computer Science">Information Technology and Computer Science</option>
                                <option value="Education and Teaching">Education and Teaching</option>
                                <option value="Business and Finance">Business and Finance</option>
                                <option value="Engineering and Architecture">Engineering and Architecture</option>
                                <option value="Legal Services">Legal Services</option>
                                <option value="Arts, Design, and Entertainment">Arts, Design, and Entertainment</option>
                                <option value="Sales and Retail">Sales and Retail</option>
                                <option value="Manufacturing and Construction">Manufacturing and Construction</option>
                                <option value="Science and Research">Science and Research</option>
                                <option value="Hospitality and Tourism">Hospitality and Tourism</option>
                                <option value="Public Service and Administration">Public Service and Administration</option>
                                <option value="Agriculture and Forestry">Agriculture and Forestry</option>
                                <option value="Transportation and Logistics">Transportation and Logistics</option>
                                <option value="Skilled Trades">Skilled Trades</option>
                                <option value="Media and Communications">Media and Communications</option>
                        </Field>
                        <ErrorMessage name="job_category" component="div" />

                        {/* Salary Expectations */}
                        <label htmlFor="salary_expectations">Salary Expectations (Ksh)</label>
                        <Field 
                            name="salary_expectations"
                            disabled={!editMode}
                            onChange={(e) => handleSalaryChange(e, setFieldValue)}
                        />
                        <ErrorMessage name="salary_expectations" component="div" />

                        {/* Edit Mode Toggle */}
                        {editMode ? (
                            <>
                                <button type="submit" disabled={isSubmitting}>Save</button>
                                <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                            </>
                        ) : (
                            <button type="button" onClick={() => setEditMode(true)}>Update</button>
                        )}
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default SeekerProfileManagement