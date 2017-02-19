var express = require("express");
var mysql = require("mysql");
var router = express.Router();
var pool = mysql.createPool({
	host:"localhost",
	user:"root",
	password:"lining",
	database:'account',
	port:"3306"
});
//用户登陆
router.post("/login",function(req,res){
	var username = req.body['username']
	var password = req.body['pws']
	getUserByName(username, function(err,results){
        if(results==""||results==null){
            res.send({flag:2})//用户名不存在
            return;
        }else if(results[0].pws!=password){
            res.send({flag:3})//密码错误
            return;
        }else if(results[0].username==username&&results[0].pws==password){
            res.send({flag:1})//登录成功
            return;
        }else{
            res.send({flag:4})//登录失败
            return
        }
   })
})
//用户注册
router.post("/register",function(req,res){
	var username = req.body["username"];
	var password = req.body["pws"];
	getUserByName(username, function(err,results){
		if(results!=null&&results!=''){
			res.send({flag:2});
			return;
		};
		save(username,password,function (err,result) {
            if (err) {
                res.send({flag:3})
                return;
            }
            if(result.insertId > 0){
                result={flag:1};//注册成功
                res.send(result);
            }else{
                res.send({flag:4})
                return;
            }
        });
	})
});
//根据用户名查询
function getUserByName(uname, callback) {
    pool.getConnection(function(err, connection) {
        var sql = "select * from account where username = ?";
        connection.query(sql, [uname], function (err, result) {
            if (err) {
                console.log("getUserByName Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
};
//保存数据
function save(username,uname,callback) {
    pool.getConnection(function(err, connection) {
        var sql = "insert into account (uid,username,pws) values(0,?,?)";
        connection.query(sql, [username,uname], function (err,result) {
            if (err) {
                console.log("insertUser_Sql Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
};
module.exports = router;