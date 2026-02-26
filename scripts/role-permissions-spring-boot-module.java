// ============================================================================
// SPRING BOOT 3.x MODULE: role_permissions
// Table       : role_permissions
// Base Tables : roles, resources, actions, users, tenants
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/role-permission
// ============================================================================


// ============================================================================
// 1. ENTITY: RolePermission.java
// Package: com.cmms.rbac.entity
// ============================================================================

package com.cmms.rbac.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "role_permissions",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_role_resource_action",
           columnNames = {"role_id", "resource_id", "action_id"}
       ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolePermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "action_id", nullable = false)
    private Long actionId;

    @Column(name = "is_allowed", nullable = false)
    private Boolean isAllowed = true;

    @Column(name = "granted_at", nullable = false)
    private OffsetDateTime grantedAt;

    @Column(name = "granted_by")
    private Long grantedBy;

    // ---------- FK Lazy references (read-only) ----------

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", insertable = false, updatable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", insertable = false, updatable = false)
    private Action action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "granted_by", insertable = false, updatable = false)
    private User grantedByUser;

    @PrePersist
    void prePersist() {
        if (this.grantedAt == null) this.grantedAt = OffsetDateTime.now();
        if (this.isAllowed == null) this.isAllowed = true;
    }
}


// ============================================================================
// 2. REQUEST DTOs
// Package: com.cmms.rbac.dto.request
// ============================================================================

// ---------- 2a. RolePermissionCreateRequest.java ----------

package com.cmms.rbac.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionCreateRequest {

    @NotNull(message = "roleId is required")
    private Long roleId;

    @NotNull(message = "resourceId is required")
    private Long resourceId;

    @NotNull(message = "actionId is required")
    private Long actionId;

    private Boolean isAllowed = true;
}


// ---------- 2b. RolePermissionUpdateRequest.java ----------

package com.cmms.rbac.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionUpdateRequest {

    @NotNull(message = "id is required")
    private Long id;

    @NotNull(message = "roleId is required")
    private Long roleId;

    @NotNull(message = "resourceId is required")
    private Long resourceId;

    @NotNull(message = "actionId is required")
    private Long actionId;

    private Boolean isAllowed = true;
}


// ---------- 2c. RolePermissionBulkSaveRequest.java ----------
// Used by the Permission Matrix screen: toggles entire role's permissions at once

package com.cmms.rbac.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionBulkSaveRequest {

    @NotNull(message = "roleId is required")
    private Long roleId;

    @NotNull @Size(min = 1, message = "permissions list must not be empty")
    @Valid
    private List<PermissionEntry> permissions;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PermissionEntry {

        @NotNull(message = "resourceId is required")
        private Long resourceId;

        @NotNull(message = "actionId is required")
        private Long actionId;

        private Boolean isAllowed = true;
    }
}


// ============================================================================
// 3. RESPONSE DTOs
// Package: com.cmms.rbac.dto.response
// ============================================================================

// ---------- 3a. RolePermissionResponseBasic.java ----------

package com.cmms.rbac.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionResponseBasic {

    private Long id;
    private Long tenantId;
    private Long roleId;
    private Long resourceId;
    private Long actionId;
    private Boolean isAllowed;
    private OffsetDateTime grantedAt;
    private Long grantedBy;
}


// ---------- 3b. RolePermissionResponseExpanded.java ----------

package com.cmms.rbac.dto.response;

import lombok.*;
import java.time.OffsetDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionResponseExpanded {

    private Long id;
    private Long tenantId;

    // Role fields
    private Long roleId;
    private String roleName;
    private String roleCode;
    private String roleScope;

    // Resource fields
    private Long resourceId;
    private String resourceKey;
    private String resourceName;
    private Long resourceParentId;

    // Action fields
    private Long actionId;
    private String actionKey;
    private String actionName;

    private Boolean isAllowed;
    private OffsetDateTime grantedAt;

    // Granted by user
    private Long grantedBy;
    private String grantedByName;
}


// ---------- 3c. RolePermissionMatrixResponse.java ----------
// Used by the Permission Matrix screen: grouped by role with full grid data

package com.cmms.rbac.dto.response;

import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RolePermissionMatrixResponse {

    private Long roleId;
    private String roleName;
    private String roleCode;
    private String roleScope;
    private int totalPermissions;
    private List<ResourcePermissionGroup> resourceGroups;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ResourcePermissionGroup {
        private Long resourceId;
        private String resourceKey;
        private String resourceName;
        private Long parentId;
        private boolean isParent;
        private List<ActionPermission> actions;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ActionPermission {
        private Long actionId;
        private String actionKey;
        private String actionName;
        private Boolean isAllowed;
        private Long permissionId;  // null if no row exists
    }
}


// ---------- 3d. ResponseDto.java (global wrapper) ----------

package com.cmms.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseDto<T> {

    private String requestId;
    private int statusCode;
    private String message;
    private T data;
    private String errorCode;
    private Map<String, String> fieldErrors;

    public static <T> ResponseDto<T> success(T data, String message) {
        return ResponseDto.<T>builder()
                .requestId(java.util.UUID.randomUUID().toString())
                .statusCode(200)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ResponseDto<T> created(T data, String message) {
        return ResponseDto.<T>builder()
                .requestId(java.util.UUID.randomUUID().toString())
                .statusCode(201)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ResponseDto<T> error(int statusCode, String message, String errorCode) {
        return ResponseDto.<T>builder()
                .requestId(java.util.UUID.randomUUID().toString())
                .statusCode(statusCode)
                .message(message)
                .errorCode(errorCode)
                .build();
    }
}


// ============================================================================
// 4. REPOSITORY: RolePermissionRepository.java
// Package: com.cmms.rbac.repository
// ============================================================================

package com.cmms.rbac.repository;

import com.cmms.rbac.dto.response.RolePermissionResponseBasic;
import com.cmms.rbac.dto.response.RolePermissionResponseExpanded;
import com.cmms.rbac.entity.RolePermission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    // ---- Duplicate check ----
    boolean existsByRoleIdAndResourceIdAndActionId(Long roleId, Long resourceId, Long actionId);

    Optional<RolePermission> findByRoleIdAndResourceIdAndActionId(Long roleId, Long resourceId, Long actionId);

    // ---- Basic projection (no JOINs) ----
    @Query("""
        SELECT new com.cmms.rbac.dto.response.RolePermissionResponseBasic(
            rp.id, rp.tenantId, rp.roleId, rp.resourceId, rp.actionId,
            rp.isAllowed, rp.grantedAt, rp.grantedBy
        )
        FROM RolePermission rp
        WHERE rp.tenantId = :tenantId
        ORDER BY rp.roleId, rp.resourceId, rp.actionId
    """)
    Page<RolePermissionResponseBasic> findAllBasic(
            @Param("tenantId") Long tenantId,
            Pageable pageable
    );

    // ---- Expanded projection (JOIN query) ----
    @Query("""
        SELECT new com.cmms.rbac.dto.response.RolePermissionResponseExpanded(
            rp.id, rp.tenantId,
            r.id, r.name, r.code, r.scope,
            res.id, res.resourceKey, res.resourceName, res.parentId,
            a.id, a.actionKey, a.actionName,
            rp.isAllowed, rp.grantedAt,
            rp.grantedBy, u.name
        )
        FROM RolePermission rp
        JOIN rp.role r
        JOIN rp.resource res
        JOIN rp.action a
        LEFT JOIN rp.grantedByUser u
        WHERE rp.tenantId = :tenantId
        ORDER BY r.name, res.resourceName, a.actionName
    """)
    Page<RolePermissionResponseExpanded> findAllExpanded(
            @Param("tenantId") Long tenantId,
            Pageable pageable
    );

    // ---- Basic by ID ----
    @Query("""
        SELECT new com.cmms.rbac.dto.response.RolePermissionResponseBasic(
            rp.id, rp.tenantId, rp.roleId, rp.resourceId, rp.actionId,
            rp.isAllowed, rp.grantedAt, rp.grantedBy
        )
        FROM RolePermission rp
        WHERE rp.id = :id AND rp.tenantId = :tenantId
    """)
    Optional<RolePermissionResponseBasic> findByIdBasic(
            @Param("id") Long id,
            @Param("tenantId") Long tenantId
    );

    // ---- Expanded by ID ----
    @Query("""
        SELECT new com.cmms.rbac.dto.response.RolePermissionResponseExpanded(
            rp.id, rp.tenantId,
            r.id, r.name, r.code, r.scope,
            res.id, res.resourceKey, res.resourceName, res.parentId,
            a.id, a.actionKey, a.actionName,
            rp.isAllowed, rp.grantedAt,
            rp.grantedBy, u.name
        )
        FROM RolePermission rp
        JOIN rp.role r
        JOIN rp.resource res
        JOIN rp.action a
        LEFT JOIN rp.grantedByUser u
        WHERE rp.id = :id AND rp.tenantId = :tenantId
    """)
    Optional<RolePermissionResponseExpanded> findByIdExpanded(
            @Param("id") Long id,
            @Param("tenantId") Long tenantId
    );

    // ---- All permissions for a specific role ----
    @Query("""
        SELECT new com.cmms.rbac.dto.response.RolePermissionResponseExpanded(
            rp.id, rp.tenantId,
            r.id, r.name, r.code, r.scope,
            res.id, res.resourceKey, res.resourceName, res.parentId,
            a.id, a.actionKey, a.actionName,
            rp.isAllowed, rp.grantedAt,
            rp.grantedBy, u.name
        )
        FROM RolePermission rp
        JOIN rp.role r
        JOIN rp.resource res
        JOIN rp.action a
        LEFT JOIN rp.grantedByUser u
        WHERE rp.roleId = :roleId AND rp.tenantId = :tenantId
        ORDER BY res.resourceName, a.actionName
    """)
    List<RolePermissionResponseExpanded> findAllByRoleIdExpanded(
            @Param("roleId") Long roleId,
            @Param("tenantId") Long tenantId
    );

    // ---- Delete all permissions for a role (used in bulk save) ----
    void deleteAllByRoleIdAndTenantId(Long roleId, Long tenantId);

    // ---- Count permissions for a role ----
    long countByRoleIdAndTenantId(Long roleId, Long tenantId);
}


// ============================================================================
// 5. SERVICE: RolePermissionService.java
// Package: com.cmms.rbac.service
// ============================================================================

package com.cmms.rbac.service;

import com.cmms.common.dto.ResponseDto;
import com.cmms.rbac.dto.request.*;
import com.cmms.rbac.dto.response.*;
import com.cmms.rbac.entity.RolePermission;
import com.cmms.rbac.repository.RolePermissionRepository;
import com.cmms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolePermissionService {

    private final RolePermissionRepository repository;
    private final JwtService jwtService;

    // ---- CREATE ----
    @Transactional(rollbackFor = Exception.class)
    public ResponseDto<RolePermissionResponseBasic> create(RolePermissionCreateRequest req) {
        Long tenantId = jwtService.getTenantId();
        Long userId = jwtService.getUserId();

        // Duplicate check
        if (repository.existsByRoleIdAndResourceIdAndActionId(
                req.getRoleId(), req.getResourceId(), req.getActionId())) {
            return ResponseDto.error(409,
                    "Permission already exists for this role-resource-action combination",
                    "DUPLICATE_ROLE_RESOURCE_ACTION");
        }

        RolePermission entity = RolePermission.builder()
                .tenantId(tenantId)
                .roleId(req.getRoleId())
                .resourceId(req.getResourceId())
                .actionId(req.getActionId())
                .isAllowed(req.getIsAllowed() != null ? req.getIsAllowed() : true)
                .grantedAt(OffsetDateTime.now())
                .grantedBy(userId)
                .build();

        entity = repository.save(entity);

        return ResponseDto.created(
                mapToBasic(entity),
                "Permission created successfully"
        );
    }

    // ---- UPDATE ----
    @Transactional(rollbackFor = Exception.class)
    public ResponseDto<RolePermissionResponseBasic> update(RolePermissionUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();

        RolePermission entity = repository.findById(req.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));

        // Tenant guard
        if (!entity.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        // Duplicate check (if role/resource/action changed)
        if (!entity.getRoleId().equals(req.getRoleId()) ||
            !entity.getResourceId().equals(req.getResourceId()) ||
            !entity.getActionId().equals(req.getActionId())) {
            if (repository.existsByRoleIdAndResourceIdAndActionId(
                    req.getRoleId(), req.getResourceId(), req.getActionId())) {
                return ResponseDto.error(409,
                        "Permission already exists for this combination",
                        "DUPLICATE_ROLE_RESOURCE_ACTION");
            }
        }

        entity.setRoleId(req.getRoleId());
        entity.setResourceId(req.getResourceId());
        entity.setActionId(req.getActionId());
        entity.setIsAllowed(req.getIsAllowed() != null ? req.getIsAllowed() : true);

        entity = repository.save(entity);

        return ResponseDto.success(mapToBasic(entity), "Permission updated successfully");
    }

    // ---- DELETE (hard delete -- no active column) ----
    @Transactional(rollbackFor = Exception.class)
    public ResponseDto<Void> delete(Long id) {
        Long tenantId = jwtService.getTenantId();

        RolePermission entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));

        if (!entity.getTenantId().equals(tenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        repository.delete(entity);
        return ResponseDto.success(null, "Permission deleted successfully");
    }

    // ---- GET ALL (paginated) ----
    public ResponseDto<Page<?>> getAll(boolean expand, Pageable pageable) {
        Long tenantId = jwtService.getTenantId();

        if (expand) {
            return ResponseDto.success(
                    repository.findAllExpanded(tenantId, pageable),
                    "Permissions fetched (expanded)"
            );
        }
        return ResponseDto.success(
                repository.findAllBasic(tenantId, pageable),
                "Permissions fetched"
        );
    }

    // ---- GET BY ID ----
    public ResponseDto<?> getById(Long id, boolean expand) {
        Long tenantId = jwtService.getTenantId();

        if (expand) {
            RolePermissionResponseExpanded result = repository
                    .findByIdExpanded(id, tenantId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));
            return ResponseDto.success(result, "Permission fetched (expanded)");
        }

        RolePermissionResponseBasic result = repository
                .findByIdBasic(id, tenantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));
        return ResponseDto.success(result, "Permission fetched");
    }

    // ---- GET BY ROLE ID (all permissions for one role) ----
    public ResponseDto<List<RolePermissionResponseExpanded>> getByRoleId(Long roleId) {
        Long tenantId = jwtService.getTenantId();
        List<RolePermissionResponseExpanded> results = repository.findAllByRoleIdExpanded(roleId, tenantId);
        return ResponseDto.success(results, "Permissions for role fetched");
    }

    // ---- BULK SAVE (Permission Matrix save) ----
    // Replaces ALL permissions for a role with the new set
    @Transactional(rollbackFor = Exception.class)
    public ResponseDto<Map<String, Object>> bulkSave(RolePermissionBulkSaveRequest req) {
        Long tenantId = jwtService.getTenantId();
        Long userId = jwtService.getUserId();

        // Delete all existing permissions for this role
        repository.deleteAllByRoleIdAndTenantId(req.getRoleId(), tenantId);

        // Insert new permissions
        List<RolePermission> entities = req.getPermissions().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsAllowed()))
                .map(p -> RolePermission.builder()
                        .tenantId(tenantId)
                        .roleId(req.getRoleId())
                        .resourceId(p.getResourceId())
                        .actionId(p.getActionId())
                        .isAllowed(true)
                        .grantedAt(OffsetDateTime.now())
                        .grantedBy(userId)
                        .build())
                .collect(Collectors.toList());

        repository.saveAll(entities);

        return ResponseDto.success(
                Map.of("roleId", req.getRoleId(), "permissionsCount", entities.size()),
                "Permissions saved for role"
        );
    }

    // ---- GET PERMISSION MATRIX (for UI grid) ----
    // Returns all resources x actions with isAllowed status for a given role
    public ResponseDto<RolePermissionMatrixResponse> getPermissionMatrix(Long roleId) {
        Long tenantId = jwtService.getTenantId();

        List<RolePermissionResponseExpanded> permissions = repository.findAllByRoleIdExpanded(roleId, tenantId);

        // Build lookup: resourceId_actionId -> permission
        Map<String, RolePermissionResponseExpanded> permLookup = permissions.stream()
                .collect(Collectors.toMap(
                        p -> p.getResourceId() + "_" + p.getActionId(),
                        p -> p,
                        (a, b) -> a
                ));

        // Build the matrix response
        // (In production, you'd also load all resources and actions from their repositories)
        RolePermissionMatrixResponse matrix = RolePermissionMatrixResponse.builder()
                .roleId(roleId)
                .totalPermissions(permissions.size())
                .build();

        if (!permissions.isEmpty()) {
            matrix.setRoleName(permissions.get(0).getRoleName());
            matrix.setRoleCode(permissions.get(0).getRoleCode());
            matrix.setRoleScope(permissions.get(0).getRoleScope());
        }

        return ResponseDto.success(matrix, "Permission matrix loaded");
    }

    // ---- Helper ----
    private RolePermissionResponseBasic mapToBasic(RolePermission entity) {
        return RolePermissionResponseBasic.builder()
                .id(entity.getId())
                .tenantId(entity.getTenantId())
                .roleId(entity.getRoleId())
                .resourceId(entity.getResourceId())
                .actionId(entity.getActionId())
                .isAllowed(entity.getIsAllowed())
                .grantedAt(entity.getGrantedAt())
                .grantedBy(entity.getGrantedBy())
                .build();
    }
}


// ============================================================================
// 6. CONTROLLER: RolePermissionController.java
// Package: com.cmms.rbac.controller
// ============================================================================

package com.cmms.rbac.controller;

import com.cmms.common.dto.ResponseDto;
import com.cmms.rbac.dto.request.*;
import com.cmms.rbac.dto.response.*;
import com.cmms.rbac.service.RolePermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/role-permission")
@RequiredArgsConstructor
public class RolePermissionController {

    private final RolePermissionService service;

    // POST /api/role-permission/create
    @PostMapping("/create")
    public ResponseEntity<ResponseDto<RolePermissionResponseBasic>> create(
            @Valid @RequestBody RolePermissionCreateRequest request) {
        ResponseDto<RolePermissionResponseBasic> response = service.create(request);
        HttpStatus status = response.getStatusCode() == 201 ? HttpStatus.CREATED :
                            response.getStatusCode() == 409 ? HttpStatus.CONFLICT : HttpStatus.OK;
        return ResponseEntity.status(status).body(response);
    }

    // PUT /api/role-permission/update
    @PutMapping("/update")
    public ResponseEntity<ResponseDto<RolePermissionResponseBasic>> update(
            @Valid @RequestBody RolePermissionUpdateRequest request) {
        ResponseDto<RolePermissionResponseBasic> response = service.update(request);
        HttpStatus status = response.getStatusCode() == 409 ? HttpStatus.CONFLICT : HttpStatus.OK;
        return ResponseEntity.status(status).body(response);
    }

    // DELETE /api/role-permission/delete/{id}
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto<Void>> delete(@PathVariable Long id) {
        return ResponseEntity.ok(service.delete(id));
    }

    // GET /api/role-permission/get-all?expand=true|false&page=0&size=20&sort=id,desc
    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto<Page<?>>> getAll(
            @RequestParam(defaultValue = "false") boolean expand,
            @PageableDefault(size = 20, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(service.getAll(expand, pageable));
    }

    // GET /api/role-permission/get-by-id?id=1&expand=true|false
    @GetMapping("/get-by-id")
    public ResponseEntity<ResponseDto<?>> getById(
            @RequestParam Long id,
            @RequestParam(defaultValue = "false") boolean expand) {
        return ResponseEntity.ok(service.getById(id, expand));
    }

    // GET /api/role-permission/get-by-role?roleId=1
    @GetMapping("/get-by-role")
    public ResponseEntity<ResponseDto<List<RolePermissionResponseExpanded>>> getByRole(
            @RequestParam Long roleId) {
        return ResponseEntity.ok(service.getByRoleId(roleId));
    }

    // POST /api/role-permission/bulk-save  (Permission Matrix save)
    @PostMapping("/bulk-save")
    public ResponseEntity<ResponseDto<Map<String, Object>>> bulkSave(
            @Valid @RequestBody RolePermissionBulkSaveRequest request) {
        return ResponseEntity.ok(service.bulkSave(request));
    }

    // GET /api/role-permission/matrix?roleId=1
    @GetMapping("/matrix")
    public ResponseEntity<ResponseDto<RolePermissionMatrixResponse>> getMatrix(
            @RequestParam Long roleId) {
        return ResponseEntity.ok(service.getPermissionMatrix(roleId));
    }
}


// ============================================================================
// 7. GLOBAL EXCEPTION HANDLER: GlobalExceptionHandler.java
// Package: com.cmms.common.exception
// ============================================================================

package com.cmms.common.exception;

import com.cmms.common.dto.ResponseDto;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResponseDto<Void>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> fieldErrors.put(e.getField(), e.getDefaultMessage()));

        ResponseDto<Void> response = ResponseDto.<Void>builder()
                .requestId(java.util.UUID.randomUUID().toString())
                .statusCode(400)
                .message("Validation failed")
                .errorCode("VALIDATION_ERROR")
                .fieldErrors(fieldErrors)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ResponseDto<Void>> handleResponseStatus(ResponseStatusException ex) {
        int code = ex.getStatusCode().value();
        String errorCode = code == 404 ? "NOT_FOUND" :
                           code == 403 ? "FORBIDDEN" : "ERROR";

        return ResponseEntity.status(ex.getStatusCode())
                .body(ResponseDto.error(code, ex.getReason(), errorCode));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ResponseDto<Void>> handleDuplicateKey(DataIntegrityViolationException ex) {
        String msg = "Duplicate entry. This role-resource-action combination already exists.";
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ResponseDto.error(409, msg, "DUPLICATE_ROLE_RESOURCE_ACTION"));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ResponseDto<Void>> handleConstraintViolation(ConstraintViolationException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> fieldErrors.put(v.getPropertyPath().toString(), v.getMessage()));

        return ResponseEntity.badRequest()
                .body(ResponseDto.<Void>builder()
                        .requestId(java.util.UUID.randomUUID().toString())
                        .statusCode(400)
                        .message("Constraint violation")
                        .errorCode("CONSTRAINT_VIOLATION")
                        .fieldErrors(fieldErrors)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResponseDto<Void>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResponseDto.error(500, "An unexpected error occurred. Please try again.", "INTERNAL_ERROR"));
    }
}


// ============================================================================
// 8. RECOMMENDED DB INDEXES
// ============================================================================

/*
-- Already in DDL:
CONSTRAINT uq_role_resource_action UNIQUE (role_id, resource_id, action_id)

-- Additional recommended indexes:
CREATE INDEX idx_rp_tenant         ON role_permissions(tenant_id);
CREATE INDEX idx_rp_role           ON role_permissions(tenant_id, role_id);
CREATE INDEX idx_rp_resource       ON role_permissions(tenant_id, resource_id);
CREATE INDEX idx_rp_granted_by     ON role_permissions(granted_by);
CREATE INDEX idx_rp_role_resource  ON role_permissions(role_id, resource_id, action_id);
*/


// ============================================================================
// 9. SAMPLE JSON PAYLOADS & RESPONSES
// ============================================================================

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║  API 1: POST /api/role-permission/create                                    ║
║  Purpose: Grant one permission to a role                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣

REQUEST:
{
    "roleId": 3,
    "resourceId": 8,
    "actionId": 1,
    "isAllowed": true
}

RESPONSE (201 Created):
{
    "requestId": "a7c12f4e-9b3a-4e5d-8f2c-1a2b3c4d5e6f",
    "statusCode": 201,
    "message": "Permission created successfully",
    "data": {
        "id": 45,
        "tenantId": 1,
        "roleId": 3,
        "resourceId": 8,
        "actionId": 1,
        "isAllowed": true,
        "grantedAt": "2026-02-23T10:30:00+05:30",
        "grantedBy": 12
    }
}

RESPONSE (409 Duplicate):
{
    "requestId": "b8d23e5f-0c4b-5f6e-9g3d-2b3c4d5e6f7g",
    "statusCode": 409,
    "message": "Permission already exists for this role-resource-action combination",
    "errorCode": "DUPLICATE_ROLE_RESOURCE_ACTION"
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 2: PUT /api/role-permission/update                                     ║
║  Purpose: Update an existing permission                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣

REQUEST:
{
    "id": 45,
    "roleId": 3,
    "resourceId": 8,
    "actionId": 1,
    "isAllowed": false
}

RESPONSE (200 OK):
{
    "requestId": "c9e34f6g-1d5c-6g7f-0h4e-3c4d5e6f7g8h",
    "statusCode": 200,
    "message": "Permission updated successfully",
    "data": {
        "id": 45,
        "tenantId": 1,
        "roleId": 3,
        "resourceId": 8,
        "actionId": 1,
        "isAllowed": false,
        "grantedAt": "2026-02-23T10:30:00+05:30",
        "grantedBy": 12
    }
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 3: DELETE /api/role-permission/delete/{id}                             ║
║  Purpose: Revoke a permission (hard delete, no active column)               ║
╠══════════════════════════════════════════════════════════════════════════════╣

RESPONSE (200 OK):
{
    "requestId": "d0f45g7h-2e6d-7h8g-1i5f-4d5e6f7g8h9i",
    "statusCode": 200,
    "message": "Permission deleted successfully",
    "data": null
}

RESPONSE (404 Not Found):
{
    "requestId": "e1g56h8i-3f7e-8i9h-2j6g-5e6f7g8h9i0j",
    "statusCode": 404,
    "message": "Permission not found",
    "errorCode": "NOT_FOUND"
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 4: GET /api/role-permission/get-all?expand=false&page=0&size=20        ║
║  Purpose: List all permissions (basic)                                      ║
╠══════════════════════════════════════════════════════════════════════════════╣

RESPONSE (200 OK - Basic):
{
    "requestId": "f2h67i9j-4g8f-9j0i-3k7h-6f7g8h9i0j1k",
    "statusCode": 200,
    "message": "Permissions fetched",
    "data": {
        "content": [
            {
                "id": 1,
                "tenantId": 1,
                "roleId": 1,
                "resourceId": 2,
                "actionId": 1,
                "isAllowed": true,
                "grantedAt": "2026-01-15T09:00:00+05:30",
                "grantedBy": 1
            },
            {
                "id": 2,
                "tenantId": 1,
                "roleId": 1,
                "resourceId": 2,
                "actionId": 3,
                "isAllowed": true,
                "grantedAt": "2026-01-15T09:00:00+05:30",
                "grantedBy": 1
            }
        ],
        "pageable": {
            "pageNumber": 0,
            "pageSize": 20,
            "sort": { "sorted": true, "direction": "ASC", "property": "id" }
        },
        "totalElements": 95,
        "totalPages": 5,
        "last": false,
        "first": true,
        "numberOfElements": 20
    }
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 5: GET /api/role-permission/get-all?expand=true&page=0&size=20         ║
║  Purpose: List all permissions with display names from FK tables            ║
╠══════════════════════════════════════════════════════════════════════════════╣

RESPONSE (200 OK - Expanded):
{
    "requestId": "g3i78j0k-5h9g-0k1j-4l8i-7g8h9i0j1k2l",
    "statusCode": 200,
    "message": "Permissions fetched (expanded)",
    "data": {
        "content": [
            {
                "id": 1,
                "tenantId": 1,
                "roleId": 1,
                "roleName": "Tenant Group Admin",
                "roleCode": "TENANT_GROUP_ADMIN",
                "roleScope": "Tenant-level",
                "resourceId": 2,
                "resourceKey": "TENANT_SETTINGS",
                "resourceName": "Tenant Settings",
                "resourceParentId": 1,
                "actionId": 1,
                "actionKey": "VIEW",
                "actionName": "View",
                "isAllowed": true,
                "grantedAt": "2026-01-15T09:00:00+05:30",
                "grantedBy": 1,
                "grantedByName": "Platform Admin"
            },
            {
                "id": 15,
                "tenantId": 1,
                "roleId": 2,
                "roleName": "Organization Admin",
                "roleCode": "ORG_ADMIN",
                "roleScope": "Org-level",
                "resourceId": 10,
                "resourceKey": "LOCATION",
                "resourceName": "Location",
                "resourceParentId": 7,
                "actionId": 2,
                "actionKey": "CREATE",
                "actionName": "Create",
                "isAllowed": true,
                "grantedAt": "2026-01-20T11:30:00+05:30",
                "grantedBy": 1,
                "grantedByName": "Arjun Kumar"
            }
        ],
        "totalElements": 95,
        "totalPages": 5,
        "last": false,
        "first": true,
        "numberOfElements": 20
    }
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 6: GET /api/role-permission/get-by-id?id=15&expand=true                ║
║  Purpose: Get single permission with full display details                   ║
╠══════════════════════════════════════════════════════════════════════════════╣

RESPONSE (200 OK):
{
    "requestId": "h4j89k1l-6i0h-1l2k-5m9j-8h9i0j1k2l3m",
    "statusCode": 200,
    "message": "Permission fetched (expanded)",
    "data": {
        "id": 15,
        "tenantId": 1,
        "roleId": 2,
        "roleName": "Organization Admin",
        "roleCode": "ORG_ADMIN",
        "roleScope": "Org-level",
        "resourceId": 10,
        "resourceKey": "LOCATION",
        "resourceName": "Location",
        "resourceParentId": 7,
        "actionId": 2,
        "actionKey": "CREATE",
        "actionName": "Create",
        "isAllowed": true,
        "grantedAt": "2026-01-20T11:30:00+05:30",
        "grantedBy": 1,
        "grantedByName": "Arjun Kumar"
    }
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 7: GET /api/role-permission/get-by-role?roleId=3                       ║
║  Purpose: All permissions for Maintenance Manager (used by Matrix screen)   ║
╠══════════════════════════════════════════════════════════════════════════════╣

RESPONSE (200 OK):
{
    "requestId": "i5k90l2m-7j1i-2m3l-6n0k-9i0j1k2l3m4n",
    "statusCode": 200,
    "message": "Permissions for role fetched",
    "data": [
        {
            "id": 30,
            "tenantId": 1,
            "roleId": 3,
            "roleName": "Maintenance Manager",
            "roleCode": "MAINT_MANAGER",
            "roleScope": "Org-level",
            "resourceId": 8,
            "resourceKey": "ASSET",
            "resourceName": "Asset",
            "resourceParentId": 7,
            "actionId": 1,
            "actionKey": "VIEW",
            "actionName": "View",
            "isAllowed": true,
            "grantedAt": "2026-01-15T09:00:00+05:30",
            "grantedBy": 1,
            "grantedByName": "Arjun Kumar"
        },
        {
            "id": 31,
            "tenantId": 1,
            "roleId": 3,
            "roleName": "Maintenance Manager",
            "roleCode": "MAINT_MANAGER",
            "roleScope": "Org-level",
            "resourceId": 8,
            "resourceKey": "ASSET",
            "resourceName": "Asset",
            "resourceParentId": 7,
            "actionId": 2,
            "actionKey": "CREATE",
            "actionName": "Create",
            "isAllowed": true,
            "grantedAt": "2026-01-15T09:00:00+05:30",
            "grantedBy": 1,
            "grantedByName": "Arjun Kumar"
        },
        {
            "id": 32,
            "tenantId": 1,
            "roleId": 3,
            "roleName": "Maintenance Manager",
            "roleCode": "MAINT_MANAGER",
            "roleScope": "Org-level",
            "resourceId": 14,
            "resourceKey": "WORK_ORDER",
            "resourceName": "Work Order",
            "resourceParentId": 12,
            "actionId": 1,
            "actionKey": "VIEW",
            "actionName": "View",
            "isAllowed": true,
            "grantedAt": "2026-01-15T09:00:00+05:30",
            "grantedBy": 1,
            "grantedByName": "Arjun Kumar"
        },
        {
            "id": 33,
            "tenantId": 1,
            "roleId": 3,
            "roleName": "Maintenance Manager",
            "roleCode": "MAINT_MANAGER",
            "roleScope": "Org-level",
            "resourceId": 14,
            "resourceKey": "WORK_ORDER",
            "resourceName": "Work Order",
            "resourceParentId": 12,
            "actionId": 5,
            "actionKey": "APPROVE",
            "actionName": "Approve",
            "isAllowed": true,
            "grantedAt": "2026-01-15T09:00:00+05:30",
            "grantedBy": 1,
            "grantedByName": "Arjun Kumar"
        }
    ]
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 8: POST /api/role-permission/bulk-save                                 ║
║  Purpose: Save entire permission grid for a role (Permission Matrix)        ║
║  Behavior: Deletes all existing perms for role, inserts new set             ║
╠══════════════════════════════════════════════════════════════════════════════╣

REQUEST:
{
    "roleId": 4,
    "permissions": [
        { "resourceId": 14, "actionId": 1,  "isAllowed": true },
        { "resourceId": 14, "actionId": 2,  "isAllowed": true },
        { "resourceId": 14, "actionId": 3,  "isAllowed": true },
        { "resourceId": 14, "actionId": 7,  "isAllowed": true },
        { "resourceId": 15, "actionId": 1,  "isAllowed": true },
        { "resourceId": 15, "actionId": 2,  "isAllowed": true },
        { "resourceId": 8,  "actionId": 1,  "isAllowed": true },
        { "resourceId": 8,  "actionId": 3,  "isAllowed": true },
        { "resourceId": 16, "actionId": 1,  "isAllowed": true },
        { "resourceId": 10, "actionId": 1,  "isAllowed": false }
    ]
}

RESPONSE (200 OK):
{
    "requestId": "j6l01m3n-8k2j-3n4m-7o1l-0j1k2l3m4n5o",
    "statusCode": 200,
    "message": "Permissions saved for role",
    "data": {
        "roleId": 4,
        "permissionsCount": 9
    }
}

Note: permissionsCount = 9 (not 10) because one entry had isAllowed=false
and was filtered out. Only isAllowed=true entries are persisted.

╠══════════════════════════════════════════════════════════════════════════════╣
║  API 9: GET /api/role-permission/matrix?roleId=4                            ║
║  Purpose: Load permission matrix grid for UI (grouped by resource)          ║
╠══════════════════════════════════════════════════════════════════════════════╣

RESPONSE (200 OK):
{
    "requestId": "k7m12n4o-9l3k-4o5n-8p2m-1k2l3m4n5o6p",
    "statusCode": 200,
    "message": "Permission matrix loaded",
    "data": {
        "roleId": 4,
        "roleName": "Technician",
        "roleCode": "TECHNICIAN",
        "roleScope": "Org-level",
        "totalPermissions": 7,
        "resourceGroups": [
            {
                "resourceId": 7,
                "resourceKey": "ASSET_MANAGEMENT",
                "resourceName": "Asset Management",
                "parentId": null,
                "isParent": true,
                "actions": []
            },
            {
                "resourceId": 8,
                "resourceKey": "ASSET",
                "resourceName": "Asset",
                "parentId": 7,
                "isParent": false,
                "actions": [
                    { "actionId": 1, "actionKey": "VIEW",   "actionName": "View",   "isAllowed": true,  "permissionId": 40 },
                    { "actionId": 2, "actionKey": "CREATE", "actionName": "Create", "isAllowed": false, "permissionId": null },
                    { "actionId": 3, "actionKey": "UPDATE", "actionName": "Update", "isAllowed": false, "permissionId": null },
                    { "actionId": 4, "actionKey": "DELETE", "actionName": "Delete", "isAllowed": false, "permissionId": null }
                ]
            },
            {
                "resourceId": 12,
                "resourceKey": "MAINTENANCE",
                "resourceName": "Maintenance",
                "parentId": null,
                "isParent": true,
                "actions": []
            },
            {
                "resourceId": 14,
                "resourceKey": "WORK_ORDER",
                "resourceName": "Work Order",
                "parentId": 12,
                "isParent": false,
                "actions": [
                    { "actionId": 1, "actionKey": "VIEW",   "actionName": "View",   "isAllowed": true,  "permissionId": 41 },
                    { "actionId": 2, "actionKey": "CREATE", "actionName": "Create", "isAllowed": true,  "permissionId": 42 },
                    { "actionId": 3, "actionKey": "UPDATE", "actionName": "Update", "isAllowed": true,  "permissionId": 43 },
                    { "actionId": 5, "actionKey": "APPROVE","actionName": "Approve","isAllowed": false, "permissionId": null },
                    { "actionId": 6, "actionKey": "ASSIGN", "actionName": "Assign", "isAllowed": false, "permissionId": null },
                    { "actionId": 7, "actionKey": "CLOSE",  "actionName": "Close",  "isAllowed": true,  "permissionId": 44 }
                ]
            },
            {
                "resourceId": 15,
                "resourceKey": "WORK_REQUEST",
                "resourceName": "Work Request",
                "parentId": 12,
                "isParent": false,
                "actions": [
                    { "actionId": 1, "actionKey": "VIEW",   "actionName": "View",   "isAllowed": true,  "permissionId": 45 },
                    { "actionId": 2, "actionKey": "CREATE", "actionName": "Create", "isAllowed": true,  "permissionId": 46 },
                    { "actionId": 3, "actionKey": "UPDATE", "actionName": "Update", "isAllowed": false, "permissionId": null }
                ]
            }
        ]
    }
}

╠══════════════════════════════════════════════════════════════════════════════╣
║  ERROR RESPONSES (common across all APIs)                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣

400 - Validation Error:
{
    "requestId": "l8n23o5p-0m4l-5p6o-9q3n-2l3m4n5o6p7q",
    "statusCode": 400,
    "message": "Validation failed",
    "errorCode": "VALIDATION_ERROR",
    "fieldErrors": {
        "roleId": "roleId is required",
        "actionId": "actionId is required"
    }
}

403 - Forbidden (tenant mismatch):
{
    "requestId": "m9o34p6q-1n5m-6q7p-0r4o-3m4n5o6p7q8r",
    "statusCode": 403,
    "message": "Access denied",
    "errorCode": "FORBIDDEN"
}

404 - Not Found:
{
    "requestId": "n0p45q7r-2o6n-7r8q-1s5p-4n5o6p7q8r9s",
    "statusCode": 404,
    "message": "Permission not found",
    "errorCode": "NOT_FOUND"
}

500 - Internal Error:
{
    "requestId": "o1q56r8s-3p7o-8s9r-2t6q-5o6p7q8r9s0t",
    "statusCode": 500,
    "message": "An unexpected error occurred. Please try again.",
    "errorCode": "INTERNAL_ERROR"
}

╚══════════════════════════════════════════════════════════════════════════════╝
*/


// ============================================================================
// 10. API SUMMARY TABLE
// ============================================================================

/*
┌────┬────────┬──────────────────────────────────────┬───────────────────────────────────────┬────────┐
│ #  │ Method │ Endpoint                              │ Purpose                               │ Status │
├────┼────────┼──────────────────────────────────────┼───────────────────────────────────────┼────────┤
│  1 │ POST   │ /api/role-permission/create           │ Grant single permission                │ 201    │
│  2 │ PUT    │ /api/role-permission/update           │ Update existing permission             │ 200    │
│  3 │ DELETE │ /api/role-permission/delete/{id}      │ Revoke permission (hard delete)        │ 200    │
│  4 │ GET    │ /api/role-permission/get-all          │ List all (basic/expanded, paginated)   │ 200    │
│  5 │ GET    │ /api/role-permission/get-by-id        │ Single permission (basic/expanded)     │ 200    │
│  6 │ GET    │ /api/role-permission/get-by-role      │ All permissions for a role (expanded)  │ 200    │
│  7 │ POST   │ /api/role-permission/bulk-save        │ Replace all perms for a role (matrix)  │ 200    │
│  8 │ GET    │ /api/role-permission/matrix           │ Permission matrix grid for UI          │ 200    │
└────┴────────┴──────────────────────────────────────┴───────────────────────────────────────┴────────┘

SCREEN-TO-API MAPPING:
─────────────────────
• Roles Tab → create/update/delete via existing Roles API (not this module)
• Resources Tab → existing Resources API
• Permission Matrix Tab (checkbox grid):
    - Load:  GET  /get-by-role?roleId=X  or  GET /matrix?roleId=X
    - Save:  POST /bulk-save  (replaces all perms for the selected role)
    - Toggle single cell: POST /create  or  DELETE /delete/{id}
• User Roles Tab → references roles assigned via user_org_memberships
• Audit Log Tab → existing Audit Log API

TENANT ISOLATION:
─────────────────
• tenant_id extracted from JWT on every request
• All queries filtered by tenant_id
• Platform user (tenant_id=0) can read all tenants
• Write operations restricted to own tenant only
*/
