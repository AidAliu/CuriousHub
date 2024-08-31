package com.company.CuriousHub.service;

import com.company.CuriousHub.exception.ResourceNotFoundException;
import com.company.CuriousHub.project.Project;
import com.company.CuriousHub.project.ProjectRepository;
import com.company.CuriousHub.project.Status;
import com.company.CuriousHub.project.Visibility;
import com.company.CuriousHub.user.User;
import com.company.CuriousHub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private static final Logger logger = LoggerFactory.getLogger(ProjectService.class);

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    public Optional<Project> findById(Integer id) {
        return projectRepository.findById(id);
    }

    public Project save(String title, String description, Status status, Visibility visibility, MultipartFile file, Integer userId, int workersNeeded) throws ResourceNotFoundException {
        String filePath = saveFile(file);
        User createdBy = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = new Project();
        project.setTitle(title);
        project.setDescription(description);
        project.setStatus(status);
        project.setVisibility(visibility);
        project.setFilePath(filePath);
        project.setCreatedBy(createdBy);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project.setWorkers(1); // Creator is the first worker
        project.setWorkersNeeded(workersNeeded);

        project.getUsers().add(createdBy);
        createdBy.getProjects().add(project);

        userRepository.save(createdBy);
        return projectRepository.save(project);
    }

    public Project updateProject(Integer id, String title, String description, Status status, Visibility visibility, MultipartFile file, Integer userId, int workersNeeded) throws ResourceNotFoundException {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (file != null && !file.isEmpty()) {
            String filePath = saveFile(file);
            project.setFilePath(filePath);
        }

        project.setTitle(title);
        project.setDescription(description);
        project.setStatus(status);
        project.setVisibility(visibility);
        project.setUpdatedAt(LocalDateTime.now());
        project.setWorkersNeeded(workersNeeded);

        return projectRepository.save(project);
    }

    public Project addUserToProject(Integer projectId, Integer userId) throws ResourceNotFoundException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!project.getUsers().contains(user)) {
            project.getUsers().add(user);
            user.getProjects().add(project);
            project.setWorkers(project.getUsers().size());
            project.setWorkersNeeded(project.getWorkersNeeded() - 1);

            projectRepository.save(project);
            userRepository.save(user);
        }

        return project;
    }

    public Project removeUserFromProject(Integer projectId, Integer userId) throws ResourceNotFoundException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (project.getUsers().contains(user)) {
            project.getUsers().remove(user);
            user.getProjects().remove(project);
            project.setWorkers(project.getUsers().size());
            project.setWorkersNeeded(project.getWorkersNeeded() + 1);

            projectRepository.save(project);
            userRepository.save(user);
        }

        return project;
    }

    public void deleteById(Integer id) throws ResourceNotFoundException {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Project not found");
        }
    }

    private String saveFile(MultipartFile file) {
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String filePath = uploadDir + File.separator + file.getOriginalFilename();
        logger.info("Saving file to: {}", filePath);

        try {
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());
            return filePath;
        } catch (IOException e) {
            logger.error("Failed to store file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }
}
