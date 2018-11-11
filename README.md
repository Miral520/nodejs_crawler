# nodejs_crawler
Using nodejs to make a crawler for downloading some picture from a website

安装依赖
```js
npm install --save
```

使用
```js
node server.js url target targetAttr hasChild childTag childAttr
```

url ------------- 爬取地址(必须)  
target ---------- 需要解析的Tag所在位置,不传默认为img标签  
targetAttr ------ 需要解析标签的属性,不传默认为src属性  
hasChild -------- 布尔值,是否爬取子页面,不传默认为false  
childTag -------- 子页面图片所在标签(hasChildren值需要为true),不传默认为img标签  
childAttr ------- 子页面图片标签的的属性,不传默认为src属性  


问题:
    目前只能爬取非动态数据,如果网页中使用js获取数据,将暂时无法获取