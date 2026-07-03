package dev.illiasemenov.focusfriends.core.service;

import dev.illiasemenov.focusfriends.core.dto.CreateTaskRequest;
import dev.illiasemenov.focusfriends.core.dto.UpdateTaskRequest;
import dev.illiasemenov.focusfriends.core.entity.Task;
import dev.illiasemenov.focusfriends.core.entity.TaskPriority;
import dev.illiasemenov.focusfriends.core.entity.TaskStatus;
import dev.illiasemenov.focusfriends.core.exception.TaskNotFoundException;
import dev.illiasemenov.focusfriends.core.repository.TaskRepository;
import dev.illiasemenov.focusfriends.core.repository.TaskSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Transactional
    public Task create(UUID userId, CreateTaskRequest request) {
        Task task = Task.builder()
                .userId(userId)
                .title(request.title())
                .description(request.description())
                .deadline(request.deadline())
                .priority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)
                .status(TaskStatus.TODO)
                .build();

        return taskRepository.save(task);
    }

    public Page<Task> list(UUID userId, TaskStatus status, TaskPriority priority, Pageable pageable) {
        Specification<Task> spec = Specification
                .where(TaskSpecifications.belongsToUser(userId))
                .and(TaskSpecifications.hasStatus(status))
                .and(TaskSpecifications.hasPriority(priority));

        return taskRepository.findAll(spec, pageable);
    }

    @Transactional
    public Task update(UUID userId, UUID taskId, UpdateTaskRequest request) {
        Task task = getOwnedTask(userId, taskId);

        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.deadline() != null) {
            task.setDeadline(request.deadline());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }

        return taskRepository.save(task);
    }

    @Transactional
    public void delete(UUID userId, UUID taskId) {
        Task task = getOwnedTask(userId, taskId);
        taskRepository.delete(task);
    }

    @Transactional
    public Task complete(UUID userId, UUID taskId) {
        Task task = getOwnedTask(userId, taskId);
        task.setStatus(TaskStatus.DONE);
        return taskRepository.save(task);
    }

    /**
     * Достаёт задачу и проверяет, что она принадлежит текущему пользователю.
     * Если задача существует, но принадлежит другому — намеренно кидаем
     * NotFound (а не Forbidden), чтобы не палить чужие id.
     */
    private Task getOwnedTask(UUID userId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        if (!task.getUserId().equals(userId)) {
            throw new TaskNotFoundException(taskId);
        }

        return task;
    }
}
