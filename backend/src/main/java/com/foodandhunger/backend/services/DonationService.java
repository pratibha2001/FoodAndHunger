package com.foodandhunger.backend.services;

import com.foodandhunger.backend.models.DonationModel;
import com.foodandhunger.backend.repository.DonationRepo;
import com.foodandhunger.backend.structures.ServicesStruct;
import com.foodandhunger.backend.utils.FileUploadUtil;
import com.foodandhunger.backend.utils.LLogging;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class DonationService implements ServicesStruct<DonationModel> {

    @Autowired
    private DonationRepo donationRepo;

    @Override
    public Optional<DonationModel> getById(int id) {
        return donationRepo.findById(id);
    }

    @Override
    public List<DonationModel> getAll() {
        return donationRepo.findAll();
    }

    @Override
    public boolean updateById(int id, DonationModel entity) {
        try {
            DonationModel existing = donationRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Donation not found"));
            existing.setTitle(entity.getTitle());
            existing.setDescription(entity.getDescription());
            existing.setType(entity.getType());
            existing.setLocation(entity.getLocation());
            existing.setAddress(entity.getAddress());
            existing.setStatus(entity.getStatus());
            existing.setRemarks(entity.getRemarks());
            donationRepo.save(existing);
            return true;
        } catch (Exception e) {
            LLogging.error("update failed: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean create(DonationModel entity) {
        return createReturnEntity(entity) != null;
    }

    public DonationModel createReturnEntity(DonationModel entity) {
        try {
            boolean exists = donationRepo.existsByTitleAndDonorId(
                    entity.getTitle(), entity.getDonorId());

            if (exists) {
                LLogging.warn("Duplicate donation ignored");
                return null;
            }

            return donationRepo.save(entity);
        } catch (Exception e) {
            LLogging.error("create failed: " + e.getMessage());
            return null;
        }
    }

    @Override
    public boolean delete(int id) {
        if (!donationRepo.existsById(id))
            return false;
        donationRepo.deleteById(id);
        return true;
    }

    @Override
    public ResponseEntity<List<DonationModel>> search(String query) {
        return ResponseEntity.ok(
                donationRepo.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query));
    }

    @Override
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(donationRepo.count());
    }

    @Override
    public ResponseEntity<Boolean> exists(int id) {
        return ResponseEntity.ok(donationRepo.existsById(id));
    }

    //  Upload photo
    public ResponseEntity<?> uploadPhoto(int donationId, MultipartFile photo) {
        try {
            DonationModel donation = donationRepo.findById(donationId)
                    .orElseThrow(() -> new RuntimeException("Donation not found"));
            String path = FileUploadUtil.saveUserFile("uploads/donations", donation.getId(), photo,
                    donation.getTitle());
            donation.setPhoto(path);
            donationRepo.save(donation);
            return ResponseEntity.ok(donation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }

    //  Get by donor
    public ResponseEntity<List<DonationModel>> getByDonor(int donorId) {
        return ResponseEntity.ok(donationRepo.findByDonorId(donorId));
    }

    //  Get by location
    public ResponseEntity<List<DonationModel>> getByLocation(String location) {
        return ResponseEntity.ok(donationRepo.findByLocationContainingIgnoreCase(location));
    }

    //  Get by status
    public ResponseEntity<List<DonationModel>> getByStatus(String status) {
        return ResponseEntity.ok(donationRepo.findByStatusIgnoreCase(status));
    }

    //  Update donation status
    public ResponseEntity<DonationModel> updateStatus(int id, String status, String remarks) {
        try {
            DonationModel donation = donationRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Donation not found"));
            donation.setStatus(status);
            donation.setRemarks(remarks);
            donationRepo.save(donation);
            return ResponseEntity.ok(donation);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    //  Count by status (e.g., verified donations)
    public ResponseEntity<Long> countByStatus(String status) {
        long count = donationRepo.findByStatusIgnoreCase(status).size();
        return ResponseEntity.ok(count);
    }
}
