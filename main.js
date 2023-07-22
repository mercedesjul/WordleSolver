
let current_row_index = 0;
let current_letter_index = 0;
let current_mode = 0; // 0 = Letter Input ; 1 = Select Letter state
const output = document.querySelector('#output');
const word_out = document.querySelector('#wordoutput')
const rows = document.querySelectorAll('.wordle_row');
listeners = [];
document.addEventListener('keypress', (ev) => {

	if (ev.key == "Enter") {
		return current_mode ? confirm_state() : confirm_row();
	}
	letter = ev.key.toLowerCase();
	if (current_letter_index > 4 || current_row_index > 5 || !letter.match("[a-z]")) return;
	
	rows[current_row_index].children[current_letter_index++].innerText = letter;
})

document.addEventListener('keydown', (ev) => {
	if (ev.key != 'Backspace' || current_letter_index == 0) return;
	current_letter_index--;
	rows[current_row_index].children[current_letter_index].innerText = '';
	rows[current_row_index].children[current_letter_index].dataset.state = null;
});

function confirm_row() {
	if (Array.from(rows[current_row_index].children).filter(el => el.innerText != "").length != 5) {
		output.innerText = "Please Fill in the word"
		return
	}
	current_mode = 1;
	output.innerText = "Please select the state of the letter"

	while(listener = listeners.pop()) {
		removeEventListener(listener);
	}
	Array.from(rows[current_row_index].children).forEach(element => {
		listeners.push(element.addEventListener('click', setLetterState))
	});
	if (current_row_index > 0) {
		rows[current_row_index - 1].querySelectorAll('.letter_box[data-state="1"]').forEach(el => 
			setLetterState({target: rows[current_row_index].children[Array.from(el.parentElement.children).indexOf(el)]})
		)
	}
}

function confirm_state() {
	const invalidLetters = getInvalidLetters();
	const wrongPositionLetters = getWrongPositionLetters();
	console.log(wrongPositionLetters)
	const correctLettersRegex = getCorrectLetterRegex();
	filtered_words = words.filter(word => {
		word = word.split(',')[0];
		let containsInvalidLetter = false;
		invalidLetters.forEach((letter) => {
			if (word.includes(letter)) {
				containsInvalidLetter = true;
			}
		})
		let containsAllWrongPositionLetters = true;
		wrongPositionLetters.forEach(letter => {
			if (!word.includes(letter)) {
				containsAllWrongPositionLetters = false
			}
		});

		return !containsInvalidLetter && containsAllWrongPositionLetters && word.match(correctLettersRegex);
	});
	current_row_index++;
	current_letter_index = 0;
	current_mode = 0;
	output.innerText = 'Fill in the Word'
	word_out.innerHTML = ''
	filtered_words.sort((a,b) => {
		// Sort by vocal count
		a_bonus = a.split(',')[0].split('').filter(el => wrongPositionLetters.includes(el)).filter(unique).length * 100000;
		a = a.split(',')[1];
		a = ((a == 'undefined') ? 20000 : parseInt(a) + a_bonus); // If no frequency value is given we assume a realitve low one
		b = b.split(',')[1];
		b_bonus = b.split(',')[0].split('').filter(el => wrongPositionLetters.includes(el)).filter(unique).length * 100000;
		b = ((b == 'undefined') ? 20000 : parseInt(b) + b_bonus);
		return b - a;
	}).forEach(el => {
		const span = document.createElement('span');
		span.classList.add('word_bubble');
		span.addEventListener('click', (ev) => ev.target.innerText.split('').forEach(letter => rows[current_row_index].children[current_letter_index++].innerText = letter));
		span.innerText = el.split(',')[0];
		word_out.append(span)
	});
	
}

function getInvalidLetters() {
	result = []
	for (let i = 0; i < current_row_index + 1; i++) {
		result.push(...Array.from(rows[i].querySelectorAll('.letter_box[data-state=""], .letter_box:not([data-state])')).map(el => el.innerText.toLowerCase()));
	}
	let valid = Array.from(document.querySelectorAll('.letter_box[data-state="1"]')).map(el => el.innerText.toLowerCase());
	return result.filter(unique).filter(el => !valid.includes(el));
}

function getCorrectLetterRegex() {
	const letters = (new Array(5)).fill('.');
	document.querySelectorAll('.letter_box[data-state="2"]').forEach(el => {
		index = Array.from(el.parentElement.children).indexOf(el);

		letters[index] = !(letters[index] instanceof String) && letters[index] instanceof Array ? letters[index].concat([el.innerText.toLowerCase()]) : [el.innerText.toLowerCase()];
	});
	document.querySelectorAll('.letter_box[data-state="1"]').forEach(el => {
		index = Array.from(el.parentElement.children).indexOf(el);

		letters[index] = el.innerText.toLowerCase();
	});
	
	return letters.map(el => el instanceof Array ? '[^'+ el.join('') + ']' : el).join('');
}
function getWrongPositionLetters() {
	letters = []
	document.querySelectorAll('.letter_box[data-state="2"]').forEach(el => {
		letters.push(el.innerText.toLowerCase());
	});
	return letters.filter(unique);
}
function setLetterState(ev) {
	let box = ev.target;
	if (!box.dataset.state) {
		box.dataset.state = 1
		box.classList.add('correct');
	} else if (box.dataset.state == 1) {
		box.dataset.state = 2;
		box.classList.remove('correct');
		box.classList.add('wrong_position');
	} else {
		box.dataset.state = ''
		box.classList.remove('wrong_position');
	}
}
function unique(value, index, self) { 
    return self.indexOf(value) === index;
}