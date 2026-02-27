package com.foodandhunger.backend.controller;

import com.foodandhunger.backend.models.DonorModel;
import com.foodandhunger.backend.services.DonorService;
import com.foodandhunger.backend.structures.ControllerStruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/donor")
public class DonorController implements ControllerStruct<DonorModel> {

    @Autowired
    private DonorService donorService;

    @PostMapping(value = "/add", consumes = { "multipart/form-data" })
    public ResponseEntity<?> create(
            @ModelAttribute DonorModel entity,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "organizationCertificate", required = false) MultipartFile organizationCertificate,
            @RequestParam(value = "certificate", required = false) MultipartFile certificate,
            @RequestParam(value = "signature", required = false) MultipartFile signature) {

        if (!donorService.isUserPresent(entity.getUserId())) {
            return ResponseEntity.status(400).body("User not present");
        }

        // Handle certificate alias (user might send 'certificate' or 'organizationCertificate')
        MultipartFile certFile = (organizationCertificate != null) ? organizationCertificate : certificate;

        try {
            donorService.create(entity, photo, certFile, signature);
            return ResponseEntity.ok(entity);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to add donor: " + e.getMessage());
        }
    }

    @PostMapping(value = "/add", consumes = "application/json")
    public ResponseEntity<?> createJson(@RequestBody DonorModel entity) {
        if (!donorService.isUserPresent(entity.getUserId())) {
            return ResponseEntity.status(400).body("User not present");
        }
        try {
            donorService.create(entity);
            return ResponseEntity.ok(entity);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to add donor: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonorModel> get(@PathVariable int id) {
        return donorService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<DonorModel>> getAll() {
        return ResponseEntity.ok(donorService.getAll());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<DonorModel> update(@PathVariable int id, @RequestBody DonorModel entity) {
        boolean updated = donorService.updateById(id, entity);
        return updated ? ResponseEntity.ok(entity) : ResponseEntity.status(404).build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        return donorService.delete(id)
                ? ResponseEntity.ok("Donor deleted successfully")
                : ResponseEntity.status(404).body("Donor not found");
    }

    @GetMapping("/search")
    public ResponseEntity<List<DonorModel>> search(@RequestParam String query) {
        return donorService.search(query);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return donorService.count();
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> exists(@PathVariable int id) {
        return donorService.exists(id);
    }

    //  Upload files (photo, certificate, signature)
    @PostMapping(value = "/{id}/upload", consumes = { "multipart/form-data" })
    public ResponseEntity<DonorModel> uploadFiles(
            @PathVariable int id,
            @RequestParam(required = false) MultipartFile photo,
            @RequestParam(required = false) MultipartFile certificate,
            @RequestParam(required = false) MultipartFile signature) {
        return donorService.uploadFiles(id, photo, certificate, signature);
    }

    //  Get by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<DonorModel> getByUser(@PathVariable int userId) {
        return donorService.getByUserId(userId);
    }

    //  Filter by location
    @GetMapping("/location/{location}")
    public ResponseEntity<List<DonorModel>> getByLocation(@PathVariable String location) {
        return donorService.getByLocation(location);
    }

    //  Filter by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DonorModel>> getByStatus(@PathVariable String status) {
        return donorService.getByStatus(status);
    }

    //  Approve / Reject donor
    @PatchMapping("/{id}/status")
    public ResponseEntity<DonorModel> updateStatus(
            @PathVariable int id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        return donorService.updateStatus(id, status, remarks);
    }

    //  Count verified donors
    @GetMapping("/count/verified")
    public ResponseEntity<Long> countVerified() {
        return donorService.countVerified();
    }
}
