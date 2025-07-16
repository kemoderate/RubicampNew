function romawi(n) {
    if (isNaN(n) || n <= 0) return NaN;

    const romanMap = [
        [1000, 'M'], [900, 'CM'],
        [500, 'D'],  [400, 'CD'],
        [100, 'C'],  [90, 'XC'],
        [50, 'L'],   [40, 'XL'],
        [10, 'X'],   [9, 'IX'],
        [5, 'V'],    [4, 'IV'],
        [1, 'I']
    ];

    let result = '';

    for (const [value, symbol] of romanMap) {
        while (n >= value) {
            result += symbol;
            n -= value;
        }
    }

    return result;
}

console.log("Script Testing untuk Konversi Romawi \n");
console.log("input  | expected | result ");
console.log("------ | ------- | ------ ");
console.log("4      | IV      | ",romawi(4));
console.log("4      | IX      | ",romawi(9));
console.log("4      | XIII    | ",romawi(13));
console.log("4      | MCDLIII | ",romawi(1453));
console.log("4      | MDCXLVI | ",romawi(1646));

