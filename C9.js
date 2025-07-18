function spiral(param1) {

    // matriks
    let matriks = []
    
    let counter = 0;

    for (let i = 0; i < param1 ; i++) { // Outer loop
        let row = [];
  for (let j = 0; j < param1; j++) { // Inner loop
    row.push(counter);
    counter++;
  }
  matriks.push(row);
}
console.log("Matriks")
console.log(matriks)

    // transversal
    let result = [];
    let top = 0
    let bottom = param1 - 1;
    let left = 0;
    let right = param1 -1;

    while (result.length < param1 * param1 ) {
        for (let i = left; i <= right; i++) {
            result.push(matriks[top][i])
        }
        top++;
        for (let i = top; i <= bottom; i++) {
            result.push(matriks[i][right])
        }
        right--;
        for (let i = right; i => left; i++) {
            result.push(matriks[i][bottom])
        }
        bottom--;
        

    }

return result;
}

spiral(5)
spiral(6)
spiral(7)
// expected output 
// // spiral(5) 
// 0,1,2,3,4
// 5,6,7,8,9
// 10,11,12,13,14
// 15,16,17,18,19
// 20,21,22,23,24
// tampilan result nya:
// [0,1,2,3,4,9,14,19,24,23,22,21,20,15,10,5,6,7,8,13,18,17,16,11,12]