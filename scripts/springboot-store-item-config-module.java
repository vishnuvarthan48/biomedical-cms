/* ====================================================================== */
/*  STORE-ITEM CONFIGURATION MODULE (Multi-Store Inventory Management)   */
/* ====================================================================== */
/*  
Purpose:
  Manage store-specific inventory settings for items. Each store can have:
  - Different physical locations (rack, shelf, bin)
  - Different reorder levels based on consumption rate
  - Different minimum order quantities
  - Different lead times from suppliers
  
This supports multi-store hospitals where the same item has different policies
per store location (e.g., Central Store vs ICU Store vs OT Store).
*/

// ---------- StoreItemConfig.java (JPA Entity) ----------
@Entity
@Table(name = "store_item_config", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "hospital_id", "store_id", "item_id" }, name = "uq_store_item_config")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreItemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "hospital_id", nullable = false)
    private UUID hospitalId;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    // Physical location fields
    @Column(name = "rack_number", length = 50)
    private String rackNumber;

    @Column(name = "shelf_number", length = 50)
    private String shelfNumber;

    @Column(name = "bin_location", length = 100)
    private String binLocation;

    // Reorder policy fields
    @Column(name = "reorder_level", nullable = false)
    private Integer reorderLevel = 0;

    @Column(name = "min_order_qty", nullable = false)
    private Integer minOrderQty = 1;

    @Column(name = "reorder_time_days")
    private Integer reorderTimeDays = 14;  // Lead time in days

    @Enumerated(EnumType.STRING)
    @Column(name = "is_active", length = 20, nullable = false)
    private RecordStatus isActive = RecordStatus.ACTIVE;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.isActive == null) this.isActive = RecordStatus.ACTIVE;
        if (this.reorderLevel == null) this.reorderLevel = 0;
        if (this.minOrderQty == null) this.minOrderQty = 1;
        if (this.reorderTimeDays == null) this.reorderTimeDays = 14;
    }
}

// ---------- CreateStoreItemConfigRequest.java (DTO) ----------
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStoreItemConfigRequest {
    @NotNull(message = "Store ID is required")
    private String storeId;

    @NotNull(message = "Item ID is required")
    private String itemId;

    private String rackNumber;
    private String shelfNumber;
    private String binLocation;

    @NotNull(message = "Reorder level is required")
    @Min(value = 0, message = "Reorder level must be >= 0")
    private Integer reorderLevel;

    @NotNull(message = "Min order qty is required")
    @Min(value = 1, message = "Min order qty must be >= 1")
    private Integer minOrderQty;

    @Min(value = 1, message = "Reorder time must be >= 1 day")
    private Integer reorderTimeDays;

    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive = "ACTIVE";

    private String remarks;
}

// ---------- UpdateStoreItemConfigRequest.java (DTO) ----------
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStoreItemConfigRequest {
    private String rackNumber;
    private String shelfNumber;
    private String binLocation;

    @Min(value = 0, message = "Reorder level must be >= 0")
    private Integer reorderLevel;

    @Min(value = 1, message = "Min order qty must be >= 1")
    private Integer minOrderQty;

    @Min(value = 1, message = "Reorder time must be >= 1 day")
    private Integer reorderTimeDays;

    private String remarks;
}

// ---------- ToggleStatusRequest.java (DTO) ----------
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToggleStatusRequest {
    @NotNull(message = "isActive is required")
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "isActive must be ACTIVE or INACTIVE")
    private String isActive;
}

// ---------- StoreItemConfigResponse.java (DTO) ----------
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StoreItemConfigResponse {
    private String id;
    private String hospitalId;
    private String storeId;
    private String storeName;
    private String itemId;
    private String itemCode;
    private String itemName;
    private String rackNumber;
    private String shelfNumber;
    private String binLocation;
    private Integer reorderLevel;
    private Integer minOrderQty;
    private Integer reorderTimeDays;
    private String isActive;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// ---------- StoreItemConfigRepository.java (Data Access) ----------
@Repository
public interface StoreItemConfigRepository extends JpaRepository<StoreItemConfig, UUID> {
    // Find config for a specific store-item combination
    Optional<StoreItemConfig> findByHospitalIdAndStoreIdAndItemIdAndIsActiveNot(
        UUID hospitalId, UUID storeId, UUID itemId, RecordStatus status);

    // Find all configs for a store
    List<StoreItemConfig> findByHospitalIdAndStoreIdAndIsActiveNot(
        UUID hospitalId, UUID storeId, RecordStatus status, Sort sort);

    // Find all configs for an item across all stores in a hospital
    List<StoreItemConfig> findByHospitalIdAndItemIdAndIsActiveNot(
        UUID hospitalId, UUID itemId, RecordStatus status);

    // Check duplicate before create
    boolean existsByHospitalIdAndStoreIdAndItemIdAndIsActiveNot(
        UUID hospitalId, UUID storeId, UUID itemId, RecordStatus status);

    // Low stock alerts query
    @Query("""
        SELECT sic FROM StoreItemConfig sic
        JOIN ItemMaster im ON sic.itemId = im.id
        WHERE sic.hospitalId = :hospitalId 
          AND sic.storeId = :storeId
          AND sic.isActive = 'ACTIVE'
          AND im.currentStock <= sic.reorderLevel
        ORDER BY im.currentStock ASC
        """)
    List<StoreItemConfig> findLowStockItems(UUID hospitalId, UUID storeId);

    // Get JPQL projection for list view
    @Query("""
        SELECT new com.cmms.dto.StoreItemConfigResponse(
            sic.id, sic.hospitalId, sic.storeId, bs.storeName,
            sic.itemId, im.itemCode, im.itemName,
            sic.rackNumber, sic.shelfNumber, sic.binLocation,
            sic.reorderLevel, sic.minOrderQty, sic.reorderTimeDays,
            sic.isActive, sic.remarks, sic.createdAt, sic.updatedAt
        )
        FROM StoreItemConfig sic
        JOIN BiomedicalStore bs ON sic.storeId = bs.id
        JOIN ItemMaster im ON sic.itemId = im.id
        WHERE sic.hospitalId = :hospitalId 
          AND sic.storeId = :storeId
          AND sic.isActive != 'DELETED'
        ORDER BY im.itemCode
        """)
    List<StoreItemConfigResponse> findStoreItemsWithDetails(UUID hospitalId, UUID storeId);
}

// ---------- StoreItemConfigService.java (Business Logic) ----------
@Service
@Transactional
@Slf4j
public class StoreItemConfigService {
    @Autowired private StoreItemConfigRepository repository;
    @Autowired private BiomedicalStoreRepository storeRepo;
    @Autowired private ItemMasterRepository itemRepo;

    /* Create store-item configuration */
    public StoreItemConfigResponse create(UUID tenantId, UUID hospitalId, CreateStoreItemConfigRequest req) {
        // Validate store exists and is not deleted
        BiomedicalStore store = storeRepo.findById(UUID.fromString(req.getStoreId()))
            .filter(s -> s.getIsActive() != RecordStatus.DELETED)
            .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        // Validate item exists and is not deleted
        ItemMaster item = itemRepo.findById(UUID.fromString(req.getItemId()))
            .filter(i -> i.getStatus().equals("Active"))
            .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        // Check duplicate
        if (repository.existsByHospitalIdAndStoreIdAndItemIdAndIsActiveNot(
                hospitalId, store.getId(), item.getId(), RecordStatus.DELETED)) {
            throw new InvalidStatusException("Configuration already exists for this store-item combination");
        }

        RecordStatus initialIsActive = (req.getIsActive() != null)
            ? RecordStatus.from(req.getIsActive())
            : RecordStatus.ACTIVE;

        StoreItemConfig entity = StoreItemConfig.builder()
            .hospitalId(hospitalId)
            .storeId(store.getId())
            .itemId(item.getId())
            .rackNumber(req.getRackNumber() != null ? req.getRackNumber().trim() : null)
            .shelfNumber(req.getShelfNumber() != null ? req.getShelfNumber().trim() : null)
            .binLocation(req.getBinLocation() != null ? req.getBinLocation().trim() : null)
            .reorderLevel(req.getReorderLevel())
            .minOrderQty(req.getMinOrderQty())
            .reorderTimeDays(req.getReorderTimeDays())
            .isActive(initialIsActive)
            .remarks(req.getRemarks())
            .build();

        repository.save(entity);
        return mapToResponse(entity, store, item);
    }

    /* Update store-item configuration */
    public StoreItemConfigResponse update(UUID hospitalId, String configId, UpdateStoreItemConfigRequest req) {
        StoreItemConfig entity = repository.findById(UUID.fromString(configId))
            .orElseThrow(() -> new ResourceNotFoundException("Configuration not found"));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot update a DELETED configuration");
        }

        entity.setRackNumber(req.getRackNumber() != null ? req.getRackNumber().trim() : entity.getRackNumber());
        entity.setShelfNumber(req.getShelfNumber() != null ? req.getShelfNumber().trim() : entity.getShelfNumber());
        entity.setBinLocation(req.getBinLocation() != null ? req.getBinLocation().trim() : entity.getBinLocation());
        if (req.getReorderLevel() != null) entity.setReorderLevel(req.getReorderLevel());
        if (req.getMinOrderQty() != null) entity.setMinOrderQty(req.getMinOrderQty());
        if (req.getReorderTimeDays() != null) entity.setReorderTimeDays(req.getReorderTimeDays());
        entity.setRemarks(req.getRemarks());

        repository.save(entity);

        BiomedicalStore store = storeRepo.findById(entity.getStoreId()).get();
        ItemMaster item = itemRepo.findById(entity.getItemId()).get();
        return mapToResponse(entity, store, item);
    }

    /* Soft delete */
    public void delete(UUID hospitalId, String configId) {
        StoreItemConfig entity = repository.findById(UUID.fromString(configId))
            .orElseThrow(() -> new ResourceNotFoundException("Configuration not found"));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Configuration is already deleted");
        }

        entity.setIsActive(RecordStatus.DELETED);
        repository.save(entity);
    }

    /* Toggle status (ACTIVE <-> INACTIVE) */
    public StoreItemConfigResponse toggleStatus(UUID hospitalId, String configId, ToggleStatusRequest req) {
        StoreItemConfig entity = repository.findById(UUID.fromString(configId))
            .orElseThrow(() -> new ResourceNotFoundException("Configuration not found"));

        if (entity.getIsActive() == RecordStatus.DELETED) {
            throw new InvalidStatusException("Cannot toggle status of a DELETED configuration");
        }

        RecordStatus newIsActive = RecordStatus.from(req.getIsActive());
        if (newIsActive == RecordStatus.DELETED) {
            throw new InvalidStatusException("Use DELETE endpoint to soft-delete");
        }

        entity.setIsActive(newIsActive);
        repository.save(entity);

        BiomedicalStore store = storeRepo.findById(entity.getStoreId()).get();
        ItemMaster item = itemRepo.findById(entity.getItemId()).get();
        return mapToResponse(entity, store, item);
    }

    /* Get by ID */
    public StoreItemConfigResponse getById(UUID hospitalId, String configId) {
        StoreItemConfig entity = repository.findById(UUID.fromString(configId))
            .filter(e -> e.getIsActive() != RecordStatus.DELETED)
            .orElseThrow(() -> new ResourceNotFoundException("Configuration not found"));

        BiomedicalStore store = storeRepo.findById(entity.getStoreId()).get();
        ItemMaster item = itemRepo.findById(entity.getItemId()).get();
        return mapToResponse(entity, store, item);
    }

    /* Get all for a store */
    public List<StoreItemConfigResponse> getAllForStore(UUID hospitalId, UUID storeId) {
        return repository.findStoreItemsWithDetails(hospitalId, storeId);
    }

    /* Get low stock alerts */
    public List<StoreItemConfigResponse> getLowStockAlerts(UUID hospitalId, UUID storeId) {
        return repository.findLowStockItems(hospitalId, storeId).stream()
            .map(sic -> {
                BiomedicalStore store = storeRepo.findById(sic.getStoreId()).get();
                ItemMaster item = itemRepo.findById(sic.getItemId()).get();
                return mapToResponse(sic, store, item);
            })
            .collect(Collectors.toList());
    }

    /* Mapping helper */
    private StoreItemConfigResponse mapToResponse(StoreItemConfig entity, BiomedicalStore store, ItemMaster item) {
        return new StoreItemConfigResponse(
            entity.getId().toString(),
            entity.getHospitalId().toString(),
            entity.getStoreId().toString(),
            store.getStoreName(),
            entity.getItemId().toString(),
            item.getItemCode(),
            item.getItemName(),
            entity.getRackNumber(),
            entity.getShelfNumber(),
            entity.getBinLocation(),
            entity.getReorderLevel(),
            entity.getMinOrderQty(),
            entity.getReorderTimeDays(),
            entity.getIsActive().name(),
            entity.getRemarks(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}

// ---------- StoreItemConfigController.java (REST Endpoints) ----------
@RestController
@RequestMapping("/api/store-item-config")
@Slf4j
public class StoreItemConfigController {
    @Autowired private StoreItemConfigService service;
    @Autowired private UserService userService;

    @PostMapping
    public ResponseEntity<StoreItemConfigResponse> create(
            @RequestBody @Valid CreateStoreItemConfigRequest req,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.create(ctx.getTenantId(), ctx.getHospitalId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StoreItemConfigResponse> update(
            @PathVariable String id,
            @RequestBody @Valid UpdateStoreItemConfigRequest req,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        return ResponseEntity.ok(service.update(ctx.getHospitalId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        service.delete(ctx.getHospitalId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<StoreItemConfigResponse> toggleStatus(
            @PathVariable String id,
            @RequestBody @Valid ToggleStatusRequest req,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        return ResponseEntity.ok(service.toggleStatus(ctx.getHospitalId(), id, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StoreItemConfigResponse> getById(
            @PathVariable String id,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        return ResponseEntity.ok(service.getById(ctx.getHospitalId(), id));
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<StoreItemConfigResponse>> getAllForStore(
            @PathVariable String storeId,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        return ResponseEntity.ok(service.getAllForStore(ctx.getHospitalId(), UUID.fromString(storeId)));
    }

    @GetMapping("/store/{storeId}/low-stock")
    public ResponseEntity<List<StoreItemConfigResponse>> getLowStockAlerts(
            @PathVariable String storeId,
            HttpServletRequest httpReq) {
        UserContext ctx = userService.getCurrentUserContext(httpReq);
        return ResponseEntity.ok(service.getLowStockAlerts(ctx.getHospitalId(), UUID.fromString(storeId)));
    }
}

// ---------- SAMPLE JSON ----------

/*
POST /api/store-item-config
{
  "storeId": "550e8400-e29b-41d4-a716-446655440000",
  "itemId": "660e8400-e29b-41d4-a716-446655440001",
  "rackNumber": "A-01",
  "shelfNumber": "3",
  "binLocation": "Central_Warehouse",
  "reorderLevel": 50,
  "minOrderQty": 10,
  "reorderTimeDays": 7,
  "isActive": "ACTIVE",
  "remarks": "Central store: faster lead time"
}

GET /api/store-item-config/store/550e8400-e29b-41d4-a716-446655440000
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "hospitalId": "880e8400-e29b-41d4-a716-446655440003",
    "storeId": "550e8400-e29b-41d4-a716-446655440000",
    "storeName": "Central Biomedical Store",
    "itemId": "660e8400-e29b-41d4-a716-446655440001",
    "itemCode": "ECGCABLE001",
    "itemName": "ECG Cable - 3 Lead",
    "rackNumber": "A-01",
    "shelfNumber": "3",
    "binLocation": "Central_Warehouse",
    "reorderLevel": 50,
    "minOrderQty": 10,
    "reorderTimeDays": 7,
    "isActive": "ACTIVE",
    "remarks": "Central store: faster lead time",
    "createdAt": "2025-02-25T10:30:00Z",
    "updatedAt": "2025-02-25T10:30:00Z"
  }
]

GET /api/store-item-config/store/550e8400-e29b-41d4-a716-446655440000/low-stock
Shows items below reorder level for alerts/dashboard
*/
