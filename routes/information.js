var express = require("express");
var mysql = require("mysql");
var router = express.Router();
var pool = mysql.createPool({
	host:"localhost",
	user:"root",
	password:"lining",
	database:'information',
	port:"3306"
});
//列表信息
router.get("/list",function(req,res){
	getAllUsers(function(err,results){
        if(err){
            res.send(err);
        }else if(results){
            res.send(results);
        }
    })

});
//详情
router.get('/confim',function(req,res){
    var sid = req.param('id')
    getUserById(sid,function(err,results){
        if(err){
            res.send(err);
        }else if(results){
            res.send(results);
        }
    })
})
//修改信息
router.post("/modify",function(req,res){
    var uname = req.body["uname"];
    var age = req.body["age"];
    var sex = req.body["sex"];
    var edu = req.body["edu"];
    var major = req.body["major"];
    var company = req.body["company"];
    var email = req.body['email'];
    var tel = req.body['tel'];
    var uid = req.body["uid"];
    updateInterview(uname,age,sex,edu,major,company,email,tel,uid,function (err,result){ 
        if (err) {
            err = {flag:2};//更新失败
            res.send(err)
            return;
        }
        if(result.changedRows>0){
            result={flag:1};//更新成功
             res.send(result);
         }else{
            err={flag:3};//更新失败
        }
    });

})
//搜索
router.get("/search",function(req,res){
     var cont = req.param("cont");
      searchData(cont,function(err,results){
        if(err){
            res.send(err);
        }else if(results){
            res.send(results);
        }
    })
})
//添加信息
router.post("/add",function(req,res){
	var uname = req.body["uname"];
	var sex = req.body["sex"];
	var age = req.body["age"];
	var edu = req.body["edu"];
	var major = req.body["major"];
	var company = req.body["company"];
	var email = req.body["email"];
	var tel = req.body["tel"];
	getUserByName(uname, function(err,results){
		if(results!=null&&results!=''){
			res.send({flag:2});
			return;
		};
		save(uname,sex,age,edu,major,company,email,tel,function (err,result) {
            if (err) {
                res.send({flag:3})
                return;
            }
            if(result.insertId > 0){
                result={flag:1};//添加成功
                res.send(result);
            }else{
                res.send({flag:4})
                return;
            }
        });
	})
});
//删除
router.get("/del",function(req,res){
    var id=req.param("id")
    deleteById(id,function(err,results){
        if(err){
            res.send({flag:2});
        }else if(results.affectedRows>0){
            res.send({flag:1});
        }else{
            res.send({flag:3})
        }
    })
})
//分页-true
router.get('/page',function(req,res){
    var page = req.param('page')
    console.log(page)
    var total = 0;
    getPages(page,function(err,results){
        if(err){
            console.log('error!')
        }else if(results){
        total = results;
            getResults(page,function(err,results,pageSize){
                var pageNum = Math.ceil(total/pageSize);
                res.send({results,total,pageNum})

            })
        }

    })

})
//获取信息列表
function getAllUsers (callback){
    pool.getConnection(function(err, connection) {
        var getAllUsers_Sql ='select * from  information';
        connection.query(getAllUsers_Sql, function(err, result) {
            if (err) {
                console.log("getAllUsers Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
};
//通过Id获取详情
function getUserById (id,callback){
    pool.getConnection(function(err, connection) {
        var getUserById_Sql ='select * from information where uid=?';
        connection.query(getUserById_Sql,[id], function(err, result) {
            if (err) {
                console.log("getUserById Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
}
//更新数据
function updateInterview(uname,age,sex,edu,major,company,email,tel,uid,callback) {
    pool.getConnection(function(err, connection) {
        var update_Sql = "update information set uname=?,age=?,sex=?,edu=?,major=?,company=?,email=?,tel=? where uid = ?";
        connection.query(update_Sql, [uname,age,sex,edu,major,company,email,tel,uid], function (err,result) {
            if (err) {
                console.log("update_Sql Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
};
//搜索
function searchData (usn,callback){
    pool.getConnection(function(err, connection) {
        var searchData_Sql ="select * from information where uname like '%' ? '%' or tel like '%' ? '%'";
        connection.query(searchData_Sql,[usn,usn], function(err, result) {
            if (err) {
                console.log("searchData Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
};
//根据用户名查询
function getUserByName(uname, callback) {
    pool.getConnection(function(err, connection) {
        var sql = "select * from information where uname = ?";
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
function save(uname,sex,age,edu,major,company,email,tel,callback) {
    pool.getConnection(function(err, connection) {
        var sql = "insert into information (uid,uname,sex,age,edu,major,company,email,tel) values(0,?,?,?,?,?,?,?,?)";
        connection.query(sql, [uname,sex,age,edu,major,company,email,tel], function (err,result) {
            if (err) {
                console.log("insertUser_Sql Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
};
//通过Id删除
function deleteById(id,callback){
    pool.getConnection(function(err, connection) {
        var deleteById_Sql ='delete from information where uid=?';
        connection.query(deleteById_Sql,[id], function(err, result) {
            if (err) {
                console.log("deleteById Error: " + err.message);
                return;
            }
            connection.release();
            callback(err,result);
        });
    });
}
//分页
function getResults (page,callback){
    console.log('into getResults....')
    var pageSize = 17;
    var startPage = page*pageSize;
    pool.getConnection(function(err, connection) {
        var total_Sql ='select * from information limit ?,?';
        connection.query(total_Sql,[startPage,pageSize], function(err, result) {
            if (err) {
                console.log("total_Error: " + err.message);
                return;
            }
             connection.release();
            callback(err,result,pageSize);

        });
    });
}
//总条数
function getPages (page,callback){
    var total =0;
    pool.getConnection(function(err, connection) {
        var total_Sql ='select * from information';
        connection.query(total_Sql, function(err, result) {
            if (err) {
                console.log("total_Error: " + err.message);
                return;
            }
            connection.release();
            total = result.length;
            callback(err,total);

        });

    });

}
module.exports = router;