function spiral(param1) {
    // Buat matriks 2D
    let matriks = [];
    let counter = 0;

    for (let i = 0; i < param1 ; i++) {
        let row = [];
        for (let j = 0; j < param1; j++) {
            row.push(counter++);
        }
        matriks.push(row);
    }

    // Spiral traversal
    let result = [];
    let top = 0;
    let bottom = param1 - 1;
    let left = 0;
    let right = param1 - 1;

    while (top <= bottom && left <= right) {
        // Kanan 
        for (let i = left; i <= right; i++) {
            result.push(matriks[top][i]);
        }
        top++;

        // Bawah 
        for (let i = top; i <= bottom; i++) {
            result.push(matriks[i][right]);
        }
        right--;

        // Kiri 
        if (top <= bottom) {
            for (let i = right; i >= left; i--) {
                result.push(matriks[bottom][i]);
            }
            bottom--;
        }

        // Atas 
        if (left <= right) {
            for (let i = bottom; i >= top; i--) {
                result.push(matriks[i][left]);
            }
            left++;
        }
    }

    // Cetak hasil spiral
    
    console.log(result);
    return result;
}


// spiral(5);
spiral(6);
// spiral(7);
