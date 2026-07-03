package dev.illiasemenov.focusfriends.social.service;

import dev.illiasemenov.focusfriends.social.dto.CreateGroupRequest;
import dev.illiasemenov.focusfriends.social.entity.Group;
import dev.illiasemenov.focusfriends.social.entity.GroupMember;
import dev.illiasemenov.focusfriends.social.exception.ApiException;
import dev.illiasemenov.focusfriends.social.exception.GroupNotFoundException;
import dev.illiasemenov.focusfriends.social.repository.GroupMemberRepository;
import dev.illiasemenov.focusfriends.social.repository.GroupRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    public GroupService(GroupRepository groupRepository, GroupMemberRepository groupMemberRepository) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @Transactional
    public Group create(UUID ownerId, CreateGroupRequest request) {
        Group group = Group.builder()
                .name(request.name())
                .ownerId(ownerId)
                .build();
        group = groupRepository.save(group);

        // владелец автоматически становится участником своей группы
        groupMemberRepository.save(GroupMember.builder()
                .groupId(group.getId())
                .userId(ownerId)
                .build());

        return group;
    }

    @Transactional
    public GroupMember join(UUID userId, UUID groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new GroupNotFoundException(groupId);
        }

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Вы уже состоите в этой группе");
        }

        GroupMember member = GroupMember.builder()
                .groupId(groupId)
                .userId(userId)
                .build();

        return groupMemberRepository.save(member);
    }

    public List<GroupMember> listMembers(UUID groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new GroupNotFoundException(groupId);
        }
        return groupMemberRepository.findAllByGroupId(groupId);
    }
}
