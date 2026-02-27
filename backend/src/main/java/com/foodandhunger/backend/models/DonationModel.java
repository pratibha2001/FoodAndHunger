package com.foodandhunger.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Getter
@Setter
public class DonationModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int donorId; // Linked donor
    @Column(unique = true)
    private String title;
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    private String type; // food / clothes / money / etc.
    private String photo; // Path to donation image
    private String location;
    private String address;
    private Double latitude;
    private Double longitude;

    private String status = "pending"; // pending | approved | completed
    private String remarks; // Admin or system note

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public DonationModel() {
    }
}
