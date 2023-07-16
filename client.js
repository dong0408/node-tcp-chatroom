const net = require("net");
const type = require("./type");

let nickname = null;
const client = net.createConnection({
  host: "127.0.0.1",
  port: 3000,
});

client.on("connect", () => {
  // client.write("world");
  process.stdout.write("请输入昵称");
  process.stdin.on("data", (data) => {
    data = data.toString().trim();
    if (!nickname) {
      return client.write(
        JSON.stringify({
          type: type.login,
          nickname: data,
        })
      );
    }
    // 私聊
    const matches = /^@(\w+)\s(.+)$/.exec(data);
    if (matches) {
      return client.write(
        JSON.stringify({
          type: type.p2p,
          nickname: matches[1],
          message: matches[2],
        })
      );
    }
    // 群聊
    client.write(
      JSON.stringify({
        type: type.broadcast,
        message: data,
      })
    );
  });
});
client.on("data", (data) => {
  data = JSON.parse(data.toString().trim());
  switch (data.type) {
    case type.login:
      if (!data.success) {
        console.log(`登录失败：${data.message}`);
        process.stdout.write("请输入昵称:");
      } else {
        console.log(`登录成功，当前在线用户：${data.sumUsers}`);
        nickname = data.nickname;
      }
      break;
    case type.broadcast:
      console.log(`${data.nickname}:${data.message}`);
      break;
    case type.p2p:
      if (!data.success) {
        return console.log(`发送失败：${data.message}`);
      }
      console.log(`${data.nickname}对你说：${data.message}`);
      break;
    case type.log:
      console.log(data.message);
    default:
      console.log("未知的消息类型");
      break;
  }
});
client.on("data", (data) => {
  console.log("服务端说", data.toString());
});
