@app
dynamodb-cd65

@http
/*
  method any
  src server

@static

@tables
user
  pk *String

password
  pk *String # userId

note
  pk *String  # noteId
  sk **String # userId
