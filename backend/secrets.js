// secrets.js
const secrets = {
  // dbUri: process.env.DB_URI
  dbUri: "mongodb://nam21031998:nam21031998@ds113692.mlab.com:13692/mern-comment-box"
};

export const getSecret = key => secrets[key];