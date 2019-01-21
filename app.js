const express = require('express'); // запрос модуля Экспресс
const pug = require('pug');			// запрос модуля Pug
const bodyParser = require('body-parser'); // запрос модуля БодиПарсер
const Datastore = require('nedb'); //запрос модуля НеДБ

//активация модуля "экспресс"
const app = express(); 

//установка рендера Паг
app.set('view engine', 'pug')
app.set('views', __dirname + '/source/views')

//активация модуля БодиПарсер
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//cors
app.use((request, response, next)=> {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

// Создание базы данных
const db = new Datastore({filename: __dirname + '/source/db/board.json'});

// Загрузка базы данных
db.loadDatabase((err)=>{
	if (err) {
	console.log(err);
	} else {
    console.log('Load db succses')};
});

// вывод метода запроса и ссылки !!!
app.use((req, res, next)=>{
	console.log(`${req.method} reques for ${req.url}`);
	next();
});

//указание на статичные файлы (хтмл, скрипты и прочее.)
app.use(express.static('source'));

//запрос данных по сылке "/" Домашняя страница
app.get('/', (req, res)=>{ 
	res.render('index', { message: 'Hello there!!!' })
});

app.get('/index', (req, res)=>{
	res.redirect('/')
});

app.get('/home', (req, res)=>{
	res.redirect('/')
});

//запрос странички для создание карточки
app.get('/board/add', (req, res)=>{
	res.render('add_board',{
	title: 'Add Card'
	})
});

//запрос на публикацию данных
app.post('/board/add', (req, res)=>{
	var card = {};
	card.name = req.body.name;
	card.money = req.body.money;
	card.date = req.body.date;
	db.insert(card, (err, newDoc)=>{
		if (err){
		console.log(err);
		return;
		} else {
		res.redirect('/board');
		}
	});
});

//запрос странички с доской
app.get('/board', (req, res)=>{
		db.find({}, (err, doc)=>{
		if(err){
		console.log(err)
		return;
		} else {
		res.render('board',{
		title: 'Cards from db',
		cards: doc
		});
		}
	});
});

//Персональная карточка
app.get('/board/:id', (req, res)=>{
		db.findOne({_id: req.params.id}, (err, doc)=>{
			if (err){
			console.log(err);
			} else {
			res.render('card',{
			title: 'Card',
			cards: doc
			});
		}
	});
});

//Форма для редактирования карточки
app.get('/board/edit/:id', (req, res)=>{
		db.findOne({_id: req.params.id}, (err, doc)=>{
			if (err){
			console.log(err);
			} else {
			res.render('edit',{
			title: 'Card edit',
			cards: doc
			});
		}
	});
});

//редактирование карточки
app.post('/board/edit/:id', (req, res)=>{
	var card = {};
	card.name = req.body.name;
	card.money = req.body.money;
	card.date = req.body.date;
	var query = {_id:req.params.id}
	db.update(query, {$set: card}, (err, newDoc)=> {
		if(err){
		console.log(err);
		return;
		} else {
		res.redirect('/board');
		}
	});
});

//Удаление карточки
app.get('/board/delete/:id', (req, res)=>{
	var query = {_id:req.params.id}
	db.remove(query, (err, newDoc)=>{
		if(err){
		console.log(err);
		return;
		} else {
		res.redirect('/board');
		}
	});
});

//прослушивание порта 3000 на запросы (есть код получше)
app.listen(3000, ()=>{
	console.log('Express run at 3000');
});