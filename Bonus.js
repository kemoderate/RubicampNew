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






spellingWord('program')
spellingWord('programit')
spellingWord('programmerit')
spellingWord('programlala')
spellingWord('proletarian')

