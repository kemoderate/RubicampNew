const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output :process.stdout,
    prompt : `daftar : `
})
if (process.argv[2] !== 'string') {
    console.log(`tolong sertakan nama file sebagai inputan soal misalnya 'node solution.js data.json'`);
    process.exit();
}else if(process.argv[2] == 'add'){
    console.log
    
}


//  node todo.js <command>
//  node todo.js <list>
//  node todo.js task <task_id>
//  node todo.js add  <task_content>
//  node todo.js delete <task_id>
//  node todo.js complete <task_id>
//  node todo.js uncomplete <task_id>
//  node todo.js list:outstanding asc|desc
//  node todo.js list:completed asc|desc 
//  node todo.js tag <tag_id> <tag_name_1> <tag_name_2> ... <tag_name_N>
//  node todo.js filter <tag_name>


