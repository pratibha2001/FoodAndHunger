package com.foodandhunger.backend.controller;

import com.foodandhunger.backend.models.DonationModel;
import com.foodandhunger.backend.services.DonationService;
import com.foodandhunger.backend.structures.ControllerStruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/donation")
public class DonationController implements ControllerStruct<DonationModel> {

    @Autowired
    private DonationService donationService;

    @PostMapping("/add")
    public ResponseEntity<DonationModel> create(@RequestBody DonationModel entity) {
        DonationModel created = donationService.createReturnEntity(entity);
        if (created == null) {
            return ResponseEntity.status(400).build();
        }
        return ResponseEntity.ok(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationModel> get(@PathVariable int id) {
        return donationService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<DonationModel>> getAll() {
        return ResponseEntity.ok(donationService.getAll());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<DonationModel> update(@PathVariable int id, @RequestBody DonationModel entity) {
        boolean updated = donationService.updateById(id, entity);
        return updated ? ResponseEntity.ok(entity) : ResponseEntity.status(404).build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        return donationService.delete(id)
                ? ResponseEntity.ok("Donation deleted successfully")
                : ResponseEntity.status(404).body("Donation not found");
    }

    @GetMapping("/search")
    public ResponseEntity<List<DonationModel>> search(@RequestParam String query) {
        return donationService.search(query);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return donationService.count();
    }

    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> exists(@PathVariable int id) {
        return donationService.exists(id);
    }

    //  Upload photo separately
    @PostMapping(value = "/{id}/photo", consumes = { "multipart/form-data" })
    public ResponseEntity<?> uploadPhoto(@PathVariable int id, @RequestParam MultipartFile photo) {
        return donationService.uploadPhoto(id, photo);
    }

    //  Get by donor
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<DonationModel>> getByDonor(@PathVariable int donorId) {
        return donationService.getByDonor(donorId);
    }

    //  Filter by location
    @GetMapping("/location/{location}")
    public ResponseEntity<List<DonationModel>> getByLocation(@PathVariable String location) {
        return donationService.getByLocation(location);
    }

    //  Filter by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<DonationModel>> getByStatus(@PathVariable String status) {
        return donationService.getByStatus(status);
    }

    //  Approve / Complete donation
    @PatchMapping("/{id}/status")
    public ResponseEntity<DonationModel> updateStatus(
            @PathVariable int id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {
        return donationService.updateStatus(id, status, remarks);
    }

    //  Count by status
    @GetMapping("/count/{status}")
    public ResponseEntity<Long> countByStatus(@PathVariable String status) {
        return donationService.countByStatus(status);
    }
}
