// 参数部分
let option = process.argv.splice(2); // 命令行内获取参数集合
let path = option[0]; // 爬取地址(必须)
let targetTag = option[1] || "img"; // 需要解析的Tag所在位置,不传默认为img标签
let attribute = option[2] || "src"; // 需要解析标签的属性,不传默认为src属性
let hasChildren = option[3]; // 是否爬取子页面,不传默认为false
let childrenTag = option[4] || "img"; // 子页面图片所在标签(hasChildren值需要为true),不传默认为img标签
let childrenAttr = option[5] || "src"; // 子页面图片标签的的属性,不传默认为src属性

// 处理协议
let urlMethodList = path.split("://");
let urlMethod = urlMethodList[0]; // 获取到协议

// 判断协议类型,并调用响应的模块
const methodModule = urlMethod === "https" ? require("https") : require("http");
const cheerio = require("cheerio");
const { URL } = require("url");
const fs = require("fs");

// 文件下载部分
class fsProcess{
    constructor(html,tag){
        this.html = html; // 页面结构
        this.tag = tag; // 图片所在位置
        this.picList = []; // 图片地址集合
        this.getAllSrc();
    }
    // 获取地址集合
    getAllSrc(){
        let array = this.picList;
        let $ = cheerio.load(this.html);
        let pic = $(this.tag);
        pic.each(function () {
            let allPath;
            if (hasChildren){
                allPath = new URL($(this).attr(childrenAttr), path); // 解析地址,若为相对url,解析为绝对url
            }
            else{
                allPath = new URL($(this).attr(attribute), path); // 解析地址,若为相对url,解析为绝对url
            }
            array.push(allPath.href);
        });
    }
    // 下载图片
    download(dir){
        for (let i in this.picList) {
            methodModule.get(this.picList[i], (res) => {
                res.setEncoding("binary"); // 设置为二进制
                let content = "";
                res.on("data", data => {
                    content += data; // 拼接数据
                }).on("end", () => {
                    // 获取文件名
                    let nameList = this.picList[i].split("/");
                    let name = nameList[nameList.length - 1];
                    // 写入文件
                    fs.writeFile(dir + "/" + name, content, "binary", (err) => {
                        if (err) {
                            throw err;
                        }
                    });
                })
            })
        }
    }
}

// 获取子页面地址 
class getChildren{
    constructor(html, tag) {
        this.html = html; // 页面结构
        this.tag = tag; // 地址所在位置
        this.pathList = []; // 图片地址集合
    }
    // 获取子页面地址集合
    getAllPath() {
        let array = this.pathList;
        let $ = cheerio.load(this.html);
        let pathTag = $(this.tag);
        pathTag.each(function () {
            let allPath = new URL($(this).attr(attribute), path); // 解析地址,若为相对url,解析为绝对url
            array.push(allPath.href);
        });
        return array;
    }
}

// 获取首页或当前页数据
const promiseFn = new Promise((resolve, reject) => {
    methodModule.get(path, res => {
        let html = "";
        res.on("data", data => {
            html += data;
        });
        res.on("end", () => {
            resolve(html);
        });
    }).on("error", (e) => {
        reject(e);
        console.log("An error has happened!");
    });
});

promiseFn
// 判断是否进入子页面或直接开始下载
.then(page => {
    if (hasChildren){
        let main = new getChildren(page, targetTag);
        return main.getAllPath();
    }
    else{
        let main = new fsProcess(page, targetTag);
        main.download("src");
    }
})
// 开始下载子页面的图片
.then(arr => {
    if (arr){
        for(let i in arr){
            methodModule.get(arr[i], res => {
                let html = "";
                res.on("data", data => {
                    html += data;
                });
                res.on("end", () => {
                    let fsLoad = new fsProcess(html, childrenTag);
                    fsLoad.download("src");
                });
            }).on("error", () => {
                console.log("An error has happened!");
            });
        }
    }
    else{
        console.log("Download success!");
    }
});


// node server.js "https://www.imooc.com/course/list?c=java" ".course-card-container img"