package com.foodandhunger.backend.repository;

import com.foodandhunger.backend.models.RecipientModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecipientRepo extends JpaRepository<RecipientModel, Integer> {
    boolean existsByUserId(int userId);

    Optional<RecipientModel> findByUserId(int userId);

    List<RecipientModel> findByLocationContainingIgnoreCase(String location);

    List<RecipientModel> findByNameContainingIgnoreCase(String name);

    List<RecipientModel> findByOrganizationNameContainingIgnoreCase(String organizationName);

    List<RecipientModel> findByStatusIgnoreCase(String status);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByAadhaar(String aadhaar);

    boolean existsByPan(String pan);

}
