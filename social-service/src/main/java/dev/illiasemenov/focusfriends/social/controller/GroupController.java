package dev.illiasemenov.focusfriends.social.controller;

import dev.illiasemenov.focusfriends.social.dto.CreateGroupRequest;
import dev.illiasemenov.focusfriends.social.dto.GroupMemberResponse;
import dev.illiasemenov.focusfriends.social.dto.GroupResponse;
import dev.illiasemenov.focusfriends.social.entity.Group;
import dev.illiasemenov.focusfriends.social.security.CurrentUserContext;
import dev.illiasemenov.focusfriends.social.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<GroupResponse> create(@Valid @RequestBody CreateGroupRequest request) {
        Group group = groupService.create(CurrentUserContext.get(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(GroupResponse.from(group));
    }

    /** Группы, в которых состоит текущий пользователь. */
    @GetMapping("/mine")
    public ResponseEntity<List<GroupResponse>> mine() {
        List<GroupResponse> groups = groupService.listMine(CurrentUserContext.get()).stream()
                .map(GroupResponse::from)
                .toList();
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<GroupMemberResponse> join(@PathVariable UUID id) {
        var member = groupService.join(CurrentUserContext.get(), id);
        return ResponseEntity.status(HttpStatus.CREATED).body(GroupMemberResponse.from(member));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberResponse>> members(@PathVariable UUID id) {
        List<GroupMemberResponse> members = groupService.listMembers(id).stream()
                .map(GroupMemberResponse::from)
                .toList();
        return ResponseEntity.ok(members);
    }
}
