Function.prototype._call = function(ctx, ...args) {
  ctx = ctx || window
  ctx.fn = this
  let result = ctx.fn(...args)
  delete ctx.fn
  return result
}
Function.prototype._apply = function(ctx,args = []) {
  ctx = ctx || window
  ctx.fn = this
  let result = ctx.fn(...args)
  delete ctx.fn
  return result
}
Function.prototype._bind = function(otherThis) {//polyfill实现
  if (typeof this !== 'function') {
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }

  var baseArgs= Array.prototype.slice.call(arguments, 1),
      baseArgsLength = baseArgs.length,
      fToBind = this,
      fNOP    = function() {},//用一个空函数中转prototype，这样做虽然可以，但是最终会多一层__proto__
      fBound  = function() {
        baseArgs.length = baseArgsLength; // reset to default base arguments
        baseArgs.push.apply(baseArgs, arguments);
        return fToBind.apply(
               fNOP.prototype.isPrototypeOf(this) ? this : otherThis, baseArgs
        );//这里判断this是否FNOP的实例主要是避免bind完后用new来调用的问题
      };

  if (this.prototype) {//意义不明，不太理解this什么时候会是Function.prototype
    // Function.prototype doesn't have a prototype property
    fNOP.prototype = this.prototype;
  }
  fBound.prototype = new fNOP();

  return fBound;
}
class Student {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  showName() {
    console.log(this.name)
  }
  getInfo() {
    return {
      name: this.name,
      age: this.age
    }
  }
}
class Teacher {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

let student = new Student('Zhang San', 16)
let teacher = new Teacher('Miss Li', 28)

student.showName._call(teacher)
Student.prototype.showName._call(teacher)
student.showName.call(teacher)
Student.prototype.showName.call(teacher)

student.showName._apply(teacher)
Student.prototype.showName._apply(teacher)
student.showName.apply(teacher)
Student.prototype.showName.apply(teacher)

student.showName._bind(teacher)()
Student.prototype.showName._bind(teacher)()
student.showName.bind(teacher)()
Student.prototype.showName.bind(teacher)()