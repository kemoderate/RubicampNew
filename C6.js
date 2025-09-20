function sentenceManipulation(sentence) {
    let arrayKata = sentence.toLowerCase().split(" ");
    let vokal = ['a', 'i', 'u', 'e', 'o'];
    let hasilAkhir = []; 

    for (let i = 0; i < arrayKata.length; i++) {
        sentence = arrayKata[i]; 
        let hurufPertama = sentence[0]; 

        if (vokal.includes(hurufPertama)) {
         
            hasilAkhir.push(sentence);
        } else {
         
            let sisasentence = sentence.slice(1);
            let hasil = sisasentence + hurufPertama + 'nyo';
            hasilAkhir.push(hasil);
        }
    }


    console.log(hasilAkhir.join(" "));
}

sentenceManipulation('ibu pergi ke pasar bersama aku');
// expected output: ibu erginyo kenyo asarpnyo ersamabnyo aku