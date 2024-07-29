// ********** GLOBALS *********** //

if (pageName('inventory')) {
    document.addEventListener('DOMContentLoaded', function(){
        pageLoad();
        loadRecipes();
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
    // either combined or individual formats, using big daddy Map().
    let cleanPairs = new Map();
    let combinedPairs = []
    let iterationCount = inputCount('stored', false);

    for (let i = 1; i < iterationCount; i+=2) {
        try {
            let inputPair = [storageAction('get', `txt-input${i}`), storageAction('get', `txt-input${i+1}`)];
            inputPair = inputPair.map((val) => val.trim().toLowerCase()); // clean the strings
            cleanPairs.set(inputPair[0], inputPair[1]); // What a massive pair of Map()s ([*] [*])
            combinedPairs.push(inputPair); // populate a single array with ingredient/date values

        } catch (e){ // if something goes wrong, we must be at the end...
            if (e.message.match(/Cannot read properties of null \(reading 'trim'\)/ig) !== null){
                alertUser(`"${storageAction('get', `txt-input${i}`)}" was entered without a date, and will not be displayed or matched`);
                errorPrinter(e);
            }
        }
    }
    if (ingredient) {return cleanPairs.keys()}
    else if (date) {return cleanPairs.values()}
    return combinedPairs;
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


//ToDo ensure the date is valid (days/months are within correct range)
function valiDateYear(date) { // checks that the year is in the future, and returns a valid future date if mm/dd is entered without a year.

    let month = new Date().getMonth()+1
    let day = new Date().getDate()

    let futureDate = manipulateDate(date, false, new Date().getFullYear() + 1); // one year in the future

    let arguedDay = parseInt(manipulateDate(date, true)[2])
    let arguedMonth = parseInt(manipulateDate(date, true)[1])

    // make sure dates are only passed through this when entered (without a year),
    // as otherwise off ingredients will magically become fresh again...

    if (arguedMonth > month) { // the argued month is in the future
        return manipulateDate(date);
    }else if ((arguedMonth === month) && (arguedDay >= day)) { // the argued month is current, and the day is either current or in the future
        return manipulateDate(date);
    }else if (arguedMonth < month) { // the argued month is in the past
        return futureDate
    }else if ((arguedMonth === month) && (arguedDay < day)) { // the argued month is current, but the day is in the past
        return futureDate
    }else {
        return false
    }
}
function manipulateDate(date, split = false, arguedYear = null) { // returns formatted OR split date.
    // Is passed full (dd-mm-yyyy) or partial (dd-mm) date. If partial date is passed, year must be passed too.
    let year = arguedYear !== null;
    let ISOFormat = /^\d{4}/.test(date);
    (!year) && (arguedYear = date.match(/\d{4}/)[0]) // set year as the year found by the search pattern

    if (ISOFormat) {
        return sendDate([arguedYear, date.match(/(\d\d)-(\d\d$)/)], split)
    }else {
        return sendDate([arguedYear, date.match(/(^\d\d)-(\d\d)/)], split)
    }

    function sendDate([val1, val2], split) {
        if (split) return [val1, val2[1], val2[2]];
        return `${val1}-${val2[0]}`
    }
}

/*// ToDo: make 'close matches' viewable:
function matchString(query = '', searchString, wordMatch) {// returns A: type of match, if successful,
    // B: words matched, if wordMatch === true, or C: null if match fails
    let matches = [];

    let exactMatch = new RegExp("^.*?$", 'i')
    let caseMatch = new RegExp(query, 'i');

    console.log(searchString.match(exactMatch))
    //if (caseMatch.test(searchString)) {return 'case-insensitive'}

    if (wordMatch) {
        query.split(' ').forEach((substr) => {
            let match = new RegExp(substr, '').exec(query) // matches whole words
            console.log(match)
            if (match !== null) {matches.push(match[0])}
        })
    }
    return null;
}*/

/*
chuffed with this sly use of arrays it's useless now tho.
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