let RecipeClasses;
let IngredientClasses;

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

//region ****************** UseByDate Class ******************

/**
 * The UseByDate Class is takes a user-entered date, verifies it, formats it, splits
 * it and rebuilds it in various standard/nonstandard formats.
 * @description This means that thorough validation is inbuilt, and a user may enter many
 * variations of a date.
 * @property Year Year entered by the user, or a future year if only Day and Month were entered. <br/>
 * @property Month Month entered by the user, or generated if only Year was entered. <br/>
 * @property Day Day entered by the user, or generated if only Year was entered. <br/>
 * @property ISODate Widely standardised date format. Required for use with HTML date input fields. <br/>
 */
class UseByDate {
    /**
     * @param arguedDate A 'dirty' date. Can be passed in the following formats: <br/>
     * – yyyy/mm/dd <br/>
     * – dd/mm/yyyy <br/>
     * – dd/mm <br/>
     * – d/m <br/>
     * slashes can be replaced with dashes (-) or white space. <br/>
     */
    constructor(arguedDate) {
        arguedDate = this.cleanDate(arguedDate)
        let dayMonth = this.splitDate(arguedDate) // more efficient than calling splitDate twice

        this.Month = dayMonth[2];
        this.Day = dayMonth[1]; // at this point, there will be dates, no matter what.

        // find year separately (in separate function, to test if it's already been passed), OR DO SO IN VALIDATE!
        this.Year = this.validateYear(arguedDate);

        this.dateError(this.validDateBounds()) // throw an error if there's a problem

        this.ISOFormat = `${this.Year}-${this.Month}-${this.Day}`;
        this.DMYFormat = `${this.Day}-${this.Month}-${this.Year}`;
    }

    /**
     * Performs basic formatting on dates and checks for obvious flaws
     * @param date Date for verification
     * @returns {string} Partially verified/formatted date
     */
    cleanDate(date) {
        let errorMessage = '';
        let originalDate = date;

        // validation tests:
        date.trim()
        if (valueEmpty(date)) {errorMessage +=  `A paired date is empty. Check for newlines in the bulk-input fields.\n`}
        if (/[^\d\s\/-]/g.test(date)) {errorMessage += `'${originalDate}' is not a valid date.\n`} // anything other than whitespace, digits, slashes or dashed? invalid date.
        date = date.replaceAll(/(\/|\s)/g, '-') // Convert whitespaces or slashes to dashes
        date = date.replaceAll(/(\b|'-')(\d)(\b|'-')/g, '0$2') // Add zeros to single digits

        if (date.match(/(^\d{4}$)/)) {date = '01-06'} // No dates? get some.
        if (!/(\d\d)-(\d\d)/.test(date)) {errorMessage += `'${originalDate}' is not a valid date.\n`}

        this.dateError(errorMessage);

        // dates should be semi-formatted up to this point
        return date;
    }
    splitDate(date) {
        let yearExists = /\d{4}/.test(date);
        if (!yearExists) {
            return date.match(/(\d\d)-(\d\d)/);
        }

        let ISOFormat = /^\d{4}/.test(date); // what side is the year on? left or right?
        if (ISOFormat) { // yyyy/mm/dd
            let matchArr = date.match(/(\d\d)-(\d\d$)/);
            matchArr.shift(); // remove [0]
            matchArr.reverse().unshift(1); // swap, then add a placeholder to position [0]
            return matchArr;
        }else { // dd/mm/yyyy
            return date.match(/(^\d\d)-(\d\d)/);
        }
    }
    /**
     * Checks that year is in the future, and returns the next valid year if the one entered is in the past.
     * @param date four-digit year
     * @returns {string} yyyy
     */
    validateYear(date) {
        let year;
        try {year = date.match(/\d{4}/)[0]}
        catch {year = new Date().getFullYear()} // no year passed? make one!

        let currentMonth = new Date().getMonth() + 1 // +1 because getMonth() starts at month 0
        let currentDay = new Date().getDate()
        let currentYear = (new Date().getFullYear()).toString()

        if (year < currentYear) { // argued year is in the past
            alertUser(`A year you entered is in the past. Are you sure this is correct?`)
            return year
        }else if (year > currentYear) { // argued year is in the future
            return year
        }

        // make sure dates are only passed through this when entered (without a Year),
        // as otherwise off ingredients will magically become fresh again...
        if (this.Month > currentMonth) { // the argued Month is in the future
            return year;
        }else if ((this.Month === currentMonth) && (this.Day >= currentDay)) { // the argued Month is current, and the Day is either current or in the future
            return year;
        }else if (this.Month < currentMonth) { // the argued Month is in the past
            return currentYear + 1;
        }else if ((this.Month === currentMonth) && (this.Day < currentDay)) { // the argued Month is current, but the Day is in the past
            return currentYear + 1;
        }else {
            this.dateError(`There was an error with the year you entered: ${year}`)
        }
    }
    validDateBounds() { // Check that Date is within correct bounds for the given Month

        if (this.Day < 1) return false; // lol

        switch (true) {
            case (parseInt(this.Month) > 0) && !(parseInt(this.Month) <= 12): // Month is out of bounds
                return this.dateError('the Month is invalid');

            case /04|06|09|11/.test(this.Month): // 31 Month
                return this.Day <= 31 ? true : this.dateError('the days are over 31');

            case /01/.test(this.Month): // feb
                if ((this.Year % 4) !== 0) {
                    if (this.Day === 28) {return this.dateError("don't you bloody well try a leap Year on me, it's 1am and i cant be bo")} // leap Year?
                }
                return this.Day <= 29 ? true : this.dateError('days are over 29');

            default: // must be a 30 date
                return this.Day <= 30 ? true : this.dateError('days are over 30');
        }
    }

    /**
     * Checks if a valid message has been passed, and throws the {@link userError} object with errMsg as the `message` property
     * @param errMsg Error message to display to the user
     */
    dateError(errMsg) {
        if (valueEmpty(errMsg) || typeof errMsg !== "string") {return}
        userError.message = errMsg;
        throw userError;
    }
}


//region ************** OBJECTS ************** //

//Recipes
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

RecipeClasses = [nachos, potatoSoup, carrotSoup, vegetableStirFry, mushroomCheeseStuffedPotatoes, broccoliCheeseBake];


// Ingredients
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

IngredientClasses = [carrot, lettuce, spinach, broccoli, potato, onion, garlic, shallot, leek,
    springOnion, mushroom, milk, butter, cheese, yogurt, apple, tomato, cucumber,
    almond, peanut, parsley, basil, chives, ginger];

//endregion