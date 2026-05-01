package com.taskmanager.backend.repository;

import com.taskmanager.backend.entity.Task;
import com.taskmanager.backend.entity.User;
import com.taskmanager.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDateTime;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProject(Project project);
    List<Task> findByAssignee(User user);
    List<Task> findByAssigneeAndStatus(User user, Task.Status status);
    List<Task> findByDueDateBeforeAndStatusNot(LocalDateTime date, Task.Status status);
}
