import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import '../components/styles/Home.css';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user and token from localStorage
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    console.log('Raw user data from localStorage:', user);
    console.log('Token from localStorage:', token);

    if (user && token) {
      try {
        const parsedUser = JSON.parse(user);
        if (!parsedUser || typeof parsedUser !== 'object') {
          throw new Error('Parsed user is not a valid object');
        }
        setCurrentUser(parsedUser); // Set the current user
        fetchProjects(); // Fetch projects if the user is authenticated
      } catch (error) {
        console.error('Invalid user data:', error);
        localStorage.clear(); // Clear all localStorage items
        navigate('/login'); // Redirect to login if user data is invalid
      }
    } else {
      console.warn('No valid token or user found. Redirecting to login.');
      navigate('/login'); // Redirect if no token or user
    }
  }, [navigate]);

  // Fetch available projects
  const fetchProjects = async () => {
    try {
      const response = await apiClient.get('/projects');
      setProjects(response.data); // Set the projects state
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Error fetching projects. Please try again later.');
    }
  };

  // Handle join project action
  const handleJoinProject = async (projectId) => {
    if (!currentUser) {
      alert('Please log in to join a project.');
      return;
    }

    try {
      await apiClient.post(`/projects/${projectId}/join`);
      alert('Successfully joined the project.');
      // Navigate to the project details page
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Error joining project. Please try again.');
    }
  };

  // Handle leave project action
  const handleLeaveProject = async (projectId) => {
    if (!currentUser) {
      alert('Please log in to leave a project.');
      return;
    }

    try {
      await apiClient.post(`/projects/${projectId}/leave`);
      alert('Successfully left the project.');
      fetchProjects(); // Refresh the project list after leaving
    } catch (error) {
      console.error('Error leaving project:', error);
      alert('Error leaving project. Please try again.');
    }
  };

  // Function to check if the user is part of the project
  const isUserInProject = (project) => {
    return project.users?.some(
      (user) => String(user.id) === String(currentUser.id)
    );
  };

  // Function to check if the current user is the creator of the project
  const isProjectCreator = (project) => {
    return (
      currentUser &&
      project.createdBy &&
      String(currentUser.id) === String(project.createdBy.id)
    );
  };

  return (
    <div className="home">
      <h2>Available Projects</h2>
      <div className="project-list">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div key={project.id} className="project-item">
              <h3
                className="project-title"
                onClick={() => navigate(`/projects/${project.id}`)}
                style={{ cursor: 'pointer', color: 'blue' }}
              >
                {project.title}
              </h3>
              <p>Created by: {project.createdBy?.username || 'Unknown'}</p>
              <p>{project.description}</p>
              <p>Status: {project.status}</p>
              <p>Visibility: {project.visibility}</p>
              <p>
                Workers Needed: {project.workersNeeded} | Current Workers:{' '}
                {project.users?.length || 0}
              </p>
              <p>
                Users: {project.users?.map((user) => user.username).join(', ')}
              </p>
              {isProjectCreator(project) ? (
                <div>
                  <p>You are the creator of this project.</p>
                  {/* Add any creator-specific actions here */}
                </div>
              ) : isUserInProject(project) ? (
                <button onClick={() => navigate(`/projects/${project.id}`)}>
                  View Project
                </button>
              ) : (
                <button onClick={() => handleJoinProject(project.id)}>
                  Join Project
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No projects available right now.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
