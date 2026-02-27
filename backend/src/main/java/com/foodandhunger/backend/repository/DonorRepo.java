package com.foodandhunger.backend.repository;

import com.foodandhunger.backend.models.DonorModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DonorRepo extends JpaRepository<DonorModel, Integer> {
    boolean existsByUserId(int userId);

    Optional<DonorModel> findByUserId(int userId);

    List<DonorModel> findByLocationContainingIgnoreCase(String location);

    List<DonorModel> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    List<DonorModel> findByStatusIgnoreCase(String status);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByAadhaar(String aadhaar);

    boolean existsByPan(String pan);

}
