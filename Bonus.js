function spellingWord(word) {
    const dictionary = ['pro','gram','merit','program','it','programmer'];
    const results = [];

    function helper(sisa, path) {
        if (sisa.length === 0) {
            results.push(path);
            return;
        }

        for (let i = 1; i <= sisa.length; i++) {
            let prefix = sisa.slice(0, i);
            if (dictionary.includes(prefix)) {
                helper(sisa.slice(i), [...path, prefix]);
            }
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

