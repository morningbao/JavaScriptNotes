/**
 * 简单理解，this指向调用函数的对象
 */
var a = {
    b: 1,
    foo: function() {
        console.log(this.b)
    }
}
a.foo() // 1


/**
 * 强调，this只有在调用时才能确定指向
 */

var foo = a.foo
foo() // undefined

function bar() {
    console.log(this.b)
}

bar() // undefined
a.bar = bar
a.bar() // 1


/**
 * 链式访问调用指向最近的对象
 */
a = {
    b:1,
    c:{
        b: 2,
        foo: function() {
            console.log(this.b)
        }
    }
}
a.c.foo() // 2

/**
 * this与作用域链不是同一个原理，不要认为this会访问上级作用域
 */
a = {
     b:2,
     foo:function(){
         function bar(){
            console.log(this.b)
         }
         bar()
     }
 };
 a.foo() //undefined


/**
 * 闭包函数立即执行指向window，作用域问题同上
 */
a = {
    b: 1,
    foo: function() {
        return function() {
            console.log(this.b)
        }
    }
}
a.foo()() // undefined


/**
 * 闭包函数赋值对象同样可以把this指向对象(强化理解this在调用时确定指向)
 */
 a = {
    b: 1,
    foo: function() {
        return function() {
            console.log(this.b)
        }
    }
}
var c = {
    b: 2,
    foo: a.foo()
}
c.foo() // 2

/**
 * 奇怪的语法
 * 表达式相当于立即执行，所以指向window
 */
a = {
    b: 1,
    foo: function() {
        return this.b
    }
}
console.log((a.foo)()) // 1

console.log((a.foo = a.foo)()) // undefined

console.log((false || a.foo)()) // undefined

console.log((a.foo, a.foo)()) // undefined


/**
 * 高能！！！
 * 真实原理
 * 了解即可
 * 详细见https://github.com/mqyqingfeng/Blog/issues/7
 * 总结：
 * 1、this将根据函数调用时的左表达式决定，也即()左边的内容
 * 2、左表达式有不同的对应值，需要根据规范定义计算对应值，计算过程非常繁杂，建议了解即可
 * 3、对应值是Reference类型时，this会指向该Reference的基值(base value)(注，中间还有一些其他判断，这里略过)
 * 4、不符合条件的表达式，this都会指向window，严格模式为undefined
 */
