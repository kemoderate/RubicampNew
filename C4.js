function indexPrime(n) {
  if (n < 1) return NaN; 

  let batasAtas = 1000000; 
  
  let penandaPrima = new Array(batasAtas).fill(true);

  penandaPrima[0] = false;
  penandaPrima[1] = false;
  
  let daftarPrima = [];

  for (let angka = 2; angka < batasAtas; angka++) {
    
    if (penandaPrima[angka]) {
      daftarPrima.push(angka); 
      
      for (let kelipatan = angka * 2; kelipatan < batasAtas; kelipatan += angka) {
        penandaPrima[kelipatan] = false;
      }
      
      if (daftarPrima.length === n) {
        return daftarPrima[n - 1]; 
      }
    }
  }

  
  return NaN;
}


console.log(indexPrime(4)) //result => 7
console.log(indexPrime(500)) //result => 3571
console.log(indexPrime(37786)) //result => 450881

