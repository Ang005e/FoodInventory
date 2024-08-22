// noinspection SpellCheckingInspection


//region ****** GLOBALS ******

let _focusedElem;
let _timeoutPromise;
let _dummyDataTest = false;
//endregion
// get gone globals


//region ************ EVENT LISTENERS ************

// Add input fields on the click of a button:
document.querySelectorAll('.btn-ingredient').forEach((elem)=> {
    elem.addEventListener('click', (event) => saveInput(event))
})


// ************ index.html ************
if (loadedPageName('index')) {

    // On page load:
    document.addEventListener('DOMContentLoaded', () => {

        populatePage(); // populate the page with previous elements
        document.querySelector('.btn-ingredient').focus() // focus the chosen button
        document.addEventListener('keypress', (event) => {
            if ((event.key !== 'Enter')) {
                return // if the event is not a keypress on enter, return
            }

            keypressEvent(event);
            // if the event is not associated with the bulk inputs, save the value:
            (event.target.className !== 'txt-bulk') && (saveInput(event));
        });
    })

    // on click of the test data population button:
    document.querySelector('#btn-test-population').addEventListener('click', () => {
        _dummyDataTest = true
        let i = 0;
        let d = 0;
        let m = 0;
        storageAction('clear-all', '');

        IngredientClasses.forEach((ingredient)=> {
            d++;m++;
            (d > 29) && (d=1); (m > 12) && (m = 1);
            (d < 10) && (d = `0${d}`); (m < 10) && (m = `0${m}`);
            storageAction('store', `txt-input${++i}`, ingredient.ingName)
            storageAction('store', `txt-input${++i}`, `2026-${m}-${d}`)
        })
        removeAllInputs();
        populatePage();
        location.reload()
    })
}

// Add a listener to mark focused input elements, allowing actions to be performed on them
function focusListener(elem) {
    if (elem instanceof Element) {
        elem.addEventListener('focus', (event) => _focusedElem = event.target.id)
        return;
    }
    document.querySelector('#'+elem).addEventListener('focus', (event) => _focusedElem = event.target.id);
}
//endregion


//region ************ MAIN FUNCTIONS ************


function keypressEvent(event) {
    try {
        if (event.target.className !== 'txt-bulk') {event.preventDefault()}
        if (event.target.id === 'btn-add-input') {
            storeInputValue(event, document.querySelector(`#txt-input${inputCount('current')}`));
            return createInput(inputCount() + 1);
        }

        // Bulk input hotkey:
        if (event.key === 'Enter' && event.shiftKey) { // shift + enter
            event.preventDefault();

            let date = (event.target === document.querySelector('#txt-bulk-date'));

            if (event.target.id === 'txt-bulk-ingredient') {
                storeBulkInput('store', event.target.value, date);
                document.querySelector('#txt-bulk-date').focus();
                return;
            } else if (event.target.id === 'txt-bulk-date') {
                storeBulkInput('store', event.target.value, date);
                storeBulkInput('combine', event.target.value, date);
                document.querySelector('#txt-bulk-ingredient').focus();
                return;
            }
            document.querySelector('#txt-bulk-ingredient').focus();
            return
        }

        // must be the enter key used on an ingredient/date field or btn-add-input, so:

        if (event.target.className === 'txt-bulk') {return}

        storeInputValue(event, event.target);
    }catch (e) {
        errorCentre(e)
    }
}
function saveInput(event) {
    try {
        let elem = document.querySelector(`#txt-input${inputCount('current', false)}`) // retrives the most recently created elem, to use if there is no focused elem.
        let skipCreation = false;

        switch (event.target.id) {
            case 'btn-add-input':
                if (valueEmpty(elem) || valueEmpty(elem.id)) { // Check if there's no input element selected (i.e. first 'addIngredient' click after loading page, no single-input elements will be present)
                    createInput(inputCount() + 1);
                    console.log('element identified as null value - no elements should be on screen.')
                    return;
                }
                storeInputValue(event, elem);
                break;

            case 'btn-remove-input':
                try {removeInputPair(_focusedElem);}
                catch {removeInputPair(elem)}
                return;

            case 'btn-remove-all':
                storageAction('clear_all', undefined);
                inputCount('none', true);
                removeAllInputs();
                return;

            case 'btn-continue':
                let currentElems = inputCount('current', false);
                if (!isEven(currentElems)) { // if an elem isn't paired...
                    let unpairedElem = document.querySelector(`#txt-input${currentElems}`);
                    if (valueEmpty(unpairedElem.value)) { // if it's empty, just remove it
                        unpairedElem.remove();
                    } else { // otherwise, warn the user so they don't lose the value
                        alertUser(`"${unpairedElem.value}" was entered without a date. please add one before continuing.`);
                        return;
                    }
                } else {
                    storeInputValue(event, elem);
                }

                skipCreation = true;
                location.href = 'inventory.html';
                return;
        }
        // once the above has been completed, create the new element
        (skipCreation === false) && (createInput(inputCount() + 1))
    }catch (e) {
        errorCentre(e)
    }
}

//endregion


//region ************ GUI/HTML & CSS Manipulation Functions ************ //

function removeAllInputs() {
    document.querySelectorAll('.single-input').forEach((elem) => {
        elem.remove()
    });
}

function createInput(idIndex) { // Create and configure empty input element
    if (isEven(inputCount())) {
        setFieldsetInput('input', 1, '', ['type', 'class', 'id', 'placeholder'], ['text', 'ingredient-input single-input', `txt-input${idIndex}`, '[Ingredient]'] );
    }else {
        setFieldsetInput('input', 2, '', ['type', 'class', 'id'], ['date', 'date-input single-input', `txt-input${idIndex}`] );
    }
}

function setFieldsetInput(element, fieldsetNum, text = '', attributes=[], values=[]) {// Append a new input element to a fieldset

    let fieldset;
    switch (fieldsetNum) {
        case 1:
            fieldset = document.querySelector('#field-ingredient');break;
        case 2:
            fieldset = document.querySelector('#field-date');break;
        default:
            throw new Error("a switch statement in setFieldsetInput() has reached its default case, which should not be possible")
    }
    let input = document.createElement(element);
    if (attributes.length > 0){
        for (let i = 0; i < attributes.length; i++) {
            input.setAttribute(attributes[i], values[i]);
        }
    }
    input.value = text;
    fieldset.append(input);
    input.focus();
    let idIndex = attributes.indexOf('id')
    if (idIndex !== (-1)){
        focusListener(values[idIndex]);
    }
}

/**
 * Displays a `message` to the user.
 * @param message Message to display.
 */
function alertUser(message) {
    let alertDiv = document.querySelector('#alert-div');
    alertDiv.innerHTML = '';
    alertDiv.innerHTML = message;
    alertDiv.classList.remove('hidden')
    clearTimeout(_timeoutPromise);
    _timeoutPromise = setTimeout(() => {
        alertDiv.classList.add('hidden')
    }, 10000);
}

function setElemAttribute(elem, attribute='readonly', value='readonly', check = true) {
    try {
        if (!elem.hasAttribute(attribute) && check) {
            elem.setAttribute(attribute, value);
        }
    }catch (e) {
        errorCentre(e);
        console.log('event may not be linked with an item entry')
    }
}
//endregion


//region ************************ Modular Page Population ************************ //
// populates the screen with paired elems and their
// corresponding data/text/date values.

/**
 * Retrives historic user data from localStorage, and repopulates previously displayed elements onto the page.
 */
function populatePage() {
    // collect the elements in local storage, plus those already on the page.
    let prevElems = inputCount('stored', true)
    let currentElems = inputCount('current', true);

    // for every ID value (in storage) not already on the page, add an elem to the page and assign the corresponding value.
    for (let i = currentElems+1; i <= prevElems; i++) {
        let elemKeyId = `txt-input${i}`
        let storedValue = storageAction('get', elemKeyId) // (the value of the existing element in local storage)

        alternateFields(storedValue, i);
        verifyIndexing(storedValue, elemKeyId);
        }
    inputCount('none', true);
}

/**
 * @description Determines which item of the pair the argued element is, given the id index, and initiates creation and configuration of the appropriate type of fieldset.
 * @description Designed specifically for use with my alternating ID system.
 * @param storedValue
 * @param idIndex
 */
function alternateFields(storedValue, idIndex) {
    if (!isEven(idIndex)) { // Check which elem type of the pair it is, depending on if the ID index is odd or even, then set the chosen elem to its old value
        // looks like it's a date input...
        setFieldsetInput('input', 1, storedValue, ['type', 'class', 'id'], ['text', 'ingredient-input single-input', `txt-input${idIndex}`]);
    } else {
        // looks like it's an ingredient input...
        setFieldsetInput('input', 2, storedValue, ['type', 'class', 'id'], ['date', 'date-input single-input', `txt-input${idIndex}`]);
    }
}

/**
 * Sets an elem to readonly, clears its previous position in local storage,
 * and stores the value. Overwrites local storage, in case the elem has been
 * reindexed and is out of whack (due to a removed input pair triggering an index reshuffle).
 * @param storedValue Value stored to localStorage
 * @param elemId ID assigned to the given element
 */
function verifyIndexing(storedValue, elemId) {
    setElemAttribute(document.querySelector(`#${elemId}`));
    storageAction('clear', elemId)
    storageAction('store', elemId, storedValue)
}

function removeInputPair(elem) { // removes selected input field. Also deletes the leftover date/ingredient input field paired with original input.

    let currentElemIdNum = getIdIndex(elem);
    let pairedElemIdNum =  (isEven(currentElemIdNum) ? currentElemIdNum-1 : currentElemIdNum+1);

    let pair = [currentElemIdNum, pairedElemIdNum]

    pair.forEach(elemIdNum => {
        try {
            storageAction('clear', `txt-input${elemIdNum}`);
            document.querySelector(`#txt-input${elemIdNum}`).remove();
        }catch (e) {errorCentre(e)}

    })

    shuffleIdIndex();
}

//endregion


//region ************************ Local Storage Manipulation ************************ //

// Local storage manipulation algorithms.
//
// Designed to:
// a: 'Seamlessly' sync the webpage GUI with localStorage...
// b: Grab paired values from localStorage and pass them to GUI interface functions,
// allowing for quick and efficient repopulation of the GUI on page reload...
// c: Be modular, to make integration of features like pair deletion (and in the future,
// view filters) more seamless...

// The challange was, the algorithm had to be designed such that entirely seperate
// localStorage items could be correlated (so each 'ingredient' could be linked with
// its corresponding 'use-by-date').
//
// Functionality includes removing input pairs, saving inputs on button press,
// automatically resolving indexing gaps after pair deletion
// (i.e. input 1, 2, 5, 7 > 1, 2, 3, 4), auto-detection of unpaired values,
// modular error analysis/decision-making/handling, and much, much more.


function storeInputValue(event, elem) { // takes an event and an elem as arguments,
    // and prepares values for use with storageAction. Additionally, refreshes the id index system.

    // console.log(`Attempting to store ${elem.type} value: ${elem.value}`);
    // Guard clauses:
    if (inputCount('current') === 0) {return}
    if (valueEmpty(event.target.value) && valueEmpty(elem.value)) {
        throw new DateInvalidError(`Date is not in the correct format`)
    }

    if (elem instanceof NodeList) { // elem has been passed in as a nodelist? do:
        elem.forEach(elem => {
            storageAction('store', elem.id, elem.value);
            setElemAttribute(elem);
        })
    } else { // passed in as a single elem? do:
        storageAction('store', elem.id, elem.value);
        setElemAttribute(elem);
    }
    inputCount('none', true);

}

/**
 * Stores/retrives bulk-input and bulk-date items from localStorage.
 * @param action Storage actiont to take
 * @param string
 * @param date
 */
function storeBulkInput(action, string = '', date) {

    if (valueEmpty(string)) {return}
    let list = string.split('\n')
    list = list.join(',')

    if (action === 'store') {
        date ? storageAction('store', 'bulk-date', list) : storageAction('store', 'bulk-ingredient', list)
        return;
    }
    if (action !== 'combine') {return;}

    let pairs = new Map()
    let lenIng = storageAction('get', 'bulk-ingredient').split(',').length
    let lenDate = storageAction('get', 'bulk-date').split(',').length
    if (lenIng !== lenDate) {
        let inputType = lenIng > lenDate ? 'date' : 'ingredient'
        let datesMissing = Math.abs(lenIng-lenDate)
        alertUser(`You are missing ${datesMissing} ${inputType}${datesMissing===1?'':'s'} in the 'input ${inputType}' field`)
        return;
    }
    for (let i = 0; i < lenIng; i++) { // set map and validate values

        let ingredient = (storageAction('get', 'bulk-ingredient').split(',')[i])
        let date = storageAction('get', 'bulk-date').split(',')[i]

        if (valueEmpty(ingredient)) {alertUser(`Incorrect/empty ingredient value entered in bulk input: '${ingredient} '`); return;}

        try {
            let useByDate = new UseByDate(date); // create, validate and format a new UseByDate object
            // before storing the date.
            pairs.set(ingredient, useByDate.ISOFormat)
        } catch (e) {
            errorCentre(e)
        }

    }
    pairs.forEach((date, ingredient) => { // store each pair
        storageAction('store', `txt-input${inputCount('stored', true)+1}`, ingredient);
        storageAction('store', `txt-input${inputCount('stored', true)+1}`, date);
    });
    populatePage(); // repopulate the page
}

function inputCount(returnIndex = 'current', refreshStoredIndex = true) {
    if (refreshStoredIndex) {

        let i = -1;
        for (let key in localStorage) {/txt-input/g.test(key) ? i++ : 0}
        storageAction('store', 'input-fields-count', (++i).toString())
    }
    switch (returnIndex) {
        case 'current':
            return document.querySelectorAll('.single-input').length;
        case 'stored':
            return parseInt(storageAction('get', 'input-fields-count'));
        case 'every-second':
            let totalInputsCount = document.querySelectorAll('.single-input').length / 2; //Get the number of elems divided by 2
            return !isEven(totalInputsCount) ? Math.round(totalInputsCount + 0.1) : totalInputsCount; // Returns the rounded (up) value
        case 'none':
            return;
    }
}

function storageAction(action, key, value='') {
    //stores value of an element and uses its id as the key
    switch(action){
        case 'store':
            localStorage.setItem(key, value);return;
        case 'get':
            return localStorage.getItem(key);
        case 'clear':
            localStorage.removeItem(key);return;
        case 'clear_all':
            localStorage.clear();
    }
}

function shuffleIdIndex() { // fixes gaps in the id indexing of each input element by detecting if the previous element increments by more than 1.
    let prevElemIdNum = 0;
    let idOffset = 0;
    let inputElems = [];
    let reshuffledId = 0;

    // sort the elements in acending order based on their id:
    document.querySelectorAll('.single-input').forEach(elem => inputElems[getIdIndex(elem)] = elem)

    inputElems.forEach((elem) =>{
        let existingElemIdNum = getIdIndex(elem);

        // commence confusing maths that I blundered my way through
        if (existingElemIdNum > prevElemIdNum - idOffset + 1) {
            idOffset = existingElemIdNum - prevElemIdNum; // the gap between the IDs
            reshuffledId = (existingElemIdNum - idOffset) + 1

            elem.id = `txt-input${reshuffledId}`;
            storageAction('clear', `txt-input${existingElemIdNum}`);
            storageAction('store', `txt-input${reshuffledId}`, elem.value);

            prevElemIdNum = reshuffledId;
        }else {
            prevElemIdNum = existingElemIdNum
        }

    })
}
//endregion


//region ************* Misc helpers *************

/**
 * The `getIdIndex()` function searches for a valid index value within the `id` property of an {@link`Element`}.
 * @description "Valid" means any number, of any length, that is located at the end of the `id` string.
 * @param {Element, string} identifier An {@link`Element`} object, or `id` property.
 * @returns {number} An index value associated with the `id`, or `null`.
 */
function getIdIndex(identifier) { //
    identifier = (identifier instanceof Element) ? identifier.id : identifier;
    try {
        identifier = identifier.match(/\d+$/)[0]; // any length of number, at the end of the string
        console.log(identifier)
        return parseInt(identifier);
    }catch (e) {
        errorCentre(e);
    }
}

/**
 * Checks if a value is an empty string, null, or undefined.
 * @param {*} value Value to be checked
 * @returns {boolean}
 */
function valueEmpty(value) {

    value = typeof(value) === 'string' ? value.trim() : value;
    switch (value) {
        case undefined:
        case 'undefined':
        case null:
        case 'null':
        case '':
            return true;
        default:
            return false;
    }
}

function isEven(value) { // remainder comparator
    parseInt(value);
    return value % 2 === 0;
}

function loadedPageName(page) { // returns the name of the loaded page's HTML file
    return document.location.pathname.includes(`${page}.html`);
}

function errorCentre(errorObj) {
    if (errorObj instanceof DateInvalidError) {
        alertUser('Date Error: ' + errorObj.message)
    }else{
        errorPrinter(errorObj)
        throw errorObj
    }
}

function errorPrinter(e) { // lazy programming, aka modularity
    let startPos;
    startPos = e.stack.substring(e.stack.search(/at /g) + 3) // finds the starting index of the first function in the stack

    // (must be the function that the error happened in)
    let functionName = startPos.substring(0, startPos.search(/\(/));
    console.warn(`Error in function ${functionName.trim()}(): \n${e.message}`);
}


//endregion