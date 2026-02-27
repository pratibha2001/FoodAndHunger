package com.foodandhunger.backend.repository;

import com.foodandhunger.backend.models.RequestModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestRepo extends JpaRepository<RequestModel, Integer> {
    List<RequestModel> findByLocationContainingIgnoreCase(String location);

    List<RequestModel> findByTitleContainingIgnoreCase(String title);

    List<RequestModel> findByRecipientId(int recipientId);

    List<RequestModel> findByStatusIgnoreCase(String status);

    boolean existsByRecipientIdAndTitle(int recipientId, String title);

}
