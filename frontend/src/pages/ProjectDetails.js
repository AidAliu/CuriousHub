// src/pages/ProjectDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import '../components/styles/ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      const projectData = response.data;

      // Extract the filename from filePath
      if (projectData.filePath) {
        const pathParts = projectData.filePath.split(/[/\\]/); // Split on both '/' and '\'
        projectData.filename = pathParts[pathParts.length - 1]; // Get the last part
      }

      setProject(projectData);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert('Error fetching project details.');
      navigate('/home');
    }
  };

  const handleLeaveProject = async () => {
    try {
      await apiClient.post(`/projects/${id}/leave`);
      alert('You left the project.');
      navigate('/home');
    } catch (error) {
      console.error('Error leaving project:', error);
      alert('Error leaving project.');
    }
  };

  const handleDownloadFile = () => {
    if (!project || !project.filename) {
      alert('No file available for this project.');
      return;
    }

    const encodedFilename = encodeURIComponent(project.filename);
    window.open(
      `http://localhost:8080/curioushub/api/v1/projects/download/${encodedFilename}`,
      '_blank'
    );
  };

  if (!project) return <p>Loading...</p>;

  return (
    <div className="project-details">
      <h2>{project.title}</h2>
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
      <button onClick={handleLeaveProject}>Leave Project</button>
      <button onClick={handleDownloadFile}>Download Project File</button>
    </div>
  );
};

export default ProjectDetails;
