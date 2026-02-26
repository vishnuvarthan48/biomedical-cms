// ============================================================================
// SPRING BOOT 3.x COMMON CLASSES + LOOKUP APIs
// Shared across all location modules: Building, Floor, Room, Bed
// SOFT-DELETE STRATEGY: is_active column as EnumType.STRING (ACTIVE | INACTIVE | DELETED)
// ============================================================================


// ============================================================================
// 0. STATUS ENUM: RecordStatus.java
// Package: com.cmms.common.enums
// ============================================================================

package com.cmms.common.enums;

public enum RecordStatus {
    ACTIVE,
    INACTIVE,
    DELETED;

    /**
     * Safe parse: defaults to ACTIVE if null/invalid.
     */
    public static RecordStatus from(String value) {
        if (value == null || value.isBlank()) return ACTIVE;
        try {
            return RecordStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ACTIVE;
        }
    }

    /**
     * Returns true for anything except DELETED.
     * Use in queries: WHERE status <> 'DELETED'
     */
    public boolean isVisible() {
        return this != DELETED;
    }
}


// ============================================================================
// 0b. StatusToggleRequest.java
// Package: com.cmms.common.dto
// Generic request used by all toggle-status endpoints
// ============================================================================

package com.cmms.common.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusToggleRequest {

    @NotNull(message = "id is required")
    private Long id;

    @NotNull(message = "isActive is required")
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}


// ============================================================================
// 1. ResponseDto.java
// Package: com.cmms.common.dto
// ============================================================================

package com.cmms.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseDto {

    private String requestId;
    private int statusCode;
    private String message;
    private Object data;
    private String errorCode;
    private List<FieldError> fieldErrors;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FieldError {
        private String field;
        private String message;
    }

    public static ResponseDto success(String requestId, String message, Object data) {
        return ResponseDto.builder()
                .requestId(requestId)
                .statusCode(200)
                .message(message)
                .data(data)
                .build();
    }

    public static ResponseDto created(String requestId, String message, Object data) {
        return ResponseDto.builder()
                .requestId(requestId)
                .statusCode(201)
                .message(message)
                .data(data)
                .build();
    }

    public static ResponseDto error(String requestId, int statusCode, String message, String errorCode) {
        return ResponseDto.builder()
                .requestId(requestId)
                .statusCode(statusCode)
                .message(message)
                .errorCode(errorCode)
                .build();
    }
}


// ============================================================================
// 2. CUSTOM EXCEPTIONS
// Package: com.cmms.common.exception
// ============================================================================

// ---------- DuplicateException.java ----------
package com.cmms.common.exception;

import lombok.Getter;

@Getter
public class DuplicateException extends RuntimeException {
    private final String errorCode;

    public DuplicateException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
}

// ---------- NotFoundException.java ----------
package com.cmms.common.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}

// ---------- ForbiddenException.java ----------
package com.cmms.common.exception;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}

// ---------- InvalidStatusException.java ----------
package com.cmms.common.exception;

public class InvalidStatusException extends RuntimeException {
    public InvalidStatusException(String message) {
        super(message);
    }
}


// ============================================================================
// 3. GlobalExceptionHandler.java
// Package: com.cmms.common.exception
// ============================================================================

package com.cmms.common.exception;

import com.cmms.common.dto.ResponseDto;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<ResponseDto> handleDuplicate(DuplicateException ex) {
        log.warn("Duplicate: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ResponseDto.error(uuid(), 409, ex.getMessage(), ex.getErrorCode()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ResponseDto> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponseDto.error(uuid(), 404, ex.getMessage(), "NOT_FOUND"));
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ResponseDto> handleForbidden(ForbiddenException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ResponseDto.error(uuid(), 403, ex.getMessage(), "FORBIDDEN"));
    }

    @ExceptionHandler(InvalidStatusException.class)
    public ResponseEntity<ResponseDto> handleInvalidStatus(InvalidStatusException ex) {
        return ResponseEntity.badRequest()
                .body(ResponseDto.error(uuid(), 400, ex.getMessage(), "INVALID_STATUS"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDto> handleValidation(MethodArgumentNotValidException ex) {
        var fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> ResponseDto.FieldError.builder()
                        .field(fe.getField())
                        .message(fe.getDefaultMessage())
                        .build())
                .collect(Collectors.toList());

        var dto = ResponseDto.builder()
                .requestId(uuid())
                .statusCode(400)
                .message("Validation failed")
                .errorCode("VALIDATION_ERROR")
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.badRequest().body(dto);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ResponseDto> handleConstraint(ConstraintViolationException ex) {
        return ResponseEntity.badRequest()
                .body(ResponseDto.error(uuid(), 400, ex.getMessage(), "CONSTRAINT_VIOLATION"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDto.error(uuid(), 500, "An unexpected error occurred", "INTERNAL_ERROR"));
    }

    private String uuid() { return UUID.randomUUID().toString(); }
}


// ============================================================================
// 4. JwtService.java (interface -- implement per your JWT library)
// Package: com.cmms.common.service
// ============================================================================

package com.cmms.common.service;

public interface JwtService {
    Long getTenantId();
    Long getOrgId();
    Long getUserId();
    String getRole();
}


// ============================================================================
// 5. ROOM TYPE LOOKUP APIs (status-aware)
// ============================================================================

// ---------- RoomTypeRepository.java ----------
package com.cmms.location.repository;

import com.cmms.location.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    @Query("""
        SELECT rt FROM RoomType rt
        WHERE rt.tenantId = :tenantId AND rt.isActive = 'ACTIVE'
        ORDER BY rt.sortOrder
    """)
    List<RoomType> findAllActiveByTenant(@Param("tenantId") Long tenantId);

    @Query("""
        SELECT rt FROM RoomType rt
        WHERE rt.tenantId = :tenantId AND rt.isActive <> 'DELETED'
        ORDER BY rt.sortOrder
    """)
    List<RoomType> findAllVisibleByTenant(@Param("tenantId") Long tenantId);
}

// ---------- RoomTypeResponseDto.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomTypeResponseDto {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Integer sortOrder;
    private String isActive;       // ACTIVE | INACTIVE | DELETED
}

// ---------- RoomTypeController.java ----------
package com.cmms.location.controller;

import com.cmms.location.dto.response.RoomTypeResponseDto;
import com.cmms.location.repository.RoomTypeRepository;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/room-type")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeRepository roomTypeRepository;
    private final JwtService jwtService;

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(
            @RequestParam(value = "activeOnly", defaultValue = "true") boolean activeOnly) {
        Long tenantId = jwtService.getTenantId();
        var entities = activeOnly
                ? roomTypeRepository.findAllActiveByTenant(tenantId)
                : roomTypeRepository.findAllVisibleByTenant(tenantId);

        var data = entities.stream().map(rt -> RoomTypeResponseDto.builder()
                .id(rt.getId()).code(rt.getCode()).name(rt.getName())
                .description(rt.getDescription()).sortOrder(rt.getSortOrder())
                .isActive(rt.getIsActive().name())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(
                ResponseDto.success(UUID.randomUUID().toString(), "Room types retrieved", data));
    }
}


// ============================================================================
// 6. LOCATION LEVEL LOOKUP APIs (status-aware)
// ============================================================================

// ---------- LocationLevel entity ----------
package com.cmms.location.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "location_level",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_location_level_tenant_code",
           columnNames = {"tenant_id", "code"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LocationLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "name", nullable = false, length = 60)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", nullable = false, length = 20)
    private RecordStatus isActive;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

// ---------- LocationLevelRepository.java ----------
package com.cmms.location.repository;

import com.cmms.location.entity.LocationLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LocationLevelRepository extends JpaRepository<LocationLevel, Long> {

    @Query("""
        SELECT ll FROM LocationLevel ll
        WHERE ll.tenantId = :tenantId AND ll.isActive = 'ACTIVE'
        ORDER BY ll.sortOrder
    """)
    List<LocationLevel> findAllActiveByTenant(@Param("tenantId") Long tenantId);
}

// ---------- LocationLevelResponseDto.java ----------
package com.cmms.location.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LocationLevelResponseDto {
    private Long id;
    private String code;
    private String name;
    private Integer sortOrder;
    private String isActive;       // ACTIVE | INACTIVE | DELETED
}

// ---------- LocationLevelController.java ----------
package com.cmms.location.controller;

import com.cmms.location.dto.response.LocationLevelResponseDto;
import com.cmms.location.repository.LocationLevelRepository;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/location-level")
@RequiredArgsConstructor
public class LocationLevelController {

    private final LocationLevelRepository locationLevelRepository;
    private final JwtService jwtService;

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll() {
        Long tenantId = jwtService.getTenantId();
        var entities = locationLevelRepository.findAllActiveByTenant(tenantId);

        var data = entities.stream().map(ll -> LocationLevelResponseDto.builder()
                .id(ll.getId()).code(ll.getCode()).name(ll.getName())
                .sortOrder(ll.getSortOrder()).isActive(ll.getIsActive().name())
                .build()
        ).collect(Collectors.toList());

        return ResponseEntity.ok(
                ResponseDto.success(UUID.randomUUID().toString(), "Location levels retrieved", data));
    }
}


// ============================================================================
// 7. RoomType Entity (status-aware)
// ============================================================================

package com.cmms.location.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "room_type",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_room_type_tenant_code",
           columnNames = {"tenant_id", "code"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "code", nullable = false, length = 30)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 300)
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
}


// ============================================================================
// 8. SAMPLE JSON: Lookups (updated with isActive)
// ============================================================================

/*
--- GET /api/room-type/get-all?activeOnly=true ---
RESPONSE (200):
{
    "requestId": "lt1a2b3c-...",
    "statusCode": 200,
    "message": "Room types retrieved",
    "data": [
        { "id": 1,  "code": "ICU",       "name": "Intensive Care Unit",     "description": "Critical care rooms",            "sortOrder": 1,  "isActive": "ACTIVE" },
        { "id": 2,  "code": "MICU",      "name": "Medical ICU",            "description": "Medical intensive care",          "sortOrder": 2,  "isActive": "ACTIVE" },
        { "id": 3,  "code": "NICU",      "name": "Neonatal ICU",           "description": "Neonatal intensive care",         "sortOrder": 3,  "isActive": "ACTIVE" },
        { "id": 7,  "code": "WARD",      "name": "General Ward",           "description": "General patient wards",           "sortOrder": 7,  "isActive": "ACTIVE" },
        { "id": 10, "code": "ER",        "name": "Emergency Room",         "description": "Emergency / trauma rooms",        "sortOrder": 10, "isActive": "ACTIVE" }
    ]
}

--- GET /api/room-type/get-all?activeOnly=false ---
RESPONSE (200):
{
    "data": [
        { "id": 1,  "code": "ICU",  "name": "Intensive Care Unit",  "sortOrder": 1,  "isActive": "ACTIVE" },
        { "id": 20, "code": "UTILITY", "name": "Utility Room",      "sortOrder": 20, "isActive": "INACTIVE" }
    ]
}
(Note: DELETED records are never returned even with activeOnly=false)

--- GET /api/location-level/get-all ---
RESPONSE (200):
{
    "requestId": "ll4d5e6f-...",
    "statusCode": 200,
    "message": "Location levels retrieved",
    "data": [
        { "id": 1, "code": "BUILDING", "name": "Building", "sortOrder": 1, "isActive": "ACTIVE" },
        { "id": 2, "code": "FLOOR",    "name": "Floor",    "sortOrder": 2, "isActive": "ACTIVE" },
        { "id": 3, "code": "ROOM",     "name": "Room",     "sortOrder": 3, "isActive": "ACTIVE" },
        { "id": 4, "code": "BED",      "name": "Bed",      "sortOrder": 4, "isActive": "ACTIVE" }
    ]
}
*/


// ============================================================================
// 9. FULL API SUMMARY TABLE
// ============================================================================

/*
is_active COLUMN AS EnumType.STRING RULES:
 - DB column name: is_active VARCHAR(20) -- reuses existing column
 - Java field name: isActive (RecordStatus enum mapped via @Enumerated(EnumType.STRING))
 - Valid values: ACTIVE | INACTIVE | DELETED
 - CREATE always sets isActive = ACTIVE (or INACTIVE if explicitly passed)
 - UPDATE can change any field EXCEPT isActive
 - DELETE (soft) sets isActive = DELETED
 - TOGGLE-STATUS switches between ACTIVE <-> INACTIVE only
 - GET-ALL returns isActive <> 'DELETED' (i.e. visible records)
 - GET-ALL-ACTIVE returns isActive = 'ACTIVE' only

PREVENTING CONFLICTS:
 - isActive is a single enum column: ACTIVE | INACTIVE | DELETED
 - This prevents impossible states like active=true AND is_deleted=true
 - DELETED records are invisible to all list endpoints
 - Only direct get-by-id can see DELETED records (for audit)

╔═══════════════════════════════════════════════════════════════════════════════════╗
║  #  | METHOD | ENDPOINT                             | DESCRIPTION                ║
╠═══════════════════════════════════════════════════════════════════════════════════╣
║     |        | LOOKUP APIs                           |                            ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║  1  | GET    | /api/room-type/get-all                | Room type dropdown          ║
║  2  | GET    | /api/location-level/get-all           | Location level dropdown     ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║     |        | BUILDING APIs                         |                            ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║  3  | POST   | /api/building/create                  | Create building             ║
║  4  | PUT    | /api/building/update                  | Update building             ║
║  5  | DELETE | /api/building/delete/{id}             | Soft delete (DELETED)       ║
║  6  | PATCH  | /api/building/toggle-status           | Toggle ACTIVE<->INACTIVE    ║
║  7  | GET    | /api/building/get-all                 | List non-deleted buildings  ║
║  8  | POST   | /api/building/get-all-active          | List ACTIVE buildings       ║
║  9  | GET    | /api/building/get-by-id               | Get building by ID          ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║     |        | FLOOR APIs                            |                            ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║ 10  | POST   | /api/floor/create                     | Create floor                ║
║ 11  | POST   | /api/floor/create-bulk                | Bulk create floors          ║
║ 12  | PUT    | /api/floor/update                     | Update floor                ║
║ 13  | DELETE | /api/floor/delete/{id}                | Soft delete (DELETED)       ║
║ 14  | PATCH  | /api/floor/toggle-status              | Toggle ACTIVE<->INACTIVE    ║
║ 15  | GET    | /api/floor/get-all                    | List non-deleted floors     ║
║ 16  | POST   | /api/floor/get-all-active             | List ACTIVE floors          ║
║ 17  | GET    | /api/floor/get-by-id                  | Get floor by ID             ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║     |        | ROOM APIs                             |                            ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║ 18  | POST   | /api/room/create                      | Create room                 ║
║ 19  | POST   | /api/room/create-bulk                 | Bulk create rooms           ║
║ 20  | PUT    | /api/room/update                      | Update room                 ║
║ 21  | DELETE | /api/room/delete/{id}                 | Soft delete (DELETED)       ║
║ 22  | PATCH  | /api/room/toggle-status               | Toggle ACTIVE<->INACTIVE    ║
║ 23  | GET    | /api/room/get-all                     | List non-deleted rooms      ║
║ 24  | POST   | /api/room/get-all-active              | List ACTIVE rooms           ║
║ 25  | GET    | /api/room/get-by-id                   | Get room by ID              ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║     |        | BED APIs                              |                            ║
╠─────┼────────┼──────────────────────────────────────┼────────────────────────────╣
║ 26  | POST   | /api/bed/create                       | Create bed                  ║
║ 27  | POST   | /api/bed/create-bulk                  | Bulk create beds            ║
║ 28  | POST   | /api/bed/auto-generate                | Auto-generate N beds        ║
║ 29  | PUT    | /api/bed/update                       | Update bed                  ║
║ 30  | DELETE | /api/bed/delete/{id}                  | Soft delete (DELETED)       ║
║ 31  | PATCH  | /api/bed/toggle-status                | Toggle ACTIVE<->INACTIVE    ║
║ 32  | GET    | /api/bed/get-all                      | List non-deleted beds       ║
║ 33  | POST   | /api/bed/get-all-active               | List ACTIVE beds            ║
║ 34  | GET    | /api/bed/get-by-id                    | Get bed by ID               ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
*/
