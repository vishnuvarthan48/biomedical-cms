// ============================================================================
// SPRING BOOT 3.x MODULE: equipment_class_option (Device Dropdown - child of inlet_power)
// Table       : equipment_class_option
// Parent FK   : inlet_power_id -> inlet_power(id)
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/device/equipment-class
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) via EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: EquipmentClassOption.java
// Package: com.cmms.device.entity
// ============================================================================

package com.cmms.device.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "equipment_class_option",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_class_per_inlet",
           columnNames = {"tenant_id", "inlet_power_id", "code"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentClassOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "inlet_power_id", nullable = false)
    private Long inletPowerId;

    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @PrePersist
    void prePersist() {
        if (this.isActive == null) this.isActive = RecordStatus.ACTIVE;
        if (this.isDefault == null) this.isDefault = false;
        if (this.sortOrder == null) this.sortOrder = 0;
    }
}


// ============================================================================
// 2. REQUEST DTOs
// Package: com.cmms.device.dto.request
// ============================================================================

// ---------- EquipmentClassCreateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentClassCreateRequest {

    @NotNull(message = "inletPowerId is required")
    private Long inletPowerId;

    @NotBlank(message = "code is required")
    @Size(max = 30)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 60)
    private String name;

    private Boolean isDefault;
    private Integer sortOrder;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- EquipmentClassUpdateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipmentClassUpdateRequest {

    @NotNull(message = "id is required")
    private Long id;

    @NotNull(message = "inletPowerId is required")
    private Long inletPowerId;

    @NotBlank(message = "code is required")
    @Size(max = 30)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 60)
    private String name;

    private Boolean isDefault;
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
public class EquipmentClassResponseDto {
    private Long id;
    private Long tenantId;
    private Long inletPowerId;
    private String inletPowerCode;   // enriched from parent
    private String inletPowerName;   // enriched from parent
    private String code;
    private String name;
    private Boolean isDefault;
    private Integer sortOrder;
    private String isActive;         // ACTIVE | INACTIVE | DELETED
}


// ============================================================================
// 4. REPOSITORY: EquipmentClassOptionRepository.java
// Package: com.cmms.device.repository
// ============================================================================

package com.cmms.device.repository;

import com.cmms.device.entity.EquipmentClassOption;
import com.cmms.device.dto.response.EquipmentClassResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentClassOptionRepository extends JpaRepository<EquipmentClassOption, Long> {

    Optional<EquipmentClassOption> findByIdAndTenantId(Long id, Long tenantId);

    @Query("""
        SELECT CASE WHEN COUNT(eco) > 0 THEN true ELSE false END
        FROM EquipmentClassOption eco
        WHERE eco.tenantId = :tenantId
          AND eco.inletPowerId = :inletPowerId
          AND UPPER(eco.code) = UPPER(:code)
          AND eco.isActive <> 'DELETED'
          AND (:excludeId IS NULL OR eco.id <> :excludeId)
    """)
    boolean existsDuplicate(@Param("tenantId") Long tenantId,
                            @Param("inletPowerId") Long inletPowerId,
                            @Param("code") String code,
                            @Param("excludeId") Long excludeId);

    // All visible by inlet_power
    @Query("""
        SELECT new com.cmms.device.dto.response.EquipmentClassResponseDto(
            eco.id, eco.tenantId, eco.inletPowerId, ip.code, ip.name,
            eco.code, eco.name, eco.isDefault, eco.sortOrder, CAST(eco.isActive AS string)
        )
        FROM EquipmentClassOption eco
        JOIN InletPower ip ON ip.id = eco.inletPowerId AND ip.tenantId = eco.tenantId
        WHERE eco.tenantId = :tenantId
          AND eco.inletPowerId = :inletPowerId
          AND eco.isActive <> 'DELETED'
        ORDER BY eco.sortOrder, eco.name
    """)
    List<EquipmentClassResponseDto> findAllVisibleByInletPower(@Param("tenantId") Long tenantId,
                                                                @Param("inletPowerId") Long inletPowerId);

    // All ACTIVE by inlet_power (for dropdown)
    @Query("""
        SELECT new com.cmms.device.dto.response.EquipmentClassResponseDto(
            eco.id, eco.tenantId, eco.inletPowerId, ip.code, ip.name,
            eco.code, eco.name, eco.isDefault, eco.sortOrder, CAST(eco.isActive AS string)
        )
        FROM EquipmentClassOption eco
        JOIN InletPower ip ON ip.id = eco.inletPowerId AND ip.tenantId = eco.tenantId
        WHERE eco.tenantId = :tenantId
          AND eco.inletPowerId = :inletPowerId
          AND eco.isActive = 'ACTIVE'
        ORDER BY eco.sortOrder, eco.name
    """)
    List<EquipmentClassResponseDto> findAllActiveByInletPower(@Param("tenantId") Long tenantId,
                                                               @Param("inletPowerId") Long inletPowerId);

    // Clear defaults
    @Query("""
        UPDATE EquipmentClassOption eco
        SET eco.isDefault = false
        WHERE eco.tenantId = :tenantId AND eco.inletPowerId = :inletPowerId
          AND eco.isDefault = true AND eco.id <> :excludeId
    """)
    void clearDefaultsForInletPower(@Param("tenantId") Long tenantId,
                                    @Param("inletPowerId") Long inletPowerId,
                                    @Param("excludeId") Long excludeId);
}


// ============================================================================
// 5. SERVICE: EquipmentClassOptionService.java
// Package: com.cmms.device.service
// ============================================================================

package com.cmms.device.service;

import com.cmms.device.dto.request.EquipmentClassCreateRequest;
import com.cmms.device.dto.request.EquipmentClassUpdateRequest;
import com.cmms.device.dto.response.EquipmentClassResponseDto;
import com.cmms.device.entity.EquipmentClassOption;
import com.cmms.device.entity.InletPower;
import com.cmms.device.repository.EquipmentClassOptionRepository;
import com.cmms.device.repository.InletPowerRepository;
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
public class EquipmentClassOptionService {

    private final EquipmentClassOptionRepository repository;
    private final InletPowerRepository inletPowerRepo;
    private final JwtService jwtService;

    // ---------- CREATE ----------
    @Transactional(rollbackFor = Exception.class)
    public EquipmentClassResponseDto create(EquipmentClassCreateRequest req) {
        Long tenantId = jwtService.getTenantId();

        InletPower parent = inletPowerRepo.findByIdAndTenantId(req.getInletPowerId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Inlet power not found with ID: " + req.getInletPowerId()));
        if (parent.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot add equipment class to a DELETED inlet power.");
        }

        if (repository.existsDuplicate(tenantId, req.getInletPowerId(), req.getCode(), null)) {
            throw new DuplicateException("DUPLICATE_EQUIPMENT_CLASS",
                "Equipment class '" + req.getCode() + "' already exists for this inlet power");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        EquipmentClassOption entity = EquipmentClassOption.builder()
                .tenantId(tenantId)
                .inletPowerId(req.getInletPowerId())
                .code(req.getCode().trim().toUpperCase())
                .name(req.getName().trim())
                .isDefault(req.getIsDefault() != null ? req.getIsDefault() : false)
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .isActive(initialIsActive)
                .build();

        entity = repository.save(entity);

        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            repository.clearDefaultsForInletPower(tenantId, entity.getInletPowerId(), entity.getId());
        }

        return mapToDto(entity, parent);
    }

    // ---------- UPDATE ----------
    @Transactional(rollbackFor = Exception.class)
    public EquipmentClassResponseDto update(EquipmentClassUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();

        EquipmentClassOption entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Equipment class not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED equipment class.");
        }

        if (repository.existsDuplicate(tenantId, req.getInletPowerId(), req.getCode(), req.getId())) {
            throw new DuplicateException("DUPLICATE_EQUIPMENT_CLASS",
                "Equipment class '" + req.getCode() + "' already exists for this inlet power");
        }

        entity.setInletPowerId(req.getInletPowerId());
        entity.setCode(req.getCode().trim().toUpperCase());
        entity.setName(req.getName().trim());
        if (req.getIsDefault() != null) entity.setIsDefault(req.getIsDefault());
        if (req.getSortOrder() != null) entity.setSortOrder(req.getSortOrder());

        entity = repository.save(entity);

        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            repository.clearDefaultsForInletPower(tenantId, entity.getInletPowerId(), entity.getId());
        }

        InletPower parent = inletPowerRepo.findByIdAndTenantId(entity.getInletPowerId(), tenantId).orElse(null);
        return mapToDto(entity, parent);
    }

    // ---------- SOFT DELETE ----------
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Long tenantId = jwtService.getTenantId();
        EquipmentClassOption entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Equipment class not found with ID: " + id));
        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Equipment class is already deleted.");
        }
        entity.setIsActive(RecordStatus.DELETED);
        repository.save(entity);
    }

    // ---------- TOGGLE STATUS ----------
    @Transactional(rollbackFor = Exception.class)
    public EquipmentClassResponseDto toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        EquipmentClassOption entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Equipment class not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED equipment class.");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE endpoint to soft-delete.");
        }

        entity.setIsActive(newIsActive);
        entity = repository.save(entity);
        InletPower parent = inletPowerRepo.findByIdAndTenantId(entity.getInletPowerId(), tenantId).orElse(null);
        return mapToDto(entity, parent);
    }

    // ---------- GET ALL by inlet_power ----------
    public List<EquipmentClassResponseDto> getAll(Long inletPowerId) {
        return repository.findAllVisibleByInletPower(jwtService.getTenantId(), inletPowerId);
    }

    // ---------- GET ALL ACTIVE by inlet_power ----------
    public List<EquipmentClassResponseDto> getAllActive(Long inletPowerId) {
        return repository.findAllActiveByInletPower(jwtService.getTenantId(), inletPowerId);
    }

    // ---------- GET BY ID ----------
    public EquipmentClassResponseDto getById(Long id) {
        Long tenantId = jwtService.getTenantId();
        EquipmentClassOption entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Equipment class not found with ID: " + id));
        InletPower parent = inletPowerRepo.findByIdAndTenantId(entity.getInletPowerId(), tenantId).orElse(null);
        return mapToDto(entity, parent);
    }

    // ---------- HELPERS ----------
    private EquipmentClassResponseDto mapToDto(EquipmentClassOption e, InletPower parent) {
        return EquipmentClassResponseDto.builder()
                .id(e.getId()).tenantId(e.getTenantId())
                .inletPowerId(e.getInletPowerId())
                .inletPowerCode(parent != null ? parent.getCode() : null)
                .inletPowerName(parent != null ? parent.getName() : null)
                .code(e.getCode()).name(e.getName())
                .isDefault(e.getIsDefault()).sortOrder(e.getSortOrder())
                .isActive(e.getIsActive().name())
                .build();
    }
}


// ============================================================================
// 6. CONTROLLER: EquipmentClassOptionController.java
// Package: com.cmms.device.controller
// ============================================================================

package com.cmms.device.controller;

import com.cmms.device.dto.request.EquipmentClassCreateRequest;
import com.cmms.device.dto.request.EquipmentClassUpdateRequest;
import com.cmms.device.service.EquipmentClassOptionService;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.dto.StatusToggleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/device/equipment-class")
@RequiredArgsConstructor
public class EquipmentClassOptionController {

    private final EquipmentClassOptionService service;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody EquipmentClassCreateRequest req) {
        var result = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Equipment class created", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody EquipmentClassUpdateRequest req) {
        var result = service.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Equipment class updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Equipment class soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = service.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Equipment class status toggled", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(@RequestParam("inletPowerId") Long inletPowerId) {
        var result = service.getAll(inletPowerId);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Equipment classes fetched", result));
    }

    @GetMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive(@RequestParam("inletPowerId") Long inletPowerId) {
        var result = service.getAllActive(inletPowerId);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active equipment classes fetched", result));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable("id") Long id) {
        var result = service.getById(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Equipment class fetched", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON
// ============================================================================
/*

--- POST /api/device/equipment-class/create ---
REQUEST:
{
  "inletPowerId": 1,
  "code": "CLASS_I",
  "name": "Class I",
  "isDefault": true,
  "sortOrder": 1,
  "isActive": "ACTIVE"
}

RESPONSE (201):
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Equipment class created",
  "data": {
    "id": 1,
    "tenantId": 100,
    "inletPowerId": 1,
    "inletPowerCode": "AC",
    "inletPowerName": "Alternating Current",
    "code": "CLASS_I",
    "name": "Class I",
    "isDefault": true,
    "sortOrder": 1,
    "isActive": "ACTIVE"
  }
}

--- GET /api/device/equipment-class/get-all?inletPowerId=1 ---
RESPONSE:
{
  "data": [
    { "id": 1, "code": "CLASS_I", "name": "Class I", "isDefault": true, "sortOrder": 1, "isActive": "ACTIVE" },
    { "id": 2, "code": "CLASS_II", "name": "Class II", "isDefault": false, "sortOrder": 2, "isActive": "ACTIVE" },
    { "id": 3, "code": "CLASS_III_SELV", "name": "Class III / SELV", "isDefault": false, "sortOrder": 3, "isActive": "ACTIVE" }
  ]
}

*/
