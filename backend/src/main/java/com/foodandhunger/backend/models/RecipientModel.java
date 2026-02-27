package com.foodandhunger.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recipients")
@Getter
@Setter
public class RecipientModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int userId; // linked to user table
    private String name;
    private int age;
    private String address;
    private String organizationName;
    @Column(unique = true)
    private String pan;
    @Column(unique = true)
    private String aadhaar;
    @Column(unique = true)
    private String phone;
    @Column(unique = true)
    private String email;
    private String location;

    private String organization_certificate_id;
    private String organizationCertificate; // file path
    private String photo; // profile photo path
    private String signature; // signature image path

    private String status = "pending"; // pending | verified | rejected
    private String remarks; // admin remarks for verification
    private Double latitude;
    private Double longitude;
    private Boolean consent;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public RecipientModel() {
    }
}
