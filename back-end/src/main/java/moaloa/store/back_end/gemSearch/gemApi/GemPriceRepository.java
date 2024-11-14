package moaloa.store.back_end.gemSearch.gemApi;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GemPriceRepository extends JpaRepository<GemPriceEntity, Long> {
    GemPriceEntity findByGemName(String gemName);
}
