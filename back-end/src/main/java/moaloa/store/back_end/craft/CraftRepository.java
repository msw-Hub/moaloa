package moaloa.store.back_end.craft;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CraftRepository extends JpaRepository<CraftEntity, Long> {
    CraftEntity findByName(String name);
}
