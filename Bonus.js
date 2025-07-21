function spellingWord(word) {
    const dictionary = ['pro','gram','merit','program','it','programmer'];
    const results = [];

    let stack = [];
    stack.push({ sisa: word, path: [] });

    while (stack.length > 0) {
        let { sisa, path } = stack.pop();

        if (sisa.length === 0) {
            results.push(path);
            continue;
        }

        for (let i = 1; i <= sisa.length; i++) {
            let prefix = sisa.slice(0, i);
            if (dictionary.includes(prefix)) {
                // push ke stack kondisi selanjutnya
                stack.push({ sisa: sisa.slice(i), path: [...path, prefix] });
            }
        }
    }

    if (results.length === 0) {
        console.log("no way");
    } else {
        for (let r of results) {
            console.log(r.join(","));
        }
    }
}




// code asli ada di bawah di atas hanyalah testing


// function spellingWord(word){
//     const dictionary = ['pro','gram','merit','program','it','programmer']
//     console.log(dictionary)

// }

spellingWord('program')
spellingWord('programit')
spellingWord('programmerit')
spellingWord('programlala')
spellingWord('proletarian')


// output
// =================================================
// Sample input:
// program 

// Sample output
//prog,gram
// program,it
// ====================================================
// sample input:
// programmerit

// sample output:
// // pro,gram,merit
// // program,it
// ========================================================

// sample input:
// programlala

// sample output:
// no way
// =============================================================
// sample input:
// proletarian

// sample output:
// no way

