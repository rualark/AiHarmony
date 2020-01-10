<script>
let varOne = 1;
let varZero = 0;
let varEmpty = '';
let varNull = null;
let varUnDefined;

console.log("typeof varOne === 'undefined': ", typeof varOne === 'undefined'); // false
console.log("typeof varZero === 'undefined': ", typeof varZero === 'undefined'); // false
console.log("typeof varEmpty === 'undefined': ", typeof varEmpty === 'undefined'); // false
console.log("typeof varNull === 'undefined': ", typeof varNull === 'undefined'); // false
console.log("typeof varUnDefined === 'undefined': ", typeof varUnDefined === 'undefined'); // true
console.log("typeof varUnDeclared === 'undefined': ", typeof varUnDeclared === 'undefined'); // true

console.log("varOne == null: ", varOne == null); // false
console.log("varZero == null: ", varZero == null); // false
console.log("varEmpty == null: ", varEmpty == null); // false
console.log("varNull == null: ", varNull == null); // true
console.log("varUnDefined == null: ", varUnDefined == null); // true
console.log("varUnDeclared == null: exception"); // exception

console.log("varOne === null: ", varOne === null); // false
console.log("varZero === null: ", varZero === null); // false
console.log("varEmpty === null: ", varEmpty === null); // false
console.log("varNull === null: ", varNull === null); // true
console.log("varUnDefined === null: ", varUnDefined === null); // false
console.log("varUnDeclared === null: exception"); // exception

console.log("varOne ? true : false: ", varOne ? true : false); // true
console.log("varZero ? true : false: ", varZero ? true : false); // false
console.log("varEmpty ? true : false: ", varEmpty ? true : false); // false
console.log("varNull ? true : false: ", varNull ? true : false); // false
console.log("varUnDefined ? true : false: ", varUnDefined ? true : false); // false
console.log("varUnDeclared ? true : false: exception"); // exception
</script>
