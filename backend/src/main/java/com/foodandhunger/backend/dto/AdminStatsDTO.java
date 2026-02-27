package com.foodandhunger.backend.dto;

import lombok.Data;

@Data
public class AdminStatsDTO {
    private long totalDonors;
    private long totalRecipients;
    private long totalVolunteers;
    private long totalRequests;
    private long totalDonations;
    private long pendingRequests;
    private long pendingDonations;
}
