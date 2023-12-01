import React, { useState, useEffect } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa'; 
import { Link } from 'react-router-dom';
import './Homepage.css';

function Homepage() {
    const [welcomeData, setWelcomeData] = useState({
        message: ''
    })

    useEffect(() => {
        const fetchWelcomeData = async () => {
            try {
                const response = await fetch('/')
                if (response.ok && response.headers.get("Content-Type").includes("application/json")) {
                    const data = await response.json()
                    setWelcomeData({
                        message: data.message
                    })
                } else {
                    console.error('Non-JSON response received')
                    setWelcomeData(prev => ({ ...prev, message: 'Welcome to the Job Seeking Platform' }))
                }
            } catch (error) {
                console.error('Error fetching welcome data:', error);
                setWelcomeData(prev => ({ ...prev, message: 'Welcome to the Job Seeking Platform' }))
            }
        }
    
        fetchWelcomeData()
    }, [])
    
    return (
        <div className="homepage">
             {/* Navbar with links to signup and login */}
             <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home"><FaHome /> Home</Navbar.Brand>
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/signup">Sign Up</Nav.Link>
                    <Nav.Link as={Link} to="/login">Login</Nav.Link>
                </Nav>
            </Navbar>

            <h1>{welcomeData.message}</h1>
            

            {/* Brief Description Card */}
            <div className="card">
                <img src="data:image/jpeg;base64,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" alt="Jobseeker Profile" />
                <div>
                    <h2>Brief Description</h2>
                    <p>Our platform, based in Kenya, connects job seekers and employers in a streamlined, efficient manner. Job seekers can create profiles, post CVs, set job statuses, and explore job postings. Employers can manage job postings and initiate contact with potential candidates.</p>
                </div>
            </div>

            {/* Advantages Card */}
            <div className="card">
                <img src="https://static.vecteezy.com/system/resources/previews/022/280/612/original/3d-illustration-of-job-seeker-holding-need-job-banner-png.png" alt="Advantages" />
                <div>
                    <h2>Advantages</h2>
                    <p>Experience a tailored job search with our platform. Gain access to exclusive job listings, direct employer contacts, and a robust support system designed to align with your career aspirations. Say goodbye to endless searching and welcome targeted opportunities.</p>
                </div>
            </div>

            {/* Mission Card */}
            <div className="card">
                <img src="https://cdn.pixabay.com/photo/2017/10/31/09/55/dream-job-2904780_1280.jpg" alt="Mission" />
                <div>
                    <h2>Mission</h2>
                    <p>Our mission is to revolutionize job seeking in Kenya by providing a dedicated platform that bridges the gap between talented individuals and potential employers. We aim to empower both job seekers and companies by facilitating efficient and meaningful connections.</p>
                </div>
            </div>

            {/* Aim Card */}
            <div className="card">
                <img src="https://img.freepik.com/free-vector/man-search-hiring-job-online-from-laptop_1150-52728.jpg" alt="Aim" />
                <div>
                    <h2>Aim</h2>
                    <p>Our aim is to enhance the job-seeking experience by offering a platform where job seekers can seamlessly connect with potential employers. We strive to provide an environment that fosters career growth and helps job seekers find roles that match their skills and ambitions.</p>
                </div>
            </div>
        </div>
    );
}