const io=require('./index.js').io

const {VERIFY_USER , USER_CONNECTED , LOGOUT,USER_DISCONNECTED ,COMMUNITY_CHAT,MESSAGE_RECEIVED,MESSAGE_SENT,TYPING,PRIVATE_MESSAGE,NEW_CHAT_USER} = require('../Events');
 const {createUser , createMessage , createChat } = require('../Factories');
 
 let connectedUsers= {};
 let communityChat = createChat({isCommunity:true});

module.exports=function(socket){
 console.log("Socket Id: " + socket.id);   

 var sendMessageToChatFromUser;
 var sendTypingFromUser;
socket.on(VERIFY_USER, (nickname,callback) =>{
  
    if(isUser(connectedUsers,nickname)){
        callback( {isUser :true , user : null })
    }else{
        callback( {isUser :false , user : createUser({name : nickname,socketId : socket.id}) })
    }
} )

//User connects
socket.on(USER_CONNECTED,(user)=>{
user.socketId = socket.id;
connectedUsers = addUser(connectedUsers,user);
socket.user= user;
sendMessageToChatFromUser=sendMessageToChat(user.name);
sendTypingFromUser= sendTypingToChat(user.name);

io.emit(USER_CONNECTED,connectedUsers);
console.log(connectedUsers);

}
)

//User disconnects
socket.on('disconnect',()=>{
    if("user"  in socket){
        connectedUsers= removeUser(connectedUsers,socket.user.name);
        io.emit(USER_DISCONNECTED,connectedUsers);
        console.log(connectedUsers);
    }
})



//User logouts

socket.on(LOGOUT , ()=>{
    connectedUsers = removeUser(connectedUsers,socket.user.name);
    io.emit(USER_DISCONNECTED,connectedUsers);
    console.log(connectedUsers);
})

//Get Community Chat
socket.on(COMMUNITY_CHAT,(callback)=>{
    callback(communityChat);
})

//receiving a message
socket.on(MESSAGE_SENT,({chatId,message})=>{
    
   sendMessageToChatFromUser(chatId,message);
});

socket.on(TYPING,({chatId,isTyping})=>{
    
    sendTypingFromUser(chatId,isTyping);
});

socket.on(PRIVATE_MESSAGE,({receiver,sender,activeChat})=>{
   if(receiver in connectedUsers){
    const receiverSocket = connectedUsers[receiver].socketId;
       if(activeChat===null || activeChat.id===communityChat.id){

       
       const newChat = createChat({name : `${receiver}&${sender}`,users:[receiver,sender]})
      
       socket.to(receiverSocket).emit(PRIVATE_MESSAGE,newChat);
       socket.emit(PRIVATE_MESSAGE,newChat);
   }else{
      if(!(receiver in activeChat.users)){
          activeChat.users.filter(user => user in connectedUsers)
                            .map(user=>connectedUsers[user])
                            .map(user => {
                                socket.to(user.socketId).emit(NEW_CHAT_USER,{chatId : activeChat.id , newUser:receiver})
                            })
                           socket.emit(NEW_CHAT_USER,{chatId : activeChat.id , newUser:receiver});

      }
       socket.to(receiverSocket).emit(PRIVATE_MESSAGE,activeChat);
   }
}
});
}


//returns a function when someone is typing
function sendTypingToChat(user){
    return function(chatId,isTyping){
        io.emit(`${TYPING}-${chatId}`,{user, isTyping});
    };
}


//sending a message
function sendMessageToChat(sender){
    return function(chatId , message){
        io.emit(`${MESSAGE_RECEIVED}-${chatId}`,createMessage({message,sender}))
    };
}

function addUser(userList , user){

    let newList = Object.assign({},userList)
    newList[user.name]=user;

    return newList;
}

function removeUser(userList , username){
    let newList = Object.assign({},userList)
    delete newList[username];

    return newList;
}

function isUser(userList , username){
    
    return username in userList;
}

