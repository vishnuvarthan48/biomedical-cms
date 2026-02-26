// ============================================================================
// SPRING BOOT 3.x MODULE: voltage_option (Device Dropdown - child of inlet_power)
// Table       : voltage_option
// Parent FK   : inlet_power_id -> inlet_power(id)
// Stack       : Java 17+, Spring Boot 3.x, JPA/Hibernate, PostgreSQL, JWT
// Base URL    : /api/device/voltage-option
// SOFT-DELETE : is_active ENUM (ACTIVE | INACTIVE | DELETED) via EnumType.STRING
// ============================================================================


// ============================================================================
// 1. ENTITY: VoltageOption.java
// Package: com.cmms.device.entity
// ============================================================================

package com.cmms.device.entity;

import com.cmms.common.enums.RecordStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "voltage_option",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_voltage_per_inlet",
           columnNames = {"tenant_id", "inlet_power_id", "display_label"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VoltageOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "inlet_power_id", nullable = false)
    private Long inletPowerId;

    @Column(name = "display_label", nullable = false, length = 30)
    private String displayLabel;

    @Column(name = "voltage_v", precision = 8, scale = 2)
    private BigDecimal voltageV;

    @Column(name = "frequency_hz")
    private Integer frequencyHz;

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

// ---------- VoltageOptionCreateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VoltageOptionCreateRequest {

    @NotNull(message = "inletPowerId is required")
    private Long inletPowerId;

    @NotBlank(message = "displayLabel is required")
    @Size(max = 30)
    private String displayLabel;

    @DecimalMin(value = "0.01", message = "voltageV must be positive")
    private BigDecimal voltageV;

    @Min(value = 1, message = "frequencyHz must be positive")
    private Integer frequencyHz;

    private Boolean isDefault;
    private Integer sortOrder;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- VoltageOptionUpdateRequest.java ----------
package com.cmms.device.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VoltageOptionUpdateRequest {

    @NotNull(message = "id is required")
    private Long id;

    @NotNull(message = "inletPowerId is required")
    private Long inletPowerId;

    @NotBlank(message = "displayLabel is required")
    @Size(max = 30)
    private String displayLabel;

    @DecimalMin(value = "0.01", message = "voltageV must be positive")
    private BigDecimal voltageV;

    @Min(value = 1, message = "frequencyHz must be positive")
    private Integer frequencyHz;

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
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VoltageOptionResponseDto {
    private Long id;
    private Long tenantId;
    private Long inletPowerId;
    private String inletPowerCode;   // enriched from parent
    private String inletPowerName;   // enriched from parent
    private String displayLabel;
    private BigDecimal voltageV;
    private Integer frequencyHz;
    private Boolean isDefault;
    private Integer sortOrder;
    private String isActive;         // ACTIVE | INACTIVE | DELETED
}


// ============================================================================
// 4. REPOSITORY: VoltageOptionRepository.java
// Package: com.cmms.device.repository
// ============================================================================

package com.cmms.device.repository;

import com.cmms.device.entity.VoltageOption;
import com.cmms.device.dto.response.VoltageOptionResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoltageOptionRepository extends JpaRepository<VoltageOption, Long> {

    Optional<VoltageOption> findByIdAndTenantId(Long id, Long tenantId);

    // Duplicate check (displayLabel per tenant + inlet_power)
    @Query("""
        SELECT CASE WHEN COUNT(vo) > 0 THEN true ELSE false END
        FROM VoltageOption vo
        WHERE vo.tenantId = :tenantId
          AND vo.inletPowerId = :inletPowerId
          AND UPPER(vo.displayLabel) = UPPER(:displayLabel)
          AND vo.isActive <> 'DELETED'
          AND (:excludeId IS NULL OR vo.id <> :excludeId)
    """)
    boolean existsDuplicate(@Param("tenantId") Long tenantId,
                            @Param("inletPowerId") Long inletPowerId,
                            @Param("displayLabel") String displayLabel,
                            @Param("excludeId") Long excludeId);

    // All visible by inlet_power (non-deleted), enriched with parent
    @Query("""
        SELECT new com.cmms.device.dto.response.VoltageOptionResponseDto(
            vo.id, vo.tenantId, vo.inletPowerId, ip.code, ip.name,
            vo.displayLabel, vo.voltageV, vo.frequencyHz,
            vo.isDefault, vo.sortOrder, CAST(vo.isActive AS string)
        )
        FROM VoltageOption vo
        JOIN InletPower ip ON ip.id = vo.inletPowerId AND ip.tenantId = vo.tenantId
        WHERE vo.tenantId = :tenantId
          AND vo.inletPowerId = :inletPowerId
          AND vo.isActive <> 'DELETED'
        ORDER BY vo.sortOrder, vo.displayLabel
    """)
    List<VoltageOptionResponseDto> findAllVisibleByInletPower(@Param("tenantId") Long tenantId,
                                                              @Param("inletPowerId") Long inletPowerId);

    // All ACTIVE only (for dropdown binding)
    @Query("""
        SELECT new com.cmms.device.dto.response.VoltageOptionResponseDto(
            vo.id, vo.tenantId, vo.inletPowerId, ip.code, ip.name,
            vo.displayLabel, vo.voltageV, vo.frequencyHz,
            vo.isDefault, vo.sortOrder, CAST(vo.isActive AS string)
        )
        FROM VoltageOption vo
        JOIN InletPower ip ON ip.id = vo.inletPowerId AND ip.tenantId = vo.tenantId
        WHERE vo.tenantId = :tenantId
          AND vo.inletPowerId = :inletPowerId
          AND vo.isActive = 'ACTIVE'
        ORDER BY vo.sortOrder, vo.displayLabel
    """)
    List<VoltageOptionResponseDto> findAllActiveByInletPower(@Param("tenantId") Long tenantId,
                                                             @Param("inletPowerId") Long inletPowerId);

    // Clear any existing default for the same inlet_power (before setting a new one)
    @Query("""
        UPDATE VoltageOption vo
        SET vo.isDefault = false
        WHERE vo.tenantId = :tenantId AND vo.inletPowerId = :inletPowerId
          AND vo.isDefault = true AND vo.id <> :excludeId
    """)
    void clearDefaultsForInletPower(@Param("tenantId") Long tenantId,
                                    @Param("inletPowerId") Long inletPowerId,
                                    @Param("excludeId") Long excludeId);
}


// ============================================================================
// 5. SERVICE: VoltageOptionService.java
// Package: com.cmms.device.service
// ============================================================================

package com.cmms.device.service;

import com.cmms.device.dto.request.VoltageOptionCreateRequest;
import com.cmms.device.dto.request.VoltageOptionUpdateRequest;
import com.cmms.device.dto.response.VoltageOptionResponseDto;
import com.cmms.device.entity.VoltageOption;
import com.cmms.device.entity.InletPower;
import com.cmms.device.repository.VoltageOptionRepository;
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
public class VoltageOptionService {

    private final VoltageOptionRepository repository;
    private final InletPowerRepository inletPowerRepo;
    private final JwtService jwtService;

    // ---------- CREATE ----------
    @Transactional(rollbackFor = Exception.class)
    public VoltageOptionResponseDto create(VoltageOptionCreateRequest req) {
        Long tenantId = jwtService.getTenantId();

        // Validate parent exists and is not deleted
        InletPower parent = inletPowerRepo.findByIdAndTenantId(req.getInletPowerId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Inlet power not found with ID: " + req.getInletPowerId()));
        if (parent.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot add voltage to a DELETED inlet power.");
        }

        if (repository.existsDuplicate(tenantId, req.getInletPowerId(), req.getDisplayLabel(), null)) {
            throw new DuplicateException("DUPLICATE_VOLTAGE_OPTION",
                "Voltage option '" + req.getDisplayLabel() + "' already exists for this inlet power");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
                ? RecordStatus.from(req.getIsActive())
                : RecordStatus.ACTIVE;

        VoltageOption entity = VoltageOption.builder()
                .tenantId(tenantId)
                .inletPowerId(req.getInletPowerId())
                .displayLabel(req.getDisplayLabel().trim())
                .voltageV(req.getVoltageV())
                .frequencyHz(req.getFrequencyHz())
                .isDefault(req.getIsDefault() != null ? req.getIsDefault() : false)
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                .isActive(initialIsActive)
                .build();

        entity = repository.save(entity);

        // Ensure only one default per inlet_power
        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            repository.clearDefaultsForInletPower(tenantId, entity.getInletPowerId(), entity.getId());
        }

        return mapToDto(entity, parent);
    }

    // ---------- UPDATE (does NOT change isActive) ----------
    @Transactional(rollbackFor = Exception.class)
    public VoltageOptionResponseDto update(VoltageOptionUpdateRequest req) {
        Long tenantId = jwtService.getTenantId();

        VoltageOption entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Voltage option not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED voltage option.");
        }

        if (repository.existsDuplicate(tenantId, req.getInletPowerId(), req.getDisplayLabel(), req.getId())) {
            throw new DuplicateException("DUPLICATE_VOLTAGE_OPTION",
                "Voltage option '" + req.getDisplayLabel() + "' already exists for this inlet power");
        }

        entity.setInletPowerId(req.getInletPowerId());
        entity.setDisplayLabel(req.getDisplayLabel().trim());
        entity.setVoltageV(req.getVoltageV());
        entity.setFrequencyHz(req.getFrequencyHz());
        if (req.getIsDefault() != null) entity.setIsDefault(req.getIsDefault());
        if (req.getSortOrder() != null) entity.setSortOrder(req.getSortOrder());
        // isActive NOT changed here

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
        VoltageOption entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Voltage option not found with ID: " + id));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Voltage option is already deleted.");
        }

        entity.setIsActive(RecordStatus.DELETED);
        repository.save(entity);
    }

    // ---------- TOGGLE STATUS ----------
    @Transactional(rollbackFor = Exception.class)
    public VoltageOptionResponseDto toggleStatus(StatusToggleRequest req) {
        Long tenantId = jwtService.getTenantId();
        VoltageOption entity = repository.findByIdAndTenantId(req.getId(), tenantId)
                .orElseThrow(() -> new NotFoundException("Voltage option not found with ID: " + req.getId()));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED voltage option.");
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

    // ---------- GET ALL by inlet_power (non-deleted) ----------
    public List<VoltageOptionResponseDto> getAll(Long inletPowerId) {
        Long tenantId = jwtService.getTenantId();
        return repository.findAllVisibleByInletPower(tenantId, inletPowerId);
    }

    // ---------- GET ALL ACTIVE by inlet_power (for dropdown) ----------
    public List<VoltageOptionResponseDto> getAllActive(Long inletPowerId) {
        Long tenantId = jwtService.getTenantId();
        return repository.findAllActiveByInletPower(tenantId, inletPowerId);
    }

    // ---------- GET BY ID ----------
    public VoltageOptionResponseDto getById(Long id) {
        Long tenantId = jwtService.getTenantId();
        VoltageOption entity = repository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new NotFoundException("Voltage option not found with ID: " + id));
        InletPower parent = inletPowerRepo.findByIdAndTenantId(entity.getInletPowerId(), tenantId).orElse(null);
        return mapToDto(entity, parent);
    }

    // ---------- HELPERS ----------
    private VoltageOptionResponseDto mapToDto(VoltageOption e, InletPower parent) {
        return VoltageOptionResponseDto.builder()
                .id(e.getId()).tenantId(e.getTenantId())
                .inletPowerId(e.getInletPowerId())
                .inletPowerCode(parent != null ? parent.getCode() : null)
                .inletPowerName(parent != null ? parent.getName() : null)
                .displayLabel(e.getDisplayLabel())
                .voltageV(e.getVoltageV()).frequencyHz(e.getFrequencyHz())
                .isDefault(e.getIsDefault()).sortOrder(e.getSortOrder())
                .isActive(e.getIsActive().name())
                .build();
    }
}


// ============================================================================
// 6. CONTROLLER: VoltageOptionController.java
// Package: com.cmms.device.controller
// ============================================================================

package com.cmms.device.controller;

import com.cmms.device.dto.request.VoltageOptionCreateRequest;
import com.cmms.device.dto.request.VoltageOptionUpdateRequest;
import com.cmms.device.service.VoltageOptionService;
import com.cmms.common.dto.ResponseDto;
import com.cmms.common.dto.StatusToggleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/device/voltage-option")
@RequiredArgsConstructor
public class VoltageOptionController {

    private final VoltageOptionService service;

    @PostMapping("/create")
    public ResponseEntity<ResponseDto> create(@Valid @RequestBody VoltageOptionCreateRequest req) {
        var result = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseDto.success(UUID.randomUUID().toString(), "Voltage option created", result));
    }

    @PutMapping("/update")
    public ResponseEntity<ResponseDto> update(@Valid @RequestBody VoltageOptionUpdateRequest req) {
        var result = service.update(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Voltage option updated", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseDto> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Voltage option soft-deleted", null));
    }

    @PatchMapping("/toggle-status")
    public ResponseEntity<ResponseDto> toggleStatus(@Valid @RequestBody StatusToggleRequest req) {
        var result = service.toggleStatus(req);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Voltage option status toggled", result));
    }

    @GetMapping("/get-all")
    public ResponseEntity<ResponseDto> getAll(@RequestParam("inletPowerId") Long inletPowerId) {
        var result = service.getAll(inletPowerId);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Voltage options fetched", result));
    }

    @GetMapping("/get-all-active")
    public ResponseEntity<ResponseDto> getAllActive(@RequestParam("inletPowerId") Long inletPowerId) {
        var result = service.getAllActive(inletPowerId);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Active voltage options fetched", result));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseDto> getById(@PathVariable("id") Long id) {
        var result = service.getById(id);
        return ResponseEntity.ok(ResponseDto.success(UUID.randomUUID().toString(), "Voltage option fetched", result));
    }
}


// ============================================================================
// 7. SAMPLE JSON
// ============================================================================
/*

--- POST /api/device/voltage-option/create ---
REQUEST:
{
  "inletPowerId": 1,
  "displayLabel": "230 V / 50 Hz",
  "voltageV": 230.00,
  "frequencyHz": 50,
  "isDefault": true,
  "sortOrder": 1,
  "isActive": "ACTIVE"
}

RESPONSE (201):
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Voltage option created",
  "data": {
    "id": 1,
    "tenantId": 100,
    "inletPowerId": 1,
    "inletPowerCode": "AC",
    "inletPowerName": "Alternating Current",
    "displayLabel": "230 V / 50 Hz",
    "voltageV": 230.00,
    "frequencyHz": 50,
    "isDefault": true,
    "sortOrder": 1,
    "isActive": "ACTIVE"
  }
}

--- GET /api/device/voltage-option/get-all?inletPowerId=1 ---
RESPONSE:
{
  "requestId": "...",
  "statusCode": 200,
  "message": "Voltage options fetched",
  "data": [
    {
      "id": 1, "inletPowerId": 1, "inletPowerCode": "AC", "inletPowerName": "Alternating Current",
      "displayLabel": "230 V / 50 Hz", "voltageV": 230.00, "frequencyHz": 50,
      "isDefault": true, "sortOrder": 1, "isActive": "ACTIVE"
    },
    {
      "id": 2, "inletPowerId": 1, "inletPowerCode": "AC", "inletPowerName": "Alternating Current",
      "displayLabel": "110 V / 60 Hz", "voltageV": 110.00, "frequencyHz": 60,
      "isDefault": false, "sortOrder": 2, "isActive": "ACTIVE"
    }
  ]
}

*/
