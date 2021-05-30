const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
function MyPromise(executor) {
    var _this = this
    this.state = PENDING //状态
    this.value = undefined //成功结果
    this.reason = undefined //失败原因

    this.fulfillCallbacks = []//成功的回调
    this.rejectCallbacks = [] //失败的回调
    function resolve(value) {
        if(_this.state === PENDING){
            _this.state = FULFILLED
            _this.value = value
            _this.fulfillCallbacks.forEach(callback => callback(value))
        }
    }
    function reject(reason) {
        if(_this.state === PENDING){
            _this.state = REJECTED
            _this.reason = reason
            _this.rejectCallbacks.forEach(callback => callback(reason))
        }
    }
    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}
MyPromise.prototype.then = function (onFulfilled, onRejected) {
    /**
     * 不传回调函数时，将会把value和reason透传到下一个then
     */
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => { return value }
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    var fatherThis = this
    var newPromise = new MyPromise((resolve, reject) => {
        /**
         * 下面四段代码非常相似，但是不知为何封装不起来，一封装，测试就不通过
         */
        if(fatherThis.state === FULFILLED){
            setTimeout(()=>{
                try {
                    let callbackResult = onFulfilled(fatherThis.value)
                    resolvePromise(newPromise, callbackResult, resolve, reject)
                }catch(e) {
                    reject(e)
                }
            })
        } else if(fatherThis.state === REJECTED){
            setTimeout(()=>{
                try {
                    let callbackResult = onRejected(fatherThis.reason)
                    resolvePromise(newPromise, callbackResult, resolve, reject)
                }catch(e) {
                    reject(e)
                }
            })
        }else if(fatherThis.state === PENDING) {
            /**
             * 把这段代码添加到父promise的回调函数里
             * 当父promise执行resolve后就会在最后执行到这个函数
             * 执行父promise的回调函数并且检查返回值是否promise(严谨：类似)
             * 如果是，就会在返回的promise里注入当前resolve方法，直到可以直接执行为止
             */
            fatherThis.fulfillCallbacks.push(()=>{
                setTimeout(()=>{
                    try {
                        let callbackResult = onFulfilled(fatherThis.value)
                        resolvePromise(newPromise, callbackResult, resolve, reject)
                    }catch(e) {
                        reject(e)
                    }
                })
            })
            fatherThis.rejectCallbacks.push(()=>{
                setTimeout(()=>{
                    try {
                        let callbackResult = onRejected(fatherThis.reason)
                        resolvePromise(newPromise, callbackResult, resolve, reject)
                    }catch(e) {
                        reject(e)
                    }
                })
            })
        }
    })
    return newPromise
}
function resolvePromise(newPromise, result, resolve, reject) {
    /**
     * 返回结果是自己的引用，死循环
     */
    if (newPromise === result) return reject(new TypeError('The promise and the return value are the same'))
    
    /**
     * 这里没有直接判断 result instanceof MyPromise是因为规范的要求是拥有function类型的then属性的对象，见例1
     * 
     * 如果回调函数返回结果是一个promise，则会继续递归下去，见例2
     * resolve 是被透传下来的最外层的newPromise的
     * 
     * called：如果在回调里出错了，就会既调用fulfill，又调用reject，所以用called标记是否调用过回调。实际情况比较少见,测试就必须要加上这个逻辑
     */
    if (result === null) {
        resolve(result)
    } else if (typeof result === 'object' || typeof result === 'function') {
        var called = false
        try {
            var then = result.then
            if(typeof then !== 'function') resolve(result)
            then.call(result, newResult => {
                if (called) return
                called = true
                resolvePromise(newPromise, newResult, resolve, reject)
            }, reason => {
                if (called) return
                called = true
                reject(reason)
            })
        } catch (error) {
            if (called) return
            reject(error)
        }
    } else {
        resolve(result)
    }
}
MyPromise.resolve = (value) => {
    if(value instanceof MyPromise) return value
    return new MyPromise((resolve, reject) => {
        if(value && value.then && typeof value.then === 'function') {
            /**
             * 同样的逻辑，透传resolve和reject，但是这里不会递归
             * 同样也会出现假promise不触发下一个then
             */
            value.then(resolve, reject)
        }else {
            resolve(value)
        }
    })
}
  
  
/**
 * 单元测试要求实现方法
 */
MyPromise.deferred = function() {
    var result = {}
    result.promise = new MyPromise(function(resolve, reject){
        result.resolve = resolve
        result.reject = reject
    })
    return result
}

/**
 * 例1
 * 可以尝试伪造一个{then: ()=> {}}对象返回结果
 * 他其实会调用这个对象的then但是并没有触发下一个链式的then
 */
 Promise.resolve().then(() => {
    console.log('then1')
    return {then: () => {console.log('this is fake promise')}}
}).then(() => {
    console.log('then2')
})
//then1
//this is fake promise

/**
 * 例2
 * 可以看到这是很恶心的嵌套调用，所以then里的方法要用递归
 * 仔细想想，最终目的其实是在then3之后触发then1返回的promise
 * 所以递归里把then1的resolve一直透传下去，直到被直接调用
 */
// Promise.resolve().then(() => {
//     console.log('then1')
//     return Promise.resolve().then(() => {
//         console.log('then2')
//         return Promise.resolve().then(() => {
//             console.log('then3')
//         })
//     })
// }).then(() => {
//     console.log('then4')
// })
// then1
// then2
// then3
// then4




// let promise1 = new MyPromise(resolve => {
//     let promise2 = new MyPromise(resolve => {
//         resolve() 
//     })
//     promise2.then(() => console.log('inner then'))
//     resolve(promise2) 
// })
// promise1.then(() => console.log('outter then'))

// let a = new MyPromise(resolve => {
//     setTimeout(() => {
//         resolve(1234)
//     },0)
// })
// a.then(null).then(v => {
//     console.log(v)
// })

/**
 * 测试可以打开这个语句
 * 安装 npm install promises-aplus-tests --save
 * 设置test命令  "scripts": {"test": "promises-aplus-tests index.js"}
 * index.js为实现promise的文件,需要导出promise
 * 测试 npm run test
 */
// module.exports  = MyPromise