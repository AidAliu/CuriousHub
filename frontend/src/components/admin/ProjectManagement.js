import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    visibility: 'PUBLIC',
  });
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [newFileSelected, setNewFileSelected] = useState(false); // New flag to track if a new file is uploaded
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    apiClient.get('/projects')
      .then(response => setProjects(response.data))
      .catch(error => {
        console.error('There was an error fetching the projects!', error);
        alert('Error fetching projects. Please try again later.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setNewFileSelected(true); // Set flag to true when a new file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    };

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('status', formData.status);
    data.append('visibility', formData.visibility);

    if (editMode) {
      if (newFileSelected) {
        // Append new file only if a new file has been selected
        data.append('file', file);
      }
      apiClient.put(`/projects/${projectId}`, data, config)
        .then(() => {
          setEditMode(false);
          setProjectId(null);
          fetchProjects();
        })
        .catch(error => {
          console.error('There was an error updating the project!', error);
          alert('Error updating project. Please try again later.');
        });
    } else {
      data.append('file', file); // Append file for creating a new project
      apiClient.post('/projects', data, config)
        .then(() => fetchProjects())
        .catch(error => {
          console.error('There was an error creating the project!', error);
          alert('Error creating project. Please try again later.');
        });
    }

    // Reset form and file state after submission
    setFormData({
      title: '',
      description: '',
      status: 'PENDING',
      visibility: 'PUBLIC',
    });
    setFile(null);
    setNewFileSelected(false); // Reset the flag
  };

  const handleEditProject = (project) => {
    setEditMode(true);
    setProjectId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      status: project.status,
      visibility: project.visibility
    });
    setFile(null); // Reset file when editing
    setNewFileSelected(false); // Reset the flag
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      apiClient.delete(`/projects/${id}`)
        .then(() => fetchProjects())
        .catch(error => {
          console.error('There was an error deleting the project!', error);
          alert('Error deleting project. Please try again later.');
        });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setProjectId(null);
    setFormData({
      title: '',
      description: '',
      status: 'PENDING',
      visibility: 'PUBLIC',
    });
    setFile(null);
    setNewFileSelected(false); // Reset the flag
  };

  return (
    <div>
      <h2>{editMode ? 'Edit Project' : 'Create New Project'}</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <input
          type="text"
          name="title"
          placeholder="Project Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Project Description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
        >
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          required
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
        <input
          type="file"
          name="file"
          onChange={handleFileChange}
        />
        <button type="submit">{editMode ? 'Update Project' : 'Create Project'}</button>
        {editMode && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>

      <h2>Project List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.id}</td>
              <td>{project.title}</td>
              <td>{project.description}</td>
              <td>{project.status}</td>
              <td>{project.visibility}</td>
              <td>
                <button onClick={() => handleEditProject(project)}>Edit</button>
                <button onClick={() => handleDeleteProject(project.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectManagement;
