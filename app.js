//database stuff
var mongojs = require('mongojs')
var db = mongojs('localhost:27017/rootGame', ['account', 'progress']);

db.account.insert({username: "SecnytDev", password: "WacFoiFluEsc7749" })//Ben's account
db.account.insert({username: "", password: ""})//Rajas this is your account

//package stuff
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var nodemailer = require('nodemailer')

//important stuff for server
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
 
serv.listen(2000);
console.log("Server started.");
 

/*nodemailer stuff

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass '',
    }
});

var mailOptions = {
    from: 'rootioconfirm@gmail.com'

}

*/

//game stuff
var Entity = function () {
    var self = {
        x: 250,
        y: 250,
        spdX: 0,
        spdY: 0,
        id: "",
    }
    self.update = function () {
        self.updatePosition();
    }
    self.updatePosition = function () {
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function (pt) {
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    }
    return self;
}

var Player = function (id) {
    var self = Entity();
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random());
    self.accomplishments = {
        points: 0,
        kills: 0,
        sustenance: 0
    }; //accomplishments
    self.inventory = {
        //player inventory (will be rendered in client)

        //sustenance levels
        water: 10,
        minerals: 10,
        energy: 250,
        //new materials per unit time
        newWater: 0,
        newMinerals: 0,
        newEnergy: 0,
        //human drops
        metals: {
            mercury: 0, //used for toxins
            lead: 0,    //used for toxins
            iron: 0,
            nickel: 0,
            steel: 0     //made from iron and nickel inside a heat bulb (a type of tower that players can build)
        },
        weapons: {
            sword: 0,   //can make plant thorns (a type of tower that players can build)
            gun: 0,     //can make turrets (a type of tower that players can build)
            taser: 0,   //can make zappers (a type of tower that players can build)
            bearspray: 0,//can repel animals that want to eat players
            weedkiller: 0//can damage other players
        },
        misc: {
            battery: 0, //can make mechanical shield (like the ones in Star Wars)
            insectrepellent: 0,//can repel the nasty flies that run around the screen (extra unnecessary object)
            flashlight: 0,//can make searchlights for nighttime
            match: 0,   //can make heat bulbs (a type of tower that players can build)
            tophat: 0   //can be placed on any plant tower for decor
        }

    };//inventory
    self.update = function () {
        self.water += self.newWater;
        self.minerals += self.newMinerals;
        self.energy += self.newEnergy;
    }

    Player.list[id] = self;
    return self;




};
var isValidPassword = function (data, cb) {
    db.account.find({ username: data.username, password: data.password }, function (err, res) {
        if (res[0])
            cb(true);
        else
            cb(false);
    })   
}
var isUsernameTaken = function (data, cb) {
    db.account.find({ username: data.username }, function (err, res) {
        if (res[0])
            cb(true);
        else
            cb(false);
    })   
}
var addUser = function (data, cb) {
    db.account.insert({ username: data.username, password: data.password }, function (err) {
        cb();
    })   
}
var SOCKET_LIST = [];

var io = require('socket.io')(serv, {});
io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
});

    socket.on('signIn', function (data) {
        isValidPassword(data, function (res) {
            if (res) {
                socket.emit('signInResponse', { success: true });
            } else {
                socket.emit('signInResponse', { success: false });

            }

        })
    });

    socket.on('signUp', function (data) {
        isUsernameTaken(data, function (res) {
            if (res) {
                socket.emit('signUpResponse', { success: false });
            } else {
                addUser(data, function () {
                    socket.emit('signUpResponse', { success: true });
                });


            }

        });
    });


 