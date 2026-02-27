package com.foodandhunger.backend.repository;

import com.foodandhunger.backend.models.VolunteerModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VolunteerRepo extends JpaRepository<VolunteerModel, Integer> {
    List<VolunteerModel> findByLocationContainingIgnoreCase(String location);

    List<VolunteerModel> findByNameContainingIgnoreCase(String name);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByAadhaarCard(String aadhaarCard);

}
