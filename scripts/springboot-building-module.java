// ============================================================================
// SPRING BOOT 3.x MODULE: building
// Table       : building
// Base Tables : organization (RBAC, external)
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/building
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) -- reuses existing column as EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: Building.java
// Package: com.cmms.location.entity
// ============================================================================

package com.cmms.location.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "building",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_building_tenant_org_code",
           columnNames = {"tenant_id", "org_id", "building_code"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "building_id")
    private Long buildingId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "org_id", nullable = false)
    private Long orgId;

    @Column(name = "building_name", nullable = false, length = 150)
    private String buildingName;

    @Column(name = "building_code", length = 50)
    private String buildingCode;

    @Column(name = "description", length = 500)
    private String description;

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
// Package: com.cmms.location.dto.request
// ============================================================================

// ---------- BuildingCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BuildingCreateRequest {

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotBlank(message = "buildingName is required")
    @Size(max = 150)
    private String buildingName;

    @Size(max = 50)
    private String buildingCode;

    @Size(max = 500)
    private String description;

    // Optional: defaults to ACTIVE if null
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- BuildingUpdateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BuildingUpdateRequest {

    @NotNull(message = "buildingId is required")
    private Long buildingId;

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotBlank(message = "buildingName is required")
    @Size(max = 150)
    private String buildingName;

    @Size(max = 50)
    private String buildingCode;

    @Size(max = 500)
    private String description;

    // NOTE: status is NOT in update DTO. Use PATCH /toggle-status or DELETE /delete/{id} instead.
}


// ============================================================================
// 3. RESPONSE DTOs
// Package: com.cmms.location.dto.response
// ============================================================================

// ---------- BuildingResponseBasic.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BuildingResponseBasic {
    private Long buildingId;
    private Long tenantId;
    private Long orgId;
    private String buildingName;
    private String buildingCode;
    private String description;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
}

// ---------- BuildingResponseExpanded.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BuildingResponseExpanded {
    private Long buildingId;
    private Long tenantId;
    private Long orgId;
    private String orgName;          // enriched from organization
    private String orgCode;          // enriched from organization
    private String buildingName;
    private String buildingCode;
    private String description;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
    private Long floorCount;         // aggregated (non-deleted)
    private Long roomCount;          // aggregated (non-deleted)
    private Long bedCount;           // aggregated (non-deleted)
    private Long activeBedCount;     // aggregated (ACTIVE only)

    // Constructor for JPQL projection
    public BuildingResponseExpanded(Long buildingId, Long tenantId, Long orgId,
                                     String buildingName, String buildingCode,
                                     String description, String isActive,
                                     Long floorCount, Long roomCount,
                                     Long bedCount, Long activeBedCount) {
        this.buildingId = buildingId;
        this.tenantId = tenantId;
        this.orgId = orgId;
        this.buildingName = buildingName;
        this.buildingCode = buildingCode;
        this.description = description;
        this.isActive = isActive;
        this.floorCount = floorCount;
        this.roomCount = roomCount;
        this.bedCount = bedCount;
        this.activeBedCount = activeBedCount;
    }
}


// ============================================================================
// 4. REPOSITORY: BuildingRepository.java
// Package: com.cmms.location.repository
// ============================================================================

package com.cmms.location.repository;

import com.cmms.location.entity.Building;
import com.cmms.common.enums.RecordStatus;
import com.cmms.location.dto.response.BuildingResponseBasic;
import com.cmms.location.dto.response.BuildingResponseExpanded;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {

    // --- Duplicate check (case+trim insensitive, excludes DELETED) ---
    @Query("""
        SELECT COUNT(b) > 0 FROM Building b
        WHERE b.tenantId = :tenantId AND b.orgId = :orgId
        AND LOWER(TRIM(b.buildingCode)) = LOWER(TRIM(:code))
        AND b.isActive <> 'DELETED'
        AND (:excludeId IS NULL OR b.buildingId <> :excludeId)
    """)
    boolean existsDuplicateCode(@Param("tenantId") Long tenantId,
                                @Param("orgId") Long orgId,
                                @Param("code") String code,
                                @Param("excludeId") Long excludeId);

    // --- All visible (non-deleted) basic projection ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BuildingResponseBasic(
            b.buildingId, b.tenantId, b.orgId,
            b.buildingName, b.buildingCode, b.description, CAST(b.isActive AS string)
        )
        FROM Building b
        WHERE b.tenantId = :tenantId AND b.orgId = :orgId AND b.isActive <> 'DELETED'
        ORDER BY b.buildingName
    """)
    Page<BuildingResponseBasic> findAllVisible(@Param("tenantId") Long tenantId,
                                                @Param("orgId") Long orgId,
                                                Pageable pageable);

    // --- Expanded projection (LEFT JOIN aggregated counts, non-deleted children) ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BuildingResponseExpanded(
            b.buildingId, b.tenantId, b.orgId,
            b.buildingName, b.buildingCode, b.description, CAST(b.isActive AS string),
            COUNT(DISTINCT CASE WHEN fl.isActive <> 'DELETED' THEN fl.floorId END),
            COUNT(DISTINCT CASE WHEN r.isActive <> 'DELETED' THEN r.roomId END),
            COUNT(DISTINCT CASE WHEN bd.isActive <> 'DELETED' THEN bd.bedId END),
            COUNT(DISTINCT CASE WHEN bd.isActive = 'ACTIVE' THEN bd.bedId END)
        )
        FROM Building b
        LEFT JOIN Floor fl ON fl.buildingId = b.buildingId
        LEFT JOIN Room r ON r.floorId = fl.floorId
        LEFT JOIN Bed bd ON bd.roomId = r.roomId
        WHERE b.tenantId = :tenantId AND b.orgId = :orgId AND b.isActive <> 'DELETED'
        GROUP BY b.buildingId, b.tenantId, b.orgId,
                 b.buildingName, b.buildingCode, b.description, b.isActive
        ORDER BY b.buildingName
    """)
    Page<BuildingResponseExpanded> findAllExpanded(@Param("tenantId") Long tenantId,
                                                    @Param("orgId") Long orgId,
                                                    Pageable pageable);

    // --- Active only (basic) ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BuildingResponseBasic(
            b.buildingId, b.tenantId, b.orgId,
            b.buildingName, b.buildingCode, b.description, CAST(b.isActive AS string)
        )
        FROM Building b
        WHERE b.tenantId = :tenantId AND b.orgId = :orgId AND b.isActive = 'ACTIVE'
        ORDER BY b.buildingName
    """)
    Page<BuildingResponseBasic> findAllActive(@Param("tenantId") Long tenantId,
                                               @Param("orgId") Long orgId,
                                               Pageable pageable);

    // --- Single record by ID + tenant (any status, for internal lookups/audit) ---
    Optional<Building> findByBuildingIdAndTenantId(Long buildingId, Long tenantId);

    // --- Expanded single record ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BuildingResponseExpanded(
            b.buildingId, b.tenantId, b.orgId,
            b.buildingName, b.buildingCode, b.description, CAST(b.isActive AS string),
            COUNT(DISTINCT CASE WHEN fl.isActive <> 'DELETED' THEN fl.floorId END),
            COUNT(DISTINCT CASE WHEN r.isActive <> 'DELETED' THEN r.roomId END),
            COUNT(DISTINCT CASE WHEN bd.isActive <> 'DELETED' THEN bd.bedId END),
            COUNT(DISTINCT CASE WHEN bd.isActive = 'ACTIVE' THEN bd.bedId END)
        )
        FROM Building b
        LEFT JOIN Floor fl ON fl.buildingId = b.buildingId
        LEFT JOIN Room r ON r.floorId = fl.floorId
        LEFT JOIN Bed bd ON bd.roomId = r.roomId
        WHERE b.buildingId = :buildingId AND b.tenantId = :tenantId
        GROUP BY b.buildingId, b.tenantId, b.orgId,
                 b.buildingName, b.buildingCode, b.description, b.isActive
    """)
    Optional<BuildingResponseExpanded> findByIdExpanded(@Param("buildingId") Long buildingId,
                                                         @Param("tenantId") Long tenantId);
}


// ============================================================================
// 5. SERVICE: BuildingService.java
// Package: com.cmms.location.service
// ============================================================================

package com.cmms.location.service;

import com.cmms.location.dto.request.BuildingCreateRequest;
import com.cmms.location.dto.request.BuildingUpdateRequest;
import com.cmms.location.dto.response.BuildingResponseBasic;
import com.cmms.location.dto.response.BuildingResponseExpanded;
import com.cmms.location.entity.Building;
import com.cmms.location.repository.BuildingRepository;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.dto.StatusToggleRequest;
import com.cmms.common.enums.RecordStatus;
import com.cmms.common.exception.DuplicateException;
import com.cmms.common.exception.NotFoundException;
import com.cmms.common.exception.ForbiddenException;
import com.cmms.common.exception.InvalidStatusException;
import com.cmms.common.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final JwtService jwtService;

    // ---------- CREATE ----------
    @Transactional(rollbackFor = Exception.class)
    public BuildingResponseBasic create(BuildingCreateRequest req) {
        Long tenantId = jwtService.getTenantId();
        Long orgId = req.getOrgId();

        validateOrgAccess(orgId);

        if (req.getBuildingCode() != null && !req.getBuildingCode().isBlank()) {
            if (buildingRepository.existsDuplicateCode(tenantId, orgId, req.getBuildingCode(), null)) {
                throw new DuplicateException("DUPLICATE_BUILDING_CODE",
                    "Building code '" + req.getBuildingCode().trim() + "' already exists in this organization");
            }
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        Building entity = Building.builder()
                .tenantId(tenantId)
                .orgId(orgId)
                .buildingName(req.getBuildingName().trim())
                .buildingCode(req.getBuildingCode() != null ? req.getBuildingCode().trim() : null)
                .description(req.getDescription())
                .isActive(initialIsActive)
                .build();

        entity = buildingRepository.save(entity);
        return mapToBasic(entity);
    }

    // ---------- UPDATE (does NOT change status) ----------
    @Transactional(rollbackFor = Exception.class)
    public BuildingResponseBasic update(BuildingUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();

        validateOrgAccess(req.getOrgId());

        Building entity = buildingRepository.findByBuildingIdAndTenantId(req.getBuildingId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Building not found with ID: " + req.getBuildingId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED building. Restore it first.");
        }

        if (req.getBuildingCode() != null && !req.getBuildingCode().isBlank()) {
            if (buildingRepository.existsDuplicateCode(tenantId, req.getOrgId(),
                    req.getBuildingCode(), req.getBuildingId())) {
                throw new DuplicateException("DUPLICATE_BUILDING_CODE",
                    "Building code '" + req.getBuildingCode().trim() + "' already exists in this organization");
            }
        }

        entity.setOrgId(req.getOrgId());
        entity.setBuildingName(req.getBuildingName().trim());
        entity.setBuildingCode(req.getBuildingCode() != null ? req.getBuildingCode().trim() : null);
        entity.setDescription(req.getDescription());
        // NOTE: isActive is NOT updated here -- use toggle-status or delete

        entity = buildingRepository.save(entity);
        return mapToBasic(entity);
    }

    // ---------- SOFT DELETE (sets status = DELETED) ----------
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long buildingId) {
        Long tenantId = jwtService.getTenantId();
        Building entity = buildingRepository.findByBuildingIdAndTenantId(buildingId, tenantId)
                .orElseThrow(() -> new NotFoundException("Building not found with ID: " + buildingId));

        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Building is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        buildingRepository.save(entity);
    }

    // ---------- TOGGLE STATUS (ACTIVE <-> INACTIVE) ----------
    @Transactional(rollbackFor = Exception.class)
    public BuildingResponseBasic toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        Building entity = buildingRepository.findByBuildingIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Building not found with ID: " + req.getId()));

        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED building.");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE /delete/{id} to soft-delete. Toggle only supports ACTIVE/INACTIVE.");
        }

        entity.setIsActive(newIsActive);
        entity = buildingRepository.save(entity);
        return mapToBasic(entity);
    }

    // ---------- GET ALL (non-deleted) ----------
    public Page<?> getAll(Long orgId, boolean expand, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(orgId);

        if (expand) {
            return buildingRepository.findAllExpanded(tenantId, orgId, pageable);
        }
        return buildingRepository.findAllVisible(tenantId, orgId, pageable);
    }

    // ---------- GET ALL ACTIVE ----------
    public Page<BuildingResponseBasic> getAllActive(Long orgId, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(orgId);
        return buildingRepository.findAllActive(tenantId, orgId, pageable);
    }

    // ---------- GET BY ID ----------
    public Object getById(Long buildingId, boolean expand) {
        Long tenantId = jwtService.getTenantId();

        if (expand) {
            return buildingRepository.findByIdExpanded(buildingId, tenantId)
                    .orElseThrow(() -> new NotFoundException("Building not found with ID: " + buildingId));
        }

        Building entity = buildingRepository.findByBuildingIdAndTenantId(buildingId, tenantId)
                .orElseThrow(() -> new NotFoundException("Building not found with ID: " + buildingId));

        validateOrgAccess(entity.getOrgId());
        return mapToBasic(entity);
    }

    // ---------- HELPERS ----------
    private BuildingResponseBasic mapToBasic(Building entity) {
        return BuildingResponseBasic.builder()
                .buildingId(entity.getBuildingId())
                .tenantId(entity.getTenantId())
                .orgId(entity.getOrgId())
                .buildingName(entity.getBuildingName())
                .buildingCode(entity.getBuildingCode())
                .description(entity.getDescription())
                .isActive(entity.getIsActive().name())
                .build();
    }

    private void validateOrgAccess(Long orgId) {
        Long userOrgId = jwtService.getOrgId();
        if (userOrgId != null && !userOrgId.equals(0L) && !userOrgId.equals(orgId)) {
            throw new ForbiddenException("Access denied to organization: " + orgId);
        }
    }
}


// ============================================================================
// 6. CONTROLLER: BuildingController.java
// Package: com.cmms.location.controller
// ============================================================================

package com.cmms.location.controller;

import com.cmms.location.dto.request.BuildingCreateRequest;
import com.cmms.location.dto.request.BuildingUpdateRequest;
import com.cmms.location.service.BuildingService;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.dto.StatusToggleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/building")
@RequiredArgsConstructor
public class BuildingController {

    private final BuildingService buildingService;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody BuildingCreateRequest req) {
        var result = buildingService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Building created", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody BuildingUpdateRequest req) {
        var result = buildingService.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Building updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        buildingService.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Building soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = buildingService.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Building status updated", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(
            @RequestParam("orgId") Long orgId,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand,
            @PageableDefault(size = 20, sort = "buildingId") Pageable pageable) {
        var result = buildingService.getAll(orgId, expand, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Buildings retrieved", result));
    }

    @PostMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive(
            @RequestParam("orgId") Long orgId,
            @PageableDefault(size = 20) Pageable pageable) {
        var result = buildingService.getAllActive(orgId, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active buildings retrieved", result));
    }

    @GetMapping("/get-by-id")
    public ResponseEntity<ResponseDto> getById(
            @RequestParam("id") Long id,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand) {
        var result = buildingService.getById(id, expand);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Building retrieved", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON: Building (status-aware)
// ============================================================================

/*
--- POST /api/building/create ---
REQUEST:
{
    "orgId": 1,
    "buildingName": "Main Tower",
    "buildingCode": "MT",
    "description": "Primary 8-floor main tower",
    "isActive": "ACTIVE"
}

RESPONSE (201):
{
    "requestId": "a1b2c3d4-...",
    "statusCode": 201,
    "message": "Building created",
    "data": {
        "buildingId": 1,
        "tenantId": 1,
        "orgId": 1,
        "buildingName": "Main Tower",
        "buildingCode": "MT",
        "description": "Primary 8-floor main tower",
        "isActive": "ACTIVE"
    }
}

--- PUT /api/building/update ---
REQUEST (NOTE: no status field):
{
    "buildingId": 1,
    "orgId": 1,
    "buildingName": "Main Tower (Renamed)",
    "buildingCode": "MT",
    "description": "Updated description"
}

RESPONSE (200):
{
    "requestId": "e5f6g7h8-...",
    "statusCode": 200,
    "message": "Building updated",
    "data": {
        "buildingId": 1,
        "tenantId": 1,
        "orgId": 1,
        "buildingName": "Main Tower (Renamed)",
        "buildingCode": "MT",
        "description": "Updated description",
        "isActive": "ACTIVE"
    }
}

--- DELETE /api/building/delete/1 ---
RESPONSE (200):
{
    "requestId": "i9j0k1l2-...",
    "statusCode": 200,
    "message": "Building soft-deleted",
    "data": null
}

--- PATCH /api/building/toggle-status ---
REQUEST:
{
    "id": 1,
    "isActive": "INACTIVE"
}

RESPONSE (200):
{
    "requestId": "t1u2v3w4-...",
    "statusCode": 200,
    "message": "Building status updated",
    "data": {
        "buildingId": 1,
        "tenantId": 1,
        "orgId": 1,
        "buildingName": "Main Tower",
        "buildingCode": "MT",
        "description": "Primary 8-floor main tower",
        "isActive": "INACTIVE"
    }
}

--- GET /api/building/get-all?orgId=1&expand=true ---
RESPONSE (200):
{
    "requestId": "m3n4o5p6-...",
    "statusCode": 200,
    "message": "Buildings retrieved",
    "data": {
        "content": [
            {
                "buildingId": 1,
                "tenantId": 1,
                "orgId": 1,
                "buildingName": "Main Tower",
                "buildingCode": "MT",
                "description": "Primary 8-floor main tower",
                "isActive": "ACTIVE",
                "floorCount": 8,
                "roomCount": 19,
                "bedCount": 116,
                "activeBedCount": 116
            },
            {
                "buildingId": 2,
                "tenantId": 1,
                "orgId": 1,
                "buildingName": "Old Wing",
                "buildingCode": "OW",
                "description": "Temporarily disabled wing",
                "isActive": "INACTIVE",
                "floorCount": 2,
                "roomCount": 4,
                "bedCount": 10,
                "activeBedCount": 0
            }
        ],
        "totalElements": 2,
        "totalPages": 1
    }
}
(Note: DELETED buildings never appear in get-all)

--- ERROR 400 (Invalid status on toggle) ---
{
    "requestId": "x5y6z7a8-...",
    "statusCode": 400,
    "message": "Cannot toggle status of a DELETED building.",
    "errorCode": "INVALID_STATUS"
}

--- ERROR 400 (Cannot update deleted) ---
{
    "requestId": "b9c0d1e2-...",
    "statusCode": 400,
    "message": "Cannot update a DELETED building. Restore it first.",
    "errorCode": "INVALID_STATUS"
}

--- ERROR 409 (Duplicate) ---
{
    "requestId": "u1v2w3x4-...",
    "statusCode": 409,
    "message": "Building code 'MT' already exists in this organization",
    "errorCode": "DUPLICATE_BUILDING_CODE"
}
*/
