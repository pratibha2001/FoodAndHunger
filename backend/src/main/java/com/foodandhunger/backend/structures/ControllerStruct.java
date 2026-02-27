package com.foodandhunger.backend.structures;

import org.springframework.http.ResponseEntity;
import java.util.List;

/**
 * Generic controller structure for CRUD operations.
 * Keep it clean — no @PostMapping or @RequestParam here.
 */
public interface ControllerStruct<T> {

//    ResponseEntity<String> create(T entity);           // Create
    ResponseEntity<T> get(int id);                     // Get one
    ResponseEntity<List<T>> getAll();                  // Get all
    ResponseEntity<T> update(int id, T entity);        // Update
    ResponseEntity<String> delete(int id);             // Delete
    ResponseEntity<List<T>> search(String query);      // Search
    ResponseEntity<Long> count();                      // Count
    ResponseEntity<Boolean> exists(int id);            // Exists check
}
