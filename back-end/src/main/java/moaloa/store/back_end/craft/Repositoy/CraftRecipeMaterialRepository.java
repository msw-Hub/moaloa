package moaloa.store.back_end.craft.Repositoy;

import moaloa.store.back_end.craft.Entity.CraftRecipeMaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CraftRecipeMaterialRepository extends JpaRepository<CraftRecipeMaterialEntity, Long> {
    CraftRecipeMaterialEntity findByCraftRecipeIdAndCraftMaterialId(int craftRecipeId, int craftMaterialId);
}
