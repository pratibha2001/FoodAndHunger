package com.foodandhunger.backend.controller;

import com.foodandhunger.backend.dto.LoginRequest;
import com.foodandhunger.backend.models.User;
import com.foodandhunger.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/user")
public class UserController {

    @Autowired
    private UserService userService;

    //  Register new user
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        return userService.signup(user);
    }

    //  Login
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody LoginRequest request) {
        return userService.login(request.getUsername(), request.getPassword());
    }

    //  Get all users (supports pagination)
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return userService.getAll(page, size);
    }

    //  Get single user
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable int id) {
        return userService.getById(id);
    }

    //  Change password
    @PatchMapping("/{id}/password")
    public ResponseEntity<String> changePassword(
            @PathVariable int id,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        return userService.changePassword(id, oldPassword, newPassword);
    }

    //  Update username/email
    @PutMapping("/{id}/update")
    public ResponseEntity<User> updateUserInfo(
            @PathVariable int id,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email) {
        return userService.updateUserInfo(id, username, email);
    }

    //  Delete user account
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable int id) {
        return userService.deleteUser(id);
    }

    //  Search users by name or email
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("query") String query) {
        return userService.search(query);
    }

    //  Default welcome route
    @GetMapping("/")
    public ResponseEntity<String> hello() {
        return ResponseEntity.ok("Welcome to Food & Hunger API!");
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("testing api");
    }
}
