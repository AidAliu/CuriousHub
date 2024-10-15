package com.company.CuriousHub.controller;

import com.company.CuriousHub.exception.ResourceNotFoundException;
import com.company.CuriousHub.project.Project;
import com.company.CuriousHub.project.Status;
import com.company.CuriousHub.project.Visibility;
import com.company.CuriousHub.service.ProjectService;
import com.company.CuriousHub.user.User;
import com.company.CuriousHub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private static final Logger logger = LoggerFactory.getLogger(ProjectController.class);

    private final ProjectService projectService;
    private final UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Integer id) {
        return projectService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Project> createProject(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam("visibility") String visibility,
            @RequestParam("file") MultipartFile file,
            @RequestParam("workersNeeded") int workersNeeded) {

        try {
            Integer userId = getCurrentUserId();
            Status projectStatus = Status.valueOf(status.toUpperCase());
            Visibility projectVisibility = Visibility.valueOf(visibility.toUpperCase());

            Project savedProject = projectService.save(title, description, projectStatus, projectVisibility, file, userId, workersNeeded);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);

        } catch (IllegalArgumentException e) {
            logger.error("Error creating project: Invalid status or visibility");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (ResourceNotFoundException e) {
            logger.error("Error creating project: User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            logger.error("Error creating project: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Integer id) {
        try {
            projectService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            logger.error("Error deleting project: Project not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{projectId}/join")
    public ResponseEntity<?> joinProject(@PathVariable Integer projectId) {
        try {
            Integer userId = getCurrentUserId();
            logger.info("User with ID {} is attempting to join project with ID {}", userId, projectId);
            Project updatedProject = projectService.addUserToProject(projectId, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalStateException e) {
            logger.error("Project is full: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Cannot join project. No more workers needed.");
        } catch (ResourceNotFoundException e) {
            logger.error("Error joining project: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{projectId}/leave")
    public ResponseEntity<?> leaveProject(@PathVariable Integer projectId) {
       try {
           Integer userId = getCurrentUserId();
           Project project = projectService.findById(projectId)
                   .orElseThrow(() -> new ResourceAccessException("Project not found"));

           logger.info("User ID attempting to leave: {}", userId);
           logger.info("Project Creator ID: {}", project.getCreatedBy().getId());

           if (project.getCreatedBy().getId().equals(userId)) {
               logger.error("Project creator cannot leave their own project.");
               return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                       .body("Project creator cannot leave their own project.");
           }

           Project updatedProject = projectService.removeUserFromProject(projectId, userId);
           return ResponseEntity.ok(updatedProject);
       }
       catch (ResourceNotFoundException e) {
           e.printStackTrace();
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
       }
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            String decodedFilename = java.net.URLDecoder.decode(filename, StandardCharsets.UTF_8.name());
            Path filePath = Paths.get(uploadDir).resolve(decodedFilename).normalize();
            logger.info("Attempting to download file from: {}", filePath);

            if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
                logger.error("File not found or not readable: {}", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            logger.error("Error downloading file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Integer getCurrentUserId() throws ResourceNotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            logger.info("Authenticated User: {} with ID: {}", username, user.getId());
            return user.getId();
        }
        logger.error("User not authenticated");
        throw new ResourceNotFoundException("User not found");
    }

    @PatchMapping("/{projectId}/update")
    public ResponseEntity<Project> updateProjectAttributes(
            @PathVariable Integer projectId,
            @RequestParam(required = false) Integer workersNeeded
    ) {
        try {
            Integer userId = getCurrentUserId();
            Project updatedProject = projectService.updateProjectAttributes(projectId, userId, workersNeeded);
            return ResponseEntity.ok(updatedProject);
        } catch (ResourceNotFoundException e) {
            logger.error("Error updating project attributes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}
