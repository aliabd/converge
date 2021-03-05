var ai_tb = document.getElementById('ai-textbox');
var us_tb = document.getElementById('user-textbox');
var ai_lp = document.getElementById('last_ai_word');
var us_lp = document.getElementById('last_user_word');

var firstTurn = true;
var previousUserWords = [];
var previousAIWords = [];

function display_ai_guess(word) {
    ai_tb.value = word;
    bold();
    setTimeout(() => { hide_words(); unbold();}, 2000);
}

function hide_words() {
    ai_tb.value = "";
    us_tb.value = "";
}

function bold() {
    ai_tb.style.fontWeight = "900";
    us_tb.style.fontWeight = "900";
}

function unbold() {
    ai_tb.style.fontWeight = null;
    us_tb.style.fontWeight = null;
}

function last_pair(user_word, ai_word) {
    ai_lp.innerHTML = ai_word;
    us_lp.innerHTML = user_word;
}

function getDifferentWord(wordList){
    let word;
    console.log(wordList.length)
    for (var i=0; i<wordList.length; i++){
        let maxSimilarity = 0;
        word = wordList[i]["word"]
        console.log(word)
        for (var j=0; j<previousUserWords.length; j++) {
            s = similarity(previousUserWords[j], word)
            maxSimilarity = Math.max(s, maxSimilarity)
        }
        for (var j=0; j<previousAIWords.length; j++) {
            s = similarity(previousAIWords[j], word)
            maxSimilarity = Math.max(s, maxSimilarity)
        }
        console.log(word, "maxSimilarity", maxSimilarity)
        if (maxSimilarity < 0.8) {
            break
        }
    }
    return word;
}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
            costs[j] = j;
        else {
            if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
                newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
            }
        }
        }
        if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
    }


function get_word(input) {
    if(event.key === 'Enter') {
        let userWord = $('#user-textbox').val();
        if (firstTurn) {
            get_first_ai_word().then(aiWord => {
                display_ai_guess(aiWord);
                firstTurn = false;
                previousAIWords.push(aiWord);
                previousUserWords.push(userWord);
            })    
        } else {
            let n = previousUserWords.length-1
            wordVectors.average([previousUserWords[n], previousAIWords[n]]).then(aiWords =>{
                console.log(aiWords)
                let aiWord = getDifferentWord(aiWords)
                display_ai_guess(aiWord);
                previousAIWords.push(aiWord);
                previousUserWords.push(userWord);
            })
        }
    }
}

// Create a new word2vec method
const wordVectors = ml5.word2vec("https://raw.githubusercontent.com/abidlabs/convergence/main/wordvecs5000.json", modelLoaded);

// When the model is loaded
function modelLoaded() {
  wordVectors.getRandomWord().then(word => {
    let val = $('#user-textbox').attr("placeholder")
    $('#user-textbox').attr("placeholder", val + " like: " + word);
  })

}

function get_first_ai_word(){
    return wordVectors.getRandomWord();
}

// function get_center_word(user_word, )

