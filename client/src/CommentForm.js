// CommentForm.js
import React from 'react';
import PropTypes from 'prop-types';

const CommentForm = props => (
  <div>
    <input
      type="text"
      name="author"
      placeholder="Your name…"
      autoComplete="off"
      value={props.author}
      onChange={props.handleChangeText}
    />
    <input
      type="text"
      name="text"
      placeholder="Say something..."
      autoComplete="off"
      value={props.text}
      onChange={props.handleChangeText}
      onKeyPress={(e) => {e.key === "Enter" ? props.handleSubmit(e) : ()=>{}}}
    />
    <button onClick={props.handleSubmit}><i className="fab fa-telegram-plane"></i></button>
  </div>
);

CommentForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChangeText: PropTypes.func.isRequired,
  text: PropTypes.string,
  author: PropTypes.string,
};

CommentForm.defaultProps = {
  text: '',
  author: '',
};

export default CommentForm;