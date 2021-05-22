/**
 * 先绑定,再执行函数
 */
function Foo() {
    console.log(this.__proto__ === Foo.prototype) //true
}
var a = new Foo()


/**
 * 模拟实现 new 操作符 来自https://juejin.cn/post/6844903704663949325
 * @param  {Function} ctor [构造函数]
 * @return {Object|Function|Regex|Date|Error}      [返回结果]
 */
 function newOperator(ctor){
    if(typeof ctor !== 'function'){
      throw 'newOperator function the first param must be a function';
    }
    /**
     * 1.创建一个全新的对象
     * 2.并且执行[[Prototype]]链接
     * 3.通过`new`创建的每个对象将最终被`[[Prototype]]`链接到这个函数的`prototype`对象上。
     */
    Object.create = Object.create || function(obj){
        var F = function(){};
        F.prototype = obj;
        return new F();
    }
    var newObj = Object.create(ctor.prototype);
    /**
     * 绑定参数以及this，然后执行构造函数
     */
    var argsArr = [].slice.call(arguments, 1);
    var ctorReturnResult = ctor.apply(newObj, argsArr);
    /**
     * 除了Object类型，其他类型返回新建对象，判断要注意null以及function
     */
    if(['object','function'].indexOf(typeof ctorReturnResult) > -1 && ctorReturnResult !== null){
        return ctorReturnResult;
    }
    return newObj;
}
