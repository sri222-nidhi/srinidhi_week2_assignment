var http = require('http');
var fs = require('fs');
var url = require('url');
const querystring = require('querystring');
const mysql = require('mysql');
const { createPool } = require('mysql');


// Create a connection pool
const pool = createPool({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'interndb',
    connectionLimit: 10
});


http.createServer(function (req, res) {
    try {
        // console.log(a);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        if (req.url == "/")
            fs.readFile('index.html', function (err, data) {
                res.write(data);
                return res.end();
            }
            );
        else if (req.url == "/index.html")
            fs.readFile('index.html', function (err, data) {
                res.write(data);
                return res.end();
            });
        else if (req.url == "/login.html" && req.method === 'GET')
            fs.readFile('login.html', function (err, data) {
                res.write(data);
                return res.end();
            });
        else if (req.url === "/login.html" && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const formData = querystring.parse(body);
                const { username, password } = formData;
                console.log(username, password);
                const query = 'SELECT * FROM login WHERE name = ? AND password = ?';
                pool.query(query, [username, password], (err, results) => {
                    if (err) {
                        res.end('Internal Server Error');
                        return;
                    }
                    if (results.length > 0) {
                        res.end('Login successful');
                    } else {
                        res.end('Invalid credentials');
                    }
                });
            });
        }
        else if (req.url === "/registration.html" && req.method === 'GET')
            fs.readFile('registration.html', function (err, data) {
                res.write(data);
                return res.end();
            });
        else if (req.url === '/registration.html' && req.method === 'POST') {
            // Handle form submission
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const formData = querystring.parse(body);
                const { name, email, password, confirm_password } = formData;
                console.log(name, email, password, confirm_password);
                if (password == confirm_password) {
                    console.log("Is Match");

                    // Insert the data into the database
                    pool.query('INSERT INTO registration (name, email, password) VALUES (?, ?, ?)', [name, email, password], (error, results) => {
                        pool.query('INSERT INTO login (name, password) VALUES (?, ?)', [name, password], (error, results) => {
                            if (error) {
                                console.error('Error inserting into addresses table: ', error);
                                connection.rollback(() => {
                                    connection.release();
                                });
                                return;
                            }
                        });
                        if (error) {
                            console.error('Error inserting data: ', error);
                            res.end('Error inserting data');
                        } else {
                            console.log('Data inserted successfully');
                            res.end('Registration successful');
                        }

                    });
                } else {
                    res.write("Pasword Not Match");
                    fs.readFile('registration.html', function (err, data) {
                        res.write(data);
                        return res.end();
                    });
                }
            });
        }
        
        else {
            res.write("Page Not Found");
            return res.end();
        }
    }
    catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write("Page Not Found");
        return res.end();
    }
}).listen(8080);

console.log('Server running at http://127.0.0.1:8080/');
