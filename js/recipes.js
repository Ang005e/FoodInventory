let allRecipes;

// ************** Recipe class ************** //

class Recipe {
    constructor(recipeName, ingredients, ingredientGroups, /* optionalIngredient, category, useDays, prepTime */) {
        this.recipeName = recipeName;
        this.ingredients = ingredients;
        this.ingredientGroups = ingredientGroups;
        this.matches = [];
        // this.optionalIngredient = optionalIngredient;
        // this.category = category;
        // this.useDays = useDays;
        // this.prepTime = prepTime;
    }

    matchMe(queriedIngredients = ['']) { // takes queries in string array format and calls matchIngredient() for each string
        try {
            queriedIngredients.forEach((queriedIngredient) => {
                this.iterateIngredients(queriedIngredient, this.ingredients);
                this.splitSubstitutes(queriedIngredient);
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
                this.iterateIngredients(queriedIngredient, option);
            })
        })
    }
}

// ************** Functions ************** //

function loadRecipes(allRecipes) {
    //ToDo: check recipe objects against a list of ingredients.

    let allIngredients = getIngredients(true);

    allRecipes.forEach((recipe) => {
        if (recipe.matchMe(allIngredients)) {

            let elem = makeElement(document.querySelector('#recipeDisplay'), ['display-div', 'inventory'], 'div')
            makeElement(elem, 'inventory', 'p').innerText = recipe.recipeName;
        }
    })
}


// ************** RECIPES ************** //

const nachos = new Recipe('Nachos',
    ['corn chips', 'red kidney beans'],
    ['tomato passata|tomato paste']);

const potatoSoup = new Recipe('Potato Soup', ['potatoes', 'milk', 'butter'],
    ['leek|chives|spring onion|parsley|basil']);

allRecipes = [nachos, potatoSoup];
