import { Server as HttpServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { notificationEvent } from "./events";
import User, { IUser } from "../models/User";

const SECRET_KEY = process.env.JWT_SECRET!;

export const initSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {});

  io.on("connection", async (socket: Socket) => {
    console.log("A user connected: " + socket.id);

    const userId = await getUserIdFromSocket(socket);

    if (!userId) {
      console.log("Unauthorized connection attempt");
      socket.disconnect();
      return;
    }

    try {
      const user = (await User.findByIdAndUpdate(
        userId,
        { socketId: socket.id },
        { new: true, useFindAndModify: false }
      )) as (IUser & { _id: any }) | null;
      if (user) {
        console.log(
          `Updated user ${user.username} with socket ID: ${socket.id}`
        );
      } else {
        console.log("User not found");
      }
    } catch (err) {
      console.log("Error updating user with socket ID:", err);
    }

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.id);
      try {
        const user = (await User.findByIdAndUpdate(
          userId,
          { $unset: { socketId: "" } },
          { new: true, useFindAndModify: false }
        )) as (IUser & { _id: any }) | null;
        if (user) {
          console.log(`Cleared socket ID for user ${user.username}`);
        } else {
          console.log("User not found");
        }
      } catch (err) {
        console.log("Error clearing socket ID:", err);
      }
    });

    socket.on("likePost", (data) => {
      socket.broadcast.emit("notification", notificationEvent("like", data));
    });

    socket.on("commentPost", (data) => {
      socket.broadcast.emit("notification", notificationEvent("comment", data));
    });
  });

  return io;
};

const getUserIdFromSocket = async (socket: Socket): Promise<string | null> => {
  const token = socket.handshake.query.token as string;
  if (!token) {
    console.log("No token provided");
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    const user = (await User.findById(decoded.id)) as
      | (IUser & { _id: any })
      | null;

    if (!user) {
      console.log("Invalid token: User not found");
      return null;
    }

    return user._id.toString();
  } catch (err) {
    console.log("JWT verification error:", err);
    return null;
  }
};
