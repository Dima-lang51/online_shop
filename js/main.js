const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';


//Класс элементы каталога 
class ProductItem {
	 constructor(el, img ='https://aliradar.com/api/image?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FHTB15S6pQXXXXXbNXpXXq6xXFXXXZ%2F200-x-150.jpg_480x480.jpg_Q80.jpg') {
        this.product_name = el.product_name;
        this.price = el.price;
        this.id_product = el.id_product;
        this.img = img;
    }
	render() { //формирует html блок для отрисовки элемента каталога
        return `<div class="product-item" data-id="${this.id_product}">
                <img src="${this.img}" alt="Some img">
                <div class="desc">
                    <h3>${this.product_name}</h3>
                    <p>${this.price} ₽</p>
                    <button class="buy-btn"
                    data-id="${this.id_product}"
                    data-name="${this.product_name}"
                    data-price="${this.price}">Купить</button>
                </div>
            </div>`;
    }
	
}
//Класс списка товаров КАТАЛОГ!!!
class ProductList {
	constructor(cart){
		this.cart = cart; //имеем ссылку на карзину
		this.goods = []; //создает пустой список, который будет приходить с сервера
		this.filtered = [];
		let url = "/catalogData.json"; // указали ссылку откуда взять данные каталога!!! catalogData - это то что лежить гитхабе и внем joson с описанием товара
		this.getJson(url)
            .then(data => this.handleData(data)); // результат того что вернул метод getJson then результат того что вернул гетджейсон и что то с ним дальше делает
		this._init();
		
	}
	getJson(url) {
        return fetch(`${API + url}`) //возврат результат
            .then(result => result.json())  //.then function(result){return result.json} если все ок то возвращаем данные в формате джейсон и result.json
            .catch(error => {
                console.log(error);
            })
    }
	// метод который будет превращать данные из объекта в элементы каталога
	handleData(data) {  
        //this.goods = [...data]; // отсюда идет запалнение goods 
		for(let elem of data){ 
			let product = new ProductItem(elem) // циклом фор мы перебираем элементы массива и создаем экземпляр класса ProductItem с параметром объектов(elem)
			this.goods.push(product); //сохраняй в массив goods созданные объекты
		}
		//console.log(this.goods);
        this.render();// отрисовка элементов каталога на страеицу html
    }
	render() { //для отрисовки
        const block = document.querySelector('.products');
        for (let product of this.goods) {
            block.insertAdjacentHTML('beforeend', product.render());//beforeend вставляет блок html который приходит из product.render
        }
    }
	//Метод который по событию клик по кнопке товара назначает метод корзины addProduct
	_init() {
        document.querySelector('.products').addEventListener('click', e => {
            if (e.target.classList.contains('buy-btn')) {
                this.cart.addProduct(e.target); 
            }
        });
         document.querySelector('.search-form').addEventListener('submit', e => {
            e.preventDefault();
             this.filter(document.querySelector('.search-field').value)
         })
    }
	// Метод фильтр
	filter(value) {
        const regexp = new RegExp(value, 'i'); //"ноут" как регулярное выражение
        this.filtered = this.goods.filter(product => regexp.test(product.product_name));
        this.goods.forEach(el => {
            const block = document.querySelector(`.product-item[data-id="${el.id_product}"]`);
            if (!this.filtered.includes(el)) {
                block.classList.add('invisible');
            } else {
                block.classList.remove('invisible');
            }
        })
    }
} 
//Класс корзина
class Cart {
	constructor(){
		this.goods = [];
		this._init();
		
	}
	getJson(url) {
        return fetch(`${API + url}`) //сходи на сервер по ссылке и верни результат
            .then(result => result.json())  //.then function(result){return result.json} если все ок то возвращаем данные в формате джейсон и result.json
            .catch(error => {
                console.log(error);
            })
    }
	//Метод добавления товаров
	addProduct(element) {
        this.getJson("/addToBasket.json")//проверяет на сервере  есть ли в наличии такой товар 
            .then(data => {
                if (data.result === 1) {
					let productId = +element.dataset['id']; // Создаем переменную и присваеваем id товара с которого была нажата кнопка (+element переводит из строки в число)
					//кусок кода обнавления количества
					let isFound = false;  // флаг который будет менять значение если найдем товар
					for(let i = 0; i < this.goods.length;i++){ // цикл
						if (this.goods[i].id_product === productId){
							this.goods[i].quantity++;
							isFound = true;
						}
					}
						
					if (isFound != true){
					let cartElemParams = {
											id_product: productId,
											price: +element.dataset['price'],
											product_name: element.dataset['name'],
											quantity: 1,
											}
					let cartElem = new CartItem(cartElemParams);//создаем экземпляр класса элемента карзины
					this.goods.push(cartElem);
					}
					this._updateCart();
					
					} else {
                    alert('Error');
                }
            })
    }
	
	//Метод отрисовки списков товаров в карзине
	_updateCart() { //для отрисовки
        const block = document.querySelector('.cart-block');
		let allItemsHTML = "";
        for (let cartElem of this.goods) { // перебераем элементы товара в массиве
            allItemsHTML += cartElem.render();// накапливаем html кусок для всех товаров в корзине
		block.innerHTML = allItemsHTML; // подставляет хтмл кусок в блок корзины
        }
	if (block.innerHTML === "") {
           block.innerHTML = `<p class="product-single-price">Корзина пуста</p>`
        }
    }
	//Метод для того что бы при клике на карзину отображалось что там есть 
	_init() {
        const block = document.querySelector('.cart-block');
        block.innerHTML = `<p class="product-single-price">Корзина пуста</p>`;
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector('.cart-block').classList.toggle('invisible');
        });
         document.querySelector('.cart-block').addEventListener('click', e => {
             if (e.target.classList.contains('del-btn')) {
                 this.removeProduct(e.target);
             }
         })
    }
	// Метод удаления товара
	removeProduct(element) {
        this.getJson("/deleteFromBasket.json")//проверяет на сервере  есть ли в наличии такой товар 
            .then(data => {
                if (data.result === 1) {
					let productId = +element.dataset['id']; // Создаем переменную и присваеваем id товара с которого была нажата кнопка (+element переводит из строки в число)
					//кусок кода обнавления количества
					for(let i = 0; i < this.goods.length;i++){ // цикл
						if (this.goods[i].id_product === productId){
							this.goods[i].quantity--;
							
						}
					}
						
					
					this._updateCart();
					
					} else {
                    alert('Error');
                }
            })
    }
}
//Класс элемента карзины
class CartItem extends ProductItem { // наследуемся от родителя
	constructor(el, img = 'https://aliradar.com/api/image?url=https%3A%2F%2Fae01.alicdn.com%2Fkf%2FHTB15S6pQXXXXXbNXpXXq6xXFXXXZ%2F200-x-150.jpg_480x480.jpg_Q80.jpg') { // приходит объект из которого будем заполнять свои свойства
		super (el, img) // функуия которая вызывает конструктор класса от которого хотим унаследоваться
		this.quantity = el.quantity; // количество ед.товара
	}
	render() {
		let htmlStr = "";
        if (this.quantity>0){ console.log(this.quantity)
		htmlStr = `<div class="cart-item" data-id="${this.id_product}">
            <div class="product-bio">
            <img class="img_cart_product" src="${this.img}" alt="Some image">
            <div class="product-desc">
            <p class="product-title">${this.product_name}</p>
            <p class="product-quantity">Количество: ${this.quantity}</p>
        <p class="product-single-price">${this.price} за ед.</p>
        </div>
        </div>
        <div class="right-block">
            <p class="product-price">${this.quantity * this.price} ₽</p>
            <button class="del-btn" data-id="${this.id_product}">&times;</button>
        </div>
        </div>`
		
   }
	return htmlStr;
	}
}
//создаем экземпляр класса карзина.Изначально она пустая что бы с ней потом работать
let cart = new Cart();
//создаем экземпляр то есть объект класса ProductList чтобы отобразить каталог
//он пустой та как он сам должен сходить на сервер (Иногда может принимать параметр например отобразить раздел каталога ноутбуков)
let catalog = new ProductList(cart); // список товаров он вызывает класс находит что там есть возвращает джейсон в виде обекта т что бы вывести на страницу элементы каталога 
