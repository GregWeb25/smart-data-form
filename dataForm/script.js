const url =
	'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party';
const token = 'f23ea8bfad210c2579436af3d345a257cfb72d2d';
const input = document.getElementById('companyInput');
const shortNameOutput = document.getElementById('shortNameOutput');
const fullNameOutput = document.getElementById('fullNameOutput');
const innOutput = document.getElementById('innOutput');
const addressOutput = document.getElementById('addressOutput');
const hintsBox = document.getElementById('hintsBox');
let selectedHintId = null; //отвечает за выбранную подсказку

document.body.addEventListener(
	'click',
	() => (hintsBox.style.display = 'none')
);

hintsBox.addEventListener('click', event => event.stopPropagation());
input.addEventListener('click', event => event.stopPropagation());
input.addEventListener('input', event => {
	data.input = event.target.value.trim();
	if (data.input.length > 0) {
        options.body = JSON.stringify({ query: data.input });
		useDebounce(() => fetchCompanies());
	} else {
        hints = [];
        selectedHintId = null;
        hintsBox.style.display = 'none';
    }
}); // проверяем на пустую строку и делаем запрос

document.addEventListener('keyup', event => {
	if (event.code === 'Enter') {
		if (selectedHintId === null) {
			hintsBox.style.display = 'none';
			hints = {};
		} else selectedHint(selectedHintId);
	}
	if (event.code === 'ArrowDown') {
		if (selectedHintId === null && hints.length > 0) {
			setTimeout(() => {
				selectedHintId = 0;
				updateHintStatus(selectedHintId);
			}, 0);
		}
		if (selectedHintId !== null && selectedHintId < hints.length - 1) {
			selectedHintId++;
			updateHintStatus(selectedHintId);
		}
	}
	if (event.code === 'ArrowUp') {
		if (selectedHintId > 0) {
			selectedHintId--;
			updateHintStatus(selectedHintId);
		} else {
			selectedHintId = null;
			updateHintStatus(selectedHintId);
		}
	}
}); // выбор подсказок с клавиатуры

let data = {
	input: '',
	shortName: '',
	fullName: '',
	inn: '',
	address: ''
};
let options = {
	method: 'POST',
	mode: 'cors',
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
		Authorization: 'Token ' + token
	},
	body: JSON.stringify({ query: '' })
};

let hints = [];//отображающиеся подсказки

function updateHintStatus(id) {
	if (id !== null) {
		input.value = hints[id].value;
		document.getElementById(id).className = 'hint_item__active';
		for (let i = 0; i <= hints.length - 1; i++) {
			if (i !== id) {
				document.getElementById(`${i}`).className = 'hint_item';
			}
		}
	} else {
		input.value = data.input;
		for (let i = 0; i <= hints.length - 1; i++) {
			document.getElementById(`${i}`).className = 'hint_item';
		}
	}
} // меняет стили при изменении выбранной подсказки

function selectedHint(id) {
	const selectedHint = hints[id];
	data.input = selectedHint.value;
	data.inn = selectedHint.data.inn;
	data.shortName = selectedHint.data.name.short;
	data.fullName = selectedHint.data.name.full;
	data.address = selectedHint.data.address.value;
	updateInputs();
	hintsBox.style.display = 'none';
	selectedHintId = null;
} // заполняет инпуты данными из выбранной подсказки

function fetchCompanies() {
	fetch(url, options)
		.then(response => response.text())
		.then(result => {
			const resultObject = JSON.parse(result);
			getHints(resultObject);
		})
		.catch(error => console.log('error', error));
}

function updateInputs() {
	input.value = data.input;
	shortNameOutput.value = data.shortName;
	fullNameOutput.value = data.fullName;
	innOutput.value = data.inn;
	addressOutput.value = data.address;
}

function useDebounce(callback) {
	const currentInput = data.input;
	setTimeout(() => {
		if (currentInput === data.input) {
			callback();
		} else return 0;
	}, 300);
} // помогает не спамить API

async function getHints(resultObject) {
	selectedHintId = null;
	if (resultObject['suggestions']) {
		hintsBox.style.display = 'block';
		if (resultObject['suggestions'].length) {
			hintsBox.innerHTML = `<header>Выберите вариант или продолжите ввод</header>`;
			hints = resultObject['suggestions'].filter(
				(suggestion, index) => index < 5
			);
			renderHints();
		} else {
			hintsBox.innerHTML = `<header>Неизвестная организация</header>`;
			hints = [];
			selectedHintId = null;
		}
	}
	if (data.input.length === 0) {
		hintsBox.style.display = 'none';
	}
} // превращает объект из API в подсказки

function renderHints() {
    if (hints.length) {
        hints.map((hint, index) => {
            let hintItem = document.createElement('div');
            hintItem.className = 'hint_item';
            hintItem.id = String(index);
            hintItem.addEventListener('click', () => selectedHint(hintItem.id));
            hintItem.innerHTML = `
                <header>${highlighting(hint.value, data.input)}</header>
                <div>
                    ${highlighting(hint.data.inn, data.input)}&nbsp;
                    ${highlighting(hint.data.address.value, data.input)}
                </div>`;
            hintsBox.appendChild(hintItem);
        });
    }
} // отрисовывает подсказки

function highlighting(string, expression) {
	if (string) {
		expression.split(' ').map(word => {
			word = word.trim();
			const regexp = new RegExp(`${word}`, 'gi'); // игнорирует регистр
			if (string.match(regexp)) {
				let wordToChange = string.match(regexp).at(0);

				function escapeRegExp(string) {
					return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				}

				function replaceAll(str, find, replace) {
					return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
				}

				string = replaceAll(
					string,
					wordToChange,
					`<span class="highlight">${wordToChange}</span>`
				); // ищет совпадения и заменят на span с классом подсветки
			}
		});
		return string;
	} else return '';
} // выделяет текст подсказки, совпадающий с введённым
