package dev.illiasemenov.focusfriends.social.service;

import dev.illiasemenov.focusfriends.social.client.AuthServiceClient;
import dev.illiasemenov.focusfriends.social.client.NotificationServiceClient;
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
import java.util.Objects;
import java.util.UUID;

@Service
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final NotificationServiceClient notificationServiceClient;
    private final AuthServiceClient authServiceClient;

    public FriendshipService(FriendshipRepository friendshipRepository,
                              NotificationServiceClient notificationServiceClient,
                              AuthServiceClient authServiceClient) {
        this.friendshipRepository = friendshipRepository;
        this.notificationServiceClient = notificationServiceClient;
        this.authServiceClient = authServiceClient;
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

        Friendship saved = Objects.requireNonNull(friendshipRepository.save(friendship));

        String requesterName = authServiceClient.getDisplayName(requesterId);
        notificationServiceClient.send(addresseeId, "FRIEND_REQUEST",
                requesterName + " хочет добавить вас в друзья");

        return saved;
    }

    @Transactional
    public Friendship accept(UUID currentUserId, UUID requestId) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(() -> new FriendshipNotFoundException(requestId));

        UUID addresseeId = Objects.requireNonNull(friendship.getAddresseeId());

        if (!addresseeId.equals(currentUserId)) {
            // запрос существует, но принять его может только адресат — маскируем под 404
            throw new FriendshipNotFoundException(requestId);
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        Friendship saved = Objects.requireNonNull(friendshipRepository.save(friendship));

        String accepterName = authServiceClient.getDisplayName(currentUserId);
        notificationServiceClient.send(friendship.getRequesterId(), "FRIEND_ACCEPTED",
                accepterName + " принял(а) вашу заявку в друзья");

        return saved;
    }

    public List<Friendship> listAccepted(UUID userId) {
        return friendshipRepository.findAllByUserIdAndStatus(userId, FriendshipStatus.ACCEPTED);
    }

    /** Входящие заявки в друзья, ожидающие решения текущего пользователя. */
    public List<Friendship> listPending(UUID userId) {
        return friendshipRepository.findAllByAddresseeIdAndStatus(userId, FriendshipStatus.PENDING);
    }
}
