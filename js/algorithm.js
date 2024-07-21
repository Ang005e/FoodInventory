// ********** GLOBALS *********** //

if (pageName('inventory')) {
    document.addEventListener('DOMContentLoaded', function(){
        pageLoad();
        loadRecipes(allRecipes);
    });
    document.querySelector('#btn-continue').addEventListener('click', function(){
        location.href = 'index.html';
    })
}

function pageLoad() { // Main code. Runs on page load/reload. Populates elems with ingredients and use-by-dates.
    getIngredients(true).forEach((value) => {
        let parentElem = document.querySelector('#ingredientDisplay');
        let elem = makeElement(parentElem, ['display-div', 'inventory'], 'div')
        makeElement(elem, 'inventory', 'p').innerText = value.toString();
    })
    getIngredients(false, true).forEach((value) => {
        let parentElem = document.querySelector('#dateDisplay');
        let elem = makeElement(parentElem, ['display-div', 'inventory'], 'div')
        makeElement(elem, 'inventory', 'p').innerText = value.toString();
    })
}

function getIngredients(ingredient, date) { // get all the user-entered ingredients, format them, and return them in
    // either combined or individual formats.
    let valuePairs = [[], []]; // I get off on confusing people who try to understand my code
    let combinedValues = []
    let iterationCount = inputElemIdIndex('stored', false);

    for (let i = 1; i <= iterationCount; i++) {
        let inputValue = storageAction('get', `txt-input${i}`).trim();
        isEven(i) ? valuePairs[0].push(inputValue) : valuePairs[1].push(inputValue); // populate two arrays with ingredient/date values
        combinedValues.push(inputValue); // populate a single array with ingredient/date values
    }
    if (ingredient) {return valuePairs[1]}
    else if (date) {return valuePairs[0]}
    return combinedValues;
}

function makeElement(parentElem, classes, elemType) {
    let elem;
    switch (elemType) {
        case 'div':
            elem = document.createElement('div');
            break;
        case 'p':
            elem = document.createElement('p');
            break;
    }
    classes instanceof Array ? classes.forEach((cls)=> elem.classList.add(cls)) : elem.classList.add(classes);
    parentElem.appendChild(elem);

    return elem;
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