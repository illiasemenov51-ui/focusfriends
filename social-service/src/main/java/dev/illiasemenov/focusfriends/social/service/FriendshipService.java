package dev.illiasemenov.focusfriends.social.service;

import dev.illiasemenov.focusfriends.social.entity.Friendship;
import dev.illiasemenov.focusfriends.social.entity.FriendshipStatus;
import dev.illiasemenov.focusfriends.social.exception.DuplicateFriendRequestException;
import dev.illiasemenov.focusfriends.social.exception.FriendshipNotFoundException;
import dev.illiasemenov.focusfriends.social.repository.FriendshipRepository;
import org.springframework.http.HttpStatus;
import dev.illiasemenov.focusfriends.social.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;

    public FriendshipService(FriendshipRepository friendshipRepository) {
        this.friendshipRepository = friendshipRepository;
    }

    @Transactional
    public Friendship sendRequest(UUID requesterId, UUID addresseeId) {
        if (requesterId.equals(addresseeId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Нельзя добавить самого себя в друзья");
        }

        if (friendshipRepository.existsByRequesterIdAndAddresseeId(requesterId, addresseeId)
                || friendshipRepository.existsByRequesterIdAndAddresseeId(addresseeId, requesterId)) {
            throw new DuplicateFriendRequestException();
        }

        Friendship friendship = Friendship.builder()
                .requesterId(requesterId)
                .addresseeId(addresseeId)
                .status(FriendshipStatus.PENDING)
                .build();

        return friendshipRepository.save(friendship);
    }

    @Transactional
    public Friendship accept(UUID currentUserId, UUID requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new FriendshipNotFoundException(requestId));

        if (!friendship.getAddresseeId().equals(currentUserId)) {
            // запрос существует, но принять его может только адресат — маскируем под 404
            throw new FriendshipNotFoundException(requestId);
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    public List<Friendship> listAccepted(UUID userId) {
        return friendshipRepository.findAllByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED);
    }
}
