package com.foodandhunger.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "food_requests")
@Getter
@Setter
public class RequestModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String title;
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    private double amount;
    private String location;
    private String address;
    private String type; // e.g. veg, non-veg
    private String status = "pending"; // pending | approved | completed
    private String photo; // optional image of requested item
    private double latitude;
    private double longitude;
    private int recipientId; // who created this request
    private Integer donorId; // donor who is fulfilling this request
    private String remarks; // additional notes (e.g., "Ready to donate by donor ID: 5")

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public RequestModel() {
    }

    public RequestModel(String title, String address, String description, double amount, String location) {
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.location = location;
        this.address = address;
    }
}
