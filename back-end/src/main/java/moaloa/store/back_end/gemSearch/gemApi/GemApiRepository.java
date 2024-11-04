package moaloa.store.back_end.gemSearch.gemApi;

import moaloa.store.back_end.gemSearch.crawling.CrawlingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GemApiRepository extends JpaRepository<GemApiEntity, Long> {
    GemApiEntity findByCharacterClassNameAndSkillNameAndGemTypeAndEngraveType(String characterClassName, String skillName, String gemType, String engraveType);
}
