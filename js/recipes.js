let nachos = ['corn chips', 'red kidney beans', ]
let ingredient;
let type;
let usePriority;

switch (ingredient)  {
    case 'corn-chips':
        type = 'tinned/dried';
        usePriority = 'low';
        break;
    case 'red-kidney-beans':
        type = 'tinned/dried';
        usePriority = 'non-perishable';
        break;
    case 'potato':
        type = 'vegetable';
        usePriority = 'medium';
        break;
    case 'milk':
        type = 'dairy';
        usePriority = 'high';
        break;
}