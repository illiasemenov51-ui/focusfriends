package dev.illiasemenov.focusfriends.core.repository;

import dev.illiasemenov.focusfriends.core.entity.Task;
import dev.illiasemenov.focusfriends.core.entity.TaskPriority;
import dev.illiasemenov.focusfriends.core.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    public static Specification<Task> belongsToUser(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("userId"), userId);
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasPriority(TaskPriority priority) {
        return (root, query, cb) -> priority == null ? null : cb.equal(root.get("priority"), priority);
    }
}
