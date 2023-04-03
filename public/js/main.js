const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");
const socket = io();

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);
//emit user and room details to server
socket.emit("joinRoom", { username, room });

//get users and room
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//message from server
socket.on("message", (message) => {
  console.log(message);
  //output message to DOM
  outputMessage(message);

  //scroll to bottom of page
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  //get message from client form
  const msg = e.target.elements.msg.value;

  //emit message to server
  socket.emit("chatMessage", msg);

  //clear input and focus
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

//output message to DOM function
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = ` 
            <p class="meta">${message.username} <span>${message.time}</span></p>
            <p class="text">
            ${message.text}
            </p>
          `;
  chatMessages.appendChild(div);
}

//output room name
function outputRoomName(room) {
  roomName.innerText = room;
}
function outputUsers(users) {
  usersList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
