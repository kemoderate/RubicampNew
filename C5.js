function stringManipulation(kata) {
    let hurufPertama = kata[0].toLowerCase();
    let vokal = ['a', 'i', 'u', 'e', 'o'];

    if (vokal.includes(hurufPertama)) {
        // Jika huruf pertama vokal, kembalikan kata apa adanya
        return kata;
    } else {
        // Jika huruf pertama konsonan
        let sisaKata = kata.slice(1); // ambil dari huruf kedua sampai akhir
        return sisaKata + hurufPertama + 'nyo';
    }
}
stringManipulation('ayam');
stringManipulation('bebek');