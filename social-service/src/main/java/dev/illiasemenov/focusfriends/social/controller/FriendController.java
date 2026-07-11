package dev.illiasemenov.focusfriends.social.controller;

import dev.illiasemenov.focusfriends.social.dto.FriendshipResponse;
import dev.illiasemenov.focusfriends.social.entity.Friendship;
import dev.illiasemenov.focusfriends.social.security.CurrentUserContext;
import dev.illiasemenov.focusfriends.social.service.FriendshipService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    private final FriendshipService friendshipService;

    public FriendController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    @PostMapping("/request/{userId}")
    public ResponseEntity<FriendshipResponse> sendRequest(@PathVariable UUID userId) {
        Friendship friendship = friendshipService.sendRequest(CurrentUserContext.get(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(FriendshipResponse.from(friendship));
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<FriendshipResponse> accept(@PathVariable UUID requestId) {
        Friendship friendship = friendshipService.accept(CurrentUserContext.get(), requestId);
        return ResponseEntity.ok(FriendshipResponse.from(friendship));
    }

    @GetMapping
    public ResponseEntity<List<FriendshipResponse>> list() {
        List<FriendshipResponse> friends = friendshipService.listAccepted(CurrentUserContext.get()).stream()
                .map(FriendshipResponse::from)
                .toList();
        return ResponseEntity.ok(friends);
    }

    /** Входящие заявки в друзья, ожидающие решения текущего пользователя. */
    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipResponse>> pending() {
        List<FriendshipResponse> pending = friendshipService.listPending(CurrentUserContext.get()).stream()
                .map(FriendshipResponse::from)
                .toList();
        return ResponseEntity.ok(pending);
    }
}
