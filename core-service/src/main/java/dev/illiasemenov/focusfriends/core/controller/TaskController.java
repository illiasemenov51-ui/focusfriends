package dev.illiasemenov.focusfriends.core.controller;

import dev.illiasemenov.focusfriends.core.dto.*;
import dev.illiasemenov.focusfriends.core.entity.Task;
import dev.illiasemenov.focusfriends.core.entity.TaskPriority;
import dev.illiasemenov.focusfriends.core.entity.TaskStatus;
import dev.illiasemenov.focusfriends.core.security.CurrentUserContext;
import dev.illiasemenov.focusfriends.core.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> create(@Valid @RequestBody CreateTaskRequest request) {
        Task task = taskService.create(CurrentUserContext.get(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TaskResponse.from(task));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<TaskResponse>> list(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            Pageable pageable) {

        Page<TaskResponse> page = taskService
                .list(CurrentUserContext.get(), status, priority, pageable)
                .map(TaskResponse::from);

        return ResponseEntity.ok(PagedResponse.from(page));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> update(@PathVariable UUID id,
                                                @Valid @RequestBody UpdateTaskRequest request) {
        Task task = taskService.update(CurrentUserContext.get(), id, request);
        return ResponseEntity.ok(TaskResponse.from(task));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        taskService.delete(CurrentUserContext.get(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TaskResponse> complete(@PathVariable UUID id) {
        Task task = taskService.complete(CurrentUserContext.get(), id);
        return ResponseEntity.ok(TaskResponse.from(task));
    }
}
