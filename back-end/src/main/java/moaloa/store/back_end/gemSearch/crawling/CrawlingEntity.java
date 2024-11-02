package moaloa.store.back_end.gemSearch.crawling;

import jakarta.persistence.Entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class CrawlingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String characterClassName;
    private String engraveName;
    private String userNickName;
}
