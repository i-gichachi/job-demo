import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useUserContext } from './UserContext';
import './EmployerProfile.css';

const API_URL = process.env.REACT_APP_API_URL;

function EmployerProfile(props) {
    const [csrfToken, setCsrfToken] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const { user } = useUserContext()

    useEffect(() => {
        const fetchCsrfToken = async () => {
            try {
                const response = await fetch(`${API_URL}/csrf_token`)
                const data = await response.json()
                setCsrfToken(data.csrf_token)
            } catch (error) {
                console.error('Error fetching CSRF token:', error)
            }
        }

        fetchCsrfToken()
    }, [])

    const handleSubmit = async (values) => {
        const employerProfileData = {
            ...values,
            userId: user.userId
        };

        try {
            const requestOptions = {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken 
                },
                body: JSON.stringify(employerProfileData)
            };
            const response = await fetch(`${API_URL}/employer/profile`, requestOptions);
            if (response.ok) {
                setIsSubmitted(true);
                alert('Employer profile created successfully')
                props.onProfileCreated()
            } else {
                const data = await response.json()
                alert(data.message || 'Unable to create profile. Please try again.')
            }
        } catch (error) {
            console.error('Error:', error)
        }
    };

    const validationSchema = Yup.object().shape({
        company_name: Yup.string().required('Company name is required'),
        company_image: Yup.string().required('Company image URL is required'),
        company_description: Yup.string().required('Company description is required')
    });

    if (isSubmitted) {
        return <p>Profile submitted successfully.</p>
    }

    return (
        <div className='employer-profile-container'>
            <h1>Create Employer Profile</h1>
            <Formik
                initialValues={{ company_name: '', company_image: '', company_description: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className='.employer-creation-profile-form'>
                        <Field type="text" name="company_name" placeholder="Company Name" />
                        <ErrorMessage name="company_name" component="div" />

                        <Field type="text" name="company_image" placeholder="Company Image URL" />
                        <ErrorMessage name="company_image" component="div" />

                        <Field as="textarea" name="company_description" placeholder="Company Description" />
                        <ErrorMessage name="company_description" component="div" />

                        <button type="submit" disabled={isSubmitting}>Submit</button>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default EmployerProfile