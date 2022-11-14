var socket = io();

const usertext = document.querySelector('#userText');
const chatbox = document.querySelector(".chatbox");

let userInfo = [];

$.ajax({ 
        
  method: "POST",
  url: "/main",

}).done(function(data){
  userInfo[0] = data.nickName;
  userInfo[1] = data.gender;
  userInfo[2] = data.selfIntroduce;
  userInfo[3] = data.studentId;
  userInfo[4] = data.myHeartCount;
  userEmail = data.email;
})

$('#userText').keydown(function(e){
  if(e.keyCode == 13){
    e.preventDefault();
    if(usertext.value){
      socket.emit('broad', usertext.value, userInfo[0]);
      let list = document.createElement('p');
      list.classList.add('bubble-right');
      chatbox.appendChild(list);
      list.innerHTML=`${usertext.value}` + "(<span id='" + "nickN'" + ">" + userInfo[0] +"</span>)";
      $('#nickN').css('color','red')
      chatbox.scrollTop=chatbox.scrollHeight;
      usertext.value='';
    }
  }
})

socket.on('broad', (data, nick)=>{
  console.log(data)
  let list = document.createElement('p');
  list.classList.add('bubble-left');
  chatbox.appendChild(list);
  list.innerHTML=`${data}` + "(<span id='" + "nickN2'" + ">" + nick + "</span>)";
  $('#nickN2').css('color','red')
  chatbox.scrollTop=chatbox.scrollHeight;
})

$('#broadButton').click(function(){
  $('.card').show()
})
$('#delete').click(function(){
  $('.card').hide()
})
$('#modalButton2').click(function(){
  location.href='/main'
})

socket.on('userCount', function(data){
  $('#currentUser').text("현재 이용자 수: " + data + " 명")
})//현재 이용자 수 기록 
