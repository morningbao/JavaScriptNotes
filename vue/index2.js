function Vue(options) {
  this._data = options.data
  this.__ob__ = new Observer(this._data)
  this.watcher = new Watcher(this)
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


function Watcher(vm) {
  this.vm = vm
  Dep.target = this
  vm.render()
  Dep.target = null
}
Watcher.prototype.update = function() {
  this.vm.render()
}


function Dep() {
  this.subs = []//订阅列表
}
Dep.target = null
Dep.prototype.depend = function() {
  if(Dep.target) {
    this.subs.push(Dep.target)
  }
}
Dep.prototype.notify = function() {
  const subs = this.subs.slice()
  for (let i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}

function Observer(obj) {
  this.obj = obj
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
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

