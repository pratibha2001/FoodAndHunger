package com.foodandhunger.backend.utils;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.*;

public class FileUploadUtil {

    /**
     * Saves uploaded file in a user-specific folder with a custom name.
     *
     * @param baseDir   Base upload directory (e.g. "uploads")
     * @param userId    User ID (used to create subfolder)
     * @param file      Multipart file to save
     * @param customName Custom base name (without extension)
     * @return Relative file path (e.g. "/uploads/12/profile_pic.jpg")
     * @throws Exception if saving fails
     */
    public static String saveUserFile(String baseDir, int userId, MultipartFile file, String customName)
            throws Exception {
        if (file.isEmpty()) {
            throw new Exception("File is empty");
        }

        // Ensure base folder exists
        File baseFolder = new File(baseDir);
        if (!baseFolder.exists())
            baseFolder.mkdirs();

        // Create user folder
        File userFolder = new File(baseFolder, String.valueOf(userId));
        if (!userFolder.exists())
            userFolder.mkdirs();

        // Extract extension (e.g. .jpg, .png)
        String original = file.getOriginalFilename();
        String extension = "";
        if (original != null && original.contains(".")) {
            extension = original.substring(original.lastIndexOf("."));
        }

        // Build final filename (custom name + timestamp)
        // Sanitize custom name to remove spaces
        // Sanitize custom name to remove spaces and special characters that might break paths
        String sanitizedCustomName = customName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = sanitizedCustomName + "_" + System.currentTimeMillis() + extension;

        // Define target path
        Path filePath = Paths.get(userFolder.getAbsolutePath(), fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path for DB
        return "/" + baseDir + "/" + userId + "/" + fileName;
    }
}
