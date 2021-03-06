var Media = require('./janus')
var rooms = require('./rooms')
var server = "http://125.133.241.232:8088/janus"
var opaqueId = "videoroomtest-"+Media.randomString(12);
var media = null
var roomnum = 1000
Media.init({debug: "all", callback: () => {
    console.log('ho')
    media = Media.create({
        server: server,
        success: ()=>{
            media.attach({
                plugin: "janus.plugin.videoroom",
                opaqueId: opaqueId,
                success: (pluginHandle)=>{
                    sfutest = pluginHandle;
					console.log("Plugin attached! (" + sfutest.getPlugin() + ", id=" + sfutest.getId() + ")");
				    Media.event = media.customEvent;
                    Media.session = sfutest.getId();
                },
                onmessage: function(msg, jsep) {
                    var event = msg["videoroom"];
                    if(msg["error"] !== undefined && msg["error"] !== null) {
                        console.log("error in message")
                    } else if(event != undefined && event != null) {
                        if(event === "event") {
                            
                        }
                    }
                    //list room
                    else if(msg["list"]!=undefined){
                        var register = { "request": "list" }
                        sfutest.send({"message": register, "success":(data)=>{
                            console.log(data)
                        }});

                    //create room
                    }
                    else if(msg["listparticipants"]!=undefined){
                        var room;
                        if(msg["room"]==undefined)
                            return;
                        else
                            room=msg["room"]
                        var register = {
                             "request": "listparticipants",
                             "room" : room
                        }

                        sfutest.send({"message": register, "success":(data)=>{
                            console.log(data)
                        }});

                    }
                    else if(msg["create"]!=undefined){
                        var roomNumber;
                        var description;
                        var bitrate;

                        if(msg["room"]==undefined || msg["roomNumber"]<0){
                            return;
                        }
                        if(msg["description"]==undefined){
                            return;
                        }
                        if(msg["bitrate"]==undefined || msg["bitrate"]<64000){
                            msg["bitrate"] = "1000000";
                        }

                        var register = {
                            "request": "create",
                            "room" : Number(msg["room"]),
                            "description" : msg["description"],
                            "is_private" : false,
                            "max_publishers": 3,
                            "bitrate": Number(msg["bitrate"]),
                            "record": false
                        }

                        sfutest.send({"message": register, "success":(data)=>{
                            console.log("create! " + msg["room"])
                        }});
                    }
                    else if(msg["updateroom"]!=undefined){
                        var register = { "request": "list" }
                        console.log('update room list')

                        sfutest.send({"message": register, "success":(data)=>{
                            for ( var room in data.list){
                                rooms[data.list[room].room] = {}
                                Object.assign(rooms[data.list[room].room],{}, {"description":data.list[room].description})
                                register = {
                                    "request": "listparticipants",
                                    "room" : data.list[room].room
                                }
                                sfutest.send({"message": register, "success":(data)=>{
                                    var publisher = data.participants[0];
                                    if(publisher == undefined){
                                        Object.assign(rooms[data.room],{},rooms[data.room], {id:0})
                                    }
                                    else{
                                        if(rooms[publisher.id]==undefined){
                                           Object.assign(rooms[data.room],{},rooms[data.room], {id:publisher.id})
                                        }
                                    }
                                }});
                            }
                        }});
                    }

                    else {
                            // What has just happened?
                    }
                },
                error: (error) =>{
                    console.log("error attaching plugin..." + error)
                }
            })
        },
        error: function(error) {
            console.log("error initializing..."+error)
		},
		destroyed: function() {
            console.log("destroyed")
		}
    })
}})

module.exports = Media
