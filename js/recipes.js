let type;
let usePriority;

class Recipe {
    constructor(ingredients, category, useDays, prepTime) {
        this.ingredients = ingredients;
        this.catergory = category;
        this.useDays = useDays;
        this.prepTime = prepTime;
    }
    match(queriedIngredients = ['']) { // takes queries in string array format and calls matchIngredient() for each string
        try {
            let matches = 0;
            queriedIngredients.forEach(queriedIngredient => matches = this.iterateIngredients(queriedIngredient, matches))
            console.log(`${this.valueOf()}Matches: ${matches}/${this.ingredients.length}`);
            return matches === this.ingredients.length // all ingredients have been matched correctly?
        }
        catch(e) {errorPrinter(e); return false;}
    }
    iterateIngredients(queriedIngredient, matches) {
        this.ingredients.forEach((ingredient) => {
            if (RegExp(ingredient, 'i').test(queriedIngredient)) {matches++}
        })
        return matches;
    }
}

const nachos = new Recipe(['corn-chips', 'mexican-beans', 'spices']);
const potatoSoup = new Recipe(['potato', 'leek', 'chives', 'milk']);

let x = nachos.match(['mexican-beans', 'garlic', 'corn-chips', 'spices', 'milk']);
console.log(x);

function recipes() {
    //ToDo: check recipe objects against a list of ingredients.

    // Additionally, there could be an algorithm to check if a recipe is ALMOST made, then a value to tell
    // if an ingredient is vital to the recipe, or can be substituted.

    // Categories for each recipe?
}

/*
switch (//ingredient)  {
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
*/
