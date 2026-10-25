package com.sgcs.controller;

import com.sgcs.entity.Ward;
import com.sgcs.repository.WardRepository;
import com.sgcs.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wards")
public class WardController {

    @Autowired
    private WardRepository wardRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<List<Ward>> getWards() {
        List<Ward> wards = adminService.getAllWards();
        wards.sort(Comparator.comparingInt(w -> w.getWardNumber() != null ? w.getWardNumber() : 0));
        return ResponseEntity.ok(wards);
    }

    @GetMapping("/public")
    public ResponseEntity<List<Map<String, Object>>> getPublicWards() {
        List<Ward> wards = adminService.getAllWards();
        wards.sort(Comparator.comparingInt(w -> w.getWardNumber() != null ? w.getWardNumber() : 0));
        List<Map<String, Object>> result = wards.stream().map(w -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", w.getId());
            map.put("wardNumber", w.getWardNumber());
            map.put("name", w.getName());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
