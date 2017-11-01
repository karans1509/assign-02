const hapi = require('hapi');
const inert = require('inert');
const vision = require('vision');
const firebase = require('firebase');

// Firebase Configuration
const config = {
	databaseURL : "https://assign-firebase.firebaseio.com/"
}
firebase.initializeApp(config);

// Server Config
const server = new hapi.Server();

server.connection({
	host : 'localhost' ,
	port : 8008
});

server.start((err)=>{
	if(err) {
		console.log(err);
	}
	console.log("Server listening at "+server.info.uri);
})

server.register(vision, (err)=>{
	if(err) {
		console.log(err);
	}

	server.views({
		engines : {
			html : require('handlebars')
		},
		path : __dirname + '/templates'
	});

	server.route({
		method : 'GET',
		path : '/',
		handler : (request, reply) =>{
				let students = [];
				const db = firebase.database().ref('students');
				db.on('value', function(snapshot){
					snapshot.forEach((student)=>{
					   let item = {
						   key : student.key,
						   ID : student.val().ID,
						   name : student.val().name,
						   Stream : student.val().Stream,
						   Nationality : student.val().Nationality
					   }
					   students.push(item);
					})
					reply.view('students',{
						studentsData : students
				    });
				})		
		}
	})

	server.route({
		method : 'GET',
		path : '/{key}',
		handler : (request, reply) =>{
				let single;
				const db = firebase.database().ref('students');
				db.on('value', function(snapshot){
					snapshot.forEach((student)=>{
					   if(student.key == request.params.key){
						   let item = {
							   key : student.key,
							   ID : student.val().ID,
							   name : student.val().name,
							   Stream : student.val().Stream,
							   Nationality : student.val().Nationality
						   }
						   single = item;
					   }
					})

					reply.view('individual',{ key : single.key, name : single.name, 
					ID : single.ID, Stream : single.Stream, Nationality : single.Nationality});
				})	
		}
	})

	server.route({
		method : 'GET',
		path : '/edit/{key}',
		handler : (request, reply) => {
			let single;
			const db = firebase.database().ref('students');
			db.on('value', function(snapshot){
				snapshot.forEach((student)=>{
					if(student.key == request.params.key){
						let item = {
							key : student.key,
							ID : student.val().ID,
							name : student.val().name,
							Stream : student.val().Stream,
							Nationality : student.val().Nationality
						}
						single = item;
					}
				})
			})
		     reply.view('editing', { key : single.key, name : single.name, 
				ID : single.ID, Stream : single.Stream, Nationality : single.Nationality});
		}
	})

	server.route({
		method : 'POST',
		path : '/',
		handler : (request, reply) => {
			if(request.payload.name == null || request.payload.ID == null || request.payload.Stream == null || request.payload.Nationality == null) {
				reply.redirect().location('/');
			}
			else {
				let item = {
					name : request.payload.name,
					ID : request.payload.ID,
					Stream : request.payload.Stream,
					Nationality : request.payload.Nationality
				}
				const db = firebase.database().ref('students');
				db.push(item);
				reply.redirect().location('/');
			}
		}
	})

	server.route({
		method : 'POST' ,
		path : '/{key}',
		handler : (request, reply) => {
			const db = firebase.database().ref('students/'+request.params.key);
			db.remove();
			reply.redirect().location('/');
		}
	})

	server.route({
		method : 'POST',
		path : '/edit/{key}',
		handler : (request, reply) => {
			let item = {
				name : request.payload.name,
				ID : request.payload.ID,
				Stream : request.payload.Stream,
				Nationality : request.payload.Nationality
			}
			const db = firebase.database().ref('students/'+request.params.key);
			db.update(item);
			reply.redirect().location('/'+request.params.key);
		}
	})
})

server.register(inert, (err)=>{
	if(err){
		console.log(err);
	}
	server.route({
		method : 'GET',
		path : '/styles.css',
		handler : (request, reply)=>{
			reply.file('styles.css');
		}
	})
})
