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

document.addEventListener('keypress', (event) => eventCentre(event));

// Populate index.html's elements with stored (previously entered) values
if (pageName('index')) {
    document.addEventListener('DOMContentLoaded', (event) => {
        eventCentre(event)
        document.querySelector('.btn-ingredient').focus()
        if (inputCount('current', false)>47){
            alertUser('Note: HTML god prevents population of date inputs with dateTime values when testing with dummy data.')
        }
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
        repopulatePage();
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
        console.log(event.type);
        switch (event.type) {
            case 'DOMContentLoaded':
                repopulatePage();
                return;

            case 'keypress':

                if ((event.key !== 'Enter') && (event.key !== undefined)) {
                    return
                }
                // must be the enter key used on an ingredient/date field or btn-add-input, so:

                if (event.target.id === 'btn-add-input') {
                    return createInput(inputCount() + 1);
                }
                if (event.target.className === 'txt-bulk') {
                    storeInputValue(event, event.target, true);
                    document.querySelector('#txt-bulk-date').focus()
                }
                let issue = storeInputValue(event, event.target);
                if (issue) {return}
                break;
            case 'focus':
                _focusedElem = event.target.id;
                return;
        }

        let elem = document.querySelector(`#txt-input${inputCount('current', false)}`) // retrives the most recently created elem, to use if there is no focused elem.
        let issue;
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
                try {
                    removeInputPair(_focusedElem);
                } catch {
                    removeInputPair(elem);
                }
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


// ************ HELPER FUNCTIONS ************

function removeAllInputs() {
    document.querySelectorAll('.single-input').forEach((elem) => {
        elem.remove()
    });
}

function createInput(idIndex) { // Create and configure empty input element
    if (inputCount() !== 46) {
        if (isEven(inputCount())) {
            setFieldsetInput('input', 1, '', ['type', 'class', 'id', 'placeholder'], ['text', 'ingredient-input single-input', `txt-input${idIndex}`, '[Ingredient]'] );
        }else {
            setFieldsetInput('input', 2, '', ['type', 'class', 'id'], ['date', 'date-input single-input', `txt-input${idIndex}`] );
        }
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

function storeInputValue(event, elem, bulk = false) { // takes an event and an elem as arguments,
    // and prepares values for use with storageAction. Also refreshed the id index system.
    event.preventDefault();
    try {
        console.log(`Attempting to store ${elem.type} value: ${elem.value}`);
        if (elem.value === '') {
            // noinspection ExceptionCaughtLocallyJS
            throw TypeError('Provided value is not of the correct format')
        }
        if (elem instanceof NodeList) { // elem has been passed in as a nodelist? do:
            elem.forEach(elem => {
                storageAction('store', elem.id, elem.value);
                setElemAttribute(elem);
            })
        } else if (bulk) {
            if (event.target.value !== undefined) {
                event.target.value.split(',').forEach(text => {
                    storageAction('store', `txt-input${inputCount('stored', true) + 1}`, text);
                });
                setElemAttribute(elem);
            }
        } else { // passed in as a single elem? do:
            storageAction('store', elem.id, elem.value);
            setElemAttribute(elem);
        }
        inputCount('none', true);
    }catch (e) {
        errorPrinter(e);
        if (e.name === "TypeError") {alertUser('Inappropriate value entered – are you typing the correct values?')}
        return true;
    }
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

function repopulatePage() { // repopulates the elements on the page when the user reloads and locally stored values are avalable
    let prevElems = !_dummyDataTest ? inputCount('stored', false) : inputCount('stored', true);
    for (let j = 1; j <= prevElems; j++) {

        let elemKeyId = `txt-input${j}`
        let storedValue = storageAction('get', elemKeyId) // get the value of the existing element from local storage

        if ((storedValue !== null) && (storedValue !== '')) { // if the elem is NOT empty
            if (!isEven(j)) { // Check which elem type of the pair it is, depending on if the ID index is odd or even
                // set the chosen elem to its old value
                setFieldsetInput('input', 1, storedValue, ['type', 'class', 'id'], ['text', 'ingredient-input single-input', `txt-input${j}`] );
            }else {
                setFieldsetInput('input', 2, storedValue, ['type', 'class', 'id'], ['date', 'date-input single-input', `txt-input${j}`] );
            }

            // overwrite local storage in case this value has been reshuffled
            setElemAttribute(document.querySelector(`#txt-input${j}`));
            storageAction('clear', elemKeyId)
            storageAction('store', `txt-input${j}`, storedValue)

            if ((j === prevElems)&&(!_dummyDataTest)) {
                !isEven(prevElems) ? storageAction('clear', `txt-input${j-1}`) : 0;
             } // if there's an ingredient elem at the end that's not paired with a date, delete it.
        }
    }

    inputCount('none', true);

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

function isEven(value) {
    parseInt(value);
    return value % 2 === 0;
} // remainder comparator helper function

function pageName(page) {
    return document.location.pathname.includes(`${page}.html`);
}

// ********************** ultimate reusability accomplished ********************** //
function errorPrinter(e) { // this has to be ultimate lazy programming (aka modularity)
    let startPos = e.stack.substring(e.stack.search(/at /g) + 3) // finds the starting index of the first function in the stack
    // (must be the function that the error happened in)
    let functionName = startPos.substring(0, startPos.search(/\(/));
    console.warn('Error in function ' + functionName.trim() + '()');
}
