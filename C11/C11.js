const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface((
    input = process.stdin,
    output = process.stdout
));

const quizData = JSON.parse(fs.readFileSync(data.json,'utf-8'));

let current = 0;

console.log ("Selamat datang di permainan Tebak Kata, silahkan isi dengan jawaban yang benar ya!")
rl.prompt();