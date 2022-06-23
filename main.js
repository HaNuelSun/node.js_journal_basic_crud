var http = require('http');
var fs = require('fs');
var url = require('url');
const filedirr = './data';

function create(respond){
    fs.readdir(filedirr,function(error, filelist){
        list = '';
        list = list + '<ul>'+'\n';
        for(i = 0; i<filelist.length; i++){
            list = list + `<li><a href='?id=${filelist[i]}'>${filelist[i]}</li>` + '\n';
        }
        list = list + '</ul>'+'\n';
        template=`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Journal</title>
        </head>
        <body>
            <h1><a href='/'>Journal</a></h1>
            <form action='/create_process' method="post">
            <p><input type="text" name="title"></p>
            <p><textarea name="description"></textarea></p>
            <p><input type='submit'></p>
            </form>
            ${list}
            </body>
        </html>`;
        respond.writeHead(200);
        respond.end(template);
    });
}

function view(respond){
    fs.readdir(filedirr,function(error, filelist){
        var list = '';
        list = list + '<ul>'+'\n';
        for(i = 0; i<filelist.length; i++){
            list = list + `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</li>` + '\n';
        }
        list = list + '</ul>'+'\n';
        var template=`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Journal</title>
        </head>
        <body>
            <h1><a href='/'>Journal</a></h1>
            <a href='?id=create'>create</a>
            ${list}
            </body>
        </html>`;
        respond.writeHead(200);
        respond.end(template);
    });
}

function description(respond, url){
    fs.readdir(filedirr,function(error, filelist){
        var list = '';
        list = list + '<ul>'+'\n';
        for(i = 0; i<filelist.length; i++){
            list = list + `<li><a href='/?id=${filelist[i]}'>${filelist[i]}</li>` + '\n';
        }
        list = list + '</ul>'+'\n';
        fs.readFile(`./data/${url}`, 'utf-8',function(error, content){
            var template = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Journal</title>
            </head>
            <body>
                <h1><a href='/'>Journal</a></h1>
                <h1>${url}</h1>
                <p>${content}</p>
                <a href='?id=create'>create</a>
                <p>${list}</p>
                <a href='/edit?id=${url}'>edit</a>
                <form action="/delete" method="post">
                    <input type="hidden" name="id" value="${url}">
                    <input type="submit" value="delete">
                </form>
            </body>
            </html>
            `;
            respond.writeHead(200);
            respond.end(template);
        });
    });
}

function edit(respond,url){
    fs.readFile(`./data/${url}`, 'utf-8', function(error,content){
        var template = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Journal</title>
        </head>
        <body>
            <h1><a href='/'>Edit</a></h1>
            <form action='/edit_process' method="post">
            <input type="hidden" name="id" value="${url}">
            <p><input type="text" name="title" value='${url}'></p>
            <p><textarea name="description">${content}</textarea></p>
            <p><input type='submit'></p>
            </form>
        </html>`;
        respond.writeHead(200);
        respond.end(template);
    });
}

var app = http.createServer(function(request, respond){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;
    var pathname = url.parse(_url, true).pathname;
    if(pathname == '/edit'){
        edit(respond, title);
    }
    else if(pathname == '/create_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = new URLSearchParams(body);
            console.log(post.get('title'));
            fs.writeFile(`${filedirr}/${post.get('title')}`,`${post.get('description')}`,'utf-8', function(error){
                if(error){
                    console.log('error');
                }
                else{
                    console.log('saved');
                }
            });
            respond.writeHead(302, {Location: encodeURI(`/?id=${post.get('title')}`)});
            respond.end();  
        });
        
    }
    else if(pathname == '/edit_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = new URLSearchParams(body);
            var id = post.get('id');
            var title = post.get('title');
            var description = post.get('description');
            fs.rename(`${filedirr}/${id}`,`${filedirr}/${title}`,function(error){

            })
            fs.writeFile(`${filedirr}/${title}`,`${description}`,'utf-8', function(error){
                if(error){
                    console.log('error');
                }
                else{
                    console.log('saved');
                }
            });
            respond.writeHead(302, {Location: encodeURI(`/?id=${post.get('title')}`)});
            respond.end();  
        });
    }
    else if(pathname == '/delete'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = new URLSearchParams(body);
            var id = post.get('id');
            fs.unlink(`${filedirr}/${id}`, function(error){

            })
            respond.writeHead(302, {Location: '/'});
            respond.end(); 
        })
    }
    else if(pathname != '/'){
        respond.writeHead(404);
        respond.end('Not Found');
    }
    else{
        if(_url == '/'){
            view(respond);
        }
        else if(title === 'create'){
            create(respond);
        }
        else{
            description(respond,title);
        }
    }
})

app.listen(3000);