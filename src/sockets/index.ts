import { Server } from 'socket.io';
import { IPost } from '../models/post';
import jwt from 'jsonwebtoken';

enum MessagesSend {
	NewPost = 'newPostCreated',
	Error = 'error',
}

enum MessagesSubscribe {
	Connection = 'connection',
}

class IServer extends Server {
	notifyOnNewPost(post: IPost) {
		this.emit(MessagesSend.NewPost, post);
	}

	onConnection() {
		return this.on(MessagesSubscribe.Connection, (socket) => {
			const token = socket.request.headers.authorization;
			if (!token) {
				socket.emit(MessagesSend.Error, 'No authorization token were provided!');
				socket.disconnect();
				return;
			}
			const payload = jwt.verify(token, process.env.JWT_SECRET_KEY!) as unknown as { id: string };
			if (!payload.id) {
				socket.emit(MessagesSend.Error, 'Not valid authorization token!');
				socket.disconnect();
				return;
			}
			console.log('New Connection: ', socket.id, ', userId: ', payload.id);
			return;
		});
	}
}

const IO = new IServer(+(process.env.PORT || 4000) + 1, { cors: { origin: '*' } });

export default IO;
