var ai_tb = document.getElementById('ai-textbox');
var us_tb = document.getElementById('user-textbox');
var ai_lp = document.getElementById('last_ai_word');
var us_lp = document.getElementById('last_user_word');


function display_ai_guess(word) {
    ai_tb.value = word;
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

function last_pair(word, ai_guess) {
    ai_lp.innerHTML = ai_guess;
    us_lp.innerHTML = word;
}

function get_word(input) {
    if(event.key === 'Enter') {
        var word = input.value;
        var ai_guess = "apple";
        display_ai_guess(ai_guess);
        bold();
        setTimeout(() => { hide_words(); unbold(); last_pair(word, ai_guess)}, 2000);
    }
}

