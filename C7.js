function weirdmultiply (sentence){

    let str = sentence.toString() 
    
    while (str.length > 1) {
        let hasil = 1;
        for (let i = 0; i < str.length; i++) {
            hasil *= Number(str[i]); 
        }
       str = hasil.toString();
    }
    return Number(str);
}
console.log(weirdmultiply(39)); // -> 3 * 9 = 27 -> 2 * 7 = 14 -> 1 * 4 = 4
console.log(weirdmultiply(999)); // -> 9 * 9 * 9 = 729 -> 7 * 2 * 9  = 126 -> 1 * 2 * 6 = 12 -> 1 * 2 = 2
console.log(weirdmultiply(3)); // 3 karena telah satu digit