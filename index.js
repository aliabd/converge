var ai_tb = document.getElementById('ai-textbox');
var us_tb = document.getElementById('user-textbox');

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

function get_word(input) {
    if(event.key === 'Enter') {
        var word = input.value;
        display_ai_guess("random");
        bold();
        setTimeout(() => { hide_words(); unbold();}, 2000);
    }
}
