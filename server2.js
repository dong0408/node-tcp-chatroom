const net = require("net");

const server = net.createServer();
const clinets = [];

server.on("connection", (clientSocket) => {
  clinets.push(clientSocket);
  clientSocket.on("data", (data) => {
    console.log("有人说", data.toString());
    clinets.forEach((socket) => {
      if (socket !== clientSocket) {
        socket.write(data);
      }
    });
  });

  clientSocket.write("hello");
});

server.listen(3000, () => console.log("Server running 127.0.0.1 3000"));
