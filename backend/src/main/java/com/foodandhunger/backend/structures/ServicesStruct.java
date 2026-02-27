package com.foodandhunger.backend.structures;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Optional;

public interface ServicesStruct<T> {
    Optional<T> getById(int id);
    List<T> getAll();  // removed unnecessary 'int id' parameter
    boolean updateById(int id, T entity);
    boolean create(T entity);
    boolean delete(int id);
    ResponseEntity<List<T>> search(@RequestParam("query") String query); // e.g. search donors by name
    ResponseEntity<Long> count(); // total records
    ResponseEntity<Boolean> exists(int id); // check if entity exists
}
