package com.foodandhunger.backend.services;

import com.foodandhunger.backend.models.FeedbackModel;
import com.foodandhunger.backend.repository.FeedbackRepo;
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
public class FeedbackService implements ServicesStruct<FeedbackModel> {

    @Autowired
    private FeedbackRepo feedbackRepo;

    @Override
    public Optional<FeedbackModel> getById(int id) {
        return feedbackRepo.findById(id);
    }

    @Override
    public List<FeedbackModel> getAll() {
        return feedbackRepo.findAll();
    }

    @Override
    public boolean updateById(int id, FeedbackModel entity) {
        try {
            FeedbackModel existing = feedbackRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));
            existing.setMessage(entity.getMessage());
            existing.setStar(entity.getStar());
            existing.setPhoto(entity.getPhoto());
            existing.setCategory(entity.getCategory());
            feedbackRepo.save(existing);
            return true;
        } catch (Exception e) {
            LLogging.error("update failed: " + e.getMessage());
            return false;
        }
    }

    @Override
    public boolean create(FeedbackModel entity) {
        try {
            boolean exist = feedbackRepo.existsByUserIdAndMessage(
                    entity.getUserId(), entity.getMessage()
            );

            if (exist) {
                LLogging.warn("Duplicate feedback ignored");
                return false;
            }

            feedbackRepo.save(entity);
            return true;
        } catch (Exception e) {
            LLogging.error("create failed: " + e.getMessage());
            return false;
        }
    }


    @Override
    public boolean delete(int id) {
        if (!feedbackRepo.existsById(id)) return false;
        feedbackRepo.deleteById(id);
        return true;
    }

    @Override
    public ResponseEntity<List<FeedbackModel>> search(String query) {
        return ResponseEntity.ok(feedbackRepo.findByMessageContainingIgnoreCase(query));
    }

    @Override
    public ResponseEntity<Long> count() {
        return ResponseEntity.ok(feedbackRepo.count());
    }

    @Override
    public ResponseEntity<Boolean> exists(int id) {
        return ResponseEntity.ok(feedbackRepo.existsById(id));
    }

    //  Upload photo (optional)
    public ResponseEntity<FeedbackModel> uploadPhoto(int id, MultipartFile photo) {
        try {
            FeedbackModel feedback = feedbackRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Feedback not found"));
            String path = FileUploadUtil.saveUserFile("uploads/feedbacks", feedback.getUserId(), photo, "feedback");
            feedback.setPhoto(path);
            feedbackRepo.save(feedback);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    //  Get feedback by user
    public ResponseEntity<List<FeedbackModel>> getByUser(int userId) {
        return ResponseEntity.ok(feedbackRepo.findByUserId(userId));
    }

    //  Get feedback by star rating
    public ResponseEntity<List<FeedbackModel>> getByStar(int star) {
        return ResponseEntity.ok(feedbackRepo.findByStar(star));
    }

    //  Get average rating
    public ResponseEntity<Double> getAverageRating() {
        Double avg = feedbackRepo.getAverageStar();
        return ResponseEntity.ok(avg != null ? avg : 0.0);
    }
}
