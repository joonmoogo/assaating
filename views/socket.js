
    var socket = io();

    const myFace = document.getElementById("myFace");
    const peerFace = document.getElementById("peerFace");
    const muteBtn = document.getElementById("mute");
    const cameraBtn = document.getElementById("camera");

    let myStream;
    let muted = false;
    let cameraOff = false;
    let myPeerConnection;

    let time = 0;
    let timerId;
    let counter = 0;
    let hour,min,sec;
    let userstat = 0 // 시작하기 중지 상태임
    let roomname = null;

    let userInfo = [];
    let userEmail;

    const timer = document.querySelector('#timer')
    const timerButton = document.querySelector('#startButton');
    const longButton = document.querySelector("#longButton");
    const profileButton = document.querySelector("#profileButton");
    const ring = document.querySelector('.lds-ring');
    const chatbtn = document.querySelector("#chatBtn");
    const chatbox = document.querySelector(".chatbox");
    const usertext = document.querySelector('#userText');
    const chatBox = document.querySelector('.chatbox');


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
        console.log(data._id)
        userInfo[5] = data._id;
    })

    $('#profileButton').click(function(){
        if(time < 1){
            alert("아직 프로필을 공유할 수 없습니다")
        }
        else{
            $('.card').show()
            $('.card').draggable()
        }
    })
    $('#delete').click(function() {
        $('.card').hide()
    })
    $('#givingHeartButton').click(function(){
        socket.emit('givingHeart', roomname)
        alert('상대방에게 하트가 보내졌습니다.')
    })
    socket.on('givingHeart', function(){
        socket.emit('heart', userEmail)
        //$('#myheart').empty()
        //$('#myheart').append("내 하트: 🧡 X" + userInfo[4]+1);
        $('#myheart').load(location.href+' #myheart')
        $('#myheart2').load(location.href+' #myheart2')
        socket.emit('heartupdate',roomname,userInfo[4]+1)
        userInfo[4] += 1;
    })
    socket.on('heartupdate', function(data){
        $('#yourheartcount').empty()
        $('#yourheartcount').text("내 하트: 🧡 X" + data);
    })

    socket.on('profile', function(userInfo){
        $('#nickname').text(`닉네임: ${userInfo[0]}`);
        $('#gender').text(`성별: ${userInfo[1]}`);
        $('#selfintroduce').text(`내 소개: ${userInfo[2]}`);
        $('#studentid').text(`학번 : ${userInfo[3]}`);
        $('#yourheartcount').text(`내 하트: 🧡 X ${userInfo[4]}`);
        $('#yourImage').attr("src","/" + userInfo[5] + ".png");
    })

    $('#signup').click(function(){
        socket.emit('requestLeave',roomname);
    })
    $('#exitButton').click(function(){
        socket.emit('requestLeave',roomname);
    })  

    $(muteBtn).click(function(){
        handleMuteClick();
    })

    $(cameraBtn).click(function(){
        handleCameraClick();
    })

    timerButton.addEventListener('click', async ()=>{
        await getMedia()
        makeConnection()
        if(userstat == 0){
            // clearInterval(timerId);
            // time = 0;
            // timer.innerHTML="Time: 00:00"
            // timerId = setInterval(printTime,1000);
            // clearTimeout(time);
            
            timerButton.innerHTML= '중지'
            timerButton.classList.remove('is-success');
            timerButton.classList.add('is-warning');
            let list = document.createElement('p');
            chatbox.appendChild(list);
            list.innerHTML=`찾는중임`;
            socket.emit('requestChat',socket.id);
            ring.style.display='inline-block';
   
            userstat = 1;
        }
        else{
            // clearInterval(timerId);
            // clearTimeout(time);
            // time = 0;
            // timer.innerHTML="Time: 00:00"
            await socket.emit('requestLeave',roomname);
            timerButton.classList.remove('is-warning');
            timerButton.classList.add('is-success');
            timerButton.innerHTML ='시작하기'
            chatBox.innerHTML='';
            userstat = 0;
        }
   
    });


    socket.on('requestChat',async function(room){
        roomname = room;
        // let list = document.createElement('p');
        // chatbox.appendChild(list);
        // list.innerHTML=`${data} joined room`;
    })

    socket.on('matchingComplete',async ()=>{
        chatBox.innerHTML='매칭됐다';
        clearInterval(timerId);
               time = 0;
               timer.innerHTML="Time: 00:00"
               timerId = setInterval(printTime,1000);
               clearTimeout(time);
               ring.style.display='none';
        peerFace.muted = false;
        $('#peerFace').show()
        socket.emit('profile',roomname,userInfo)
    })

    chatbtn.addEventListener('submit',function(event){
        event.preventDefault(); // 새로고침 방지
        if(usertext.value){
        socket.emit('chat message', usertext.value,roomname,userInfo[0]);
        let list = document.createElement('p');
        list.classList.add('bubble-right');
        chatbox.appendChild(list); 
        list.innerHTML=`${usertext.value}` + "(<span>"+userInfo[0]+"</span>)";
        $('span').css('color','red');
        chatbox.scrollTop=chatbox.scrollHeight; //스크롤박스 맨 밑으로 내리는 역할
      
        usertext.value='';
      
        
        }
    }) // 채팅 받기

    socket.on('chat message',function(msg, nick){
        let list = document.createElement('p');
        list.classList.add('bubble-left');
        chatbox.appendChild(list); 
        list.innerHTML=`${msg}` + "(<span>" + nick + "</span>)";
        $('span').css("color",'red');
              usertext.value='';
   
        chatbox.scrollTop=chatbox.scrollHeight; //스크롤박스 맨 밑으로 내리는 역할
      
    })

    socket.on('leaveMessage',()=>{
        chatBox.innerHTML='대화 종료';
        timerButton.classList.remove('is-warning');
        timerButton.classList.add('is-success');
        timerButton.innerHTML ='시작하기';
        userstat=0;
        roomname=null;
         clearInterval(timerId);
           clearTimeout(time);
           time = 0;
           timer.innerHTML="Time: 00:00"
           longButton.style.display = 'none';
           longButton.removeAttribute("disabled");
           ring.style.display='none';
        myStream.getTracks().forEach((track)=>{
            track.stop()
        })
        peerFace.muted = true;
        $('#peerFace').hide()      
    })

    longButton.addEventListener('click',()=>{
        //  time -= 60;
        //  longButton.setAttribute("disabled",""); // 1분 감소버튼 누르면 disabled됨
        socket.emit('longButton',roomname); 
         
    })
    
    socket.on('longButton',()=>{
         time -= 60;
         longButton.setAttribute("disabled",""); // 1분 감소버튼 누르면 disabled됨
    })


    //webRTC에 사용되는 socket.io 연결
    socket.on('welcome', async function(){
        const offer = await myPeerConnection.createOffer();
        myPeerConnection.setLocalDescription(offer)
        console.log('sent the offer')
        socket.emit('offer', offer, roomname)
    })
    socket.on('offer', async (offer) => {
        console.log("received the offer");
        myPeerConnection.setRemoteDescription(offer);
        const answer = await myPeerConnection.createAnswer();
        myPeerConnection.setLocalDescription(answer)
        socket.emit('answer', answer, roomname);
        console.log("sent the answer")
    })
    socket.on('answer', (answer) => {
        console.log("received the answer")
        myPeerConnection.setRemoteDescription(answer);
    })
    socket.on("ice", (ice) => {
        console.log("received candidate")
        myPeerConnection.addIceCandidate(ice);
    })
    //여기까지 webRTC socket.io 연결


    /*$('#chatButton').click(function(){
        socket.emit('user-send',$('#chatInput').val())
    })
  
    socket.on('broadcast', function(data){
        console.log(data);
        $('#chatBoard').append('<div>' + data + '</div>')
    })

    socket.on('user-enter', function(data){
        $('#chatBoard').append('<div>' + data + '</div>')
    })

    socket.on('user-exit', function(data){
        $('#chatBoard').append('<div>' + data + '</div>')
    })

    /*socket.on('user-overload', function(data){
        alert(data)
        window.location.href = "/profile"
    })*/

    socket.on('userCount', function(data){
        $('#currentUser').text("현재 이용자 수: " + data + " 명")
    })//현재 이용자 수 기록 





//webRTC에서 사용되는 함수
    async function getMedia() {
        try{
            myStream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
            console.log(myStream);
            myFace.srcObject = myStream;
        }catch(e){
            console.log(e);
        }
    }

    function handleMuteClick() {
        myStream.getAudioTracks().forEach((track) => {track.enabled = !track.enabled});
        if(!muted){
            muteBtn.innerText = "Mute";
            muted = true;
        }else{
            muteBtn.innerText = "Unmute";
            muted = false;
        }
    }

    function handleCameraClick() {
        myStream.getVideoTracks().forEach((track) => {track.enabled = !track.enabled});
        if(!cameraOff){
            cameraBtn.innerText = "Camera Off"
            cameraOff = true;
        }else{
            cameraBtn.innerText = "Camera On"
            cameraOff = false;
        }
    }

    function handleIce(data){
        console.log("sent candidate")
        socket.emit("ice", data.candidate, roomname);
    }

    function handleAddStream(data){
        console.log("mystream", myStream)
        console.log("peerstream", data.stream)
        const peerFace = document.getElementById("peerFace");
        peerFace.srcObject = data.stream;
    }

    function makeConnection(){
        myPeerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                    ],
                },
            ],
        });
        myPeerConnection.addEventListener("icecandidate", handleIce);
        myPeerConnection.addEventListener("addstream", handleAddStream);
        myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
    }

    function getTimeFormatString() {
        hour = parseInt(String(time / (60 * 60)));
        min = parseInt(String((time - (hour * 60 * 60)) / 60));
        sec = time % 60;
        return "Time: " +String(min).padStart(2, '0') + ":" + String(sec).padStart(2, '0') + " => 05:00";
    }


    // 타이머 5분되면 초기화 되게 만들거임
    function printTime(){
        time++;
        timer.innerHTML = getTimeFormatString();
        if(time == 300){
            $('peerFace').hide()
            timerButton.classList.remove('is-warning'); // 색깔 놀이
            timerButton.classList.add('is-success');
            timerButton.innerHTML = '시작하기';
            clearInterval(timerId);
            timer.innerHTML="Time: 00:00";
            socket.emit('requestLeave',roomname);
            window.location.href="/profile";
            alert('방에서 퇴장되었습니다.')
        }
        if(time > 10){
            longButton.style.display = 'block'; // 1분 넘으면 1분 감소버튼 보이게
            //profileButton.style.display = 'block';
        }
        
    }
   



    


    
    
    


    



    
   

   
    


