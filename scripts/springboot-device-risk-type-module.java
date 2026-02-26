// ============================================================================
// SPRING BOOT 3.x MODULE: device_risk_type (Device Management Dropdown - Independent Master)
// Table       : device_risk_type
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/device/risk-type
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) via EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: DeviceRiskType.java
// Package: com.cmms.device.entity
// ============================================================================

package com.cmms.device.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "device_risk_type",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_device_risk_type_tenant_code",
           columnNames = {"tenant_id", "code"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceRiskType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (this.isActive == null) this.isActive = RecordStatus.ACTIVE;
        if (this.sortOrder == null) this.sortOrder = 0;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}


// ============================================================================
// 2. REQUEST DTOs
// Package: com.cmms.device.dto.request
// ============================================================================

// ---------- DeviceRiskTypeCreateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceRiskTypeCreateRequest {

    @NotBlank(message = "code is required")
    @Size(max = 20)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 50)
    private String name;

    @Size(max = 255)
    private String description;

    private Integer sortOrder;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- DeviceRiskTypeUpdateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceRiskTypeUpdateRequest {

    @NotNull(message = "id is required")
    private Long id;

    @NotBlank(message = "code is required")
    @Size(max = 20)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 50)
    private String name;

    @Size(max = 255)
    private String description;

    private Integer sortOrder;
    // isActive NOT updatable here
}


// ============================================================================
// 3. RESPONSE DTO
// Package: com.cmms.device.dto.response
// ============================================================================

package com.cmms.device.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeviceRiskTypeResponseDto {
    private Long id;
    private Long tenantId;
    private String code;
    private String name;
    private String description;
    private Integer sortOrder;
    private String isActive;    // ACTIVE | INACTIVE | DELETED
}


// ============================================================================
// 4. REPOSITORY: DeviceRiskTypeRepository.java
// Package: com.cmms.device.repository
// ============================================================================

package com.cmms.device.repository;

import com.cmms.device.entity.DeviceRiskType;
import com.cmms.device.dto.response.DeviceRiskTypeResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRiskTypeRepository extends JpaRepository<DeviceRiskType, Long> {

    Optional<DeviceRiskType> findByIdAndTenantId(Long id, Long tenantId);

    @Query("""
        SELECT CASE WHEN COUNT(drt) > 0 THEN true ELSE false END
        FROM DeviceRiskType drt
        WHERE drt.tenantId = :tenantId
          AND UPPER(drt.code) = UPPER(:code)
          AND drt.isActive <> 'DELETED'
          AND (:excludeId IS NULL OR drt.id <> :excludeId)
    """)
    boolean existsDuplicateCode(@Param("tenantId") Long tenantId,
                                @Param("code") String code,
                                @Param("excludeId") Long excludeId);

    // All visible (non-deleted)
    @Query("""
        SELECT new com.cmms.device.dto.response.DeviceRiskTypeResponseDto(
            drt.id, drt.tenantId, drt.code, drt.name,
            drt.description, drt.sortOrder, CAST(drt.isActive AS string)
        )
        FROM DeviceRiskType drt
        WHERE drt.tenantId = :tenantId AND drt.isActive <> 'DELETED'
        ORDER BY drt.sortOrder, drt.name
    """)
    List<DeviceRiskTypeResponseDto> findAllVisible(@Param("tenantId") Long tenantId);

    // All ACTIVE only (for dropdown binding)
    @Query("""
        SELECT new com.cmms.device.dto.response.DeviceRiskTypeResponseDto(
            drt.id, drt.tenantId, drt.code, drt.name,
            drt.description, drt.sortOrder, CAST(drt.isActive AS string)
        )
        FROM DeviceRiskType drt
        WHERE drt.tenantId = :tenantId AND drt.isActive = 'ACTIVE'
        ORDER BY drt.sortOrder, drt.name
    """)
    List<DeviceRiskTypeResponseDto> findAllActive(@Param("tenantId") Long tenantId);
}


// ============================================================================
// 5. SERVICE: DeviceRiskTypeService.java
// Package: com.cmms.device.service
// ============================================================================

package com.cmms.device.service;

import com.cmms.device.dto.request.DeviceRiskTypeCreateRequest;
import com.cmms.device.dto.request.DeviceRiskTypeUpdateRequest;
import com.cmms.device.dto.response.DeviceRiskTypeResponseDto;
import com.cmms.device.entity.DeviceRiskType;
import com.cmms.device.repository.DeviceRiskTypeRepository;
import com.cmms.common.dto.StatusToggleRequest;
import com.cmms.common.enums.RecordStatus;
import com.cmms.common.exception.*;
import com.cmms.common.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeviceRiskTypeService {

    private final DeviceRiskTypeRepository repository;
    private final JwtService jwtService;

    // ---------- CREATE ----------
    @Transactional(rollbackFor = Exception.class)
    public DeviceRiskTypeResponseDto create(DeviceRiskTypeCreateRequest req) {
        Long tenantId = jwtService.getTenantId();

        if (repository.existsDuplicateCode(tenantId, req.getCode(), null)) {
            throw new DuplicateException("DUPLICATE_RISK_TYPE_CODE",
                "Device risk type code '" + req.getCode().trim() + "' already exists");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        DeviceRiskType entity = DeviceRiskType.builder()
                .tenantId(tenantId)
                .code(req.getCode().trim().toUpperCase())
                .name(req.getName().trim())
                .description(req.getDescription())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .isActive(initialIsActive)
                .build();

        entity = repository.save(entity);
        return mapToDto(entity);
    }

    // ---------- UPDATE ----------
    @Transactional(rollbackFor = Exception.class)
    public DeviceRiskTypeResponseDto update(DeviceRiskTypeUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();

        DeviceRiskType entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Device risk type not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED device risk type.");
        }

        if (repository.existsDuplicateCode(tenantId, req.getCode(), req.getId())) {
            throw new DuplicateException("DUPLICATE_RISK_TYPE_CODE",
                "Device risk type code '" + req.getCode().trim() + "' already exists");
        }

        entity.setCode(req.getCode().trim().toUpperCase());
        entity.setName(req.getName().trim());
        entity.setDescription(req.getDescription());
        if (req.getSortOrder() != null) entity.setSortOrder(req.getSortOrder());
        // isActive NOT changed here

        entity = repository.save(entity);
        return mapToDto(entity);
    }

    // ---------- SOFT DELETE ----------
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Long tenantId = jwtService.getTenantId();
        DeviceRiskType entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Device risk type not found with ID: " + id));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Device risk type is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        repository.save(entity);
    }

    // ---------- TOGGLE STATUS ----------
    @Transactional(rollbackFor = Exception.class)
    public DeviceRiskTypeResponseDto toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        DeviceRiskType entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Device risk type not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED device risk type.");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE endpoint to soft-delete.");
        }

        entity.setIsActive(newIsActive);
        entity = repository.save(entity);
        return mapToDto(entity);
    }

    // ---------- GET ALL (non-deleted) ----------
    public List<DeviceRiskTypeResponseDto> getAll() {
        return repository.findAllVisible(jwtService.getTenantId());
    }

    // ---------- GET ALL ACTIVE (for dropdowns) ----------
    public List<DeviceRiskTypeResponseDto> getAllActive() {
        return repository.findAllActive(jwtService.getTenantId());
    }

    // ---------- GET BY ID ----------
    public DeviceRiskTypeResponseDto getById(Long id) {
        Long tenantId = jwtService.getTenantId();
        DeviceRiskType entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Device risk type not found with ID: " + id));
        return mapToDto(entity);
    }

    // ---------- HELPERS ----------
    private DeviceRiskTypeResponseDto mapToDto(DeviceRiskType e) {
        return DeviceRiskTypeResponseDto.builder()
                .id(e.getId()).tenantId(e.getTenantId())
                .code(e.getCode()).name(e.getName())
                .description(e.getDescription())
                .sortOrder(e.getSortOrder()).isActive(e.getIsActive().name())
                .build();
    }
}


// ============================================================================
// 6. CONTROLLER: DeviceRiskTypeController.java
// Package: com.cmms.device.controller
// ============================================================================

package com.cmms.device.controller;

import com.cmms.device.dto.request.DeviceRiskTypeCreateRequest;
import com.cmms.device.dto.request.DeviceRiskTypeUpdateRequest;
import com.cmms.device.service.DeviceRiskTypeService;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.dto.StatusToggleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/device/risk-type")
@RequiredArgsConstructor
public class DeviceRiskTypeController {

    private final DeviceRiskTypeService service;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody DeviceRiskTypeCreateRequest req) {
        var result = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Device risk type created", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody DeviceRiskTypeUpdateRequest req) {
        var result = service.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Device risk type updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Device risk type soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = service.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Device risk type status toggled", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll() {
        var result = service.getAll();
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Device risk types fetched", result));
    }

    @GetMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive() {
        var result = service.getAllActive();
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active device risk types fetched", result));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable("id") Long id) {
        var result = service.getById(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Device risk type fetched", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON
// ============================================================================
/*

--- POST /api/device/risk-type/create ---
REQUEST:
{
  "code": "HIGH",
  "name": "High Risk",
  "description": "Life-supporting or life-sustaining equipment",
  "sortOrder": 1,
  "isActive": "ACTIVE"
}

RESPONSE (201):
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Device risk type created",
  "data": {
    "id": 1,
    "tenantId": 100,
    "code": "HIGH",
    "name": "High Risk",
    "description": "Life-supporting or life-sustaining equipment",
    "sortOrder": 1,
    "isActive": "ACTIVE"
  }
}

--- GET /api/device/risk-type/get-all ---
RESPONSE:
{
  "data": [
    { "id": 1, "code": "HIGH", "name": "High Risk", "description": "Life-supporting or life-sustaining equipment", "sortOrder": 1, "isActive": "ACTIVE" },
    { "id": 2, "code": "MEDIUM", "name": "Medium Risk", "description": "Diagnostic and therapeutic equipment", "sortOrder": 2, "isActive": "ACTIVE" },
    { "id": 3, "code": "LOW", "name": "Low Risk", "description": "Non-critical equipment", "sortOrder": 3, "isActive": "ACTIVE" },
    { "id": 4, "code": "MISC", "name": "Miscellaneous", "description": "General purpose equipment", "sortOrder": 4, "isActive": "INACTIVE" }
  ]
}

--- PATCH /api/device/risk-type/toggle-status ---
REQUEST:
{
  "id": 4,
  "isActive": "ACTIVE"
}

--- DELETE /api/device/risk-type/delete/4 ---
RESPONSE:
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Device risk type soft-deleted"
}

*/
