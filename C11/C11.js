const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Tebakan :'
});

const quizData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

let current = 0;

console.log("Selamat datang di permainan Tebak Kata, silahkan isi dengan jawaban yang benar ya!")
console.log(`${current + 1}: ${quizData[current].Pertanyaan}`)
rl.prompt();

rl.on('line', (jawaban) => {
    const correctJawaban = quizData[current].Jawaban.toLowerCase();
    const userJawaban = jawaban.trim().toLowerCase();

    if (userJawaban === correctJawaban) {
        console.log("Selamat Anda Benar");
        current++;
    } else {
        console.log("Wkwkwkwk, Anda Kurang Beruntung !");
    }


    if (current < quizData.length) {
        console.log(`\nSoal ${current + 1}: ${quizData[current].Pertanyaan}`);
        rl.prompt();
    } else {
        console.log("\nHore anda menang!");
        rl.close();
    }
})