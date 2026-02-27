package com.foodandhunger.backend.controller;

import com.foodandhunger.backend.models.RecipientModel;
import com.foodandhunger.backend.services.RecipientService;
import com.foodandhunger.backend.structures.ControllerStruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/recipient")
public class RecipientController implements ControllerStruct<RecipientModel> {

    @Autowired
    private RecipientService recipientService;

    @PostMapping("/add")
    public ResponseEntity<?> create(@RequestBody RecipientModel entity) {
        try {
            recipientService.create(entity);
            return ResponseEntity.ok(entity);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to add recipient: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipientModel> get(@PathVariable int id) {
        return recipientService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<RecipientModel>> getAll() {
        return ResponseEntity.ok(recipientService.getAll());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<RecipientModel> update(@PathVariable int id, @RequestBody RecipientModel entity) {
        boolean updated = recipientService.updateById(id, entity);
        return updated ? ResponseEntity.ok(entity) : ResponseEntity.status(404).build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        return recipientService.delete(id)
                ? ResponseEntity.ok("Recipient deleted successfully")
                : ResponseEntity.status(404).body("Recipient not found");
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecipientModel>> search(@RequestParam String query) {
        return recipientService.search(query);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return recipientService.count();
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> exists(@PathVariable int id) {
        return recipientService.exists(id);
    }

    //  Upload photo, certificate, signature
    @PostMapping(value = "/{id}/upload", consumes = { "multipart/form-data" })
    public ResponseEntity<RecipientModel> uploadFiles(
            @PathVariable int id,
            @RequestParam(required = false) MultipartFile photo,
            @RequestParam(required = false) MultipartFile certificate,
            @RequestParam(required = false) MultipartFile signature) {
        return recipientService.uploadFiles(id, photo, certificate, signature);
    }

    //  Get by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<RecipientModel> getByUser(@PathVariable int userId) {
        return recipientService.getByUserId(userId);
    }

    //  Filter by location
    @GetMapping("/location/{location}")
    public ResponseEntity<List<RecipientModel>> getByLocation(@PathVariable String location) {
        return recipientService.getByLocation(location);
    }

    //  Filter by organization name
    @GetMapping("/organization/{name}")
    public ResponseEntity<List<RecipientModel>> getByOrganization(@PathVariable String name) {
        return recipientService.getByOrganization(name);
    }

    //  Filter by verification status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<RecipientModel>> getByStatus(@PathVariable String status) {
        return recipientService.getByStatus(status);
    }

    //  Approve / Reject recipient
    @PatchMapping("/{id}/status")
    public ResponseEntity<RecipientModel> updateStatus(
            @PathVariable int id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        return recipientService.updateStatus(id, status, remarks);
    }
}
