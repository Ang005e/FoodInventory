let allRecipes;

class Recipe {
    constructor(recipeName, ingredients, ingredientGroups, /* optionalIngredient, category, useDays, prepTime */) {
        this.recipeName = recipeName;
        this.ingredients = ingredients;
        this.ingredientGroups = ingredientGroups;
        this.matches = [];
        // this.optionalIngredient = optionalIngredient;
        // this.catergory = category;
        // this.useDays = useDays;
        // this.prepTime = prepTime;
    }

    matchMe(queriedIngredients = ['']) { // takes queries in string array format and calls matchIngredient() for each string
        try {

            queriedIngredients.forEach((queriedIngredient) => {
                this.iterateIngredients(queriedIngredient, this.ingredients)
                this.splitSubstitutes(queriedIngredient)
            })
            let matches = this.matches.length;
            let ingredientCount = this.ingredients.length + this.ingredientGroups.length;
            let outcome = matches - ingredientCount;
            let recipeCompleted = outcome >= 0; // all ingredients have been matched correctly?
            let coreIngredients = recipeCompleted ? outcome - matches : matches; // in 'x/y', ensure x >! y

            console.log(`${this.recipeName}: ${coreIngredients}/${ingredientCount} core ingredients`);
            console.log(this.matches) //this.matches.forEach(match => console.log(match))
            recipeCompleted ? console.log(`Plus ${outcome} Bonus Ingredients!`) : 0;
            return recipeCompleted;
        }
        catch(e) {errorPrinter(e); return false;}
    }
    iterateIngredients(queriedIngredient, list) {
        if (list instanceof Array) {
            list.forEach((ingredient) => {
                if (RegExp(ingredient, 'i').test(queriedIngredient)) {this.matches.push(queriedIngredient)} // this matches!
            })
        }else if(RegExp(list, 'i').test(queriedIngredient)) {this.matches.push(queriedIngredient)}
    }
    splitSubstitutes(queriedIngredient) {
        this.ingredientGroups.forEach(group => { // split the 'ingredientGroups' array into each group
            let options = group.split('|') // separate the interchangeable ingredients.
            options.forEach(option => {
                this.iterateIngredients(queriedIngredient, option)
            })
        })
    }
}

const nachos = new Recipe('Nachos',
    ['corn chips', 'red kidney beans'],
    ['tomato passata|tomato paste']);

const potatoSoup = new Recipe('Potato Soup', ['potatoes', 'milk', 'butter'],
    ['leek|chives|spring onion|parsley|basil'])

allRecipes = [nachos, potatoSoup]

recipes(allRecipes);

function recipes(allRecipes) {
    //ToDo: check recipe objects against a list of ingredients.

    let allIngredients = getIngredients(true)

    allRecipes.forEach((recipe) => {
        recipe.matchMe(allIngredients)
    })


    // Additionally, there could be an algorithm to check if a recipe is ALMOST made, then a value to tell
    // if an ingredient is vital to the recipe, or can be substituted.

    // Categories for each recipe?
}

/*
switch (//ingredient)  {
    //ToDo: make a list of regularly used ingredients.
    // could also add additional details to each matched ingredient
    case 'corn chips':
        type = 'tinned/dried';
        usePriority = 'low';
        break;
    case 'red kidney beans':
        type = 'tinned/dried';
        usePriority = 'non perishable';
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
