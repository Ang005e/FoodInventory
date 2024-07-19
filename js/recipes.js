let nachos = ['corn chips', 'red kidney beans', ]
let ingredient;
let type;
let usePriority;

function recipeTemplate(ingredients) {
    //ToDo: create a list of recipes that can be used to check against a list of ingredients.
    // Use boolean values (for each ingredient) and switch from true to false if a match is made.
    // The booleans could be stored in an array, and it could be checked after the match for any false values

    // Additionally, there could be an algorithm to check if a recipe is ALMOST made, then a value to tell
    // if an ingredient is vital to the recipe, or can be substituted.

    // Categories for each recipe?

}

switch (ingredient)  {
    //ToDo: make a list of regularly-used ingredients.
    // could also add additional details to each matched ingredient
    case 'corn-chips':
        type = 'tinned/dried';
        usePriority = 'low';
        break;
    case 'red-kidney-beans':
        type = 'tinned/dried';
        usePriority = 'non-perishable';
        break;
    case 'potato':
        type = 'vegetable';
        usePriority = 'medium';
        break;
    case 'milk':
        type = 'dairy';
        usePriority = 'high';
        break;
}