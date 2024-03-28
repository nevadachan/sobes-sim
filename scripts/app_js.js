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
new Question("Какие типы данных существуют в JavaScript?", [
        new Answer("Числа, строки, булевы значения и объекты", 1),
        new Answer("Только числа и строки", 0),
        new Answer("Только булевы значения", 0),
        new Answer("Только объекты", 0)
    ]),

    new Question("Что такое цикл событий (event loop) и как он работает?", [
        new Answer("Это бесконечный цикл обработки событий в браузере", 0),
        new Answer("Это механизм обработки событий в JavaScript, основанный на одном потоке", 1),
        new Answer("Это часть жизненного цикла компонента в React", 0),
        new Answer("Цикл событий не существует в JavaScript", 0)
    ]),

    new Question("Что такое замыкание?", [
        new Answer("Это процесс закрытия окна браузера", 0),
        new Answer("Это функция, которая ссылается на переменные из внешней области видимости, даже после завершения выполнения", 1),
        new Answer("Это способ создания новых объектов в JavaScript", 0),
        new Answer("Это свойство объекта, которое указывает на прототип", 0)
    ]),

    new Question("Что такое прототип объекта в JavaScript?", [
        new Answer("Это встроенный метод объекта", 0),
        new Answer("Это объект, который используется для наследования свойств другого объекта", 1),
        new Answer("Это атрибут объекта, который содержит его тип данных", 0),
        new Answer("Прототип объекта не существует в JavaScript", 0)
    ]),

    new Question("Как работает ключевое слово this?", [
        new Answer("Оно всегда ссылается на глобальный объект", 0),
        new Answer("Оно зависит от контекста вызова и указывает на объект, из которого вызывается функция", 1),
        new Answer("Оно используется только в стрелочных функциях", 0),
        new Answer("Оно всегда ссылается на объект, для которого был вызван метод", 0)
    ]),

    new Question("Как работают методы apply(), call() и bind()?", [
        new Answer("Это способы изменения прототипа объекта", 0),
        new Answer("apply() и call() используются для вызова функции с определенным контекстом, bind() создает новую функцию с привязанным контекстом", 1),
        new Answer("apply() и call() создают новые объекты, bind() изменяет текущий объект", 0),
        new Answer("Эти методы не существуют в JavaScript", 0)
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
