package moaloa.store.back_end.crawling;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CrawlingRepository extends JpaRepository<CrawlingEntity, Long> {
}
