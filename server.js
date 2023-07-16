const net = require("net");
const type = require("./type");
const server = net.createServer();
const users = [];

server.on("connection", (clientSocket) => {
  clientSocket.on("data", (data) => {
    console.log("有人说", data.toString());
    data = JSON.parse(data.toString().trim());
    switch (data.type) {
      case type.login:
        if (users.find((item) => item.nickname === data.nickname)) {
          return clientSocket.write(
            JSON.stringify({
              type: type.login,
              success: false,
              message: "昵称已存在",
            })
          );
        }
        clientSocket.nickname = data.nickname;
        users.push(clientSocket);
        clientSocket.write(
          JSON.stringify({
            type: type.login,
            success: true,
            message: "登录成功",
            nickname: data.nickname,
            sumUsers: users.length,
          })
        );

        users.forEach((user) => {
          if (user !== clientSocket) {
            user.write(
              JSON.stringify({
                type: type.log,
                message: `${data.nickname} 进入聊天室，当前在线用户有${users.length}`,
              })
            );
          }
        });
        break;
      case type.broadcast:
        users.forEach((item) => {
          item.write(
            JSON.stringify({
              type: type.broadcast,
              nickname: clientSocket.nickname,
              message: data.message,
            })
          );
        });
        break;
      case type.p2p:
        const user = users.find((item) => item.nickname === data.nickname);
        if (!user) {
          return clientSocket.write(
            JSON.stringify({
              type: type.p2p,
              success: false,
              message: "该用户不存在",
            })
          );
        }
        user.write(
          JSON.stringify({
            type: type.p2p,
            success: true,
            nickname: clientSocket.nickname,
            message: data.message,
          })
        );
        break;
      default:
        break;
    }
  });
  clientSocket.on("end", () => {
    console.log("有人走了");
    const index = users.findIndex(
      (user) => user.nickname === clientSocket.nickname
    );
    if (index !== -1) {
      const offlinerUser = users[index];
      users.splice(index, 1);
      users.forEach((user) => {
        user.write(
          JSON.stringify({
            type: type.log,
            message: `${offlinerUser.nickname} 离开聊天室，当前在线用户有${users.length}`,
          })
        );
      });
    }
  });
});

server.listen(3000, () => console.log("Server running 127.0.0.1 3000"));
