/**
 * 基础用法
 */
function Person() {}
Person.prototype.age = 0
var person1 = new Person()
console.log(person1.age) // 0

/**
 * 不是复制了一份数据，只是不存在时会到原型去查找
 */
 person1.age = 10
 console.log(person1.age) // 10
 delete person1.age
 console.log(person1.age) // 0

/**
 * 共享原型
 */
 var person2 = new Person()
 console.log(person2.age) // 0
 Person.prototype.age = 3
 console.log(person2.age) // 3
 console.log(person1.age) // 3

/**
 * 一般浏览器的实现中为对象的__proto__属性指向原型
 */
console.log(person1.__proto__ === Person.prototype) // true

/**
 * 原型中存在属性constructor指向函数
 */
 console.log(Person === Person.prototype.constructor) // true

 /**
  * 对象，本身也是实例化Object得到的
  */
var obj = {}
console.log(obj.__proto__ === Object.prototype) // true

/**
 * 感觉有个无穷套娃？不会，因为有个终点
 */
console.log(Object.prototype.__proto__) // null

/**
 * Person原型也是对象，person1可以追寻到Object的原型上
 */
Object.prototype._age = 1
console.log(person1._age) // 1

/**
 * 套娃可以自己造
 */
function Student() {}
Student.prototype = person1
var student1 = new Student()
console.log(student1.age) // 3
console.log(student1.__proto__ === person1) //true
console.log(student1.__proto__.__proto__ === Person.prototype) // true

/**
 * 奇怪的逻辑，可以不用在意,【怕乱就不要往下看】
 * 
 * 1、在js里，function本身也是对象，是Function的实例
 * 2、Object本身也是一个function
 * 3、Function本身也是一个function
 * 4、Function原型本身也是对象(傻了吧)
 * 
 * 关系图见文件夹下jpg图片
 */
function func() {}
console.log(func.__proto__ === Function.prototype) // true
console.log(Object.__proto__ === Function.prototype) // true
console.log(Function.__proto__ === Function.prototype) // true
console.log(Function.prototype.__proto__ === Object.prototype) // true
