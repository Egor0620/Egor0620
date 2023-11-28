const axios = require("axios");
const FormData = require('form-data');

const postPhotoUnPublish = async (url, pageId, pageAccessToken) => {
  return axios.post(
    `https://graph.facebook.com/${pageId}/photos`, '',
    {
      params: {
        'published': 'false',
        'url': url,
        'access_token': pageAccessToken
      }
    }).then((res) => res.data)
    .catch((error) => console.log(error));
}

const postVideoPublish = async (url, message, pageId, pageAccessToken, schedule) => {
  const form = new FormData();
  form.append('access_token', `${pageAccessToken}`);
  schedule && form.append('scheduled_publish_time', `${new Date(schedule).valueOf() / 1000}`);
  form.append('file_url', `${url}`);
  return axios.post(
    `https://graph.facebook.com/v16.0/${pageId}/videos`,
    form,
    {
      params: {
        published: !schedule,
        description: message
      },
      headers: {
        ...form.getHeaders()
      }
    }
  ).then((res) => res.data)
    .catch((error) => console.log(error));
}

const addPublishPostImages = async (attached, message, pageId, pageAccessToken, schedule) => {
  const params = schedule ? {
    'access_token': pageAccessToken,
    'scheduled_publish_time': new Date(schedule).valueOf() / 1000
  } : { 'access_token': pageAccessToken, };

  return axios.post(
    `https://graph.facebook.com/${pageId}/feed`,
    new URLSearchParams({
      'attached_media': `[${attached}]`,
      'debug': 'all',
      'format': 'json',
      'message': message,
      'method': 'post',
      'pretty': '0',
      'published': !schedule,
      'suppress_http_code': '1',
      'transport': 'cors'
    }),
    {
      params

    }).then((res) => res.data)
    .catch((error) => console.log(error));
}

const addPublishPost = async (message, pageId, pageAccessToken, payload, schedule) => {
  const item = {
    'message': message,
    'published': !schedule,
    'access_token': pageAccessToken,
  }
  const query = schedule ? `scheduled_publish_time=${new Date(schedule).valueOf() / 1000}&${payload}` : payload;

  return await axios
    .post(
      `https://graph.facebook.com/${pageId}/feed?message=${message}&access_token=${pageAccessToken}&published=${!schedule}&${query}`, {
      query
    }
    )
    .then((res) => res.data)
    .catch((error) => console.log(error));
}

const updatePublishPost = async (message, postId, pageAccessToken) => {
  return axios
    .post(
      `https://graph.facebook.com/${postId}?message=${message}&description=${message}&access_token=${pageAccessToken}`
    )
    .then((res) => res.data)
    .catch((error) => console.log(error));
}

const getPageById = async (pageId, accessToken) => {
  return axios
    .get(
      `https://graph.facebook.com/${pageId}?
      fields=access_token&
      access_token=${accessToken}`
    )
    .then((res) => res.data)
    .catch((error) => console.log(error));
}

const deletePublishPost = async (postId, accessToken) => {
  return axios
    .delete(
      `https://graph.facebook.com/${postId}?access_token=${accessToken}`
    )
    .then((res) => res.data)
    .catch((error) => console.log(error));
}

const getPagesFacebook = async (accountId, accessToken, payload) => {
  return axios.get(`https://graph.facebook.com/${accountId}/accounts?fields=id,name,location,access_token,emails,website,picture,about&access_token=${accessToken}&${payload}`)
    .then(res => { return res.data })
    .catch(error => console.log(error))
}

const updatePagesFacebook = async (pageId, accessToken, payload, res) => {
  return axios.post(`https://graph.facebook.com/${pageId}?access_token=${accessToken}`,
    { ...payload })
}

module.exports = {
  postPhotoUnPublish,
  addPublishPostImages,
  addPublishPost,
  updatePublishPost,
  getPageById,
  deletePublishPost,
  getPagesFacebook,
  postVideoPublish,
  updatePagesFacebook,
};
