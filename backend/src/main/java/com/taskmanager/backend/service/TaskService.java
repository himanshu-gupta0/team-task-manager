package com.taskmanager.backend.service;

import com.taskmanager.backend.dto.TaskRequest;
import com.taskmanager.backend.entity.*;
import com.taskmanager.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Task createTask(TaskRequest request) {
        Project project = projectRepository.findById(request.getProjectId()).orElseThrow();
        User assignee = request.getAssigneeId() != null
                ? userRepository.findById(request.getAssigneeId()).orElse(null) : null;
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? Task.Status.valueOf(request.getStatus()) : Task.Status.TODO)
                .priority(request.getPriority() != null ? Task.Priority.valueOf(request.getPriority()) : Task.Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .project(project)
                .assignee(assignee)
                .build();
        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow();
        return taskRepository.findByProject(project);
    }

    public List<Task> getMyTasks(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return taskRepository.findByAssignee(user);
    }

    public List<Task> getOverdueTasks() {
        return taskRepository.findByDueDateBeforeAndStatusNot(LocalDateTime.now(), Task.Status.DONE);
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = taskRepository.findById(id).orElseThrow();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(Task.Status.valueOf(request.getStatus()));
        if (request.getPriority() != null) task.setPriority(Task.Priority.valueOf(request.getPriority()));
        task.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null)
            task.setAssignee(userRepository.findById(request.getAssigneeId()).orElse(null));
        return taskRepository.save(task);
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
