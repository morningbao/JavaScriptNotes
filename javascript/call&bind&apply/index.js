/**
 * 例1:apply得第二个形参表现
 */
var a = {
  foo: function(i, j, k) {
    console.log(i, j, k)
  }
}
var b = {
}
var arrObj = {
  length: 3,
  0: 1,
  // 1: 2,
  2: 3
}
a.foo.apply(b, arrObj) // 1  undefined 3







// 实现来自https://segmentfault.com/a/1190000017206223
function getGlobalObject(){
  return this;
}
function generateFunctionCode(argsArrayLength){
  /**
   * 这里拼接得结果就是  thisArg[__fn](...argsArray)
   */
  var code = 'return arguments[0][arguments[1]](';
  for(var i = 0; i < argsArrayLength; i++){
      if(i > 0){
          code += ',';
      }
      code += 'arguments[2][' + i + ']';
  }
  code += ')';
  return code;
}
Function.prototype.applyFn = function(thisArg, argsArray) {
  if(typeof this !== 'function'){
      throw new TypeError(this + ' is not a function');
  }
  if(typeof argsArray === 'undefined' || argsArray === null){
      argsArray = [];
  }
  /**
   * 这是实现规范里得其中一条规则
   * 但是非常无语，这里只要是对象，有length，以及数字下标对应得值就能顺利执行，缺了参数就变undefined
   * 完全可以限制只能是数组或者arguments
   * 见例1
   */
  if(argsArray !== new Object(argsArray)){
      throw new TypeError('CreateListFromArrayLike called on non-object');
  }
  if(typeof thisArg === 'undefined' || thisArg === null){//如果第一个形参为undefined或者null，this值为全局对象
      thisArg = getGlobalObject();
  }
  /**
   * 其他一切值会被转换为对象作为this值
   * 这个实际上会变成一个包装类,typeof结果会变为object
   */
  thisArg = new Object(thisArg);
  var __fn = '__' + new Date().getTime();//尽量造不可重复得函数名字
  var originalVal = thisArg[__fn];//避免覆盖，缓存起原值
  var hasOriginalVal = thisArg.hasOwnProperty(__fn);
  thisArg[__fn] = this;
  var code = generateFunctionCode(argsArray.length);//构造执行代码
  /**
   * new Function()运行比eval好在不容易污染作用域，但是缺点都是一样得，运行效率不好，安全性也不好
   */
  var result = (new Function(code))(thisArg, __fn, argsArray);
  /**
   * 删除属性并添加回原值
   */
  delete thisArg[__fn];
  if(hasOriginalVal){
      thisArg[__fn] = originalVal;
  }
  return result;
};
/**
 * call相似实现不再赘述
 */
Function.prototype.callFn = function(thisArg) {
  var argsArray = [];
  var argumentsLength = arguments.length;
  for(var i = 0; i < argumentsLength - 1; i++){
      argsArray[i] = arguments[i + 1];
  }
  return this.applyFn(thisArg, argsArray);
}

/**
 * 以 var foo = a.foo.bind(b, c)来分析
 * foo(d, e)
 */
Function.prototype.bindFn = function(thisArg) {
  if(typeof this !== 'function'){
      throw new TypeError(this + ' must be a function');
  }
  var self = this;//self = a.foo
  /**
   * 把绑定时b后面得参数也拿出来，当绑定后得foo执行时也添加到参数列表里
   * 也就是把c变量取出
   */
  var args = Array.prototype.slice.call(arguments, 1);
  var bound = function(){
      /**
       * foo执行时，把d, e 取出，并和c合并，此时finalArgs = [c, d, e]
       */
      var boundArgs = Array.prototype.slice.call(arguments);
      var finalArgs = args.concat(boundArgs);
      /**
       * 这个判断不准确，因为当方法用apply、call来调用并传入一个先new出来的bound对象，就失效了，见例2
       * 可以用   new.target === bound 判断
       */
      if(this instanceof bound){//new 调用
        /**
         * 见例2，new调用时this会指向原函数的原型
         */
        var newThis = Object.create(self.prototype);
        /**
         * 绑定this并执行原函数
         */
        var result = self.apply(newThis, finalArgs);
        if(['object','function'].indexOf(typeof result) > -1 && result !== null){
            return result;
        }
        return this;
      } else {
          /**
           * apply修改this指向，把两个函数的参数合并传给self函数，并执行self函数，返回执行结果
           */
          return self.apply(thisArg, finalArgs);
      }
  };
  return bound;
}

/**
 * 例2:bind 返回得函数，new调用的this指向原函数的原型,与b已无关系
 */
 a.Foo = function () {
  console.log(this)
  console.log(this.__proto__ === a.Foo.prototype) 
}
var Foo = a.Foo.bind(b)
var c = new Foo() // true
Foo.apply(c) // false


var Foo2 = a.Foo.bindFn(b)
var d = new Foo2() // true
Foo2.apply(d) // true 这里是因为没办法判断new调用
