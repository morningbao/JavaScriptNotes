/**
 * 词法作用域（静态作用域）
 * 根据函数定义的位置确定的作用域，与执行位置无关
 */
var value = 1;

function foo() {
    console.log(value);
}

function bar() {
    var value = 2;
    foo();
}

bar(); // 1

/**
 * 执行上下文伪代码
 */
function go() {
    var ECStack = [] //上下文栈
    var globalContext = {}
    ECStack.push(globalContext)
    initContext(globalContext)
    // ... 执行代码
    // ... 执行到function foo
    var fooContext = {}
    ECStack.push(fooContext)
    initContext(fooContext, globalContext)
    // ...执行foo
    ECStack.pop()//执行完成

}
function initContext(curContext ,lastContext) {
    var arguments = [] // 若为函数，获取函数参数
    var function_define = [], variable_define = [] // 扫描代码获得当前上下文的变量声明和函数声明
    if(!curContext) {
        var VO = {
            ...function_define,
            //例 foo: reference to function foo(){},
            ...variable_define,
            //例 a: undefined
            window: undefined
        }
        VO.window = VO //window属性指向自身
        curContext.VO = VO
        curContext.Scope = [VO]
        curContext.this = VO
    }else {
        var AO = {
            arguments: {
                ...arguments,
                length: 1
            },
            ...function_define,
            ...variable_define
        }
        var curAO = lastContext.AO || lastContext.VO
        var Scope = curAO['currentFunctionName']['[[scope]]'] // 取父级上下文里，当前方法的[[scope]]属性
        Scope.shift(AO)
        curContext.AO = AO
        curContext.Scope = Scope
        curContext.this = AO
    }
    // 初始化最后会给函数创建特殊属性 [[scope]]，指向当前上下文的Scope
    // 例 foo.[[scope]] = curContext.Scope
}

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f();
}
checkscope();
/**
 * 执行步骤分析
 * 
 * 1、创建全局执行上下文globalContext,并压入执行上下文栈ECStack = [globalContext]
 * 2、初始化全局执行上下文 globalContext:
 *      a.扫描当前上下文的变量声明 scope 和函数声明 checkscope  (注:f函数不在当前上下文)
 *      b.创建全局变量对象 VO =  {scope: undefined, checkscope: reference to function checkscope(){}}
 *      c.把VO推入作用域链 Scope = [VO]
 *      d.checkscope函数的[[scope]]属性指向当前作用域链
 * 
 * ---> var scope = "global scope";
 * 3、执行赋值代码, 把全局上下文里的变量对象的对应值修改,globalContext.VO.scope = "global scope"
 * ---> function checkscope(){...} 声明代码略过
 * 
 * ---> checkscope()
 * 4、执行checkscope 函数，创建执行上下文checkscopeContext,并压入执行上下文栈ECStack = [globalContext, checkscopeContext]
 * 5、初始化上下文 checkscopeContext
 *      a.扫描当前上下文的变量声明 scope 和函数声明 f 
 *      b.创建活动变量对象 AO =  {scope: undefined, f: reference to function f(){}}
 *      c.复制函数checkscope的[[scope]]属性也就是全局上下文里的作用域链 Scope = [globalContext.VO]
 *      d.把AO压入复制出来的作用域链的头部 Scope = [checkscopeContext.AO, globalContext.VO]
 *      e.f函数的[[scope]]属性指向当前作用域链 checkscopeContext.Scope
 * ---> var scope = "local scope"
 * 6、执行赋值代码, 把checkscope上下文里的变量对象的对应值修改,checkscopeContext.AO.scope = "local scope"
 * ---> function f(){...} 声明代码略过
 * 
 * ---> f()
 * 7、执行 f 函数，创建执行上下文fContext,并压入执行上下文栈ECStack = [globalContext, checkscopeContext, fContext]
 * 8、初始化上下文 fContext 
 *      a.创建活动变量对象 AO =  {}
 *      b.复制函数 f 的[[scope]]属性也就是checkscope上下文里的作用域链 Scope = [checkscopeContext.AO, globalContext.VO]
 *      c.把AO压入复制出来的作用域链的头部 Scope = [fContext.AO, checkscopeContext.AO, globalContext.VO]
 * ---> return scope
 * 9、按作用域链顺序寻找scope变量，fContext.AO没有，到checkscopeContext.AO找，找到值为local scope，返回
 * 10、结束执行，弹出 fContext   ECStack = [globalContext， checkscopeCtontext]
 * 
 * ---> return f()
 * 11、结束执行，弹出 checkscopeContext   ECStack = [globalContext]
 */

var scope = "global scope";
function checkscope(){
    var scope = "local scope";
    function f(){
        return scope;
    }
    return f;
}
checkscope()(); // local scope

/**
 * 执行步骤分析
 * 
 * 1、创建全局执行上下文globalContext,并压入执行上下文栈ECStack = [globalContext]
 * 2、初始化全局执行上下文 globalContext:
 *      a.扫描当前上下文的变量声明 scope 和函数声明 checkscope  (注:f函数不在当前上下文)
 *      b.创建全局变量对象 VO =  {scope: undefined, checkscope: reference to function checkscope(){}}
 *      c.把VO推入作用域链 Scope = [VO]
 *      d.checkscope函数的[[scope]]属性指向当前作用域链
 * 
 * ---> var scope = "global scope";
 * 3、执行赋值代码, 把全局上下文里的变量对象的对应值修改,globalContext.VO.scope = "global scope"
 * ---> function checkscope(){...} 声明代码略过
 * 
 * ---> checkscope()
 * 4、执行checkscope 函数，创建执行上下文checkscopeContext,并压入执行上下文栈ECStack = [globalContext, checkscopeContext]
 * 5、初始化上下文 checkscopeContext
 *      a.扫描当前上下文的变量声明 scope 和函数声明 f 
 *      b.创建活动变量对象 AO =  {scope: undefined, f: reference to function f(){}}
 *      c.复制函数checkscope的[[scope]]属性也就是全局上下文里的作用域链 Scope = [globalContext.VO]
 *      d.把AO压入复制出来的作用域链的头部 Scope = [checkscopeContext.AO, globalContext.VO]
 *      e.f函数的[[scope]]属性指向当前作用域链 checkscopeContext.Scope
 * ---> var scope = "local scope"
 * 6、执行赋值代码, 把checkscope上下文里的变量对象的对应值修改,checkscopeContext.AO.scope = "local scope"
 * ---> function f(){...} 声明代码略过
 * 
 * ---> return f
 * 7、结束执行，弹出 checkscopeContext   ECStack = [globalContext]
 * 
 * ---> checkscope()()
 * 8、执行 f 函数，创建执行上下文fContext,并压入执行上下文栈ECStack = [globalContext, fContext]
 * 9、初始化上下文 fContext  (闭包关键：[[scope]]属性引用了checkscope的作用域链，所以checkscopeContext都无法被自动释放)
 *      a.创建活动变量对象 AO =  {}
 *      b.复制函数 f 的[[scope]]属性也就是checkscope上下文里的作用域链 Scope = [checkscopeContext.AO, globalContext.VO] 
 *      c.把AO压入复制出来的作用域链的头部 Scope = [fContext.AO, checkscopeContext.AO, globalContext.VO]
 * ---> return scope
 * 10、按作用域链顺序寻找scope变量，fContext.AO没有，到checkscopeContext.AO找，找到值为local scope，返回
 * 11、结束执行，弹出 fContext   ECStack = [globalContext]
 * 
 */