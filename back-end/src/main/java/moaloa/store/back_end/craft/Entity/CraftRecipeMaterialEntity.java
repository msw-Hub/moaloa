package moaloa.store.back_end.craft.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class CraftRecipeMaterialEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne
    @JoinColumn(name = "craft_recipe_id", nullable = false)
    @JsonBackReference
    private CraftRecipeEntity craftRecipe;

    @ManyToOne
    @JoinColumn(name = "craft_material_id", nullable = false)
    private CraftMaterialEntity craftMaterial;

    private int quantity; // 필요 수량

}