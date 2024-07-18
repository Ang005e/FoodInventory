// ********** GLOBALS *********** //

if (pageName('inventory')) {
    document.addEventListener('DOMContentLoaded', function(){
        pageLoad();
    });
    document.querySelector('#btn-continue').addEventListener('click', function(){
        location.href = 'index.html';
    })
}

function pageLoad() {
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
        //parentElem.append(elemContainer);

    })


} // main code. runs on page load/reload

function recipeTemplate(ingredients) {

}

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
} // get all the user-entered ingredients, format them, and return them.

