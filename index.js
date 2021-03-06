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
    let same_root = false;
    for (var i=0; i<wordList.length; i++){
        word = wordList[i]["word"];
        for (var j=0; j<previousUserWords.length; j++) {
            if (get_root(word) == get_root(previousUserWords[j])) {
                same_root = true;
                break
            }
        }
        for (var j=0; j<previousAIWords.length; j++) {
            if (get_root(word) == get_root(previousAIWords[j])) {
                same_root = true;
                break
            }
        }
        if (!same_root) {
            break
        }
    }
    return word;
}


function converged(userWord, aiWord) {
    if (get_root(userWord) == get_root(aiWord)) {
        confetti.start();
        $('#congrats').css('display','block');
        $('#convergedword').html(userWord);
        setTimeout(() => {confetti.stop(); }, 5000);
    }
}

function get_word(input) {
    if(event.key === 'Enter') {
        let userWord =$('#user-textbox').val();
        us_tb.value = userWord;
        if (firstTurn) {
            get_first_ai_word().then(aiWord => {
                display_ai_guess(aiWord);
                firstTurn = false;
                previousAIWords.push(aiWord);
                previousUserWords.push(userWord);
                converged(userWord, aiWord);
            })    
        } else {
            let n = previousUserWords.length-1
            wordVectors.average([previousUserWords[n], previousAIWords[n]]).then(aiWords =>{
                let aiWord = getDifferentWord(aiWords)
                display_ai_guess(aiWord);
                previousAIWords.push(aiWord);
                previousUserWords.push(userWord);
                converged(userWord, aiWord);
            })
        }
    }
}


// Create a new word2vec method
const wordVectors = ml5.word2vec("https://raw.githubusercontent.com/abidlabs/convergence/main/new_wordvecs10000.json", modelLoaded);

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

function get_root(word) {
    return stemmer(word)
}


$( document ).ready(function() {
    let ctx = $('#canvas')[0].getContext('2d');
    embedding_chart = new Chart(ctx, {
      type: 'scatter',
      responsive:true,
      maintainAspectRatio: false,  
      data: {
          datasets: [{
            label: 'User Embedding',
            data: [{'x': 1, 'y': 0.2}, {'x': 0.3, 'y': 4}],
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(0, 0, 0)',
            pointRadius: 13,
            pointHoverRadius: 13,
            pointStyle: 'rectRot',
            showLine: true,
            fill: false,
          }, {
            label: 'AI Embedding',
            data: [{'x': -1, 'y': -0.2}, {'x': -0.3, 'y': -4}],
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(0, 0, 0)',
            pointRadius: 13,
            pointHoverRadius: 13,
            pointStyle: 'rectRot',
            showLine: true,
            fill: false,
          }]
      },
      options: {
        legend: {display: false}
      }
    });    
})


// Porter stemmer in Javascript. Few comments, but it's easy to follow against the rules in the original
// paper, in
//
//  Porter, 1980, An algorithm for suffix stripping, Program, Vol. 14,
//  no. 3, pp 130-137,
//
// see also http://www.tartarus.org/~martin/PorterStemmer
var stemmer = (function(){
	var step2list = {
			"ational" : "ate",
			"tional" : "tion",
			"enci" : "ence",
			"anci" : "ance",
			"izer" : "ize",
			"bli" : "ble",
			"alli" : "al",
			"entli" : "ent",
			"eli" : "e",
			"ousli" : "ous",
			"ization" : "ize",
			"ation" : "ate",
			"ator" : "ate",
			"alism" : "al",
			"iveness" : "ive",
			"fulness" : "ful",
			"ousness" : "ous",
			"aliti" : "al",
			"iviti" : "ive",
			"biliti" : "ble",
			"logi" : "log"
		},

		step3list = {
			"icate" : "ic",
			"ative" : "",
			"alize" : "al",
			"iciti" : "ic",
			"ical" : "ic",
			"ful" : "",
			"ness" : ""
		},

		c = "[^aeiou]",          // consonant
		v = "[aeiouy]",          // vowel
		C = c + "[^aeiouy]*",    // consonant sequence
		V = v + "[aeiou]*",      // vowel sequence

		mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
		meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
		mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
		s_v = "^(" + C + ")?" + v;                   // vowel in stem

	return function (w) {
		var 	stem,
			suffix,
			firstch,
			re,
			re2,
			re3,
			re4,
			origword = w;

		if (w.length < 3) { return w; }

		firstch = w.substr(0,1);
		if (firstch == "y") {
			w = firstch.toUpperCase() + w.substr(1);
		}

		// Step 1a
		re = /^(.+?)(ss|i)es$/;
		re2 = /^(.+?)([^s])s$/;

		if (re.test(w)) { w = w.replace(re,"$1$2"); }
		else if (re2.test(w)) {	w = w.replace(re2,"$1$2"); }

		// Step 1b
		re = /^(.+?)eed$/;
		re2 = /^(.+?)(ed|ing)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			re = new RegExp(mgr0);
			if (re.test(fp[1])) {
				re = /.$/;
				w = w.replace(re,"");
			}
		} else if (re2.test(w)) {
			var fp = re2.exec(w);
			stem = fp[1];
			re2 = new RegExp(s_v);
			if (re2.test(stem)) {
				w = stem;
				re2 = /(at|bl|iz)$/;
				re3 = new RegExp("([^aeiouylsz])\\1$");
				re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
				if (re2.test(w)) {	w = w + "e"; }
				else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
				else if (re4.test(w)) { w = w + "e"; }
			}
		}

		// Step 1c
		re = /^(.+?)y$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(s_v);
			if (re.test(stem)) { w = stem + "i"; }
		}

		// Step 2
		re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			suffix = fp[2];
			re = new RegExp(mgr0);
			if (re.test(stem)) {
				w = stem + step2list[suffix];
			}
		}

		// Step 3
		re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			suffix = fp[2];
			re = new RegExp(mgr0);
			if (re.test(stem)) {
				w = stem + step3list[suffix];
			}
		}

		// Step 4
		re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
		re2 = /^(.+?)(s|t)(ion)$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(mgr1);
			if (re.test(stem)) {
				w = stem;
			}
		} else if (re2.test(w)) {
			var fp = re2.exec(w);
			stem = fp[1] + fp[2];
			re2 = new RegExp(mgr1);
			if (re2.test(stem)) {
				w = stem;
			}
		}

		// Step 5
		re = /^(.+?)e$/;
		if (re.test(w)) {
			var fp = re.exec(w);
			stem = fp[1];
			re = new RegExp(mgr1);
			re2 = new RegExp(meq1);
			re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
			if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
				w = stem;
			}
		}

		re = /ll$/;
		re2 = new RegExp(mgr1);
		if (re.test(w) && re2.test(w)) {
			re = /.$/;
			w = w.replace(re,"");
		}

		// and turn initial Y back to y

		if (firstch == "y") {
			w = firstch.toLowerCase() + w.substr(1);
		}

		return w;
	}
})();
