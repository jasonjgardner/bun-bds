import { state } from "../serve";
export function startup() {
    setTimeout(() => {
        console.log('%cR%cA%cI%cN%cB%cO%cW server started!', 'color:red;', 'color:orange;', 'color:yellow;', 'color:green;', 'color:blue;', 'color:indigo;', 'color:violet;');
        state.addRequest('tellraw @a {"rawtext":[{"text":"§c§o§lR"},{"text":"§6§o§lA"},{"text":"§e§o§lI"},{"text":"§a§o§lN"},{"text":"§b§o§lB"},{"text":"§9§o§lO"},{"text":"§1§o§lW"},{"text":"§r sever connected!"}]}');
      }, 1000);
}