const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.on('line', function (sentence) {
    let arrayKata = sentence.toLowerCase().split(" ");

    let vokal = ['a', 'i', 'u', 'e', 'o'];
    for (let i = 0; i < arrayKata.length; i++) {
        sentence = arrayKata[i];

    }

    let hurufPertama = sentence[0].toLowerCase();
    if (vokal.includes(hurufPertama)) {
        console.log(sentence);
    } else {
        let sisasentence = sentence.slice(1);
        let hasil = sisasentence + hurufPertama + 'nyo';
        console.log(hasil);
    }

    rl.close();
});


