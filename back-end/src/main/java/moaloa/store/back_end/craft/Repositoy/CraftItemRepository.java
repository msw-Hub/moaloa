package moaloa.store.back_end.craft.Repositoy;

import moaloa.store.back_end.craft.Entity.CraftItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CraftItemRepository extends JpaRepository<CraftItemEntity, Long> {

    CraftItemEntity findByMarketIdAndMarketName(int marketId, String marketName);
    List<CraftItemEntity> findAllByMarketId(int marketId);
}
