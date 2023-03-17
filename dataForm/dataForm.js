const template = document.createElement('div');
template.innerHTML = `
    <div class="root">
        <div class="company_input">
            <h4>Компания или ИП</h4>
            <input
                    placeholder="Введите название, ИНН, ОГРН или адрес организации"
                    type="text"
                    id="companyInput"
            />
            <div
                    class="hints"
                    id="hintsBox"
            >

            </div>
        </div>
        <div class="output">
            <h4>Краткое наименование</h4>
            <input
                    type="text"
                    id="shortNameOutput"
            />
        </div>
        <div class="output">
            <h4>Полное наименование</h4>
            <input
                    type="text"
                    id="fullNameOutput"
            />
        </div>
        <div class="output">
            <h4>ИНН / КПП</h4>
            <input
                    type="text"
                    id="innOutput"
            />
        </div>
        <div class="output">
            <h4>Адрес</h4>
            <input
                    type="text"
                    id="addressOutput"
            />
        </div>
    </div> 
`;

const script = document.createElement('script');
const styles = document.createElement('link');
styles.rel = 'stylesheet';

class DataForm extends HTMLElement {
	constructor() {
		super();
		script.src = this.dataset.script;
		styles.href = this.dataset.style;
		this.appendChild(script);
		this.appendChild(styles);
		this.appendChild(template);
	}
}

window.customElements.define('data-form', DataForm);