package moaloa.store.back_end.craft.Repositoy;

import moaloa.store.back_end.craft.Entity.CraftRecipeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CraftRecipeRepository extends JpaRepository<CraftRecipeEntity, Long> {
}
