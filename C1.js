function sum(...args) {
    const hasil = args.reduce((total, num) => total + num, 0);
    console.log(hasil);
    return hasil;
}

sum(1, 2, 7);         
sum(1, 4);            
sum(11);              
sum(10, 3, 6, 7, 9);  
