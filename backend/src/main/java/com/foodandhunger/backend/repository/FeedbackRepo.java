package com.foodandhunger.backend.repository;

import com.foodandhunger.backend.models.FeedbackModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FeedbackRepo extends JpaRepository<FeedbackModel, Integer> {
    List<FeedbackModel> findByMessageContainingIgnoreCase(String message);
    List<FeedbackModel> findByUserId(int userId);
    List<FeedbackModel> findByStar(int star);

    // Custom query for average rating
    @Query("SELECT AVG(f.star) FROM FeedbackModel f")
    Double getAverageStar();

    boolean existsByUserIdAndMessage(int userId, String message);

}
