package com.foodandhunger.backend.controller;

import com.foodandhunger.backend.models.FeedbackModel;
import com.foodandhunger.backend.services.FeedbackService;
import com.foodandhunger.backend.structures.ControllerStruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController implements ControllerStruct<FeedbackModel> {

    @Autowired
    private FeedbackService feedbackService;

    //  Create feedback
    @PostMapping("/add")
    public ResponseEntity<String> create(@RequestBody FeedbackModel entity) {
        return feedbackService.create(entity)
                ? ResponseEntity.ok("Feedback added successfully")
                : ResponseEntity.status(400).body("Failed to add feedback");
    }

    //  Upload photo
    @PostMapping(value = "/{id}/photo", consumes = {"multipart/form-data"})
    public ResponseEntity<FeedbackModel> uploadPhoto(@PathVariable int id,
                                                     @RequestParam("photo") MultipartFile photo) {
        return feedbackService.uploadPhoto(id, photo);
    }

    //  Get all feedbacks
    @GetMapping("/all")
    public ResponseEntity<List<FeedbackModel>> getAll() {
        return ResponseEntity.ok(feedbackService.getAll());
    }

    //  Get feedback by ID
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackModel> get(@PathVariable int id) {
        return feedbackService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //  Update feedback
    @PutMapping("/update/{id}")
    public ResponseEntity<FeedbackModel> update(@PathVariable int id, @RequestBody FeedbackModel entity) {
        boolean updated = feedbackService.updateById(id, entity);
        return updated ? ResponseEntity.ok(entity) : ResponseEntity.status(404).build();
    }

    //  Delete feedback
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable int id) {
        return feedbackService.delete(id)
                ? ResponseEntity.ok("Feedback deleted successfully")
                : ResponseEntity.status(404).body("Feedback not found");
    }

    //  Search feedbacks
    @GetMapping("/search")
    public ResponseEntity<List<FeedbackModel>> search(@RequestParam String query) {
        return feedbackService.search(query);
    }

    //  Count
    @GetMapping("/count")
    public ResponseEntity<Long> count() {
        return feedbackService.count();
    }

    //  Exists
    @GetMapping("/exists/{id}")
    public ResponseEntity<Boolean> exists(@PathVariable int id) {
        return feedbackService.exists(id);
    }

    //  By user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackModel>> getByUser(@PathVariable int userId) {
        return feedbackService.getByUser(userId);
    }

    //  By star rating
    @GetMapping("/star/{star}")
    public ResponseEntity<List<FeedbackModel>> getByStar(@PathVariable int star) {
        return feedbackService.getByStar(star);
    }

    //  Average rating
    @GetMapping("/average")
    public ResponseEntity<Double> getAverageRating() {
        return feedbackService.getAverageRating();
    }
}
