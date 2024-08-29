package com.company.CuriousHub.controller;

import com.company.CuriousHub.exception.ResourceNotFoundException;
import com.company.CuriousHub.project.Project;
import com.company.CuriousHub.project.Status;
import com.company.CuriousHub.project.Visibility;
import com.company.CuriousHub.service.ProjectService;
import com.company.CuriousHub.user.User;
import com.company.CuriousHub.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository; // To fetch user details from the database

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

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Project> createProject(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam("visibility") String visibility,
            @RequestParam("file") MultipartFile file) {

        try {
            // Get the user ID from the Security Context
            Integer userId = getCurrentUserId();

            // Convert the strings to enums
            Status projectStatus = Status.valueOf(status.toUpperCase());
            Visibility projectVisibility = Visibility.valueOf(visibility.toUpperCase());

            // Save the project
            Project savedProject = projectService.save(title, description, projectStatus, projectVisibility, file, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<Project> updateProject(
            @PathVariable Integer id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("status") String status,
            @RequestParam("visibility") String visibility,
            @RequestParam("file") MultipartFile file) {

        try {
            // Get the user ID from the Security Context
            Integer userId = getCurrentUserId();

            // Convert the strings to enums
            Status projectStatus = Status.valueOf(status.toUpperCase());
            Visibility projectVisibility = Visibility.valueOf(visibility.toUpperCase());

            Project updatedProject = projectService.updateProject(id, title, description, projectStatus, projectVisibility, file, userId);
            return ResponseEntity.ok(updatedProject);

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
