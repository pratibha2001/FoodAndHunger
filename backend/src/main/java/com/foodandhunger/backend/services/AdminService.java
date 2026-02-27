package com.foodandhunger.backend.services;

import com.foodandhunger.backend.dto.AdminStatsDTO;
import com.foodandhunger.backend.models.*;
import com.foodandhunger.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private DonorRepo donorRepo;

    @Autowired
    private RecipientRepo recipientRepo;

    @Autowired
    private VolunteerRepo volunteerRepo;

    @Autowired
    private RequestRepo requestRepo;

    @Autowired
    private DonationRepo donationRepo;

    public AdminStatsDTO getStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        stats.setTotalDonors(donorRepo.count());
        stats.setTotalRecipients(recipientRepo.count());
        stats.setTotalVolunteers(volunteerRepo.count());
        stats.setTotalRequests(requestRepo.count());
        stats.setTotalDonations(donationRepo.count());
        // For simplified pending counts, we might need custom queries in repos, 
        // but for now let's just count all or filter in memory if datasets are small.
        // Ideally, add countByStatus methods in Repos.
        return stats;
    }

    // Users
    public List<DonorModel> getAllDonors() {
        return donorRepo.findAll();
    }

    public List<RecipientModel> getAllRecipients() {
        return recipientRepo.findAll();
    }

    public List<VolunteerModel> getAllVolunteers() {
        return volunteerRepo.findAll();
    }

    public DonorModel updateDonorStatus(int id, String status) {
        Optional<DonorModel> donor = donorRepo.findById(id);
        if (donor.isPresent()) {
            DonorModel d = donor.get();
            d.setStatus(status);
            return donorRepo.save(d);
        }
        return null;
    }

    public RecipientModel updateRecipientStatus(int id, String status) {
        Optional<RecipientModel> recipient = recipientRepo.findById(id);
        if (recipient.isPresent()) {
            RecipientModel r = recipient.get();
            r.setStatus(status);
            return recipientRepo.save(r);
        }
        return null;
    }

    public VolunteerModel updateVolunteerStatus(int id, String status) {
        Optional<VolunteerModel> volunteer = volunteerRepo.findById(id);
        if (volunteer.isPresent()) {
            VolunteerModel v = volunteer.get();
            v.setStatus(status);
            return volunteerRepo.save(v);
        }
        return null;
    }

    // Requests
    public List<RequestModel> getAllRequests() {
        return requestRepo.findAll();
    }

    public RequestModel updateRequestStatus(int id, String status) {
        Optional<RequestModel> request = requestRepo.findById(id);
        if (request.isPresent()) {
            RequestModel r = request.get();
            r.setStatus(status);
            return requestRepo.save(r);
        }
        return null;
    }

    // Donations
    public List<DonationModel> getAllDonations() {
        return donationRepo.findAll();
    }

    public DonationModel updateDonationStatus(int id, String status) {
        Optional<DonationModel> donation = donationRepo.findById(id);
        if (donation.isPresent()) {
            DonationModel d = donation.get();
            d.setStatus(status);
            return donationRepo.save(d);
        }
        return null;
    }
}
