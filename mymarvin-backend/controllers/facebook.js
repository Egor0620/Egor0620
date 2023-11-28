const User = require("../models/User");
const FacebookFeeds = require("../models/FacebookFeeds");
const payloadCtl = require("../common/callAxiosFb");
const s3Client = require("../config/s3Client");
const openAi = require("../common/openAi");
const axios = require("axios");
const TINYURL_API = 'http://tinyurl.com/api-create.php?url=';

const getPageFacebook = async (req, res) => {
  try {
    const { use } = req.user;
    const { before, after, limit = 20 } = req.query;
    const payload =
      before || after
        ? `limit=${limit}&${before ? "before=" + before : "after=" + after}`
        : `limit=${limit}`;
    const user = await User.findById(use._id).select("-password").exec();
    const pages = await payloadCtl.getPagesFacebook(user.fbAccountId, user.fbAccessToken, payload);

    pages.nextPage = pages.paging.next ? true : false;

    res.status(200).json(pages);
  } catch (error) {
    res.status(400).json({
      message: "Error: ",
      error,
    });
  }
};

const getFeeds = async (req, res) => {
  const { use } = req.user;
  const { page = 0, perPage = 10, pageId, search } = req.query;

  const where = pageId
    ? {
      $and: [{ user: require("mongodb").ObjectId(use._id) }, { pageId }],
    }
    : { user: require("mongodb").ObjectId(use._id) };

  const [facebookFeeds] = await FacebookFeeds.aggregate([
    {
      $match: search ? Object.assign({ message: { $regex: '.*' + search + '.*' } }, where) : where
    },
    {
      $facet: {
        data: [
          {
            $project: {
              _id: 1,
              message: 1,
              images: 1,
              link: 1,
              pageId: 1,
              postId: 1,
              video: 1,
              namePage: 1,
              picturePage: 1,
              isPublished: 1,
              createdAt: 1,
              updatedAt: 1,
            }
          },
          { $sort: { createdAt: -1 } },
          { $skip: +page * perPage },
          { $limit: +perPage },
        ],
        totalData: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
      },
    },
    {
      $project: {
        data: 1,
        totalData: { $arrayElemAt: ['$totalData.total', 0] }
      },
    },
  ]);

  res.status(200).json({
    data: facebookFeeds.data,
    page: +page,
    perPage: +perPage,
    totalData: facebookFeeds?.totalData || 0,
  });
};

const getRandomFeeds = async (req, res) => {
  const { limit = 10 } = req.query;
  const facebookFeeds = await FacebookFeeds.aggregate([
    {
      $project: {
        _id: 1,
        message: 1,
        images: 1,
        link: 1,
        pageId: 1,
        postId: 1,
        namePage: 1,
        picturePage: 1,
        video: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    },
    { $sample: { size: limit } },
    { $sort: { createdAt: -1 } },
  ]);
  res.status(200).json({
    data: facebookFeeds,
  });
};

const getFeedsUnPublish = async (req, res) => {
  const { use } = req.user;
  const { page = 0, perPage = 10, search } = req.query;

  const where = {
    $and: [{ user: require("mongodb").ObjectId(use._id) }, { isPublished: false }]
  };

  const [facebookFeeds] = await FacebookFeeds.aggregate([
    {
      $match: search ? Object.assign({ message: { $regex: '.*' + search + '.*' } }, where) : where
    },
    {
      $facet: {
        data: [
          {
            $project: {
              _id: 1,
              message: 1,
              images: 1,
              link: 1,
              pageId: 1,
              postId: 1,
              namePage: 1,
              picturePage: 1,
              video: 1,
              isPublished: 1,
              createdAt: 1,
              updatedAt: 1,
            }
          },
          { $sort: { createdAt: -1 } },
          { $skip: +page * perPage },
          { $limit: +perPage },
        ],
        totalData: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
            },
          },
        ],
      },
    },
    {
      $project: {
        data: 1,
        totalData: { $arrayElemAt: ['$totalData.total', 0] }
      },
    },
  ]);

  res.status(200).json({
    data: facebookFeeds.data,
    page: +page,
    perPage: +perPage,
    totalData: facebookFeeds?.totalData || 0,
  });
};

const createFeed = async (req, res) => {
  try {
    const { use } = req.user;
    const { link, message, images, pageId, video, namePage, picturePage, tone, type, visual, isPublished = false } = req.body;
    const data = {
      user: use._id,
      isPublished,
      message,
      link,
      images,
      pageId,
      video,
      tone,
      type,
      visual,
      namePage,
      picturePage,
    };

    const feed = new FacebookFeeds(data);
    await feed.save();

    await FacebookFeeds.updateMany({ pageId }, { namePage, picturePage, }).then(res => console.log("Data", res.data)).catch((err) => {
      console.log('Error: ' + err);
    });

    res.status(200).json(feed);
  } catch (error) {
    res.status(400).json({
      message: "Error: ",
      error,
    });
  }
};

const uploadFileS3 = async (req, res) => {
  try {
    const file = req.file;
    const user = req.user;
    const params = {
      Bucket: "mymarvin-storage",
      Key: `${user.ainame || "facebook"}/post_${Date.now().toString()}.${file.originalname
        .split(".")
        .pop()}`,
      Body: file.buffer,
      ACL: "public-read-write",
      ContentType: file.mimetype,
    };

    if (file) {
      s3Client.upload(params, async (err, data) => {
        if (err) {
          res.status(400).json({ error: "Error -> " + err });
        }
        res.status(200).json({ url: data.Location });
      });
    }

  } catch (error) {
    res.status(400).json({
      message: "Error: ",
      error,
    });
  }
};

const updateFeed = async (req, res) => {
  try {
    const { use } = req.user;
    const { feedId } = req.params;
    const { link, message, images, video, isFavorite, pageAccessToken } = req.body;
    const facebookFeed = await FacebookFeeds.findById({ _id: feedId, user: use._id }).exec();

    if (!facebookFeed) {
      res.status(404).json({
        message: `No posts exist with id equal to ${feedId}`,
      });
    }

    if (facebookFeed.isPublished) {
      payloadCtl.updatePublishPost(message || '', facebookFeed.postId, pageAccessToken);
    }

    if (facebookFeed.isPublished == false) {
      facebookFeed.link = link || undefined;
      facebookFeed.images = images || undefined;
      facebookFeed.video = video || undefined;
      facebookFeed.isFavorite = isFavorite || facebookFeed.isFavorite;
    }
    facebookFeed.message = message;
    facebookFeed.save();

    res.status(200).json({ isUpdate: true, data: facebookFeed });
  } catch (error) {
    res.status(400).json({
      message: "Error:",
      error,
    });
  }
}

const deleteFeed = async (req, res) => {
  try {
    const { use } = req.user;
    const { feedId } = req.params;
    const { pageAccessToken } = req.query;
    const facebookFeed = await FacebookFeeds.findById({ _id: feedId, user: use._id }).exec();
    if (!facebookFeed) {
      res.status(404).json({
        message: `No posts exist with id equal to ${postId}`,
      })
    }

    if (facebookFeed.isPublished) {
      payloadCtl.deletePublishPost(facebookFeed.postId, pageAccessToken);
    }
    await FacebookFeeds.deleteOne({ _id: facebookFeed._id });

    res.status(200).json({ isDelete: true });
  } catch (error) {
    res.status(400).json({
      error,
    });
  }
}

const publishFeedToFacebook = async (req, res) => {
  try {
    const { use } = req.user;
    const { feedId } = req.params;
    const { pageAccessToken } = req.body;
    const facebookFeed = await FacebookFeeds.findOne({ _id: feedId, user: use._id, isPublished: false }).exec();
    if (!facebookFeed) {
      res.status(404).json({ message: `No Feeds exist with id equal to ${feedId}` });
    }

    if (facebookFeed.images && facebookFeed.images.length > 0) {
      publishImageFacebook(facebookFeed.images, facebookFeed.message || '', facebookFeed.pageId, pageAccessToken, facebookFeed._id);
    } else if (facebookFeed.video) {
      publishVideoFacebook(facebookFeed.video, facebookFeed.message || '', facebookFeed.pageId, pageAccessToken, facebookFeed._id);
    } else {
      const payload = facebookFeed.link ? `link=${facebookFeed.link}` : '';
      publishPostFacebook(facebookFeed.message || '', facebookFeed.pageId, pageAccessToken, payload, facebookFeed._id);
    }
    res.status(200).json({ message: 'Posted successfully' });
  } catch (error) {
    res.status(400).json({ error });
  }
}

const publishImageFacebook = async (images, message, pageId, pageAccessToken, feedId, schedule) => {
  let attached = [];
  for (const item of images) {
    const response = await payloadCtl.postPhotoUnPublish(item, pageId, pageAccessToken);
    const payload = { "media_fbid": `${response.id}` };
    attached.push(JSON.stringify(payload));
  }

  const response = await payloadCtl.addPublishPostImages(attached, message, pageId, pageAccessToken, schedule);
  const item = { postId: response.id, isPublished: true };
  await FacebookFeeds.updateOne({ _id: feedId }, schedule ? Object.assign(item, { scheduleAt: new Date(schedule) },) : item).then().catch((err) => {
    console.log('Error: ' + err);
  });
}

const publishVideoFacebook = async (url, message, pageId, pageAccessToken, feedId, schedule) => {
  const response = await payloadCtl.postVideoPublish(url, message, pageId, pageAccessToken, schedule);
  const item = { postId: response.id, isPublished: true };

  await FacebookFeeds.updateOne({ _id: feedId }, schedule ? Object.assign(item, { scheduleAt: new Date(schedule) }) : item).then().catch((err) => {
    console.log('Error: ' + err);
  });
}

const publishPostFacebook = async (message, pageId, pageAccessToken, payload, feedId, schedule) => {
  const response = await payloadCtl.addPublishPost(message, pageId, pageAccessToken, payload, schedule);
  const item = { postId: response.id, isPublished: true };
  await FacebookFeeds.updateOne({ _id: feedId }, schedule ? Object.assign(item, { scheduleAt: new Date(schedule) }) : item).then().catch((err) => {
    console.log('Error: ' + err);
  });
}

const shortLink = (longUrl) => {
  return axios.get(`${TINYURL_API}${longUrl}`).then((res) => {
    return res.data;
  });
};

const createImageByOpenAi = async (req, res) => {
  try {
    const use = req.user;
    const {
      tone,
      type,
      visual,
      content,
      feedId,
      limit = 1,
      size = "512x512",
    } = req.query;
    let newTone, newType, newVisual;

    if (feedId) {
      const facebookFeed = await FacebookFeeds.findById({ _id: feedId, user: use._id }).exec();
      newTone = facebookFeed.tone || "";
      newType = facebookFeed.type || "";
      newVisual = facebookFeed.visual || "";
    } else {
      newTone = tone;
      newType = type;
      newVisual = visual;
    }

    const prompt = `${content} themed images with tone of voice ${newTone}, Type ${newType} and Visual ${newVisual}`;
    const response = await getImagesOpenAi(prompt, limit, size);
    const url = await shortLink(response.data.data[0].url);

    res.status(200).json({
      data: { url, content }
    });
  } catch (error) {
    res.status(400).json({ error });
  }
}

const getImagesOpenAi = async (prompt, limit, size) => {
  return openAi.createImage({
    prompt,
    n: limit,
    size,
  });
}

const createSchedulePost = async (req, res) => {
  try {
    const { use } = req.user;
    const { feedId, schedule, pageAccessToken } = req.body;
    const facebookFeed = await FacebookFeeds.findOne({ _id: feedId, user: use._id, isPublished: false }).exec();
    if (!facebookFeed) {
      res.status(404).json({ message: `No Feeds exist with id equal to ${feedId}` });
    }

    const now = new Date();
    if (!(now.setMinutes(now.getMinutes() + 11) < new Date(schedule) && new Date(schedule) < now.setDate(now.getDate() + 75))) {
      res.status(400).json({ message: 'The specified scheduled publish time is invalid' });
    }

    if (facebookFeed.images && facebookFeed.images.length > 0) {
      publishImageFacebook(facebookFeed.images, facebookFeed.message || '', facebookFeed.pageId, pageAccessToken, facebookFeed._id, schedule);
    } else if (facebookFeed.video) {
      publishVideoFacebook(facebookFeed.video, facebookFeed.message || '', facebookFeed.pageId, pageAccessToken, facebookFeed._id, schedule);
    } else {
      const payload = facebookFeed.link ? `link=${facebookFeed.link}` : '';
      publishPostFacebook(facebookFeed.message || '', facebookFeed.pageId, pageAccessToken, payload, facebookFeed._id, schedule);
    }

    res.status(200).json({ message: 'Create Schedule posting successfully' });
  } catch (error) {
    res.status(400).json({ error });
  }
}

const updatePageFacebook = async (req, res) => {
  ``
  try {
    const { pageId } = req.params;
    const { phone, about, location, emails, website, pageAccessToken } = req.body;
    const payload = {
      about, location, emails, website, phone
    }
    await payloadCtl.updatePagesFacebook(pageId, pageAccessToken, payload)
      .then(res => { return res.data })
      .catch(error => { res.status(400).json({ error }) })
    res.status(200).json({ message: 'Update Page successfully' });
  } catch (error) {
    res.status(400).json({ error });
  }
}

module.exports = {
  getPageFacebook,
  getFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
  publishFeedToFacebook,
  uploadFileS3,
  getRandomFeeds,
  createImageByOpenAi,
  getFeedsUnPublish,
  createSchedulePost,
  updatePageFacebook
};
