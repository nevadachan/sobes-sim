const headElem = document.getElementById("head");
const buttonsElem = document.getElementById("buttons");
const pagesElem = document.getElementById("pages");

//Класс, который представляет сам тест
class Quiz
{
	constructor(type, questions, results)
	{
		//Тип теста: 1 - классический тест с правильными ответами, 2 - тест без правильных ответов
		this.type = type;

		//Массив с вопросами
		this.questions = questions;

		//Массив с возможными результатами
		this.results = results;

		//Количество набранных очков
		this.score = 0;

		//Номер результата из массива
		this.result = 0;

		//Номер текущего вопроса
		this.current = 0;
	}

	Click(index)
	{
		//Добавляем очки
		let value = this.questions[this.current].Click(index);
		this.score += value;

		let correct = -1;

		//Если было добавлено хотя одно очко, то считаем, что ответ верный
		if(value >= 1)
		{
			correct = index;
		}
		else
		{
			//Иначе ищем, какой ответ может быть правильным
			for(let i = 0; i < this.questions[this.current].answers.length; i++)
			{
				if(this.questions[this.current].answers[i].value >= 1)
				{
					correct = i;
					break;
				}
			}
		}

		this.Next();

		return correct;
	}

	//Переход к следующему вопросу
	Next()
	{
		this.current++;
		
		if(this.current >= this.questions.length) 
		{
			this.End();
		}
	}

	//Если вопросы кончились, этот метод проверит, какой результат получил пользователь
	End()
	{
		const statData = [];

		// Заголовок CSV
		statData.push(["Вопрос", "Правильный ответ", "Ответ пользователя"]);
	
		// Данные о каждом вопросе
		for (let i = 0; i < this.questions.length; i++) {
			const question = this.questions[i].text;
			const correctAnswer = this.questions[i].answers.find(answer => answer.value >= 1).text;
			const userAnswer = this.questions[i].answers[this.questions[i].Click(0)].text;
	
			statData.push([question, correctAnswer, userAnswer]);
		}
	
		// Заголовок итогового результата
		statData.push(["Результат", "Очки", this.results[this.result].text, this.score]);
	
		// Преобразование в CSV-строку
		const csvString = statData.map(row => row.join(",")).join("\n");
	
		// Сохранение в CSV файл
		downloadCSV(csvString, "quiz_statistics.csv");
}

} 

//Класс, представляющий вопрос
class Question 
{
	constructor(text, answers)
	{
		this.text = text; 
		this.answers = answers; 
	}

	Click(index) 
	{
		return this.answers[index].value; 
	}
}

//Класс, представляющий ответ
class Answer 
{
	constructor(text, value) 
	{
		this.text = text; 
		this.value = value; 
	}
}

//Класс, представляющий результат
class Result 
{
	constructor(text, value)
	{
		this.text = text;
		this.value = value;
	}

	//Этот метод проверяет, достаточно ли очков набрал пользователь
	Check(value)
	{
		if(this.value <= value)
		{
			return true;
		}
		else 
		{
			return false;
		}
	}
}

//Массив с результатами
const results = 
[
	new Result("Вам многому нужно научиться", 0),
	new Result("Вы уже неплохо разбираетесь", 2),
	new Result("Ваш уровень выше среднего", 4),
	new Result("Вы в совершенстве знаете тему", 6)
];

//Массив с вопросами
const questions = 
[
	new Question("Что такое Node.js и для чего он используется?", [
		new Answer("Это браузерный JavaScript", 0),
		new Answer("Это среда выполнения JavaScript, позволяющая запускать код на стороне сервера", 1),
		new Answer("Это база данных для хранения данных", 0),
		new Answer("Node.js не существует", 0)
	]),
	
	new Question("Чем отличается Node.js от браузерного JavaScript?", [
		new Answer("Он использует другой язык программирования", 0),
		new Answer("Он предназначен для выполнения кода на сервере, а не в браузере", 1),
		new Answer("Node.js и браузерный JavaScript идентичны", 0),
		new Answer("Node.js работает только с базами данных", 0)
	]),
	
	new Question("Что такое npm в контексте Node.js?", [
		new Answer("Это новый язык программирования", 0),
		new Answer("Это пакетный менеджер для установки и управления зависимостями в проектах Node.js", 1),
		new Answer("Это фреймворк для создания веб-приложений", 0),
		new Answer("npm не используется в Node.js", 0)
	]),
	
	new Question("Что такое модуль в Node.js?", [
		new Answer("Это отдельное веб-приложение", 0),
		new Answer("Это независимый блок кода, который можно подключить и использовать в других файлах", 1),
		new Answer("Модули не используются в Node.js", 0),
		new Answer("Это специальная переменная в Node.js", 0)
	]),
	
	new Question("Какие основные принципы работы с асинхронным кодом в Node.js?", [
		new Answer("Node.js не поддерживает асинхронный код", 0),
		new Answer("Использование колбэков (callbacks), промисов (promises) и async/await", 1),
		new Answer("Использование только синхронного кода", 0),
		new Answer("Асинхронный код в Node.js не реализован", 0)
	]),
	
];

//Сам тест
const quiz = new Quiz(1, questions, results);

Update();

//Обновление теста
function Update()
{
	//Проверяем, есть ли ещё вопросы
	if(quiz.current < quiz.questions.length) 
	{
		//Если есть, меняем вопрос в заголовке
		headElem.innerHTML = quiz.questions[quiz.current].text;

		//Удаляем старые варианты ответов
		buttonsElem.innerHTML = "";

		//Создаём кнопки для новых вариантов ответов
		for(let i = 0; i < quiz.questions[quiz.current].answers.length; i++)
		{
			let btn = document.createElement("button");
			btn.className = "button";

			btn.innerHTML = quiz.questions[quiz.current].answers[i].text;

			btn.setAttribute("index", i);

			buttonsElem.appendChild(btn);
		}
		
		//Выводим номер текущего вопроса
		pagesElem.innerHTML = (quiz.current + 1) + " / " + quiz.questions.length;

		//Вызываем функцию, которая прикрепит события к новым кнопкам
		Init();
	}
	else
	{
		//Если это конец, то выводим результат
		buttonsElem.innerHTML = "";
		headElem.innerHTML = quiz.results[quiz.result].text;
		pagesElem.innerHTML = "Очки: " + quiz.score;
	}
}

function Init()
{
	//Находим все кнопки
	let btns = document.getElementsByClassName("button");

	for(let i = 0; i < btns.length; i++)
	{
		//Прикрепляем событие для каждой отдельной кнопки
		//При нажатии на кнопку будет вызываться функция Click()
		btns[i].addEventListener("click", function (e) { Click(e.target.getAttribute("index")); });
	}
}

function Click(index) 
{
	//Получаем номер правильного ответа
	let correct = quiz.Click(index);

	//Находим все кнопки
	let btns = document.getElementsByClassName("button");

	//Делаем кнопки серыми
	for(let i = 0; i < btns.length; i++)
	{
		btns[i].className = "button button_passive";
	}

	//Если это тест с правильными ответами, то мы подсвечиваем правильный ответ зелёным, а неправильный - красным
	if(quiz.type == 1)
	{
		if(correct >= 0)
		{
			btns[correct].className = "button button_correct";
		}

		if(index != correct) 
		{
			btns[index].className = "button button_wrong";
		} 
	}
	else
	{
		//Иначе просто подсвечиваем зелёным ответ пользователя
		btns[index].className = "button button_correct";
	}

	//Ждём секунду и обновляем тест
	setTimeout(Update, 1000);
}

function downloadCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(data);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
}
