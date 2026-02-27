package com.foodandhunger.backend.controller;

import com.foodandhunger.backend.dto.AdminStatsDTO;
import com.foodandhunger.backend.models.*;
import com.foodandhunger.backend.services.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*") // Allow all origins for now
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // Donors
    @GetMapping("/donors")
    public ResponseEntity<List<DonorModel>> getAllDonors() {
        return ResponseEntity.ok(adminService.getAllDonors());
    }

    @PutMapping("/donors/{id}/status")
    public ResponseEntity<DonorModel> updateDonorStatus(@PathVariable int id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateDonorStatus(id, status));
    }

    // Recipients
    @GetMapping("/recipients")
    public ResponseEntity<List<RecipientModel>> getAllRecipients() {
        return ResponseEntity.ok(adminService.getAllRecipients());
    }

    @PutMapping("/recipients/{id}/status")
    public ResponseEntity<RecipientModel> updateRecipientStatus(@PathVariable int id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateRecipientStatus(id, status));
    }

    // Volunteers
    @GetMapping("/volunteers")
    public ResponseEntity<List<VolunteerModel>> getAllVolunteers() {
        return ResponseEntity.ok(adminService.getAllVolunteers());
    }

    @PutMapping("/volunteers/{id}/status")
    public ResponseEntity<VolunteerModel> updateVolunteerStatus(@PathVariable int id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateVolunteerStatus(id, status));
    }

    // Requests
    @GetMapping("/requests")
    public ResponseEntity<List<RequestModel>> getAllRequests() {
        return ResponseEntity.ok(adminService.getAllRequests());
    }

    @PutMapping("/requests/{id}/status")
    public ResponseEntity<RequestModel> updateRequestStatus(@PathVariable int id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateRequestStatus(id, status));
    }

    // Donations
    @GetMapping("/donations")
    public ResponseEntity<List<DonationModel>> getAllDonations() {
        return ResponseEntity.ok(adminService.getAllDonations());
    }

    @PutMapping("/donations/{id}/status")
    public ResponseEntity<DonationModel> updateDonationStatus(@PathVariable int id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.updateDonationStatus(id, status));
    }
}
