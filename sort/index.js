function exchange(arr, i, j) {
	if(i === j) return
	[arr[i], arr[j]] = [arr[j], arr[i]]
}

function selectSort(arr) {
	for (let i = 0; i < arr.length; i++) {
		let min = i
		for (let j = i; j < arr.length; j++) {
			if(arr[j] < arr[min]) min = j
		}
		exchange(arr, i, min)
	}
	return arr
}
// console.log('select')
// console.log(selectSort([1,5,7,8,2,4,5,6]))

function insertSort(arr) {
	for (let i = 1; i < arr.length; i++) {
		for (let j = i;j > 0 && arr[j] < arr[j-1]; j--) {
			exchange(arr, j, j - 1)
		}
	}
	return arr
}
// console.log('insert')
// console.log(insertSort([1,5,7,8,2,4,5,6]))

function bubbleSort(arr) {
	for (let i = 0; i < arr.length; i++) {
		for (let j = 1;j < arr.length - i; j++) {
			if(arr[j - 1] > arr[j]) exchange(arr, j, j - 1)
		}
	}
	return arr
}
// console.log('bubble')
// console.log(bubbleSort([1,5,7,8,2,4,5,6]))

function fastSort(arr) {
	if(arr.length === 1) return arr
	for (let i = 1; i < arr.length; i++) {
		let l = [], r = []
		if(arr[i] < arr[0]) l.push(arr[i])
		else r.push(arr[i])
		return [...fastSort(l), arr[0], ...fastSort(r)]
	}
}
// console.log('fast')
// console.log(bubbleSort([1,5,7,8,2,4,5,6]))

class HeapSort {
	constructor(arr) {
		this.arr = arr
		this.len = arr.length
		this.build()
		for (let i = this.len - 1; i > 0; i--) {
			[arr[0], arr[i]] = [arr[i], arr[0]]
			this.adjust(0, i)//调整长度一步步缩短
		}
	}
	build() {
		for (let i = this.len / 2; i >= 0 ; i--) {
			this.adjust(i, this.len)
		}
	}
	adjust(cur, len) {
		const arr = this.arr
		const temp = arr[cur]
		let child = cur * 2 + 1
		let rChild
		while(child < len) {
			rChild = child + 1
			if(rChild < len && arr[rChild] > arr[child]) {
				child = rChild
			}
			if(arr[cur] < arr[child]) {
				arr[cur] = arr[child]
				cur = child
				child = cur * 2 + 1
				arr[cur] = temp
			}else {
				break
			}
		}
	}
}
// console.log('heap')
// console.log((new HeapSort([1,5,7,8,2,4,5,6])).arr)