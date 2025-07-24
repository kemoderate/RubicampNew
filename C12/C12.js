const fs = require('fs');
const readline = require('readline');
 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'Tebakan :'
});
// argumen 

if (process.argv[2] !== 'data.json') {
    console.log(`tolong sertakan nama file sebagai inputan soal misalnya 'node solution.js data.json'`);
    process.exit();
} else {
    const data = fs.readFileSync('data.json');
    const quizData = JSON.parse(data);
}

let quiz = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
let skippedQuestion = [];
let current = 0;
let salah = 0;
let benar = 0;

console.log("Selamat datang di permainan Tebak Kata, silahkan isi dengan jawaban yang benar ya!")
console.log("Gunakan skip untuk menangguhkan pertanyaannya, dan di akhir pertanyaan akan di tanyakan lagi")
console.log(`Pertanyaan : ${quiz[current].Pertanyaan}`)
rl.prompt();

rl.on('line', (jawaban) => {
    const correctJawaban = quiz[current].Jawaban.toLowerCase();
    const userJawaban = jawaban.trim().toLowerCase();

    if (userJawaban === correctJawaban) {
        console.log(" Anda Beruntung !");
        salah = 0;
        current++;
        benar++;
        

    } else if (userJawaban === 'skip') {
        skippedQuestion.push(quiz[current]);
        console.log(`\njawaban dilewati`)
        salah = 0;
        current++
    }
    else {
        salah++;
        console.log(`Wkwkwkwk, Anda Kurang Beruntung ! anda ${salah} kali , silahkan coba lagi`);
        return rl.prompt();
    }

    if (benar >= 3) {
        console.log("\nHore anda menang!");
        rl.close();
    }
    else if (current < quiz.length) {
        console.log(`\nPertanyaan : ${quiz[current].Pertanyaan}`);
        rl.prompt();
    }

    else if (skippedQuestion.length > 0) {
        quiz = skippedQuestion;
        skippedQuestion = [];
        current = 0;
        console.log(`Pertanyaan : ${quiz[current].Pertanyaan}`)
        rl.prompt();
    }
    else {
        console.log("\nAnda beruntung !")
        rl.close();
    }
}
)