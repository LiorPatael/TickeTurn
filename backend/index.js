const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting: ', err);
    return;
  }
  console.log('Connected to MySQL!');
});
