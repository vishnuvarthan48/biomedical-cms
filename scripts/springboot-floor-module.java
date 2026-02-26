// ============================================================================
// SPRING BOOT 3.x MODULE: floor
// Table       : floor
// Base Tables : building
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/floor
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) -- reuses existing column as EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: Floor.java
// Package: com.cmms.location.entity
// ============================================================================

package com.cmms.location.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "floor",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_floor_tenant_building_no",
           columnNames = {"tenant_id", "building_id", "floor_no"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Floor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "floor_id")
    private Long floorId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "org_id", nullable = false)
    private Long orgId;

    @Column(name = "building_id", nullable = false)
    private Long buildingId;

    @Column(name = "floor_no", nullable = false)
    private Integer floorNo;

    @Column(name = "floor_name", length = 100)
    private String floorName;

    @Column(name = "description", length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // ---------- FK Lazy references (read-only) ----------
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", insertable = false, updatable = false)
    private Building building;

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

// ---------- FloorCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FloorCreateRequest {

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "buildingId is required")
    private Long buildingId;

    @NotNull(message = "floorNo is required")
    private Integer floorNo;

    @Size(max = 100)
    private String floorName;

    @Size(max = 300)
    private String description;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- FloorUpdateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FloorUpdateRequest {

    @NotNull(message = "floorId is required")
    private Long floorId;

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "buildingId is required")
    private Long buildingId;

    @NotNull(message = "floorNo is required")
    private Integer floorNo;

    @Size(max = 100)
    private String floorName;

    @Size(max = 300)
    private String description;

    // No isActive field -- use toggle-status or delete
}

// ---------- FloorBulkCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FloorBulkCreateRequest {

    @NotNull @Size(min = 1, max = 50)
    private List<@Valid FloorCreateRequest> floors;
}


// ============================================================================
// 3. RESPONSE DTOs
// Package: com.cmms.location.dto.response
// ============================================================================

// ---------- FloorResponseBasic.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FloorResponseBasic {
    private Long floorId;
    private Long tenantId;
    private Long orgId;
    private Long buildingId;
    private Integer floorNo;
    private String floorName;
    private String description;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
}

// ---------- FloorResponseExpanded.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FloorResponseExpanded {
    private Long floorId;
    private Long tenantId;
    private Long orgId;
    private Long buildingId;
    private String buildingName;
    private String buildingCode;
    private Integer floorNo;
    private String floorName;
    private String description;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
    private Long roomCount;          // non-deleted
    private Long bedCount;           // non-deleted
    private Long activeBedCount;     // ACTIVE only

    // Constructor for JPQL projection
    public FloorResponseExpanded(Long floorId, Long tenantId, Long orgId,
                                  Long buildingId, String buildingName, String buildingCode,
                                  Integer floorNo, String floorName, String description,
                                  String isActive, Long roomCount, Long bedCount,
                                  Long activeBedCount) {
        this.floorId = floorId; this.tenantId = tenantId; this.orgId = orgId;
        this.buildingId = buildingId; this.buildingName = buildingName; this.buildingCode = buildingCode;
        this.floorNo = floorNo; this.floorName = floorName; this.description = description;
        this.isActive = isActive; this.roomCount = roomCount; this.bedCount = bedCount;
        this.activeBedCount = activeBedCount;
    }
}


// ============================================================================
// 4. REPOSITORY: FloorRepository.java
// Package: com.cmms.location.repository
// ============================================================================

package com.cmms.location.repository;

import com.cmms.location.entity.Floor;
import com.cmms.location.dto.response.FloorResponseBasic;
import com.cmms.location.dto.response.FloorResponseExpanded;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {

    // --- Duplicate check (same building + floor_no, excludes DELETED) ---
    @Query("""
        SELECT COUNT(f) > 0 FROM Floor f
        WHERE f.tenantId = :tenantId AND f.buildingId = :buildingId
        AND f.floorNo = :floorNo
        AND f.isActive <> 'DELETED'
        AND (:excludeId IS NULL OR f.floorId <> :excludeId)
    """)
    boolean existsDuplicate(@Param("tenantId") Long tenantId,
                            @Param("buildingId") Long buildingId,
                            @Param("floorNo") Integer floorNo,
                            @Param("excludeId") Long excludeId);

    // --- Visible (non-deleted) basic ---
    @Query("""
        SELECT new com.cmms.location.dto.response.FloorResponseBasic(
            f.floorId, f.tenantId, f.orgId, f.buildingId,
            f.floorNo, f.floorName, f.description, CAST(f.isActive AS string)
        )
        FROM Floor f
        WHERE f.tenantId = :tenantId AND f.buildingId = :buildingId AND f.isActive <> 'DELETED'
        ORDER BY f.floorNo
    """)
    Page<FloorResponseBasic> findAllVisibleByBuilding(@Param("tenantId") Long tenantId,
                                                       @Param("buildingId") Long buildingId,
                                                       Pageable pageable);

    // --- Expanded: floors with room/bed counts (non-deleted children) ---
    @Query("""
        SELECT new com.cmms.location.dto.response.FloorResponseExpanded(
            f.floorId, f.tenantId, f.orgId,
            f.buildingId, b.buildingName, b.buildingCode,
            f.floorNo, f.floorName, f.description, CAST(f.isActive AS string),
            COUNT(DISTINCT CASE WHEN r.isActive <> 'DELETED' THEN r.roomId END),
            COUNT(DISTINCT CASE WHEN bd.isActive <> 'DELETED' THEN bd.bedId END),
            COUNT(DISTINCT CASE WHEN bd.isActive = 'ACTIVE' THEN bd.bedId END)
        )
        FROM Floor f
        JOIN Building b ON b.buildingId = f.buildingId
        LEFT JOIN Room r ON r.floorId = f.floorId
        LEFT JOIN Bed bd ON bd.roomId = r.roomId
        WHERE f.tenantId = :tenantId AND f.buildingId = :buildingId AND f.isActive <> 'DELETED'
        GROUP BY f.floorId, f.tenantId, f.orgId,
                 f.buildingId, b.buildingName, b.buildingCode,
                 f.floorNo, f.floorName, f.description, f.isActive
        ORDER BY f.floorNo
    """)
    Page<FloorResponseExpanded> findAllExpandedByBuilding(@Param("tenantId") Long tenantId,
                                                           @Param("buildingId") Long buildingId,
                                                           Pageable pageable);

    // --- Active only ---
    @Query("""
        SELECT new com.cmms.location.dto.response.FloorResponseBasic(
            f.floorId, f.tenantId, f.orgId, f.buildingId,
            f.floorNo, f.floorName, f.description, CAST(f.isActive AS string)
        )
        FROM Floor f
        WHERE f.tenantId = :tenantId AND f.buildingId = :buildingId AND f.isActive = 'ACTIVE'
        ORDER BY f.floorNo
    """)
    Page<FloorResponseBasic> findAllActiveByBuilding(@Param("tenantId") Long tenantId,
                                                      @Param("buildingId") Long buildingId,
                                                      Pageable pageable);

    // --- Single record ---
    Optional<Floor> findByFloorIdAndTenantId(Long floorId, Long tenantId);

    // --- Single expanded ---
    @Query("""
        SELECT new com.cmms.location.dto.response.FloorResponseExpanded(
            f.floorId, f.tenantId, f.orgId,
            f.buildingId, b.buildingName, b.buildingCode,
            f.floorNo, f.floorName, f.description, CAST(f.isActive AS string),
            COUNT(DISTINCT CASE WHEN r.isActive <> 'DELETED' THEN r.roomId END),
            COUNT(DISTINCT CASE WHEN bd.isActive <> 'DELETED' THEN bd.bedId END),
            COUNT(DISTINCT CASE WHEN bd.isActive = 'ACTIVE' THEN bd.bedId END)
        )
        FROM Floor f
        JOIN Building b ON b.buildingId = f.buildingId
        LEFT JOIN Room r ON r.floorId = f.floorId
        LEFT JOIN Bed bd ON bd.roomId = r.roomId
        WHERE f.floorId = :floorId AND f.tenantId = :tenantId
        GROUP BY f.floorId, f.tenantId, f.orgId,
                 f.buildingId, b.buildingName, b.buildingCode,
                 f.floorNo, f.floorName, f.description, f.isActive
    """)
    Optional<FloorResponseExpanded> findByIdExpanded(@Param("floorId") Long floorId,
                                                      @Param("tenantId") Long tenantId);
}


// ============================================================================
// 5. SERVICE: FloorService.java
// Package: com.cmms.location.service
// ============================================================================

package com.cmms.location.service;

import com.cmms.location.dto.request.FloorCreateRequest;
import com.cmms.location.dto.request.FloorUpdateRequest;
import com.cmms.location.dto.request.FloorBulkCreateRequest;
import com.cmms.location.dto.response.FloorResponseBasic;
import com.cmms.location.dto.response.FloorResponseExpanded;
import com.cmms.location.entity.Floor;
import com.cmms.location.repository.FloorRepository;
import com.cmms.location.repository.BuildingRepository;
import com.cmms.common.dto.StatusToggleRequest;
import com.cmms.common.enums.RecordStatus;
import com.cmms.common.exception.*;
import com.cmms.common.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class FloorService {

    private final FloorRepository floorRepository;
    private final BuildingRepository buildingRepository;
    private final JwtService jwtService;

    @Transactional(rollbackFor = Exception.class)
    public FloorResponseBasic create(FloorCreateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        buildingRepository.findByBuildingIdAndTenantId(req.getBuildingId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Building not found: " + req.getBuildingId()));

        if (floorRepository.existsDuplicate(tenantId, req.getBuildingId(), req.getFloorNo(), null)) {
            throw new DuplicateException("DUPLICATE_FLOOR_NO",
                "Floor number " + req.getFloorNo() + " already exists in this building");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        Floor entity = Floor.builder()
                .tenantId(tenantId).orgId(req.getOrgId()).buildingId(req.getBuildingId())
                .floorNo(req.getFloorNo())
                .floorName(req.getFloorName() != null ? req.getFloorName().trim() : null)
                .description(req.getDescription())
                .isActive(initialIsActive)
                .build();

        entity = floorRepository.save(entity);
        return mapToBasic(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<FloorResponseBasic> createBulk(FloorBulkCreateRequest req) {
        List<FloorResponseBasic> results = new ArrayList<>();
        for (FloorCreateRequest item : req.getFloors()) {
            results.add(create(item));
        }
        return results;
    }

    @Transactional(rollbackFor = Exception.class)
    public FloorResponseBasic update(FloorUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        Floor entity = floorRepository.findByFloorIdAndTenantId(req.getFloorId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Floor not found: " + req.getFloorId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED floor.");
        }

        if (floorRepository.existsDuplicate(tenantId, req.getBuildingId(), req.getFloorNo(), req.getFloorId())) {
            throw new DuplicateException("DUPLICATE_FLOOR_NO",
                "Floor number " + req.getFloorNo() + " already exists in this building");
        }

        entity.setOrgId(req.getOrgId());
        entity.setBuildingId(req.getBuildingId());
        entity.setFloorNo(req.getFloorNo());
        entity.setFloorName(req.getFloorName() != null ? req.getFloorName().trim() : null);
        entity.setDescription(req.getDescription());
        // isActive NOT changed here

        entity = floorRepository.save(entity);
        return mapToBasic(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long floorId) {
        Long tenantId = jwtService.getTenantId();
        Floor entity = floorRepository.findByFloorIdAndTenantId(floorId, tenantId)
                .orElseThrow(() -> new NotFoundException("Floor not found: " + floorId));
        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Floor is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        floorRepository.save(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public FloorResponseBasic toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        Floor entity = floorRepository.findByFloorIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Floor not found: " + req.getId()));
        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED floor.");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE endpoint to soft-delete.");
        }

        entity.setIsActive(newIsActive);
        entity = floorRepository.save(entity);
        return mapToBasic(entity);
    }

    public Page<?> getAll(Long buildingId, boolean expand, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();
        if (expand) return floorRepository.findAllExpandedByBuilding(tenantId, buildingId, pageable);
        return floorRepository.findAllVisibleByBuilding(tenantId, buildingId, pageable);
    }

    public Page<FloorResponseBasic> getAllActive(Long buildingId, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();
        return floorRepository.findAllActiveByBuilding(tenantId, buildingId, pageable);
    }

    public Object getById(Long floorId, boolean expand) {
        Long tenantId = jwtService.getTenantId();
        if (expand) {
            return floorRepository.findByIdExpanded(floorId, tenantId)
                    .orElseThrow(() -> new NotFoundException("Floor not found: " + floorId));
        }
        Floor entity = floorRepository.findByFloorIdAndTenantId(floorId, tenantId)
                .orElseThrow(() -> new NotFoundException("Floor not found: " + floorId));
        return mapToBasic(entity);
    }

    private FloorResponseBasic mapToBasic(Floor e) {
        return FloorResponseBasic.builder()
                .floorId(e.getFloorId()).tenantId(e.getTenantId()).orgId(e.getOrgId())
                .buildingId(e.getBuildingId()).floorNo(e.getFloorNo())
                .floorName(e.getFloorName()).description(e.getDescription())
                .isActive(e.getIsActive().name())
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
// 6. CONTROLLER: FloorController.java
// Package: com.cmms.location.controller
// ============================================================================

package com.cmms.location.controller;

import com.cmms.location.dto.request.*;
import com.cmms.location.service.FloorService;
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
@RequestMapping("/api/floor")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody FloorCreateRequest req) {
        var result = floorService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Floor created", result));
    }

    @PostMapping("/create-bulk")
    public ResponseEntity<ResponseDto> createBulk(@Valid @RequestBody FloorBulkCreateRequest req) {
        var result = floorService.createBulk(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Floors created in bulk", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody FloorUpdateRequest req) {
        var result = floorService.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Floor updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        floorService.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Floor soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = floorService.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Floor status updated", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(
            @RequestParam("buildingId") Long buildingId,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand,
            @PageableDefault(size = 50, sort = "floorNo") Pageable pageable) {
        var result = floorService.getAll(buildingId, expand, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Floors retrieved", result));
    }

    @PostMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive(
            @RequestParam("buildingId") Long buildingId,
            @PageableDefault(size = 50) Pageable pageable) {
        var result = floorService.getAllActive(buildingId, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active floors retrieved", result));
    }

    @GetMapping("/get-by-id")
    public ResponseEntity<ResponseDto> getById(
            @RequestParam("id") Long id,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand) {
        var result = floorService.getById(id, expand);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Floor retrieved", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON: Floor (status-aware)
// ============================================================================

/*
--- POST /api/floor/create ---
REQUEST:
{
    "orgId": 1,
    "buildingId": 1,
    "floorNo": 0,
    "floorName": "Ground Floor",
    "description": "Main hospital entrance"
}

RESPONSE (201):
{
    "requestId": "f1a2b3c4-...",
    "statusCode": 201,
    "message": "Floor created",
    "data": {
        "floorId": 2,
        "tenantId": 1,
        "orgId": 1,
        "buildingId": 1,
        "floorNo": 0,
        "floorName": "Ground Floor",
        "description": "Main hospital entrance",
        "isActive": "ACTIVE"
    }
}

--- PATCH /api/floor/toggle-status ---
REQUEST:
{
    "id": 2,
    "isActive": "INACTIVE"
}

RESPONSE (200):
{
    "requestId": "x1y2z3a4-...",
    "statusCode": 200,
    "message": "Floor status updated",
    "data": {
        "floorId": 2,
        "tenantId": 1,
        "orgId": 1,
        "buildingId": 1,
        "floorNo": 0,
        "floorName": "Ground Floor",
        "description": "Main hospital entrance",
        "isActive": "INACTIVE"
    }
}

--- DELETE /api/floor/delete/2 ---
RESPONSE (200):
{
    "requestId": "d5e6f7g8-...",
    "statusCode": 200,
    "message": "Floor soft-deleted",
    "data": null
}

--- GET /api/floor/get-all?buildingId=1&expand=true ---
RESPONSE (200):
{
    "requestId": "k9l0m1n2-...",
    "statusCode": 200,
    "message": "Floors retrieved",
    "data": {
        "content": [
            {
                "floorId": 1,
                "tenantId": 1,
                "orgId": 1,
                "buildingId": 1,
                "buildingName": "Main Tower",
                "buildingCode": "MT",
                "floorNo": -1,
                "floorName": "Basement",
                "description": null,
                "isActive": "ACTIVE",
                "roomCount": 1,
                "bedCount": 0,
                "activeBedCount": 0
            },
            {
                "floorId": 3,
                "tenantId": 1,
                "orgId": 1,
                "buildingId": 1,
                "buildingName": "Main Tower",
                "buildingCode": "MT",
                "floorNo": 1,
                "floorName": "1st Floor",
                "description": null,
                "isActive": "INACTIVE",
                "roomCount": 3,
                "bedCount": 8,
                "activeBedCount": 4
            }
        ],
        "totalElements": 7,
        "totalPages": 1
    }
}
(Note: DELETED floors are excluded from get-all)
*/
