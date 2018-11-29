// CommentBox.js
import React, { Component } from 'react';
import io from 'socket.io-client'
import 'whatwg-fetch';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import './CommentBox.css';

const server = 'http://127.0.0.1:3002';

class CommentBox extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      error: null,
      text: '',
      login: false,
      user_id: null,
      username: '',
    };
    this.pollInterval = null;
    this.socket = null;
  }

  checkLogin = () => {
    if (this.state.login) return;
    let username = prompt("Enter Username");
    let password = prompt("Enter Password");
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    })
    .then(resRaw => resRaw.json())
    .then(res => {
      if (res.message == true) {
        this.setState({
          login: true,
          user_id: res.user_id,
          username: res.username
        }, () => {
          this.start();
        })
      }
      else {
        alert('Login failed');
        this.checkLogin();
      }
    })
  }

  listener = () => {
    this.socket.removeAllListeners('message');

    this.socket.on('message', comments => {
      this.setState({data: comments})
    })
  }

  onChangeText = (e) => {
    const newState = { ...this.state };
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  }

  submitComment = (e) => {
    e.preventDefault();
    const { username, text } = this.state;
    if (!username || !text) return;
    this.socket.emit('message', {
      user_id: this.state.user_id,
      message: this.state.text
    })
    this.setState({ text: '', error: null });
  }

  submitNewComment = () => {
    const { username, text } = this.state;
    const data = [
      ...this.state.data,
      {
        username,
          text,
          _id: Date.now().toString(),
          updatedAt: new Date(),
          createdAt: new Date()
      },
    ];
    this.setState({ data });
    fetch('/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text }),
    }).then(res => res.json()).then((res) => {
      if (!res.success) this.setState({ error: res.error.message || res.error });
      else this.setState({ text: '', error: null });
      this.loadCommentsFromServer();
    });
  }

  loadCommentsFromServer = () => {
    fetch('/comments/')
      .then(data => data.json())
      .then((res) => {
        if (!res.success) this.setState({ error: res.error });
        else if (JSON.stringify(this.state.data) !== JSON.stringify(res.data)) {
          console.log(res.data)
          this.setState({ data: res.data });
        }
      });
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  }

  start() {
    this.socket = io(server, {'forceNew': true, 'transport': ['websocket']});
    this.listener();
    this.loadCommentsFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadCommentsFromServer, 60000);
    }
    this.scrollToBottom();
  }

  componentDidMount() {
    this.checkLogin();
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = null;
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="container">
        <div className="comments">
          <CommentList
            data={this.state.data} 
          />
        <div style={{ float:"left", clear: "both" }}
          ref={(el) => { this.messagesEnd = el; }}>
        </div>
        </div>
        <div className="form">
          <CommentForm
            username={this.state.username}
            text={this.state.text}
            handleChangeText={this.onChangeText}
            handleSubmit={this.submitComment}
          />
        </div>
        {this.state.error && <p>{this.state.error}</p>}
      </div>
    );
  }
}

export default CommentBox;