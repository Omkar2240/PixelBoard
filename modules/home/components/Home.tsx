import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { socket } from "@/common/lib/socket";
import { useModal } from "@/common/recoil/modal";
import { useSetRoomId } from "@/common/recoil/room";
import NotFoundModal from "../modals/NotFound";

const Home = () => {
  const { openModal } = useModal();
  const setAtomRoomId = useSetRoomId();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    document.body.style.backgroundColor = "#f5f5f5";
  }, []);

  useEffect(() => {
    socket.on("created", (roomIdFromServer) => {
      setAtomRoomId(roomIdFromServer);
      router.push(roomIdFromServer);
    });

    const handleJoinedRoom = (roomIdFromServer: string, failed?: boolean) => {
      if (!failed) {
        setAtomRoomId(roomIdFromServer);
        router.push(roomIdFromServer);
      } else {
        openModal(<NotFoundModal id={roomId} />);
      }
    };

    socket.on("joined", handleJoinedRoom);

    return () => {
      socket.off("created");
      socket.off("joined", handleJoinedRoom);
    };
  }, [openModal, roomId, router, setAtomRoomId]);

  useEffect(() => {
    socket.emit("leave_room");
    setAtomRoomId("");
  }, [setAtomRoomId]);

  const handleCreateRoom = () => {
    socket.emit("create_room", username);
  };

  const handleJoinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId) socket.emit("join_room", roomId, username);
  };

  return (
    <div className="flex flex-col items-center py-24 text-black bg-gray-100 min-h-screen font-bold">
      <h1 className="text-5xl font-extrabold leading-tight sm:text-extra bg-black text-white px-6 py-2 rounded-md shadow-lg">
        PixelBoard
      </h1>
      <h3 className="text-xl sm:text-2xl mt-4 bg-yellow-300 px-4 py-1 rounded-md">
        Real-time whiteboard
      </h3>

      <div className="mt-10 flex flex-col gap-4 bg-white shadow-xl p-6 rounded-lg border-4 border-black">
        <label className="self-start text-lg">Enter your name</label>
        <input
          className="input border-2 border-black p-2 rounded-md"
          placeholder="Username..."
          value={username}
          onChange={(e) => setUsername(e.target.value.slice(0, 15))}
        />
      </div>

      <div className="my-8 h-px w-96 bg-black" />

      <form className="flex flex-col items-center gap-4 bg-white shadow-xl p-6 rounded-lg border-4 border-black" onSubmit={handleJoinRoom}>
        <label htmlFor="room-id" className="self-start text-lg">
          Enter room ID
        </label>
        <input
          className="input border-2 border-black p-2 rounded-md"
          id="room-id"
          placeholder="Room ID..."
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button className="btn bg-red-500 text-white px-4 py-2 rounded-md border-2 border-black hover:bg-red-600">
          Join
        </button>
      </form>

      <div className="my-8 flex w-96 items-center gap-2">
        <div className="h-px w-full bg-black" />
        <p className="text-black">or</p>
        <div className="h-px w-full bg-black" />
      </div>

      <div className="flex flex-col items-center gap-4 bg-white shadow-xl p-6 rounded-lg border-4 border-black">
        <h5 className="self-start text-lg">Create new room</h5>
        <button className="btn bg-blue-500 text-white px-4 py-2 rounded-md border-2 border-black hover:bg-blue-600" onClick={handleCreateRoom}>
          Create
        </button>
      </div>
    </div>
  );
};

export default Home;
