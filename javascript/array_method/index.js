/**
 * 以下代码来自
 * https://juejin.cn/post/6844903986479251464#heading-25
 */



Array.prototype.map = function(callbackFn, thisArg) {
  // 处理数组类型异常
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'map' of null or undefined");
  }
  // 处理回调类型异常
  if (Object.prototype.toString.call(callbackFn) != "[object Function]") {
    throw new TypeError(callbackFn + ' is not a function')
  }
  // 草案中提到要先转换为对象
  let O = Object(this);
  let T = thisArg;
  
  let len = O.length >>> 0;
  let A = new Array(len);
  for(let k = 0; k < len; k++) {
    // 还记得原型链那一节提到的 in 吗？in 表示在原型链查找
    // 如果用 hasOwnProperty 是有问题的，它只能找私有属性
    if (k in O) {
      let kValue = O[k];
      // 依次传入this, 当前项，当前索引，整个数组
      let mappedValue = callbackFn.call(T, kValue, k, O);
      A[k] = mappedValue;
    }
  }
  return A;
}
/**
 * 右移操作符的规范定义如下，文章里解释作用为 保证len为数字且为整数，但是没有解释为什么要用这个右移0位的操作
 * 
 * 这个操作符全名叫无符号右移操作符unsignedRightShift，规范里第一条就是把左操作数转化为无符号32位整型数ToUint32(x)
 * 所以这里是利用了这个操作符的特性，目的就是为了执行ToUint32，又不想改变原数值，所以右移0位
 * 可以用其他转换整形的方法，但是这个ToUint32是规范里所有Array相关方法里提到length时必须执行的，而且全部操作符里也就只有>>>这个操作符用到这个方法
 * 
 * 6.1.6.1.11 Number::unsignedRightShift ( x, y )
The abstract operation Number::unsignedRightShift takes arguments x (a Number) and y (a Number). It performs the following steps when called:

1. Let lnum be ! ToUint32(x).
2. Let rnum be ! ToUint32(y).
3. Let shiftCount be ℝ(rnum) modulo 32.
4. Return the result of performing a zero-filling right shift of lnum by shiftCount bits. Vacated bits are filled with zero. The mathematical value of the result is exactly representable as a 32-bit unsigned bit string.
 */

/**
 * 例1
 * 注意这个特性，会把原型链里的内容遍历出来，数组方法此特性均相同
 * 遍历的key是根据length决定的
 */
Array.prototype[1] = 2
let a = [1]
a[2] = 3
console.log(a)  //[1, empty, 3]
let b = a.map(val => val)
console.log(b) // [1,2,3]


Array.prototype.reduce  = function(callbackfn, initialValue) {
  // 处理数组类型异常
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'reduce' of null or undefined");
  }
  // 处理回调类型异常
  if (Object.prototype.toString.call(callbackfn) != "[object Function]") {
    throw new TypeError(callbackfn + ' is not a function')
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let k = 0;
  /**
   *  如果没有提供初始值，则将使用数组中的第一个元素。
   */
  let accumulator = initialValue;
  if (accumulator === undefined) {
    for(; k < len ; k++) {
      if (k in O) {
        accumulator = O[k];
        k++;
        break;
      }
    }
  }
  // 表示数组全为空  在没有初始值的空数组上调用 reduce 将报错。
  if(k === len && accumulator === undefined) 
    throw new Error('Each element of the array is empty');
  for(;k < len; k++) {
    if (k in O) {
      // 注意，核心！
      accumulator = callbackfn.call(undefined, accumulator, O[k], k, O);
    }
  }
  return accumulator;
}

Array.prototype.push = function(...items) {
  let O = Object(this);
  let len = this.length >>> 0;
  let argCount = items.length >>> 0;
  // 2 ** 53 - 1 为JS能表示的最大正整数
  // **是指数运算语法，等同于Math.pow()
  if (len + argCount > 2 ** 53 - 1) {
    throw new TypeError("The number of array is over the max value restricted!")
  }
  for(let i = 0; i < argCount; i++) {
    O[len + i] = items[i];
  }
  let newLength = len + argCount;
  O.length = newLength;
  return newLength;
}

Array.prototype.pop = function() {
  let O = Object(this);
  let len = this.length >>> 0;
  if (len === 0) {
    O.length = 0;
    return undefined;
  }
  len --;
  let value = O[len];
  delete O[len];
  O.length = len;
  return value;
}

Array.prototype.filter = function(callbackfn, thisArg) {
  // 处理数组类型异常
  if (this === null || this === undefined) {
    throw new TypeError("Cannot read property 'filter' of null or undefined");
  }
  // 处理回调类型异常
  if (Object.prototype.toString.call(callbackfn) != "[object Function]") {
    throw new TypeError(callbackfn + ' is not a function')
  }
  let O = Object(this);
  let len = O.length >>> 0;
  let resLen = 0;
  let res = [];
  for(let i = 0; i < len; i++) {
    if (i in O) {
      /**
       * 注意这个位置，虽然另外赋值了一个变量，但是如果这是一个对象的话，函数里修改了对象内的值，新旧数组的元素都会变。见例2
       * 返回的新数组和原来的数组的这一个对象是同一个
       */
      let element = O[i];
      if (callbackfn.call(thisArg, O[i], i, O)) {
        res[resLen++] = element;
      }
    }
  }
  return res;
}

/**
 * 例2
 */
let arr = [{a:1}, 2,3]
let brr = arr.filter(data => {
  if(data.a) {
    data.a = 4
  }
  return true
})
brr[3] = 5
console.log(arr) // [{a:4}, 2, 3]
console.log(brr) // [{a:4}, 2, 3, 5]


const sliceDeleteElements = (array, startIndex, deleteCount, deleteArr) => {
  for (let i = 0; i < deleteCount; i++) {
    let index = startIndex + i;
    if (index in array) {
      let current = array[index];
      deleteArr[i] = current;
    }
  }
};

const movePostElements = (array, startIndex, len, deleteCount, addElements) => {
  // 如果添加的元素和删除的元素个数相等，相当于元素的替换，数组长度不变，被删除元素后面的元素不需要挪动
  if (deleteCount === addElements.length) return;
  // 如果添加的元素和删除的元素个数不相等，则移动后面的元素
  else if(deleteCount > addElements.length) {
    // 删除的元素比新增的元素多，那么后面的元素整体向前挪动
    // 一共需要挪动 len - startIndex - deleteCount 个元素
    for (let i = startIndex + deleteCount; i < len; i++) {
      let fromIndex = i;
      // 将要挪动到的目标位置
      let toIndex = i - (deleteCount - addElements.length);
      if (fromIndex in array) {
        array[toIndex] = array[fromIndex];
      } else {
        delete array[toIndex];
      }
    }
    // 注意注意！这里我们把后面的元素向前挪，相当于数组长度减小了，需要删除冗余元素
    // 目前长度为 len + addElements - deleteCount
    for (let i = len - 1; i >= len + addElements.length - deleteCount; i --) {
      delete array[i];
    }
  } else if(deleteCount < addElements.length) {
    // 删除的元素比新增的元素少，那么后面的元素整体向后挪动
    // 思考一下: 这里为什么要从后往前遍历？从前往后会产生什么问题？
    for (let i = len - 1; i >= startIndex + deleteCount; i--) {
      let fromIndex = i;
      // 将要挪动到的目标位置
      let toIndex = i + (addElements.length - deleteCount);
      if (fromIndex in array) {
        array[toIndex] = array[fromIndex];
      } else {
        delete array[toIndex];
      }
    }
  }
};

Array.prototype.splice = function(startIndex, deleteCount, ...addElements)  {
  let argumentsLen = arguments.length;
  let array = Object(this);
  let len = array.length >>> 0;
  let deleteArr = new Array(deleteCount);

  if (startIndex < 0) //处理起始index
    startIndex =  startIndex + len > 0 ? startIndex + len: 0;
  else 
    startIndex = startIndex >= len ? len: startIndex;
  
  
  if (argumentsLen === 1) // 删除数目没有传，默认删除startIndex及后面所有的
    deleteCount = len - startIndex;
  if (deleteCount < 0) // 删除数目过小
    deleteCount = 0;
  if (deleteCount > len - startIndex) // 删除数目过大
    deleteCount = len - startIndex;

  // 判断 sealed 对象和 frozen 对象, 即 密封对象 和 冻结对象
  if (Object.isSealed(array) && deleteCount !== addElements.length) {
    throw new TypeError('the object is a sealed object!')
  } else if(Object.isFrozen(array) && (deleteCount > 0 || addElements.length > 0)) {
    throw new TypeError('the object is a frozen object!')
  }
   
  // 拷贝删除的元素
  sliceDeleteElements(array, startIndex, deleteCount, deleteArr);
  // 移动删除元素后面的元素
  movePostElements(array, startIndex, len, deleteCount, addElements);

  // 插入新元素
  for (let i = 0; i < addElements.length; i++) {
    array[startIndex + i] = addElements[i];
  }

  array.length = len - deleteCount + addElements.length;

  return deleteArr;
}