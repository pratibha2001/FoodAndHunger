package com.foodandhunger.backend.repository;

import com.foodandhunger.backend.models.DonationModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DonationRepo extends JpaRepository<DonationModel, Integer> {
    boolean existsByDonorId(int donorId);

    List<DonationModel> findByDonorId(int donorId);

    List<DonationModel> findByLocationContainingIgnoreCase(String location);

    List<DonationModel> findByStatusIgnoreCase(String status);

    List<DonationModel> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title,
            String description);

    boolean existsByTitleAndDonorId(String title, int donorId);

}
