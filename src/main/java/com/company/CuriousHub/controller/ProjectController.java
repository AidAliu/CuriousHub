package com.company.CuriousHub.controller;

import com.company.CuriousHub.exception.ResourceNotFoundException;
import com.company.CuriousHub.project.Project;
import com.company.CuriousHub.project.Status;
import com.company.CuriousHub.project.Visibility;
import com.company.CuriousHub.service.ProjectService;
import com.company.CuriousHub.user.User;
import com.company.CuriousHub.user.UserRepository;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Integer id) {
        return projectService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("C:/Users/aidal/Desktop/CuriousHub/src/main/resources/uploads").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Integer id) {
        try {
            projectService.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/{projectId}/join")
    public ResponseEntity<Project> joinProject(@PathVariable Integer projectId) {
        try {
            Integer userId = getCurrentUserId();
            Project updatedProject = projectService.addUserToProject(projectId, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{projectId}/leave")
    public ResponseEntity<Project> leaveProject(@PathVariable Integer projectId) {
        try {
            Integer userId = getCurrentUserId();
            Project updatedProject = projectService.removeUserFromProject(projectId, userId);
            return ResponseEntity.ok(updatedProject);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    private Integer getCurrentUserId() throws ResourceNotFoundException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails) authentication.getPrincipal()).getUsername();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            return user.getId();
        }
        throw new ResourceNotFoundException("User not found");
    }
}
