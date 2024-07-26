let allRecipes;
let allIngredients;

// ************** CLASSES ************** //

class Recipe {
    constructor(recipeName, ingredients, ingredientGroups = [], /* optionalIngredient, category, useDays, prepTime */) {
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
                this.iterateIngredients(queriedIngredient, this.ingredients); // perform matching on the main query
                this.splitSubstitutes(queriedIngredient); // split alternate names/spellings of the main query, and do the same
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

    // **************** MATCHING ALGORITHM **************** //
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

class Ingredient {
    constructor(ingName, ingType, subType, alternateNames) {
        this.ingName = ingName;
        this.ingType = ingType;
        this.subType = subType;
        this.alternateNames = alternateNames;
    }
    commaToArray() {

    }
}


// ************** Functions ************** //

function loadRecipes(allRecipes) {

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

const potatoSoup = new Recipe('Potato Soup',
    ['potatoes', 'milk', 'butter'],
    ['leek|chives|spring onion|parsley|basil']);

const carrotSoup = new Recipe('Carrot Soup',
    ['carrot', 'garlic', 'butter', 'milk'],
    ['onion|shallot|leek']);

const vegetableStirFry = new Recipe('Vegetable Stir-Fry',
    ['garlic', 'mushroom', 'spring onion'],
    ['carrot|broccoli', 'onion|shallot|spring onion']);

const mushroomCheeseStuffedPotatoes = new Recipe('Mushroom Cheese Stuffed Potatoes',
    ['potato', 'mushroom', 'cheese', 'butter', 'garlic', 'chives']);

const broccoliCheeseBake = new Recipe('Broccoli Cheese Bake',
    ['broccoli', 'cheese', 'milk', 'butter']);

allRecipes = [nachos, potatoSoup, carrotSoup, vegetableStirFry, mushroomCheeseStuffedPotatoes, broccoliCheeseBake];


// ************** INGREDIENTS ************** //

// curry pastes, parmesan

const tofu = new Ingredient('tofu', 'protein', '');
const parmesan = new Ingredient('parmesan', 'dairy', 'cheese', ['parmigiano reggiano', 'reggiano'])
const coconutMilk = new Ingredient('coconut milk', 'misc', '');
const silverbeet = new Ingredient('silverbeet', 'vegetable', 'leaf vegetable', ['chard']);
const curryPaste = new Ingredient('curry paste', 'misc', '');

const carrot = new Ingredient('carrot', 'vegetable', 'root vegetable');
const lettuce = new Ingredient('lettuce', 'vegetable', 'leaf vegetable', ['iceberg lettuce', 'cos lettuce']);
const spinach = new Ingredient('spinach', 'vegetable', 'leaf vegetable', ['baby spinach']);
const broccoli = new Ingredient('broccoli', 'vegetable', 'flowering vegetable');

const potato = new Ingredient('potato', 'vegetable', 'root vegetable', ['sweet potato']);
const onion = new Ingredient('onion', 'vegetable', 'root vegetable', ['red onion', 'brown onion']);
const garlic = new Ingredient('garlic', 'vegetable', 'root vegetable');
const shallot = new Ingredient('shallot', 'vegetable', 'root vegetable');
const leek = new Ingredient('leek', 'vegetable', 'root vegetable');
const springOnion = new Ingredient('spring onion', 'vegetable', 'root vegetable', ['green onion', 'scallion']);

const mushroom = new Ingredient('mushroom', 'fungus', '', ['button mushroom', 'portobello mushroom']);

const milk = new Ingredient('milk', '', '', ['full cream milk', 'hilo milk', 'skim milk']);
const butter = new Ingredient('butter', 'dairy', '');
const cheese = new Ingredient('cheese', 'dairy', '')
const yogurt = new Ingredient('yogurt', 'dairy', '', ['greek yogurt']);

const apple = new Ingredient('apple', 'fruit', 'pome', ['red apple', 'green apple', 'granny smith', 'golden delicious']);

const tomato = new Ingredient('tomato', 'vegetable', '', ['cherry tomato', 'roma tomato']);
const cucumber = new Ingredient('cucumber', 'vegetable', '', ['english cucumber', 'persian cucumber']);

const almond = new Ingredient('almond', 'nut', 'tree nut');
const peanut = new Ingredient('peanut', 'nut', 'ground nut');

const parsley = new Ingredient('parsley', 'herb', 'leafy herb');
const basil = new Ingredient('basil', 'herb', 'leafy herb');
const chives = new Ingredient('chives', 'herb', 'root herb', ['garlic chives']);

const ginger = new Ingredient('ginger', 'vegetable', 'root spice', ['fresh ginger', 'ground ginger']);

allIngredients = [carrot, lettuce, spinach, broccoli, potato, onion, garlic, shallot, leek,
    springOnion, mushroom, milk, butter, cheese, yogurt, apple, tomato, cucumber,
    almond, peanut, parsley, basil, chives, ginger];

