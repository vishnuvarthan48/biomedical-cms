// ============================================================================
// SPRING BOOT 3.x MODULE: room
// Table       : room
// Base Tables : floor, building, room_type
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/room
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) -- reuses existing column as EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: Room.java
// Package: com.cmms.location.entity
// ============================================================================

package com.cmms.location.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "room",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_room_tenant_floor_no",
           columnNames = {"tenant_id", "floor_id", "room_no"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "org_id", nullable = false)
    private Long orgId;

    @Column(name = "floor_id", nullable = false)
    private Long floorId;

    @Column(name = "room_no", nullable = false, length = 50)
    private String roomNo;

    @Column(name = "room_name", length = 100)
    private String roomName;

    @Column(name = "room_type_id")
    private Long roomTypeId;

    @Column(name = "description", length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", insertable = false, updatable = false)
    private Floor floor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", insertable = false, updatable = false)
    private RoomType roomType;

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

// ---------- RoomCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomCreateRequest {

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "floorId is required")
    private Long floorId;

    @NotBlank(message = "roomNo is required")
    @Size(max = 50)
    private String roomNo;

    @Size(max = 100)
    private String roomName;

    private Long roomTypeId;

    @Size(max = 300)
    private String description;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- RoomUpdateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomUpdateRequest {

    @NotNull(message = "roomId is required")
    private Long roomId;

    @NotNull(message = "orgId is required")
    private Long orgId;

    @NotNull(message = "floorId is required")
    private Long floorId;

    @NotBlank(message = "roomNo is required")
    @Size(max = 50)
    private String roomNo;

    @Size(max = 100)
    private String roomName;

    private Long roomTypeId;

    @Size(max = 300)
    private String description;

    // No isActive -- use toggle-status or delete
}

// ---------- RoomBulkCreateRequest.java ----------
package com.cmms.location.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomBulkCreateRequest {

    @NotNull @Size(min = 1, max = 50)
    private List<@Valid RoomCreateRequest> rooms;
}


// ============================================================================
// 3. RESPONSE DTOs
// Package: com.cmms.location.dto.response
// ============================================================================

// ---------- RoomResponseBasic.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomResponseBasic {
    private Long roomId;
    private Long tenantId;
    private Long orgId;
    private Long floorId;
    private String roomNo;
    private String roomName;
    private Long roomTypeId;
    private String description;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
}

// ---------- RoomResponseExpanded.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomResponseExpanded {
    private Long roomId;
    private Long tenantId;
    private Long orgId;
    private Long floorId;
    private Integer floorNo;
    private String floorName;
    private Long buildingId;
    private String buildingName;
    private String roomNo;
    private String roomName;
    private Long roomTypeId;
    private String roomTypeCode;
    private String roomTypeName;
    private String description;
    private String isActive;           // ACTIVE | INACTIVE | DELETED
    private Long bedCount;           // non-deleted
    private Long activeBedCount;     // ACTIVE only

    // Constructor for JPQL projection
    public RoomResponseExpanded(Long roomId, Long tenantId, Long orgId,
                                 Long floorId, Integer floorNo, String floorName,
                                 Long buildingId, String buildingName,
                                 String roomNo, String roomName,
                                 Long roomTypeId, String roomTypeCode, String roomTypeName,
                                 String description, String isActive,
                                 Long bedCount, Long activeBedCount) {
        this.roomId = roomId; this.tenantId = tenantId; this.orgId = orgId;
        this.floorId = floorId; this.floorNo = floorNo; this.floorName = floorName;
        this.buildingId = buildingId; this.buildingName = buildingName;
        this.roomNo = roomNo; this.roomName = roomName;
        this.roomTypeId = roomTypeId; this.roomTypeCode = roomTypeCode; this.roomTypeName = roomTypeName;
        this.description = description; this.isActive = isActive;
        this.bedCount = bedCount; this.activeBedCount = activeBedCount;
    }
}


// ============================================================================
// 4. REPOSITORY: RoomRepository.java
// Package: com.cmms.location.repository
// ============================================================================

package com.cmms.location.repository;

import com.cmms.location.entity.Room;
import com.cmms.location.dto.response.RoomResponseBasic;
import com.cmms.location.dto.response.RoomResponseExpanded;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // --- Duplicate check (excludes DELETED) ---
    @Query("""
        SELECT COUNT(r) > 0 FROM Room r
        WHERE r.tenantId = :tenantId AND r.floorId = :floorId
        AND LOWER(TRIM(r.roomNo)) = LOWER(TRIM(:roomNo))
        AND r.isActive <> 'DELETED'
        AND (:excludeId IS NULL OR r.roomId <> :excludeId)
    """)
    boolean existsDuplicate(@Param("tenantId") Long tenantId,
                            @Param("floorId") Long floorId,
                            @Param("roomNo") String roomNo,
                            @Param("excludeId") Long excludeId);

    // --- Visible (non-deleted) basic ---
    @Query("""
        SELECT new com.cmms.location.dto.response.RoomResponseBasic(
            r.roomId, r.tenantId, r.orgId, r.floorId,
            r.roomNo, r.roomName, r.roomTypeId, r.description, CAST(r.isActive AS string)
        )
        FROM Room r
        WHERE r.tenantId = :tenantId AND r.floorId = :floorId AND r.isActive <> 'DELETED'
        ORDER BY r.roomNo
    """)
    Page<RoomResponseBasic> findAllVisibleByFloor(@Param("tenantId") Long tenantId,
                                                   @Param("floorId") Long floorId,
                                                   Pageable pageable);

    // --- Expanded: rooms with bed counts + FK enrichment (non-deleted children) ---
    @Query("""
        SELECT new com.cmms.location.dto.response.RoomResponseExpanded(
            r.roomId, r.tenantId, r.orgId,
            r.floorId, fl.floorNo, fl.floorName,
            b.buildingId, b.buildingName,
            r.roomNo, r.roomName,
            r.roomTypeId, rt.code, rt.name,
            r.description, CAST(r.isActive AS string),
            COUNT(DISTINCT CASE WHEN bd.isActive <> 'DELETED' THEN bd.bedId END),
            COUNT(DISTINCT CASE WHEN bd.isActive = 'ACTIVE' THEN bd.bedId END)
        )
        FROM Room r
        JOIN Floor fl ON fl.floorId = r.floorId
        JOIN Building b ON b.buildingId = fl.buildingId
        LEFT JOIN RoomType rt ON rt.id = r.roomTypeId
        LEFT JOIN Bed bd ON bd.roomId = r.roomId
        WHERE r.tenantId = :tenantId AND r.floorId = :floorId AND r.isActive <> 'DELETED'
        GROUP BY r.roomId, r.tenantId, r.orgId,
                 r.floorId, fl.floorNo, fl.floorName,
                 b.buildingId, b.buildingName,
                 r.roomNo, r.roomName,
                 r.roomTypeId, rt.code, rt.name,
                 r.description, r.isActive
        ORDER BY r.roomNo
    """)
    Page<RoomResponseExpanded> findAllExpandedByFloor(@Param("tenantId") Long tenantId,
                                                       @Param("floorId") Long floorId,
                                                       Pageable pageable);

    // --- Active only ---
    @Query("""
        SELECT new com.cmms.location.dto.response.RoomResponseBasic(
            r.roomId, r.tenantId, r.orgId, r.floorId,
            r.roomNo, r.roomName, r.roomTypeId, r.description, CAST(r.isActive AS string)
        )
        FROM Room r
        WHERE r.tenantId = :tenantId AND r.floorId = :floorId AND r.isActive = 'ACTIVE'
        ORDER BY r.roomNo
    """)
    Page<RoomResponseBasic> findAllActiveByFloor(@Param("tenantId") Long tenantId,
                                                  @Param("floorId") Long floorId,
                                                  Pageable pageable);

    Optional<Room> findByRoomIdAndTenantId(Long roomId, Long tenantId);

    // --- Single expanded ---
    @Query("""
        SELECT new com.cmms.location.dto.response.RoomResponseExpanded(
            r.roomId, r.tenantId, r.orgId,
            r.floorId, fl.floorNo, fl.floorName,
            b.buildingId, b.buildingName,
            r.roomNo, r.roomName,
            r.roomTypeId, rt.code, rt.name,
            r.description, CAST(r.isActive AS string),
            COUNT(DISTINCT CASE WHEN bd.isActive <> 'DELETED' THEN bd.bedId END),
            COUNT(DISTINCT CASE WHEN bd.isActive = 'ACTIVE' THEN bd.bedId END)
        )
        FROM Room r
        JOIN Floor fl ON fl.floorId = r.floorId
        JOIN Building b ON b.buildingId = fl.buildingId
        LEFT JOIN RoomType rt ON rt.id = r.roomTypeId
        LEFT JOIN Bed bd ON bd.roomId = r.roomId
        WHERE r.roomId = :roomId AND r.tenantId = :tenantId
        GROUP BY r.roomId, r.tenantId, r.orgId,
                 r.floorId, fl.floorNo, fl.floorName,
                 b.buildingId, b.buildingName,
                 r.roomNo, r.roomName,
                 r.roomTypeId, rt.code, rt.name,
                 r.description, r.isActive
    """)
    Optional<RoomResponseExpanded> findByIdExpanded(@Param("roomId") Long roomId,
                                                     @Param("tenantId") Long tenantId);
}


// ============================================================================
// 5. SERVICE: RoomService.java
// Package: com.cmms.location.service
// ============================================================================

package com.cmms.location.service;

import com.cmms.location.dto.request.*;
import com.cmms.location.dto.response.*;
import com.cmms.location.entity.Room;
import com.cmms.location.repository.RoomRepository;
import com.cmms.location.repository.FloorRepository;
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
public class RoomService {

    private final RoomRepository roomRepository;
    private final FloorRepository floorRepository;
    private final JwtService jwtService;

    @Transactional(rollbackFor = Exception.class)
    public RoomResponseBasic create(RoomCreateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        floorRepository.findByFloorIdAndTenantId(req.getFloorId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Floor not found: " + req.getFloorId()));

        if (roomRepository.existsDuplicate(tenantId, req.getFloorId(), req.getRoomNo(), null)) {
            throw new DuplicateException("DUPLICATE_ROOM_NO",
                "Room number '" + req.getRoomNo().trim() + "' already exists on this floor");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        Room entity = Room.builder()
                .tenantId(tenantId).orgId(req.getOrgId()).floorId(req.getFloorId())
                .roomNo(req.getRoomNo().trim())
                .roomName(req.getRoomName() != null ? req.getRoomName().trim() : null)
                .roomTypeId(req.getRoomTypeId()).description(req.getDescription())
                .isActive(initialIsActive)
                .build();
        entity = roomRepository.save(entity);
        return mapToBasic(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public List<RoomResponseBasic> createBulk(RoomBulkCreateRequest req) {
        List<RoomResponseBasic> results = new ArrayList<>();
        for (RoomCreateRequest item : req.getRooms()) results.add(create(item));
        return results;
    }

    @Transactional(rollbackFor = Exception.class)
    public RoomResponseBasic update(RoomUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();
        validateOrgAccess(req.getOrgId());

        Room entity = roomRepository.findByRoomIdAndTenantId(req.getRoomId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + req.getRoomId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED room.");
        }

        if (roomRepository.existsDuplicate(tenantId, req.getFloorId(), req.getRoomNo(), req.getRoomId())) {
            throw new DuplicateException("DUPLICATE_ROOM_NO",
                "Room number '" + req.getRoomNo().trim() + "' already exists on this floor");
        }

        entity.setOrgId(req.getOrgId()); entity.setFloorId(req.getFloorId());
        entity.setRoomNo(req.getRoomNo().trim());
        entity.setRoomName(req.getRoomName() != null ? req.getRoomName().trim() : null);
        entity.setRoomTypeId(req.getRoomTypeId()); entity.setDescription(req.getDescription());
        entity = roomRepository.save(entity);
        return mapToBasic(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long roomId) {
        Long tenantId = jwtService.getTenantId();
        Room entity = roomRepository.findByRoomIdAndTenantId(roomId, tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));
        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Room is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        roomRepository.save(entity);
    }

    @Transactional(rollbackFor = Exception.class)
    public RoomResponseBasic toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        Room entity = roomRepository.findByRoomIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + req.getId()));
        validateOrgAccess(entity.getOrgId());

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED room.");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE endpoint to soft-delete.");
        }

        entity.setIsActive(newIsActive);
        entity = roomRepository.save(entity);
        return mapToBasic(entity);
    }

    public Page<?> getAll(Long floorId, boolean expand, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();
        if (expand) return roomRepository.findAllExpandedByFloor(tenantId, floorId, pageable);
        return roomRepository.findAllVisibleByFloor(tenantId, floorId, pageable);
    }

    public Page<RoomResponseBasic> getAllActive(Long floorId, Pageable pageable) {
        return roomRepository.findAllActiveByFloor(jwtService.getTenantId(), floorId, pageable);
    }

    public Object getById(Long roomId, boolean expand) {
        Long tenantId = jwtService.getTenantId();
        if (expand) return roomRepository.findByIdExpanded(roomId, tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));
        Room entity = roomRepository.findByRoomIdAndTenantId(roomId, tenantId)
                .orElseThrow(() -> new NotFoundException("Room not found: " + roomId));
        return mapToBasic(entity);
    }

    private RoomResponseBasic mapToBasic(Room e) {
        return RoomResponseBasic.builder()
                .roomId(e.getRoomId()).tenantId(e.getTenantId()).orgId(e.getOrgId())
                .floorId(e.getFloorId()).roomNo(e.getRoomNo()).roomName(e.getRoomName())
                .roomTypeId(e.getRoomTypeId()).description(e.getDescription())
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
// 6. CONTROLLER: RoomController.java
// Package: com.cmms.location.controller
// ============================================================================

package com.cmms.location.controller;

import com.cmms.location.dto.request.*;
import com.cmms.location.service.RoomService;
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
@RequestMapping("/api/room")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody RoomCreateRequest req) {
        var result = roomService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Room created", result));
    }

    @PostMapping("/create-bulk")
    public ResponseEntity<ResponseDto> createBulk(@Valid @RequestBody RoomBulkCreateRequest req) {
        var result = roomService.createBulk(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Rooms created in bulk", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody RoomUpdateRequest req) {
        var result = roomService.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Room updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        roomService.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Room soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = roomService.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Room status updated", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(
            @RequestParam("floorId") Long floorId,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand,
            @PageableDefault(size = 50) Pageable pageable) {
        var result = roomService.getAll(floorId, expand, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Rooms retrieved", result));
    }

    @PostMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive(
            @RequestParam("floorId") Long floorId,
            @PageableDefault(size = 50) Pageable pageable) {
        var result = roomService.getAllActive(floorId, pageable);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active rooms retrieved", result));
    }

    @GetMapping("/get-by-id")
    public ResponseEntity<ResponseDto> getById(
            @RequestParam("id") Long id,
            @RequestParam(value = "expand", defaultValue = "false") boolean expand) {
        var result = roomService.getById(id, expand);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Room retrieved", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON: Room (status-aware)
// ============================================================================

/*
--- POST /api/room/create ---
REQUEST:
{
    "orgId": 1,
    "floorId": 5,
    "roomNo": "MICU-301",
    "roomName": "Medical ICU",
    "roomTypeId": 2,
    "description": "12-bed medical intensive care unit"
}

RESPONSE (201):
{
    "data": {
        "roomId": 10,
        "tenantId": 1,
        "orgId": 1,
        "floorId": 5,
        "roomNo": "MICU-301",
        "roomName": "Medical ICU",
        "roomTypeId": 2,
        "description": "12-bed medical intensive care unit",
        "isActive": "ACTIVE"
    }
}

--- PATCH /api/room/toggle-status ---
REQUEST:
{
    "id": 10,
    "isActive": "INACTIVE"
}

RESPONSE (200):
{
    "data": {
        "roomId": 10,
        "isActive": "INACTIVE"
    }
}

--- GET /api/room/get-all?floorId=5&expand=true ---
RESPONSE (200):
{
    "data": {
        "content": [
            {
                "roomId": 12,
                "tenantId": 1,
                "orgId": 1,
                "floorId": 5,
                "floorNo": 3,
                "floorName": "3rd Floor",
                "buildingId": 1,
                "buildingName": "Main Tower",
                "roomNo": "CICU-303",
                "roomName": "CICU",
                "roomTypeId": 4,
                "roomTypeCode": "CICU",
                "roomTypeName": "Cardiac ICU",
                "description": null,
                "isActive": "ACTIVE",
                "bedCount": 6,
                "activeBedCount": 6
            },
            {
                "roomId": 10,
                "tenantId": 1,
                "orgId": 1,
                "floorId": 5,
                "floorNo": 3,
                "floorName": "3rd Floor",
                "buildingId": 1,
                "buildingName": "Main Tower",
                "roomNo": "MICU-301",
                "roomName": "MICU",
                "roomTypeId": 2,
                "roomTypeCode": "MICU",
                "roomTypeName": "Medical ICU",
                "description": null,
                "isActive": "INACTIVE",
                "bedCount": 12,
                "activeBedCount": 0
            }
        ],
        "totalElements": 2,
        "totalPages": 1
    }
}
(Note: DELETED rooms excluded from get-all)
*/
