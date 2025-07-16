function deretKaskus(n) {
    const hasil = [];
    let i = 3, count = 0;

    while (count < n) {
        if (i % 5 === 0 && i % 6 === 0) {
            hasil.push("KASKUS");
        } else if (i % 6 === 0) {
            hasil.push("KUS");
        } else if (i % 5 === 0) {
            hasil.push("KAS");
        } else {
            hasil.push(i);
        }
        i += 3;
        count++;
    }

    return hasil;
}

console.log(deretKaskus(10));
