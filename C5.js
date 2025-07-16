function stringManipulation(kata) {
    let hurufPertama = kata[0].toLowerCase();
    let vokal = ['a', 'i', 'u', 'e', 'o'];

    if (vokal.includes(hurufPertama)) {
        
        console.log(kata);
    } else {
        
        let sisaKata = kata.slice(1);
        let hasil = sisaKata + hurufPertama + 'nyo';
        console.log(hasil);
    }
}

stringManipulation('ayam');
stringManipulation('bebek');