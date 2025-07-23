const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Tebakan :'
});

const quizData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
let skippedQuestion = [];
let current = 0;
let salah = 0;
let benar = 0;

console.log("Selamat datang di permainan Tebak Kata, silahkan isi dengan jawaban yang benar ya!")
console.log("Gunakan skip untuk menangguhkan pertanyaannya, dan di akhir pertanyaan akan di tanyakan lagi")
console.log(`${current + 1}: ${quizData[current].Pertanyaan}`)
rl.prompt();

rl.on('line', (jawaban) => {
    const correctJawaban = quizData[current].Jawaban.toLowerCase();
    const userJawaban = jawaban.trim().toLowerCase();

    if (userJawaban === correctJawaban) {
        console.log("Selamat Anda Benar");
        current++;
       
    }  else if(userJawaban === 'skip'){
            current++
        }
    else {
        console.log("Wkwkwkwk, Anda Kurang Beruntung !");
        salah++;
    }

    if(skippedQuestion.length > 0){
        quizData = skippedQuestion;
        skippedQuestion = [];
        current = 0;
    }

    if (current < quizData.length) {
        console.log(`\nSoal ${current + 1}: ${quizData[current].Pertanyaan}`);
        rl.prompt();
    } else {
        console.log("\nHore anda menang!");
        rl.close();
    }
})