package com.foodandhunger.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
public class FeedbackModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private int userId;            // who gave feedback
    private String message;
    private int star;              // 1 to 5
    private String photo;          // optional image path (screenshot or proof)
    private String category;       // e.g. "App", "Donation", "Recipient"

    @CreationTimestamp
    private LocalDateTime createdAt;

    public FeedbackModel() {}
    public FeedbackModel(int userId, String message, int star) {
        this.userId = userId;
        this.message = message;
        this.star = star;
    }
}
