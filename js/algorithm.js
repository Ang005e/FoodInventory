// ********** GLOBALS *********** //

if (pageName('inventory')) {
    document.addEventListener('DOMContentLoaded', function(){
        pageLoad();
    });
    document.querySelector('#btn-continue').addEventListener('click', function(){
        location.href = 'index.html';
    })
}

function pageLoad() { // main code. runs on page load/reload
    let displayValues = getIngredients(); // the (sorted and cleaned) array of ingredient and date pairs, ready for display
    console.log(displayValues);

    displayValues.forEach(displayValue => {
        // let arrayPosition = displayValues.indexOf(displayValue)
        let parentElem;
        let i = displayValues.indexOf(displayValue);

        // Value is valid, and has not been wiped?
        if (displayValue.length === 0) {return}

        // value is for ingredient or date section?
        if (!isEven(++i)) {
            parentElem = document.querySelector('#ingredients')
        } else if (isEven(i)) {
            parentElem = document.querySelector('#dates');
        }

        let elemContainer = document.createElement('div');
        let elem = document.createElement('p');
        elemContainer.classList.add('display-div', 'inventory')
        elem.classList.add('inventory')
        elemContainer.appendChild(elem);
        parentElem.appendChild(elemContainer);
        elem.innerText = displayValue.toString();
    })
}

function getIngredients(ingredient, date) { // get all the user-entered ingredients, format them, and return them in
    // either combined or individual formats.
    // ToDo: ensure the values stored are not '' (not in this func – do in main.js)
    let valuePairs = [[], []]; // I get off on confusing people who try to understand my code
    let combinedValues = []
    let iterationCount = inputElemIdIndex('stored', false);

    for (let i = 1; i <= iterationCount; i++) {
        let inputValue = storageAction('get', `txt-input${i}`).trim();
        isEven(i) ? valuePairs[0].push(inputValue) : valuePairs[1].push(inputValue); // populate two arrays with ingredient/date values
        combinedValues.push(inputValue); // populate a single array with ingredient/date values
    }
    if (ingredient){return valuePairs[1]}
    else if (date) {return valuePairs[0]}
    return combinedValues;
}

function recipeTemplate(ingredients) {
    //ToDo: create a list of recipes that can be checked against a list of ingredients
}

/*
still quite chuffed with this sly use of arrays, even though it's useless now.
function getIngredients() {
    let ingredients = [];
    let numIterations = [handleBulkInput(), inputElemIdIndex('stored', false)]; // this
    // is an array with items that refer to the number of storage items in each separate storage-key-naming-scheme (i.e.
    // bulkInput(index) or txtInput(index). The array stores the (index) part). It's used to gracefully manipulate localStorage

    numIterations.forEach(iteration => { // for each 'index array':
        let keyTemplate = (iteration === numIterations[0] ? 'bulk-input' : 'txt-input')
        for (let i = 1; i <= iteration; i++) {
            let ingredient = storageAction('get', `${keyTemplate}${i}`)
            ingredients[ingredients.length] = (ingredient !== null ? ingredient.trim() : ingredients.splice(i, 1));
        }
    })
    return ingredients;
}
*/