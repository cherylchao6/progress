{
  data:[
    {
      "name": "牙套",
      "category": "體態外表",
      "motivation": "變漂亮",
      "public": "0",
      "view": "21",
      "last_update": "2011.01.23",
      "picture": "bsdb.jpg",
      "datatype": [
        {
          "name": "體重",
          "unit": "kg"
        },
        {
          "name": "腰圍",
          "unit": "cm"
        },
      ],
      "diarys": [
        {
          "id": "123",
          "date": "2011-06-13",
          "content": "ssbmshnbi",
          "main_image": "dfma.jpg",
          "images": [
            "https://stylish.com/0.jpg",
            "https://stylish.com/1.jpg",
            "https://stylish.com/2.jpg"
          ],
          "datas": [
            {
              "name":"體重",
              "value":"20",
              "unit":"kg"
            },
            {
              "name":"腰圍",
              "value":"20",
              "unit":"cm"
            }
          ]
        },
        {
          "id": "123",
          "date": "2011-06-13",
          "content": "ssbmshnbi",
          "main_image": "dfma.jpg",
          "images": [
            "https://stylish.com/0.jpg",
            "https://stylish.com/1.jpg",
            "https://stylish.com/2.jpg"
          ],
          "datas": [
            {
              "name":"體重",
              "value":"20",
              "unit":"kg"
            },
            {
              "name":"腰圍",
              "value":"20",
              "unit":"cm"
            }
          ]
        }
      ]
    }
  ]
}

select contributors.user_id, trips.name FROM contributors 
    -> join trips on trips.id = contributors.trip_id
    -> ;



    `SELECT diary.id, diary.date, diary.content, diary.mood, diary.main_image, diary_images.path, diary_data.name, diary_data.value, diary_data.unit FROM diary WHERE progress_id=${progressId} JOIN diary_images ON diary_images.diary_id = diary.id JOIN diary_data ON diary_data.diary_id = diary.id`

    select s.name "Student", c.name "Course"
from student s, bridge b, course c
where b.sid = s.sid and b.cid = c.cid 

`SELECT room_user.room_id, room.name, room.image, message.msg, message.time, message.sqltime, message.status FROM room_user JOIN room ON room_user.room_id = room.id JOIN (SELECT msg, time, sqltime, status FROM message GROUP BY room_id ORDER BY sqltime DESC ) AS message ON room_user.room_id = message.room_id WHERE user=${userID} GROUP BY message.room_id ORDER BY message.sqltime DESC`
`SELECT room_user.room_id, room.name, room.image, message.msg, message.time, message.status FROM room_user JOIN room ON room_user.room_id = room.id JOIN message ON room_user.room_id = message.room_id WHERE user=${userID} GROUP BY message.room_id ORDER BY message.sqltime DESC`

message.msg, message.time, message.sqltime, message.status

`SELECT room_user.room_id, room.name, room.image, MAX(message.sqltime) AS latest_time FROM room_user JOIN room ON room_user.room_id = room.id JOIN message ON room_user.room_id = message.room_id WHERE user=${userID} GROUP BY message.room_id ORDER BY message.sqltime DESC`
`SELECT room_user.room_id, room.name, room.image, MAX(message.sqltime) AS latest_time FROM room_user JOIN room ON room_user.room_id = room.id JOIN message ON room_user.room_id = message.room_id WHERE user=${userID} GROUP BY message.room_id ORDER BY message.sqltime DESC`