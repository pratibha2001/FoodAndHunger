package com.foodandhunger.backend.services;

import com.foodandhunger.backend.models.VolunteerModel;
import com.foodandhunger.backend.repository.VolunteerRepo;
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
public class VolunteerService implements ServicesStruct<VolunteerModel> {

    @Autowired
    private VolunteerRepo volunteerRepo;

    @Override
    public Optional<VolunteerModel> getById(int id) {
        return volunteerRepo.findById(id);
    }

    @Override
    public List<VolunteerModel> getAll() {
        return volunteerRepo.findAll();
    }

    @Override
    public boolean updateById(int id, VolunteerModel entity) {
        try {
            VolunteerModel existing = volunteerRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Volunteer not found"));

            existing.setName(entity.getName());
            existing.setEmail(entity.getEmail());
            existing.setPhone(entity.getPhone());
            existing.setAddress(entity.getAddress());
            existing.setLocation(entity.getLocation());
            existing.setAvailability(entity.getAvailability());
            existing.setSkills(entity.getSkills());
            existing.setReason(entity.getReason());
            existing.setEmergencyContactPhone(entity.getEmergencyContactPhone());
            existing.setAadhaarCard(entity.getAadhaarCard());
            existing.setPanCard(entity.getPanCard());

            volunteerRepo.save(existing);
            return true;
        } catch (Exception e) {
            LLogging.error("Update failed: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean create(VolunteerModel entity) {
        try {
            if (volunteerRepo.existsByEmail(entity.getEmail())) {
                LLogging.warn("Duplicate volunteer email");
                return false;
            }

            if (entity.getPhone() != null && volunteerRepo.existsByPhone(entity.getPhone())) {
                LLogging.warn("Duplicate volunteer phone");
                return false;
            }

            if (entity.getAadhaarCard() != null && volunteerRepo.existsByAadhaarCard(entity.getAadhaarCard())) {
                LLogging.warn("Duplicate volunteer Aadhaar");
                return false;
            }

            volunteerRepo.save(entity);
            return true;

        } catch (Exception e) {
            LLogging.error("Create failed: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean delete(int id) {
        if (!volunteerRepo.existsById(id))
            return false;
        volunteerRepo.deleteById(id);
        return true;
    }

    @Override
    public ResponseEntity<List<VolunteerModel>> search(String query) {
        return ResponseEntity.ok(volunteerRepo.findByNameContainingIgnoreCase(query));
    }

    @Override
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(volunteerRepo.count());
    }

    @Override
    public ResponseEntity<Boolean> exists(int id) {
        return ResponseEntity.ok(volunteerRepo.existsById(id));
    }

    // Filter by location
    public ResponseEntity<List<VolunteerModel>> getByLocation(String location) {
        return ResponseEntity.ok(volunteerRepo.findByLocationContainingIgnoreCase(location));
    }

    // Upload profile photo
    public ResponseEntity<VolunteerModel> uploadProfilePhoto(int volunteerId, MultipartFile file) {
        try {
            VolunteerModel vol = volunteerRepo.findById(volunteerId)
                    .orElseThrow(() -> new RuntimeException("Volunteer not found"));

            String filePath = FileUploadUtil.saveUserFile(
                    "uploads/volunteers",
                    volunteerId,
                    file,
                    vol.getName());

            vol.setProfilePhotoUrl(filePath);
            volunteerRepo.save(vol);
            return ResponseEntity.ok(vol);
        } catch (Exception e) {
            LLogging.error("Photo upload failed: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
