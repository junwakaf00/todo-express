'use strict'

const express = require('express')

let todos = [
  {
    id: 1,
    title: 'ネーム',
    completed: false
  },
  {
    id: 2,
    title: '下書き',
    completed: true
  }
]

const app = express()

app.use(express.json())

// ToDo一覧の取得
app.get('/api/todos', (req, res) => {
  if (!req.query.completed) {
    return res.json(todos)
  }
  // completedクエリパラメータを指定された場合はToDoをフィルタリング
  const completed = req.query.completed === 'true'
  res.json(todos.filter(todo => todo.completed === completed))
})

// ToDoのIDを管理する変数（仮）
let id = 2;

// ToDoの作成
app.post('/api/todos', (req, res, next) => {
  const { title } = req.body
  if (typeof title !== 'string' || !title) {
    // titleがリクエストに含まれない場合はステータスコード400(Bad Request)
    const err = new Error('title is required')
    err.statusCode = 400
    return next(err)
  }
  // ToDoの作成
  const todo = { id: id += 1, title, completed: false }
  todos.push(todo)
  // ステータスコード201(Created)で結果を返す
  res.status(201).json(todo)
})

// 指定されたIDのToDoを取得するミドルウェア
app.use('/api/todos/:id(\\d+)', (req, res, next) => {
  const targetId = Number(req.params.id)
  const todo = todos.find(todo => todo.id === targetId)
  if (!todo) {
    const err = new Error('Todo not found')
    err.statusCode = 404
    return next(err)
  }
  req.todo = todo
  next()
})

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({ error: err.message })
})

app.listen(3000)

const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })

nextApp.prepare().then(
  () => app.get('*', nextApp.getRequestHandler()),
  err => {
    console.error(err)
    process.exit(1)
  }
)
