import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import '../components/styles/Home.css'; 

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    status: 'PENDING',
    visibility: 'PUBLIC',
    file: null,
    workersNeeded: 1
  });

  useEffect(() => {
    fetchProjects();
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchProjects = () => {
    apiClient.get('/projects')
      .then(response => setProjects(response.data))
      .catch(error => {
        console.error('Error fetching projects:', error);
        alert('Error fetching projects. Please try again later.');
      });
  };

  const handleJoinProject = (projectId) => {
    console.log('currentUser:', currentUser);
    if (!currentUser) {
      alert('Please log in to join a project.');
      return;
    }
    apiClient.post(`/projects/${projectId}/join`)
      .then(() => fetchProjects())
      .catch(error => {
        console.error('Error joining project:', error);
        alert('Error joining project. Please try again later.');
      });
  };

  const handleLeaveProject = (projectId) => {
    if (!currentUser) {
      alert('Please log in to leave a project.');
      return;
    }
    apiClient.post(`/projects/${projectId}/leave`)
      .then(() => fetchProjects())
      .catch(error => {
        console.error('Error leaving project:', error);
        alert('Error leaving project. Please try again later.');
      });
  };

  const handleDownload = (filePath) => {
    const fileName = filePath.split(/(\\|\/)/g).pop();
    apiClient.get(`/download/${encodeURIComponent(fileName)}`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        alert('Error downloading file. Please try again later.');
      });
  };

  const handleCreateProject = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', newProject.title);
    formData.append('description', newProject.description);
    formData.append('status', newProject.status);
    formData.append('visibility', newProject.visibility);
    formData.append('file', newProject.file);
    formData.append('workersNeeded', newProject.workersNeeded);
    formData.append('createdBy', currentUser.id);

    apiClient.post('/projects', formData)
      .then(() => {
        fetchProjects();
        setNewProject({
          title: '',
          description: '',
          status: 'PENDING',
          visibility: 'PUBLIC',
          file: null,
          workersNeeded: 1
        });
        alert('Project created successfully!');
      })
      .catch(error => {
        console.error('Error creating project:', error);
        alert('Error creating project. Please try again later.');
      });
  };

  return (
    <div className="home">
      <div className="home-content"> {/* Wrap the rest of the content */}
        <h2>Projects</h2>

        {/* Project Creation Form */}
        {currentUser && (
          <form onSubmit={handleCreateProject} className="create-project-form">
            <h3>Create New Project</h3>
            <input 
              type="text" 
              placeholder="Title" 
              value={newProject.title}
              onChange={(e) => setNewProject({...newProject, title: e.target.value})}
              required 
            />
            <textarea 
              placeholder="Description" 
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              required 
            />
            <input 
              type="number" 
              placeholder="Workers Needed" 
              value={newProject.workersNeeded}
              onChange={(e) => setNewProject({...newProject, workersNeeded: e.target.value})}
              required 
            />
            <input 
              type="file" 
              onChange={(e) => setNewProject({...newProject, file: e.target.files[0]})}
              required 
            />
            <button type="submit">Create Project</button>
          </form>
        )}

        {/* Existing Projects List */}
        <div className="project-list">
          {projects.slice().reverse().map(project => ( // Display from last posted to first
            <div key={project.id} className="project-item">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <p>Status: {project.status}</p>
              <p>Visibility: {project.visibility}</p>
              <p>People working: {project.workers}</p>
              <p>People needed: {Math.max(0, project.workersNeeded)}</p>
              <p>Working on this project: {project.users?.length > 0 ? project.users.map(user => user.username).join(', ') : 'No users yet'}</p>
              {currentUser && project.workersNeeded > 0 && !project.users?.some(user => user.id === currentUser.id) ? (
                <button onClick={() => handleJoinProject(project.id)}>Join Project</button>
              ) : (
                <button disabled>Join Project</button>
              )}
              {currentUser && project.users?.some(user => user.id === currentUser.id) && (
                <button onClick={() => handleLeaveProject(project.id)}>Leave Project</button>
              )}
              {project.filePath && (
                <button onClick={() => handleDownload(project.filePath)}>
                  Download {project.filePath.split(/(\\|\/)/g).pop()}
                </button>
              )}
            </div>
          ))}
        </div>
      </div> {/* Close home-content div */}
    </div>
  );
};

export default Home;
