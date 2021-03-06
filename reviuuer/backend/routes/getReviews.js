var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mysqlConf = require('../config.js').mysql_pool;

const fetchReviewsSpecific = (id, type, cb) => {
  mysqlConf.getConnection(function (err, connection) {
    connection.query({
      sql: 'SELECT r.*, c.name course_name ' +
           'FROM review r ' +
           'inner join course c on c.id = r.course_id ' +
           'WHERE ' + type + ' = ? ' +
           'ORDER BY r.date DESC',
      timeout: 40000, // 40s
      values: [id]
    }, function (error, results, fields) {
      connection.release();

      if(error) console.error(error);

      cb(error, results);
      console.log(results);
      return;
    });
  });
}

/* GET reviews. */
router.get('/', function(req, res) {
  var review_id = req.param('review_id');
  var course_id = req.param('course_id');

  if(course_id === undefined && review_id === undefined) {
    fetchReviewsSpecific(1, 1, (error, reviews) => {
        res.json(reviews);
      })
  } else if (course_id !== undefined && review_id === undefined) {
    fetchReviewsSpecific(course_id, 'course_id', (error, reviews) => {
      res.json(reviews);
    })
  } else if (course_id === undefined && review_id !== undefined) {
    fetchReviewsSpecific(review_id, 'r.id', (error, reviews) => {
      res.json(reviews);
    })
  }

});

module.exports = router;