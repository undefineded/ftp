// var mysql = require('mysql');
const fs = require('fs');
const express = require('express');
const app = express();
const multer = require('multer');//文件流接收文件
const path = require('path');
const ejs = require('ejs');
const nodeCmd = require('node-cmd');
// var gm = require('gm').subClass({imageMagick: true});//图片压缩c#库
const bodyParser = require('body-parser');
// var nodemailer  = require('nodemailer');//发邮件引用
const iconv = require('iconv-lite');//utf-8转gbk
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.set('views', './public');
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.get('/', function (req, res) {
  res.render('index');
});
app.get('/download', function (req, res) {
  res.render('download');
});
let catPath = '/public/file/'

function reName(fileBeforeName, fileLastName) {
  let checkDir = fs.existsSync('.' + catPath + fileBeforeName + '.' + fileLastName)
  // console.log('.'+catPath+fileBeforeName+'.'+fileLastName)
  // console.log(checkDir)
  if (checkDir) {
    return fileBeforeName.replace(/%2f/g,'').replace(/%2F/g,'') + Date.now() + '.' + fileLastName
  } else {
    return fileBeforeName.replace(/%2f/g,'').replace(/%2F/g,'') + '.' + fileLastName
  }
}

let storage = multer.diskStorage({
  destination(req, res, cb) {
    cb(null, '.' + catPath);
  },
  filename(req, file, cb) {
    // console.log(file)
    const filenameArr = file.originalname.split('.');
    let fileBeforeName = ''
    for (let i = 0; i < filenameArr.length - 1; i++) {
      fileBeforeName += filenameArr[i]
    }
    let allName = reName(fileBeforeName, filenameArr[filenameArr.length - 1])
    console.log(allName)
    cb(null, allName);
  }
});

let upload = multer({storage});

app.post('/upload', upload.single('avatar'), (req, res) => {
  res.send('success');
});

app.post('/mkdir', function (req, res) {
  let mkName = './public' + req.body.name
  fs.mkdir(mkName, function (err) {
    if (err) {
      res.send({'code': 500, 'data': '创建失败'});
      return
    }
    res.send({'code': 200, 'data': ''});
  });
})

app.post('/delFile', function (req, res) {
  let filepath ='./public/' + req.body.filepath
  fs.unlink(filepath, function(err){
    if(err){
      console.log(err)
      res.send({'code': 500, 'data': '删除失败'});
      return
    }
    res.send({'code': 200, 'data': ''});
  })
})

let filepath =''
app.post('/delDir', function (req, res) {
  filepath ='./public/' + req.body.filepath
  // console.log(filepath)
  deleteall(filepath,res)
})
function deleteall(path,res) {
  var files = [];
  if(fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function(file) {
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteall(curPath,res);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    })
    fs.rmdirSync(path);
    if( filepath === path ){
      res.send({'code': 200, 'data': ''});
    }
  }else {
    console.log('失败')
  }
}
app.post('/fileList', function (req, res) {
  let __path = __dirname + '/public/' + req.body.path
  fs.readdir(__path, function (err, files) {
    if (err) {
      console.log(err)
      res.send({'code': 404, 'data': 'no such file'})
      return
    }
    catPath = '/public' + req.body.path + '/'
    storage = multer.diskStorage({
      destination(req, res, cb) {
        cb(null, '.' + catPath);
      },
      filename(req, file, cb) {
        console.log(file)
        const filenameArr = file.originalname.split('.');
        let fileBeforeName = ''
        for (let i = 0; i < filenameArr.length - 1; i++) {
          fileBeforeName += filenameArr[i]
        }
        let allName = reName(fileBeforeName, filenameArr[filenameArr.length - 1])
        console.log(allName)
        cb(null, allName);
      }
    });
    upload = multer({storage});
    let listArr = []
    files.forEach(function (item) {
      let fPath = path.join(__path, item);
      let stat = fs.statSync(fPath);
      if (stat.isDirectory() === true) {
        listArr.push({
          state: 'directory',
          file: item
        })
      }
      if (stat.isFile() === true) {
        listArr.push({
          state: 'file',
          file: item
        })
      }
    })
    res.send({'code': 200, 'data': listArr})
  });
});
let readArr = ['vue','txt','js','json','ini','log']
app.post('/readFile', function (req, res) {
  let filepath ='./public/' + req.body.filepath
  let _filePath = req.body.filepath.split('.')
  // let flg = false
  // for(let i = 0;i<readArr.length;i++){
  //   if(_filePath[_filePath.length-1]===readArr[i]){
  //     flg = true
  //   }
  // }
  if(readArr.indexOf(_filePath[_filePath.length-1])!==-1){
    fs.readFile(filepath,(err, data) => {
      if (err) {
        res.send({'code': 500, 'data': '读取失败'});
        return
      }
      if(req.body.format.toLowerCase()==='utf-8'){
        res.send({'code': 200, 'data': data.toString()});
      }else {
        res.send({'code': 200, 'data': iconv.decode(data,'gbk')});
      }
    });
  }else {
    res.send({'code': 500, 'data': '不支持的文件格式'});
  }
})


app.post('/readFile.love', function (req, res) {
  res.send({'code': 200, 'data': '我是一个接口'});
})

// nodeCmd.get(
//   'notepad',//画图板
//   function(data){
//     console.log(data)
//   }
// );
// nodeCmd.run('touch example.created.file');
// nodeCmd.get(
//   'C:\\Users\\Administrator\\AppData\\Local\\youdao\\dict\\Application\\YoudaoDict.exe',
//   function(data){
//     console.log(data)
//   })
// nodeCmd.run('ipconfig');

app.listen(8880, function () {
  console.log('服务启动-----------8880')
});
