const generateNumbers = (length) => {
    let numbers = '';
    for(var i = 0; i < length; i++) {
        numbers += Math.floor(Math.random() * 10);
    }
    return numbers;
}

module.exports = generateNumbers;