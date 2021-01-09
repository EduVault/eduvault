export function ifObjectIsEmpty(object: any) {
  let isEmpty = true;
  if (JSON.stringify(object) == JSON.stringify({})) {
    // Object is Empty
    isEmpty = true;
  } else {
    //Object is Not Empty
    isEmpty = false;
  }
  return isEmpty;
}
