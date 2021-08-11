function Vue(options) {
  this._data = options.data
  this.__ob__ = new Observer(this._data)//把_data设为响应式
  Dep.target = this //把当前vue对象设为收集对象
  this.render()
  Dep.target = null
}
Vue.prototype.render = function () {
  let app = document.getElementById('app')
  app.innerHTML = null
  let title = document.createElement('h4')
  title.innerText = this._data.title
  let content = document.createElement('p')
  content.innerText = this._data.content
  app.appendChild(title)
  app.appendChild(content)
}
Vue.prototype.update = function () {
  this.render()
}


function Observer(obj) {
  this.obj = obj
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {//遍历key，把属性转为响应式
    defineReactive(obj, keys[i])
  }
}
function defineReactive(obj, key) {
  let val = obj[key]
  const dep = new Dep()
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      dep.depend()
      return val
    },
    set: function reactiveSetter (newVal) {
      const value = val
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      val = newVal
      dep.notify()
    }
  })
}

function Dep() {
  this.subs = []//视图列表
}
Dep.target = null
Dep.prototype.depend = function() {//收集对应关系
  if(Dep.target) {
    this.subs.push(Dep.target)
  }
}
Dep.prototype.notify = function() {//通知视图更新
  const subs = this.subs.slice()
  console.log(subs)
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}