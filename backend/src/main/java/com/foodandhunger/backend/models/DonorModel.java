package com.foodandhunger.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "donors")
@Getter
@Setter
public class DonorModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int userId;
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

    private String organizationCertificate; // path to uploaded certificate
    private String photo; // donor photo path
    private String signature; // donor signature path

    private String status = "pending"; // pending | verified | rejected
    private String remarks; // admin remark
    private Double latitude;
    private Double longitude;
    private Boolean consent;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public DonorModel() {
    }
}
