package moaloa.store.back_end.craft.Repositoy;

import moaloa.store.back_end.craft.Entity.CraftMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CraftMaterialRepository extends JpaRepository<CraftMaterialEntity, Long> {
    CraftMaterialEntity findByMarketId(int marketId);
    List<CraftMaterialEntity> findBySubCode(int subCode);
}
