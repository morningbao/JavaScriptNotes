

/**
 * 原型链继承
 */
function prototypeExtend() {
	function Father() {}
	Father.prototype.type = 'person'
	Father.prototype.eat = () => {console.log('eat')}
	function Son() {}
	Son.prototype = new Father()
	//子类原型继承父类方法
	Son.prototype.eat() // eat
	//子类原型继承父类属性
	console.log(Son.prototype.type) // person
	//同时还可以新增子类属性方法或者改写继承后得方法而不影响父类原型
	//关键：不影响父类原型
	Son.prototype.eat = () => {console.log('son eat')}
	Son.prototype.eat() // son eat

	Son.prototype.walk = () => {console.log('son walk')}
	Son.prototype.walk() // son walk
}
// prototypeExtend()

/**
 * 借用构造函数继承（经典继承）
 */
function constructorExtend() {
	function Father(name) {
		this.name = name
	}
	function Son(name) {
		//调用父类构造方法
		Father.call(this, name)
	}

	let son = new Son('Tom')
	console.log(son.name) // Tom
}

/**
 * 组合继承，将上述两种方案组合
 */
function constructorExtend() {
	function Father(name) {
		this.name = name
	}
	Father.prototype.type = 'person'
	Father.prototype.eat = () => {console.log('eat')}
	function Son(name) {
		//调用父类构造方法
		Father.call(this, name)
	}
	Son.prototype = new Father()
}

/**
 * 原型式继承（我感觉不算继承）
 * 利用原型链特性创建一个实例，实例原型链指向传入得对象
 */
function prototypeExtend2() {
	let father = {
		name: 'Tom',
		type: 'person'
	}
	let son = Object.create(father)
	son.name = 'Tom son'
	console.log(son) // {name: 'Tom son', __proto__: {name: 'Tom', type: 'person'}}
}
// prototypeExtend2()

/**
 * 寄生继承
 * 寄生强调封装继承得过程
 * 原型式继承基础上增加方法
 */
function parasiticExtend() {
	let father = {
		name: 'Tom',
		type: 'person'
	}
	function extend(obj) {
		let clone = Object.create(obj)
		clone.say = function() {console.log('say hi')}
		return clone
	}
	let son = extend(father)
	son.say() //say hi
}
// parasiticExtend()


/**
 * 寄生组合继承
 * 大融合
 */
function finallyExtend() {
	function extend(son, father) {
		//继承原型上得属性方法
		let prototype = Object.create(father.prototype)
		prototype.constructor = son
		son.prototype = prototype
	}
	function Father(name) {
		this.name = name
	}
	Father.prototype.type = 'person'
	Father.prototype.eat = () => {console.log('eat')}
	function Son(name) {
		//调用父类构造方法
		Father.call(this, name)
	}
	extend(Son,Father)
	Son.prototype.say = () => {console.log('say hi')} //增加方法

	let son1 = new Son('Tom son1')
	console.log(son1.name) //Tom son1
	son1.say() // say hi
	console.log(son1.type) //person
	son1.eat() //eat
	let son2 = new Son('Tom son2')
	console.log(son2.name) //Tom son2
	son2.say() // say hi
	console.log(son2.type) //person
	son2.eat() //eat

}
finallyExtend()