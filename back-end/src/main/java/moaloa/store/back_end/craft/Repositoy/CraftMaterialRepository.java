package moaloa.store.back_end.craft.Repositoy;

import moaloa.store.back_end.craft.Entity.CraftMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CraftMaterialRepository extends JpaRepository<CraftMaterialEntity, Long> {
    CraftMaterialEntity findByMarketIdAndMarketName(int marketId, String marketName);
    CraftMaterialEntity findByMarketName(String marketName);
    CraftMaterialEntity findByMarketId(int marketId);
}
