// noinspection SpellCheckingInspection


// ****** GLOBALS ******

let _focusedElem;
let _timeoutPromise;
let _dummyDataTest = false;
//get fked globals

// ************ CALLBACK FUNCTIONS (LISTENERS) ************

// Add input fields on the click of a button:
document.querySelectorAll('.btn-ingredient').forEach((elem)=> {
    elem.addEventListener('click', (event) => eventCentre(event))
})

// Populate index.html's elements with stored (previously entered) values
if (pageName('index')) {
    document.addEventListener('DOMContentLoaded', (event) => {
        eventCentre(event)
        document.querySelector('.btn-ingredient').focus()
        document.addEventListener('keypress', (event) => eventCentre(event));
    })
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
            storageAction('store', `txt-input${++i}`, `${(Math.round(i/2))+2000}-${m}-${d}`)
        })
        removeAllInputs();
        populatePage();
        location.reload()
    })
}

// Adds listeners to allow users to manipulate selected input elements
function focusListener(elem) {
    if (elem instanceof Element) {
        elem.addEventListener('focus', (event) => eventCentre(event));
        return;
    }
    document.querySelector('#'+elem).addEventListener('focus', (event) => eventCentre(event));
}


// ************ MAIN FUNCTION ************

function eventCentre(event) {
    // Centralises and manages events, and makes it MUCH easier to debug and understand.
    try {
        let issue;
        console.log(event.type);
        switch (event.type) {
            case 'DOMContentLoaded':
                populatePage();
                return;
            case 'keypress':
                if ((event.key !== 'Enter') && (event.key !== undefined)) {return}

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
                event.preventDefault();

                if (event.target.id === 'btn-add-input') {
                    storeInputValue(event, `txt-input${inputCount('current')}`);
                    return createInput(inputCount() + 1);
                }

                issue = storeInputValue(event, event.target);
                if (issue) {return}
                break;

            case 'focus':
                _focusedElem = event.target.id;
                return;
        }

        let elem = document.querySelector(`#txt-input${inputCount('current', false)}`) // retrives the most recently created elem, to use if there is no focused elem.
        let skipCreation = false;

        switch (event.target.id) {
            case 'btn-add-input':

                if (nullElem(elem)) { // Check if there's no input element selected (i.e. first 'addIngredient' click after loading page, no single-input elements will be present)
                    createInput(inputCount() + 1);
                    return;
                }
                issue = storeInputValue(event, elem);
                if (issue) {
                    return
                }
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
                storeInputValue(event, elem);
                skipCreation = true;
                location.href = 'inventory.html';
                return;
        }
        // once the above has been completed, create the new element
        (skipCreation === false) && (createInput(inputCount() + 1))
    } catch (e) {
        errorPrinter(e)
    }
}


// ************ GUI/HTML & CSS Manipulation Functions ************ //

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
            console.error('WHAT THE FUCK WHY IS THIS HAPPENNINGKUHVIWEGYVIYTWEFVDTYFGQVWDUFGW');break //me daddy uwu;
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

function alertUser(message) {
    let alertDiv = document.querySelector('#alert-div');
    alertDiv.innerHTML = '';
    alertDiv.innerHTML = message;
    alertDiv.classList.remove('hidden')
    clearTimeout(_timeoutPromise);
    _timeoutPromise = setTimeout(() => {alertDiv.classList.add('hidden')}, 5000);
}

function setElemAttribute(elem, attribute='readonly', value='readonly') {
    try {
        if (!elem.hasAttribute(attribute)) {
            elem.setAttribute(attribute, value);
        }
    }catch (e) {
        errorPrinter(e);
        console.log('event may not be linked with an item entry')
    }
}


// ************************ Modular Page Population ************************ //
// populates the screen with paired elems and their
// corresponding data/text/date values.

function populatePage() { // repopulates the elements on the page when the user reloads (locally stored values must be avalable)

    // collect the elements in local storage, plus those already on the page.
    let prevElems = inputCount('stored', true)
    let currentElems = inputCount('current', true);

    // for every ID value (in storage) not already on the page, add an elem to the page and assign the corresponding value.
    for (let i = currentElems+1; i <= prevElems; i++) {
        let elemKeyId = `txt-input${i}`
        let storedValue = storageAction('get', elemKeyId) // (the value of the existing element in local storage)

        alternateFields(storedValue, i);
        verifyIndexing(storedValue, prevElems, elemKeyId, i);
        }
    inputCount('none', true);
}

function alternateFields(storedValue, i) {
    if (!isEven(i)) { // Check which elem type of the pair it is, depending on if the ID index is odd or even
        // set the chosen elem to its old value
        setFieldsetInput('input', 1, storedValue, ['type', 'class', 'id'], ['text', 'ingredient-input single-input', `txt-input${i}`]);
    } else {
        setFieldsetInput('input', 2, storedValue, ['type', 'class', 'id'], ['date', 'date-input single-input', `txt-input${i}`]);
    }
}

function verifyIndexing(storedValue, prevElems, elemKeyId, i) {
    // sets elem to readonly, clears its previous position in local storage,
    // and stores the value. also overwrites local storage, in case the elem has been
    // reindexed and is out of whack (due to a removed input pair triggering an index reshuffle)
    setElemAttribute(document.querySelector(`#${elemKeyId}`));
    storageAction('clear', elemKeyId)
    storageAction('store', `txt-input${i}`, storedValue)

}

function removeInputPair(elem) { // removes selected input field. Also deletes the leftover date/ingredient input field paired with original input.

    let currentElemIdNum = getInputIdNum(elem);
    let pairedElemIdNum =  (isEven(currentElemIdNum) ? currentElemIdNum-1 : currentElemIdNum+1);

    let pair = [currentElemIdNum, pairedElemIdNum]

    pair.forEach(elemIdNum => {
        try {
            storageAction('clear', `txt-input${elemIdNum}`);
            document.querySelector(`#txt-input${elemIdNum}`).remove();
        }catch (e) {errorPrinter(e)}

    })

    shuffleIdIndex();
}


// ************************ Local Storage Manipulation ************************ //

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
    try {
        // console.log(`Attempting to store ${elem.type} value: ${elem.value}`);
        // Guard clauses:
        if (inputCount('current') === 0) {return}
        if (inputEmpty(event.target.value) && inputEmpty(elem.value)) {
            inputError();
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

        function inputError() {

            // noinspection ExceptionCaughtLocallyJS
            throw TypeError('Provided value is not of the correct format')
        }
    }catch (e) {
        errorPrinter(e);
        if (e.name === "TypeError") {alertUser('Inappropriate value entered – are you typing the correct values?')}
        return true;
    }
}

function storeBulkInput(action, string = '', date) { // stores/retrives the bulk-input and bulk-date items from localStorage.

    if (inputEmpty(string)) {return}
    let list = string.split('\n')
    list = list.join(',')

    switch (action) {
        case 'store':
            date ? storageAction('store', 'bulk-date', list) : storageAction('store', 'bulk-ingredient', list)
            break;
        case 'combine':
            let pairs = new Map()
            let lenIng = storageAction('get', 'bulk-ingredient').split(',').length
            let lenDate = storageAction('get', 'bulk-date').split(',').length
            if (lenIng !== lenDate) {
                let inputType = lenIng > lenDate ? 'date' : 'ingredient'
                alertUser(`You are missing ${(lenIng-lenDate)/1} ${inputType} in bulk ${inputType} input`)
                return;
            }
            for (let i = 0; i < lenIng; i++) {
                pairs.set(storageAction('get', 'bulk-ingredient').split(',')[i],
                    storageAction('get', 'bulk-date').split(',')[i])
            }

            pairs.forEach((date, ingredient) => {
                storageAction('store', `txt-input${inputCount('stored', true)+1}`, ingredient);

                let year = date.match(/\d\d\d\d/g)[0]
                date = date.replaceAll('-' + year, '')
                date = date.replaceAll(/^/g, year + '-')
                debugger
                storageAction('store', `txt-input${inputCount('stored', true)+1}`, date);
            });
            populatePage();
    }
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
    document.querySelectorAll('.single-input').forEach(elem => inputElems[getInputIdNum(elem)] = elem)

    inputElems.forEach((elem) =>{
        let existingElemIdNum = getInputIdNum(elem);

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

// ************* Mini helpers ************* //

function getInputIdNum(inputElemId) { // returns the numeric index assigned to my single-input fields IDs
    // should only be passed this form of id: txt-input(index value here)

    inputElemId = (inputElemId instanceof Element) ? inputElemId.id : inputElemId;
    try {
        console.log(inputElemId.split('t')[3])
        return parseInt(inputElemId.split('t')[3]);
    }catch (e) {
        errorPrinter(e);
        return null;
    }
}
function nullElem(elem) {// Check if an element is null
    if (elem === null) {
        console.trace(elem);
        console.log('elem identified as null value - there should be no elements on screen. \n if there are, there\'\s an issue');
        return true;
    }
    return false;
}
function inputEmpty(value) {
    try {value.trim();} catch {return true;}
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
function isEven(value) {
    parseInt(value);
    return value % 2 === 0;
} // remainder comparator helper function

function pageName(page) {
    return document.location.pathname.includes(`${page}.html`);
}
function errorPrinter(e) { // lazy programming, aka modularity
    let startPos = e.stack.substring(e.stack.search(/at /g) + 3) // finds the starting index of the first function in the stack
    // (must be the function that the error happened in)
    let functionName = startPos.substring(0, startPos.search(/\(/));
    console.warn('Error in function ' + functionName.trim() + '()');
}
