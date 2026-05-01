package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.ProjectRequest;
import com.taskmanager.backend.entity.*;
import com.taskmanager.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Project createProject(ProjectRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow();
        List<User> members = request.getMemberIds() != null
                ? userRepository.findAllById(request.getMemberIds()) : List.of();
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(owner)
                .members(members)
                .build();
        return projectRepository.save(project);
    }

    public List<Project> getUserProjects(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        List<Project> owned = projectRepository.findByOwner(user);
        List<Project> member = projectRepository.findByMembersContaining(user);
        owned.addAll(member);
        return owned.stream().distinct().toList();
    }

    public Project getProject(Long id) {
        return projectRepository.findById(id).orElseThrow();
    }

    public Project updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id).orElseThrow();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getMemberIds() != null) {
            project.setMembers(userRepository.findAllById(request.getMemberIds()));
        }
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}
