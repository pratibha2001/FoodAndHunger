package com.foodandhunger.backend.services;

import com.foodandhunger.backend.models.User;
import com.foodandhunger.backend.repository.UserRepo;

import com.foodandhunger.backend.utils.LLogging;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepo userRepo;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    //  Signup
    public ResponseEntity<String> signup(User user) {
        LLogging.info("signup()");
        if (userRepo.existsByEmail(user.getEmail()))
            return ResponseEntity.status(400).body("Email already registered");
        if (userRepo.existsByUsername(user.getUsername()))
            return ResponseEntity.status(400).body("Username already registered");

        user.setPassword(encoder.encode(user.getPassword()));
        userRepo.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    //  Login
    public ResponseEntity<User> login(String username, String password) {
        LLogging.info("login()");
        Optional<User> userOpt = userRepo.findByUsername(username);
        if (userOpt.isPresent() && encoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.status(401).build();
    }

    //  Change password
    public ResponseEntity<String> changePassword(int id, String oldPass, String newPass) {
        LLogging.info("changePassword()");
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty())
            return ResponseEntity.status(404).body("User not found");

        User user = userOpt.get();
        if (!encoder.matches(oldPass, user.getPassword()))
            return ResponseEntity.status(400).body("Incorrect old password");

        user.setPassword(encoder.encode(newPass));
        userRepo.save(user);
        return ResponseEntity.ok("Password updated successfully");
    }

    //  Update username or email
    public ResponseEntity<User> updateUserInfo(int id, String username, String email) {
        Optional<User> userOpt = userRepo.findById(id);
        if (userOpt.isEmpty())
            return ResponseEntity.notFound().build();

        User user = userOpt.get();

        if (username != null && !username.isBlank()) {
            if (userRepo.existsByUsername(username) && !user.getUsername().equals(username)) {
                return ResponseEntity.status(400).build();
            }
            user.setUsername(username);
        }

        if (email != null && !email.isBlank()) {
            if (userRepo.existsByEmail(email) && !user.getEmail().equals(email)) {
                return ResponseEntity.status(400).build();
            }
            user.setEmail(email);
        }

        userRepo.save(user);
        return ResponseEntity.ok(user);
    }

    //  Delete user
    public ResponseEntity<String> deleteUser(int id) {
        if (!userRepo.existsById(id))
            return ResponseEntity.status(404).body("User not found");
        userRepo.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    //  Get all (paginated)
    public ResponseEntity<org.springframework.data.domain.Page<User>> getAll(int page, int size) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(userRepo.findAll(pageable));
    }

    //  Get all (legacy/list)
    public ResponseEntity<List<User>> getAll() {
        return ResponseEntity.ok(userRepo.findAll());
    }

    //  Get by id
    public ResponseEntity<User> getById(int id) {
        return userRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //  Search users by username or email
    public ResponseEntity<List<User>> search(String query) {
        List<User> result = userRepo.findAll().stream()
                .filter(u -> u.getUsername().toLowerCase().contains(query.toLowerCase())
                        || u.getEmail().toLowerCase().contains(query.toLowerCase()))
                .toList();
        return ResponseEntity.ok(result);
    }
}
