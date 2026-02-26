// ============================================================================
// SPRING BOOT 3.x MODULE: inlet_power (Device Management Dropdown - Master)
// Table       : inlet_power
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/device/inlet-power
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) via EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: InletPower.java
// Package: com.cmms.device.entity
// ============================================================================

package com.cmms.device.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inlet_power",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_inlet_power_tenant_code",
           columnNames = {"tenant_id", "code"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InletPower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "code", nullable = false, length = 10)
    private String code;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @PrePersist
    void prePersist() {
        if (this.isActive == null) this.isActive = RecordStatus.ACTIVE;
        if (this.sortOrder == null) this.sortOrder = 0;
    }
}


// ============================================================================
// 2. REQUEST DTOs
// Package: com.cmms.device.dto.request
// ============================================================================

// ---------- InletPowerCreateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InletPowerCreateRequest {

    @NotBlank(message = "code is required")
    @Size(max = 10)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 50)
    private String name;

    private Integer sortOrder;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- InletPowerUpdateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InletPowerUpdateRequest {

    @NotNull(message = "id is required")
    private Long id;

    @NotBlank(message = "code is required")
    @Size(max = 10)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 50)
    private String name;

    private Integer sortOrder;

    // isActive NOT updatable -- use toggle-status or delete
}


// ============================================================================
// 3. RESPONSE DTO
// Package: com.cmms.device.dto.response
// ============================================================================

// ---------- InletPowerResponseDto.java ----------
package com.cmms.device.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InletPowerResponseDto {
    private Long id;
    private Long tenantId;
    private String code;
    private String name;
    private Integer sortOrder;
    private String isActive;    // ACTIVE | INACTIVE | DELETED
}

// ---------- InletPowerExpandedDto.java (includes child counts) ----------
package com.cmms.device.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InletPowerExpandedDto {
    private Long id;
    private Long tenantId;
    private String code;
    private String name;
    private Integer sortOrder;
    private String isActive;
    private Long voltageCount;         // non-deleted voltage options
    private Long equipmentClassCount;  // non-deleted equipment class options
    private Long equipmentTypeCount;   // non-deleted equipment type options

    // Constructor for JPQL projection
    public InletPowerExpandedDto(Long id, Long tenantId, String code, String name,
                                  Integer sortOrder, String isActive,
                                  Long voltageCount, Long equipmentClassCount,
                                  Long equipmentTypeCount) {
        this.id = id; this.tenantId = tenantId; this.code = code;
        this.name = name; this.sortOrder = sortOrder; this.isActive = isActive;
        this.voltageCount = voltageCount;
        this.equipmentClassCount = equipmentClassCount;
        this.equipmentTypeCount = equipmentTypeCount;
    }
}


// ============================================================================
// 4. REPOSITORY: InletPowerRepository.java
// Package: com.cmms.device.repository
// ============================================================================

package com.cmms.device.repository;

import com.cmms.device.entity.InletPower;
import com.cmms.device.dto.response.InletPowerResponseDto;
import com.cmms.device.dto.response.InletPowerExpandedDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InletPowerRepository extends JpaRepository<InletPower, Long> {

    Optional<InletPower> findByIdAndTenantId(Long id, Long tenantId);

    // Duplicate check (code per tenant, excluding self for update)
    @Query("""
        SELECT CASE WHEN COUNT(ip) > 0 THEN true ELSE false END
        FROM InletPower ip
        WHERE ip.tenantId = :tenantId
          AND UPPER(ip.code) = UPPER(:code)
          AND ip.isActive <> 'DELETED'
          AND (:excludeId IS NULL OR ip.id <> :excludeId)
    """)
    boolean existsDuplicateCode(@Param("tenantId") Long tenantId,
                                @Param("code") String code,
                                @Param("excludeId") Long excludeId);

    // All visible (non-deleted), sorted
    @Query("""
        SELECT new com.cmms.device.dto.response.InletPowerResponseDto(
            ip.id, ip.tenantId, ip.code, ip.name, ip.sortOrder, CAST(ip.isActive AS string)
        )
        FROM InletPower ip
        WHERE ip.tenantId = :tenantId AND ip.isActive <> 'DELETED'
        ORDER BY ip.sortOrder, ip.name
    """)
    List<InletPowerResponseDto> findAllVisible(@Param("tenantId") Long tenantId);

    // All ACTIVE only (for dropdown binding)
    @Query("""
        SELECT new com.cmms.device.dto.response.InletPowerResponseDto(
            ip.id, ip.tenantId, ip.code, ip.name, ip.sortOrder, CAST(ip.isActive AS string)
        )
        FROM InletPower ip
        WHERE ip.tenantId = :tenantId AND ip.isActive = 'ACTIVE'
        ORDER BY ip.sortOrder, ip.name
    """)
    List<InletPowerResponseDto> findAllActive(@Param("tenantId") Long tenantId);

    // Expanded: with child counts
    @Query("""
        SELECT new com.cmms.device.dto.response.InletPowerExpandedDto(
            ip.id, ip.tenantId, ip.code, ip.name, ip.sortOrder, CAST(ip.isActive AS string),
            (SELECT COUNT(vo) FROM VoltageOption vo WHERE vo.inletPowerId = ip.id AND vo.tenantId = ip.tenantId AND vo.isActive <> 'DELETED'),
            (SELECT COUNT(eco) FROM EquipmentClassOption eco WHERE eco.inletPowerId = ip.id AND eco.tenantId = ip.tenantId AND eco.isActive <> 'DELETED'),
            (SELECT COUNT(eto) FROM EquipmentTypeOption eto WHERE eto.inletPowerId = ip.id AND eto.tenantId = ip.tenantId AND eto.isActive <> 'DELETED')
        )
        FROM InletPower ip
        WHERE ip.tenantId = :tenantId AND ip.isActive <> 'DELETED'
        ORDER BY ip.sortOrder, ip.name
    """)
    List<InletPowerExpandedDto> findAllExpanded(@Param("tenantId") Long tenantId);
}


// ============================================================================
// 5. SERVICE: InletPowerService.java
// Package: com.cmms.device.service
// ============================================================================

package com.cmms.device.service;

import com.cmms.device.dto.request.InletPowerCreateRequest;
import com.cmms.device.dto.request.InletPowerUpdateRequest;
import com.cmms.device.dto.response.InletPowerResponseDto;
import com.cmms.device.dto.response.InletPowerExpandedDto;
import com.cmms.device.entity.InletPower;
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
public class InletPowerService {

    private final InletPowerRepository repository;
    private final JwtService jwtService;

    // ---------- CREATE ----------
    @Transactional(rollbackFor = Exception.class)
    public InletPowerResponseDto create(InletPowerCreateRequest req) {
        Long tenantId = jwtService.getTenantId();

        if (repository.existsDuplicateCode(tenantId, req.getCode(), null)) {
            throw new DuplicateException("DUPLICATE_INLET_POWER_CODE",
                "Inlet power code '" + req.getCode().trim() + "' already exists");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        InletPower entity = InletPower.builder()
                .tenantId(tenantId)
                .code(req.getCode().trim().toUpperCase())
                .name(req.getName().trim())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .isActive(initialIsActive)
                .build();

        entity = repository.save(entity);
        return mapToDto(entity);
    }

    // ---------- UPDATE (does NOT change isActive) ----------
    @Transactional(rollbackFor = Exception.class)
    public InletPowerResponseDto update(InletPowerUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();

        InletPower entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Inlet power not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED inlet power.");
        }

        if (repository.existsDuplicateCode(tenantId, req.getCode(), req.getId())) {
            throw new DuplicateException("DUPLICATE_INLET_POWER_CODE",
                "Inlet power code '" + req.getCode().trim() + "' already exists");
        }

        entity.setCode(req.getCode().trim().toUpperCase());
        entity.setName(req.getName().trim());
        if (req.getSortOrder() != null) entity.setSortOrder(req.getSortOrder());
        // isActive NOT changed here -- use toggle-status or delete

        entity = repository.save(entity);
        return mapToDto(entity);
    }

    // ---------- SOFT DELETE ----------
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Long tenantId = jwtService.getTenantId();
        InletPower entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Inlet power not found with ID: " + id));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Inlet power is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        repository.save(entity);
    }

    // ---------- TOGGLE STATUS (ACTIVE <-> INACTIVE) ----------
    @Transactional(rollbackFor = Exception.class)
    public InletPowerResponseDto toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        InletPower entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Inlet power not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED inlet power.");
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
    public List<?> getAll(boolean expand) {
        Long tenantId = jwtService.getTenantId();
        if (expand) {
            return repository.findAllExpanded(tenantId);
        }
        return repository.findAllVisible(tenantId);
    }

    // ---------- GET ALL ACTIVE (for dropdowns) ----------
    public List<InletPowerResponseDto> getAllActive() {
        Long tenantId = jwtService.getTenantId();
        return repository.findAllActive(tenantId);
    }

    // ---------- GET BY ID ----------
    public InletPowerResponseDto getById(Long id) {
        Long tenantId = jwtService.getTenantId();
        InletPower entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Inlet power not found with ID: " + id));
        return mapToDto(entity);
    }

    // ---------- HELPERS ----------
    private InletPowerResponseDto mapToDto(InletPower e) {
        return InletPowerResponseDto.builder()
                .id(e.getId()).tenantId(e.getTenantId())
                .code(e.getCode()).name(e.getName())
                .sortOrder(e.getSortOrder()).isActive(e.getIsActive().name())
                .build();
    }
}


// ============================================================================
// 6. CONTROLLER: InletPowerController.java
// Package: com.cmms.device.controller
// ============================================================================

package com.cmms.device.controller;

import com.cmms.device.dto.request.InletPowerCreateRequest;
import com.cmms.device.dto.request.InletPowerUpdateRequest;
import com.cmms.device.service.InletPowerService;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.dto.StatusToggleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/device/inlet-power")
@RequiredArgsConstructor
public class InletPowerController {

    private final InletPowerService service;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody InletPowerCreateRequest req) {
        var result = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Inlet power created", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody InletPowerUpdateRequest req) {
        var result = service.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Inlet power updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Inlet power soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = service.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Inlet power status toggled", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(@RequestParam(value = "expand", defaultValue = "false") boolean expand) {
        var result = service.getAll(expand);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Inlet power list fetched", result));
    }

    @GetMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive() {
        var result = service.getAllActive();
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active inlet power list fetched", result));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable("id") Long id) {
        var result = service.getById(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Inlet power fetched", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON
// ============================================================================
/*

--- POST /api/device/inlet-power/create ---
REQUEST:
{
  "code": "AC",
  "name": "Alternating Current",
  "sortOrder": 1,
  "isActive": "ACTIVE"
}

RESPONSE (201):
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Inlet power created",
  "data": {
    "id": 1,
    "tenantId": 100,
    "code": "AC",
    "name": "Alternating Current",
    "sortOrder": 1,
    "isActive": "ACTIVE"
  }
}

--- GET /api/device/inlet-power/get-all?expand=true ---
RESPONSE:
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Inlet power list fetched",
  "data": [
    {
      "id": 1,
      "tenantId": 100,
      "code": "AC",
      "name": "Alternating Current",
      "sortOrder": 1,
      "isActive": "ACTIVE",
      "voltageCount": 3,
      "equipmentClassCount": 3,
      "equipmentTypeCount": 3
    },
    {
      "id": 2,
      "tenantId": 100,
      "code": "DC",
      "name": "Direct Current",
      "sortOrder": 2,
      "isActive": "ACTIVE",
      "voltageCount": 2,
      "equipmentClassCount": 1,
      "equipmentTypeCount": 1
    },
    {
      "id": 3,
      "tenantId": 100,
      "code": "NA",
      "name": "Not Applicable",
      "sortOrder": 3,
      "isActive": "ACTIVE",
      "voltageCount": 1,
      "equipmentClassCount": 1,
      "equipmentTypeCount": 1
    }
  ]
}

--- PATCH /api/device/inlet-power/toggle-status ---
REQUEST:
{
  "id": 3,
  "isActive": "INACTIVE"
}

--- DELETE /api/device/inlet-power/delete/3 ---
RESPONSE:
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Inlet power soft-deleted"
}

*/
