const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'tulis kalimatmu disini > '
});

function sentenceManipulation(sentence) {
  const vokal = ['a', 'i', 'u', 'e', 'o'];
  const kataArray = sentence.split(" ");
  const hasil = [];

  for (let i = 0; i < kataArray.length; i++) {
    const kata = kataArray[i];
    const hurufAwal = kata.charAt(0).toLowerCase();

    if (vokal.includes(hurufAwal)) {
      hasil.push(kata);
    } else {
      const konversi = kata.slice(1) + hurufAwal + 'nyo';
      hasil.push(konversi);
    }
  }

  console.log(`dan output dengan hasil konversi: ${hasil.join(" ")}`);
  rl.prompt();
}

console.log("Ketik 'exit' untuk keluar dari program.");
rl.prompt();

rl.on('line', (input) => {
  if (input.toLowerCase() === 'exit') {
    console.log('Good bye!');
    rl.close();
  } else {
    sentenceManipulation(input);
  }
});
