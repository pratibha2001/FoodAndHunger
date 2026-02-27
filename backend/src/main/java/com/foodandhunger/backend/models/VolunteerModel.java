package com.foodandhunger.backend.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "volunteers")
@Getter
@Setter
public class VolunteerModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    @Column(unique = true)
    private String email;
    @Column(unique = true)
    private String phone;
    private String address;
    private String location;
    private Double latitude;
    private Double longitude;

    @Column(unique = true)
    private String aadhaarCard;
    @Column(unique = true)
    private String panCard;

    private String availability; // e.g. "Mon-Fri, 2pm–6pm"
    private String skills; // e.g. "Delivery, Packing"
    private String reason; // why they want to volunteer

    private String emergencyContactPhone;

    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private String profilePhotoUrl; // uploaded image link

    public VolunteerModel() {
    }

    public VolunteerModel(String name, String email, String phone, String address, String location, String aadhaarCard,
            String panCard, String availability, String skills, String reason,
            String emergencyContactPhone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.location = location;
        this.aadhaarCard = aadhaarCard;
        this.panCard = panCard;
        this.availability = availability;
        this.skills = skills;
        this.reason = reason;
        this.emergencyContactPhone = emergencyContactPhone;
    }
}
