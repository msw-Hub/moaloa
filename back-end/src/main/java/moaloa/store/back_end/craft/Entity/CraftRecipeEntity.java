package moaloa.store.back_end.craft.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class CraftRecipeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "craft_item_id", nullable = false)
    private CraftItemEntity craftItem; // 하나의 레시피는 하나의 아이템만 만들 수 있음

    @OneToMany(mappedBy = "craftRecipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CraftRecipeMaterialEntity> craftRecipeMaterials; // 여러 재료와 수량, 추가 정보 관리

}