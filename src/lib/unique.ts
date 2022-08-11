export const isPropValuesEqual = (subject: any[], target: any[], propNames: any[]) => {
 return propNames.every((propName) => subject[propName] === target[propName]);
};

export const getUniqueItemsByProperties = (items: any[], propNames: string[]) => {
 return items.filter((i, idx, a) => idx === a.findIndex((found) => isPropValuesEqual(found, i, Array.from(propNames))));
};
