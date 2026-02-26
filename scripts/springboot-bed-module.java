// ============================================================================
// SPRING BOOT 3.x MODULE: bed
// Table       : bed
// Base Tables : room, floor, building
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/bed
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) -- reuses existing column as EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: Bed.java
// Package: com.cmms.location.entity
// ============================================================================

package com.cmms.location.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bed",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_bed_tenant_room_no",
           columnNames = {"tenant_id", "room_id", "bed_no"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bed_id")
    private Long bedId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "org_id", nullable = false)
    private Long orgId;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "bed_no", nullable = false, length = 50)
    private String bedNo;

    @Column(name = "bed_code", length = 80)
    private String bedCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private Room room;

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

// ---------- BedCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedCreateRequest {

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "roomId is required")
    private Long roomId;

    @NotBlank(message = "bedNo is required")
    @Size(max = 50)
    private String bedNo;

    @Size(max = 80)
    private String bedCode;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- BedUpdateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedUpdateRequest {

    @NotNull(message = "bedId is required")
    private Long bedId;

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "roomId is required")
    private Long roomId;

    @NotBlank(message = "bedNo is required")
    @Size(max = 50)
    private String bedNo;

    @Size(max = 80)
    private String bedCode;

    // No isActive -- use toggle-status or delete
}

// ---------- BedBulkCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedBulkCreateRequest {

    @NotNull @Size(min = 1, max = 200)
    private List<@Valid BedCreateRequest> beds;
}

// ---------- BedAutoGenerateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedAutoGenerateRequest {

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "roomId is required")
    private Long roomId;

    @NotNull @Min(1) @Max(200)
    private Integer count;

    @Size(max = 30)
    private String prefix;       // e.g. "ER-B" -> generates ER-B1, ER-B2, ...
}


// ============================================================================
// 3. RESPONSE DTOs
// Package: com.cmms.location.dto.response
// ============================================================================

// ---------- BedResponseBasic.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedResponseBasic {
    private Long bedId;
    private Long tenantId;
    private Long orgId;
    private Long roomId;
    private String bedNo;
    private String bedCode;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
}

// ---------- BedResponseExpanded.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BedResponseExpanded {
    private Long bedId;
    private Long tenantId;
    private Long orgId;
    private Long roomId;
    private String roomNo;
    private String roomName;
    private Long floorId;
    private String floorName;
    private Integer floorNo;
    private Long buildingId;
    private String buildingName;
    private String bedNo;
    private String bedCode;
    private String isActive;           // ACTIVE | INACTIVE | DELETED

    // Constructor for JPQL projection
    public BedResponseExpanded(Long bedId, Long tenantId, Long orgId,
                                Long roomId, String roomNo, String roomName,
                                Long floorId, String floorName, Integer floorNo,
                                Long buildingId, String buildingName,
                                String bedNo, String bedCode, String isActive) {
        this.bedId = bedId; this.tenantId = tenantId; this.orgId = orgId;
        this.roomId = roomId; this.roomNo = roomNo; this.roomName = roomName;
        this.floorId = floorId; this.floorName = floorName; this.floorNo = floorNo;
        this.buildingId = buildingId; this.buildingName = buildingName;
        this.bedNo = bedNo; this.bedCode = bedCode; this.isActive = isActive;
    }
}


// ============================================================================
// 4. REPOSITORY: BedRepository.java
// Package: com.cmms.location.repository
// ============================================================================

package com.cmms.location.repository;

import com.cmms.location.entity.Bed;
import com.cmms.location.dto.response.BedResponseBasic;
import com.cmms.location.dto.response.BedResponseExpanded;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    // --- Duplicate check (excludes DELETED) ---
    @Query("""
        SELECT COUNT(bd) > 0 FROM Bed bd
        WHERE bd.tenantId = :tenantId AND bd.roomId = :roomId
        AND LOWER(TRIM(bd.bedNo)) = LOWER(TRIM(:bedNo))
        AND bd.isActive <> 'DELETED'
        AND (:excludeId IS NULL OR bd.bedId <> :excludeId)
    """)
    boolean existsDuplicate(@Param("tenantId") Long tenantId,
                            @Param("roomId") Long roomId,
                            @Param("bedNo") String bedNo,
                            @Param("excludeId") Long excludeId);

    // --- Visible (non-deleted) basic ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BedResponseBasic(
            bd.bedId, bd.tenantId, bd.orgId, bd.roomId,
            bd.bedNo, bd.bedCode, CAST(bd.isActive AS string)
        )
        FROM Bed bd
        WHERE bd.tenantId = :tenantId AND bd.roomId = :roomId AND bd.isActive <> 'DELETED'
        ORDER BY bd.bedNo
    """)
    Page<BedResponseBasic> findAllVisibleByRoom(@Param("tenantId") Long tenantId,
                                                 @Param("roomId") Long roomId,
                                                 Pageable pageable);

    // --- Expanded: beds with full breadcrumb ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BedResponseExpanded(
            bd.bedId, bd.tenantId, bd.orgId,
            bd.roomId, r.roomNo, r.roomName,
            fl.floorId, fl.floorName, fl.floorNo,
            b.buildingId, b.buildingName,
            bd.bedNo, bd.bedCode, CAST(bd.isActive AS string)
        )
        FROM Bed bd
        JOIN Room r ON r.roomId = bd.roomId
        JOIN Floor fl ON fl.floorId = r.floorId
        JOIN Building b ON b.buildingId = fl.buildingId
        WHERE bd.tenantId = :tenantId AND bd.roomId = :roomId AND bd.isActive <> 'DELETED'
        ORDER BY bd.bedNo
    """)
    Page<BedResponseExpanded> findAllExpandedByRoom(@Param("tenantId") Long tenantId,
                                                     @Param("roomId") Long roomId,
                                                     Pageable pageable);

    // --- Active only ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BedResponseBasic(
            bd.bedId, bd.tenantId, bd.orgId, bd.roomId,
            bd.bedNo, bd.bedCode, CAST(bd.isActive AS string)
        )
        FROM Bed bd
        WHERE bd.tenantId = :tenantId AND bd.roomId = :roomId AND bd.isActive = 'ACTIVE'
        ORDER BY bd.bedNo
    """)
    Page<BedResponseBasic> findAllActiveByRoom(@Param("tenantId") Long tenantId,
                                                @Param("roomId") Long roomId,
                                                Pageable pageable);

    Optional<Bed> findByBedIdAndTenantId(Long bedId, Long tenantId);

    // --- Count non-deleted beds for auto-generate offset ---
    @Query("SELECT COUNT(bd) FROM Bed bd WHERE bd.tenantId = :tenantId AND bd.roomId = :roomId AND bd.isActive <> 'DELETED'")
    long countVisibleByRoom(@Param("tenantId") Long tenantId, @Param("roomId") Long roomId);

    // --- Single expanded ---
    @Query("""
        SELECT new com.cmms.location.dto.response.BedResponseExpanded(
            bd.bedId, bd.tenantId, bd.orgId,
            bd.roomId, r.roomNo, r.roomName,
            fl.floorId, fl.floorName, fl.floorNo,
            b.buildingId, b.buildingName,
            bd.bedNo, bd.bedCode, CAST(bd.isActive AS string)
        )
        FROM Bed bd
        JOIN Room r ON r.roomId = bd.roomId
        JOIN Floor fl ON fl.floorId = r.floorId
        JOIN Building b ON b.buildingId = fl.buildingId
        WHERE bd.bedId = :bedId AND bd.tenantId = :tenantId
    """)
    Optional<BedResponseExpanded> findByIdExpanded(@Param("bedId") Long bedId,
                                                    @Param("tenantId") Long tenantId);
}


// ============================================================================
// 5. SERVICE: BedService.java
// Package: com.cmms.location.service
// ============================================================================

package com.cmms.location.service;

import com.cmms.location.dto.request.*;
import com.cmms.location.dto.response.*;
import com.cmms.location.entity.Bed;
import com.cmms.location.repository.BedRepository;
import com.cmms.location.repository.RoomRepository;
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
public class BedService {

    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;
    private final JwtService jwtService;

    @Transactional(rollbackFor = Exception.class)
    public BedResponseBasic create(BedCreateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        roomRepository.findByRoomIdAndTenantId(req.getRoomId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + req.getRoomId()));

        if (bedRepository.existsDuplicate(tenantId, req.getRoomId(), req.getBedNo(), null)) {
            throw new DuplicateException("DUPLICATE_BED_NO",
                "Bed number '" + req.getBedNo().trim() + "' already exists in this room");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        Bed entity = Bed.builder()
                .tenantId(tenantId).orgId(req.getOrgId()).roomId(req.getRoomId())
                .bedNo(req.getBedNo().trim())
                .bedCode(req.getBedCode() != null ? req.getBedCode().trim() : null)
                .isActive(initialIsActive)
                .build();
        entity = bedRepository.save(entity);
        return mapToBasic(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<BedResponseBasic> createBulk(BedBulkCreateRequest req) {
        List<BedResponseBasic> results = new ArrayList<>();
        for (BedCreateRequest item : req.getBeds()) results.add(create(item));
        return results;
    }

    @Transactional(rollbackFor = Exception.class)
    public List<BedResponseBasic> autoGenerate(BedAutoGenerateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        roomRepository.findByRoomIdAndTenantId(req.getRoomId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + req.getRoomId()));

        long existingCount = bedRepository.countVisibleByRoom(tenantId, req.getRoomId());
        String prefix = req.getPrefix() != null ? req.getPrefix() : "";

        List<BedResponseBasic> results = new ArrayList<>();
        for (int i = 1; i <= req.getCount(); i++) {
            long seqNo = existingCount + i;
            String bedNo = String.valueOf(seqNo);
            String bedCode = prefix.isEmpty() ? bedNo : prefix + seqNo;

            Bed entity = Bed.builder()
                    .tenantId(tenantId).orgId(req.getOrgId()).roomId(req.getRoomId())
                    .bedNo(bedNo).bedCode(bedCode).isActive(RecordStatus.ACTIVE)
                    .build();
            entity = bedRepository.save(entity);
            results.add(mapToBasic(entity));
        }
        return results;
    }

    @Transactional(rollbackFor = Exception.class)
    public BedResponseBasic update(BedUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        Bed entity = bedRepository.findByBedIdAndTenantId(req.getBedId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Bed not found: " + req.getBedId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED bed.");
        }

        if (bedRepository.existsDuplicate(tenantId, req.getRoomId(), req.getBedNo(), req.getBedId())) {
            throw new DuplicateException("DUPLICATE_BED_NO",
                "Bed number '" + req.getBedNo().trim() + "' already exists in this room");
        }

        entity.setOrgId(req.getOrgId()); entity.setRoomId(req.getRoomId());
        entity.setBedNo(req.getBedNo().trim());
        entity.setBedCode(req.getBedCode() != null ? req.getBedCode().trim() : null);
        entity = bedRepository.save(entity);
        return mapToBasic(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long bedId) {
        Long tenantId = jwtService.getTenantId();
        Bed entity = bedRepository.findByBedIdAndTenantId(bedId, tenantId)
                .orElseThrow(() -> new NotFoundException("Bed not found: " + bedId));
        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Bed is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        bedRepository.save(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public BedResponseBasic toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        Bed entity = bedRepository.findByBedIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Bed not found: " + req.getId()));
        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED bed.");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE endpoint to soft-delete.");
        }

        entity.setIsActive(newIsActive);
        entity = bedRepository.save(entity);
        return mapToBasic(entity);
    }

    public Page<?> getAll(Long roomId, boolean expand, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();
        if (expand) return bedRepository.findAllExpandedByRoom(tenantId, roomId, pageable);
        return bedRepository.findAllVisibleByRoom(tenantId, roomId, pageable);
    }

    public Page<BedResponseBasic> getAllActive(Long roomId, Pageable pageable) {
        return bedRepository.findAllActiveByRoom(jwtService.getTenantId(), roomId, pageable);
    }

    public Object getById(Long bedId, boolean expand) {
        Long tenantId = jwtService.getTenantId();
        if (expand) return bedRepository.findByIdExpanded(bedId, tenantId)
                .orElseThrow(() -> new NotFoundException("Bed not found: " + bedId));
        Bed entity = bedRepository.findByBedIdAndTenantId(bedId, tenantId)
                .orElseThrow(() -> new NotFoundException("Bed not found: " + bedId));
        return mapToBasic(entity);
    }

    private BedResponseBasic mapToBasic(Bed e) {
        return BedResponseBasic.builder()
                .bedId(e.getBedId()).tenantId(e.getTenantId()).orgId(e.getOrgId())
                .roomId(e.getRoomId()).bedNo(e.getBedNo()).bedCode(e.getBedCode())
                .isActive(e.getIsActive().name())
                .build();
    }

    private void validateOrgAccess(Long orgId) {
        Long userOrgId = jwtService.getOrgId();
        if (userOrgId != null && !userOrgId.equals(0L) && !userOrgId.equals(orgId))
            throw new ForbiddenException("Access denied to organization: " + orgId);
    }
}


// ============================================================================
// 6. CONTROLLER: BedController.java
// Package: com.cmms.location.controller
// ============================================================================

package com.cmms.location.controller;

import com.cmms.location.dto.request.*;
import com.cmms.location.service.BedService;
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
@RequestMapping("/api/bed")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody BedCreateRequest req) {
        var result = bedService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Bed created", result));
    }

    @PostMapping("/create-bulk")
    public ResponseEntity<ResponseDto> createBulk(@Valid @RequestBody BedBulkCreateRequest req) {
        var result = bedService.createBulk(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Beds created in bulk", result));
    }

    @PostMapping("/auto-generate")
    public ResponseEntity<ResponseDto> autoGenerate(@Valid @RequestBody BedAutoGenerateRequest req) {
        var result = bedService.autoGenerate(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Beds auto-generated", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody BedUpdateRequest req) {
        var result = bedService.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Bed updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        bedService.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Bed soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = bedService.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Bed status updated", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(
            @RequestParam("roomId") Long roomId,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand,
            @PageableDefault(size = 100) Pageable pageable) {
        var result = bedService.getAll(roomId, expand, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Beds retrieved", result));
    }

    @PostMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive(
            @RequestParam("roomId") Long roomId,
            @PageableDefault(size = 100) Pageable pageable) {
        var result = bedService.getAllActive(roomId, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active beds retrieved", result));
    }

    @GetMapping("/get-by-id")
    public ResponseEntity<ResponseDto> getById(
            @RequestParam("id") Long id,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand) {
        var result = bedService.getById(id, expand);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Bed retrieved", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON: Bed (status-aware)
// ============================================================================

/*
--- POST /api/bed/create ---
REQUEST:
{
    "orgId": 1,
    "roomId": 2,
    "bedNo": "1",
    "bedCode": "ER-B1"
}

RESPONSE (201):
{
    "data": {
        "bedId": 1,
        "tenantId": 1,
        "orgId": 1,
        "roomId": 2,
        "bedNo": "1",
        "bedCode": "ER-B1",
        "isActive": "ACTIVE"
    }
}

--- POST /api/bed/auto-generate ---
REQUEST:
{
    "orgId": 1,
    "roomId": 5,
    "count": 3,
    "prefix": "WA-B"
}

RESPONSE (201):
{
    "data": [
        { "bedId": 9,  "tenantId": 1, "orgId": 1, "roomId": 5, "bedNo": "1", "bedCode": "WA-B1", "isActive": "ACTIVE" },
        { "bedId": 10, "tenantId": 1, "orgId": 1, "roomId": 5, "bedNo": "2", "bedCode": "WA-B2", "isActive": "ACTIVE" },
        { "bedId": 11, "tenantId": 1, "orgId": 1, "roomId": 5, "bedNo": "3", "bedCode": "WA-B3", "isActive": "ACTIVE" }
    ]
}

--- PATCH /api/bed/toggle-status ---
REQUEST:
{
    "id": 1,
    "isActive": "INACTIVE"
}

RESPONSE (200):
{
    "data": {
        "bedId": 1,
        "tenantId": 1,
        "orgId": 1,
        "roomId": 2,
        "bedNo": "1",
        "bedCode": "ER-B1",
        "isActive": "INACTIVE"
    }
}

--- DELETE /api/bed/delete/1 ---
RESPONSE (200):
{
    "message": "Bed soft-deleted",
    "data": null
}

--- GET /api/bed/get-all?roomId=2&expand=true ---
RESPONSE (200):
{
    "data": {
        "content": [
            {
                "bedId": 2,
                "tenantId": 1,
                "orgId": 1,
                "roomId": 2,
                "roomNo": "ER-001",
                "roomName": "Emergency",
                "floorId": 2,
                "floorName": "Ground Floor",
                "floorNo": 0,
                "buildingId": 1,
                "buildingName": "Main Tower",
                "bedNo": "2",
                "bedCode": "ER-B2",
                "isActive": "ACTIVE"
            },
            {
                "bedId": 3,
                "tenantId": 1,
                "orgId": 1,
                "roomId": 2,
                "roomNo": "ER-001",
                "roomName": "Emergency",
                "floorId": 2,
                "floorName": "Ground Floor",
                "floorNo": 0,
                "buildingId": 1,
                "buildingName": "Main Tower",
                "bedNo": "3",
                "bedCode": "ER-B3",
                "isActive": "INACTIVE"
            }
        ],
        "totalElements": 7,
        "totalPages": 1
    }
}
(Note: DELETED beds never appear in get-all; bed 1 is deleted so excluded)

--- ERROR 400 (toggle on deleted) ---
{
    "statusCode": 400,
    "message": "Cannot toggle status of a DELETED bed.",
    "errorCode": "INVALID_STATUS"
}
*/


// ============================================================================
// 8. RECOMMENDED DB INDEXES (already in DDL, listed for reference)
// ============================================================================

/*
-- Building
CREATE INDEX idx_building_org    ON building(tenant_id, org_id);
CREATE INDEX idx_building_status ON building(tenant_id, org_id, status);

-- Floor
CREATE INDEX idx_floor_building  ON floor(tenant_id, building_id);
CREATE INDEX idx_floor_status    ON floor(tenant_id, building_id, status);

-- Room
CREATE INDEX idx_room_floor      ON room(tenant_id, floor_id);
CREATE INDEX idx_room_status     ON room(tenant_id, floor_id, status);

-- Bed
CREATE INDEX idx_bed_room        ON bed(tenant_id, room_id);
CREATE INDEX idx_bed_status      ON bed(tenant_id, room_id, status);
*/
