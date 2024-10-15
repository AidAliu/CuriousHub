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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchProjects = () => {
    apiClient.get('/projects')
      .then(response => {
        setProjects(response.data);
        // Removed console.log to avoid logging sensitive information
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
        alert('Error fetching projects. Please try again later.');
      });
  };

  const handleJoinProject = (projectId) => {
    if (!currentUser) {
      alert('Please log in to join a project.');
      return;
    }
    setLoading(true);
    apiClient.post(`/projects/${projectId}/join`)
      .then(() => {
        fetchProjects();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error joining project:', error);
        alert('Error joining project. Please try again later.');
        setLoading(false);
      });
  };

  const handleLeaveProject = (projectId) => {
    if (!currentUser) {
      alert('Please log in to leave a project.');
      return;
    }
    setLoading(true);
    apiClient.post(`/projects/${projectId}/leave`)
      .then(() => {
        fetchProjects();
        setLoading(false);
      })
      .catch(error => {
        console.error('Error leaving project:', error);
        alert('Error leaving project. Please try again later.');
        setLoading(false);
      });
  };

  const handleDownload = (filePath) => {
    const fileName = filePath.split(/(\\|\/)/g).pop();
    apiClient.get(`/projects/download/${encodeURIComponent(fileName)}`, { responseType: 'blob' })
        .then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
    // Removed 'createdBy' from form data; it's set on the server side

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

  const handleUpdateProjectWorkers = (projectId, workersNeeded) => {
    if (!currentUser) {
      alert('Please log in to update the project.');
      return;
    }
    setLoading(true);
    apiClient.patch(`/projects/${projectId}/update`, { workersNeeded })
      .then(() => {
        fetchProjects();
        setLoading(false);
        alert('Workers needed updated successfully!');
      })
      .catch(error => {
        console.error('Error updating project:', error);
        alert('Error updating project. Please try again later.');
        setLoading(false);
      });
  };

  const handleRemoveWorker = (projectId, userId) => {
    if (!currentUser) {
      alert('Please log in to remove a worker.');
      return;
    }
    setLoading(true);
    apiClient.delete(`/projects/${projectId}/workers/${userId}`)
      .then(() => {
        fetchProjects();
        setLoading(false);
        alert('Worker removed successfully!');
      })
      .catch(error => {
        console.error('Error removing worker:', error);
        alert('Error removing worker. Please try again later.');
        setLoading(false);
      });
  };

  return (
    <div className="home">
      <div className="home-content">
        <h2>Projects</h2>

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

        <div className="project-list">
          {projects.slice().reverse().map(project => {
            const isProjectCreator =
              currentUser &&
              project.createdBy &&
              String(currentUser.id) === String(project.createdBy.id);

            const isUserInProject =
              currentUser &&
              project.users?.some(user => String(user.id) === String(currentUser.id));

            return (
              <div key={project.id} className="project-item">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <p>Status: {project.status}</p>
                <p>Visibility: {project.visibility}</p>
                <p>People working: {project.workers}</p>
                <p>People needed: {Math.max(0, project.workersNeeded)}</p>
                <p>
                  Working on this project: {project.users?.length > 0 ? project.users.map(user => user.username).join(', ') : 'No users yet'}
                </p>

                {isProjectCreator ? (
                  <div>
                    <label>
                      Workers Needed:
                      <input 
                        type="number" 
                        value={project.workersNeeded}
                        onChange={(e) => handleUpdateProjectWorkers(project.id, e.target.value)}
                      />
                    </label>
                    <button onClick={() => handleUpdateProjectWorkers(project.id, project.workersNeeded)}>
                      Update Workers Needed
                    </button>
                    <div>
                      <h4>Manage Workers</h4>
                      {project.users.map(user => (
                        user.id !== currentUser.id && (
                          <div key={user.id}>
                            <span>{user.username}</span>
                            <button onClick={() => handleRemoveWorker(project.id, user.id)}>Remove Worker</button>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ) : (
                  isUserInProject ? (
                    <button onClick={() => handleLeaveProject(project.id)} disabled={loading}>
                      Leave Project
                    </button>
                  ) : (
                    currentUser && project.workersNeeded > 0 && (
                      <button onClick={() => handleJoinProject(project.id)} disabled={loading}>
                        Join Project
                      </button>
                    )
                  )
                )}

                {project.filePath && (
                  <button onClick={() => handleDownload(project.filePath)}>
                    Download {project.filePath.split(/(\\|\/)/g).pop()}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div> 
    </div>
  );
};

export default Home;
