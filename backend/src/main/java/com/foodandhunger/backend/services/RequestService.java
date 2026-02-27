package com.foodandhunger.backend.services;

import com.foodandhunger.backend.models.RequestModel;
import com.foodandhunger.backend.repository.RecipientRepo;
import com.foodandhunger.backend.repository.RequestRepo;
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
public class RequestService implements ServicesStruct<RequestModel> {

    @Autowired
    private RequestRepo requestRepo;

    @Autowired
    private RecipientRepo recipientRepo;

    @Override
    public Optional<RequestModel> getById(int id) {
        return requestRepo.findById(id);
    }

    @Override
    public List<RequestModel> getAll() {
        return requestRepo.findAll();
    }

    @Override
    public boolean updateById(int id, RequestModel entity) {
        try {
            RequestModel existing = requestRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            existing.setTitle(entity.getTitle());
            existing.setDescription(entity.getDescription());
            existing.setType(entity.getType());
            existing.setAmount(entity.getAmount());
            existing.setAddress(entity.getAddress());
            existing.setLocation(entity.getLocation());
            existing.setLatitude(entity.getLatitude());
            existing.setLongitude(entity.getLongitude());
            existing.setStatus(entity.getStatus());
            requestRepo.save(existing);
            return true;
        } catch (Exception e) {
            LLogging.error("update failed: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean create(RequestModel entity) {
        return createReturnEntity(entity) != null;
    }

    public RequestModel createReturnEntity(RequestModel entity) {
        try {
            if (!recipientRepo.existsById(entity.getRecipientId())) {
                LLogging.warn("Recipient not found");
                return null;
            }

            // Removed duplicate check to allow multiple requests with same title
            // if (requestRepo.existsByRecipientIdAndTitle(entity.getRecipientId(), entity.getTitle())) {
            //     LLogging.warn("Duplicate request ignored");
            //     return null;
            // }

            return requestRepo.save(entity);

        } catch (Exception e) {
            LLogging.error("create failed: " + e.getMessage());
            return null;
        }
    }

    @Override
    public boolean delete(int id) {
        if (!requestRepo.existsById(id))
            return false;
        requestRepo.deleteById(id);
        return true;
    }

    @Override
    public ResponseEntity<List<RequestModel>> search(String query) {
        return ResponseEntity.ok(requestRepo.findByTitleContainingIgnoreCase(query));
    }

    @Override
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(requestRepo.count());
    }

    @Override
    public ResponseEntity<Boolean> exists(int id) {
        return ResponseEntity.ok(requestRepo.existsById(id));
    }

    //  New: Filter by recipient
    public ResponseEntity<List<RequestModel>> getByRecipient(int recipientId) {
        return ResponseEntity.ok(requestRepo.findByRecipientId(recipientId));
    }

    //  New: Filter by location
    public ResponseEntity<List<RequestModel>> getByLocation(String location) {
        return ResponseEntity.ok(requestRepo.findByLocationContainingIgnoreCase(location));
    }

    //  New: Filter by status
    public ResponseEntity<List<RequestModel>> getByStatus(String status) {
        return ResponseEntity.ok(requestRepo.findByStatusIgnoreCase(status));
    }

    //  New: Upload photo for a request
    public ResponseEntity<?> uploadPhoto(int requestId, MultipartFile photo) {
        try {
            RequestModel req = requestRepo.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));
            String photoPath = FileUploadUtil.saveUserFile("uploads/requests", req.getId(), photo,
                    req.getTitle());
            req.setPhoto(photoPath);
            requestRepo.save(req);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            LLogging.error("photo upload failed: " + e.getMessage());
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
