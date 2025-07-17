function pola(str){
    for (let i = 0; i <= 9; i++) {  
        for( let j = 0; j <= 9; j++){
         let testStr = str.replace("#",i).replace("#",j);
       
       let [leftSide,rightSide] = testStr.split("=");
       let hasilKiri = eval(leftSide);
       let hasilKanan = Number(rightSide);

         if (hasilKiri === hasilKanan){
        return [i,j]
     
                }
            }
       } 
}
console.log(pola("42#3 * 188 = 80#204"))
//result :[8,5]
console.log(pola("8#61 * 895 = 78410#5"))
// result [7,9]
