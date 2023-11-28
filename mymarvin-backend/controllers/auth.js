const User = require("../models/User");
const Room = require("../models/Room");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("../common/sendMail");
const s3Client = require("../config/s3Client");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require('uuid');

var axios = require('axios')
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const AWS = require("aws-sdk");

// const s3Client = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY,
//   secretAccessKey: process.env.AWS_SECRET_KEY,
//   region: "us-east-1",
// });

const uploadParams = {
  Bucket: "mymarvin-storage",
  Key: "", // pass key
  Body: null, // pass file body
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) {
      res.status(400).json({
        message: "Not found user",
      });
    } else {
      // check password
      const checkPassword = await bcrypt.compareSync(password, user.password);
      console.log(">>checkPassword: ", checkPassword);
      if (!checkPassword) {
        res.status(403).json({
          message: "Password incorrect",
        });
      } else {
        // create token
        const token = jwt.sign(
          {
            use: {
              _id: user._id,
              email: user.email,
            },
          },
          process.env.JWT_SECRET
        );

        res.status(200).json({
          _id: user._id,
          email: user.email,
          ainame: user.ainame,
          firstName: user.firstName,
          lastName: user.lastName,
          verify: user.verify,
          token,
        });
      }
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Login failed",
    });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    // check email available
    const checkEmail = await User.findOne({ email }).exec();
    console.log("checkEmail: ", checkEmail);
    if (!checkEmail) {
      const user = new User({ email, password, firstName, lastName });
      await user.save();

      // send email verify account
      const token = jwt.sign(
        {
          use: {
            _id: user._id,
            email: user.email,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      const url = `${process.env.BACKEND_URL}/api/verify?token=${token}`;
      const _html = `
      <div>
        <h4>Welcome to MyMarvin.</h4>
        <p>To be able to discover more about us. Please visit the URL below to activate your account.</p>
        <p>Link Active: <a href="${url}" target="_blank">${url}</a></p>
        <p><strong>Note: This link will expire after 24 hours</strong></p>
        <p></p>
        <p>Regards,</p>
        <p>Support Team</p>
      </div>
    `;
      // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

      const msg = {
        to: email, // Change to your recipient
        from: process.env.FROM_EMAIL, // Change to your verified sender
        subject: "Welcome to MyMarvin!",
        text: "Verify Account",
        html: _html,
      };
      sgMail
        .send(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log(response[0].headers);
        })
        .catch((error) => {
          console.error(error);
        });

      res.status(200).json({
        _id: user._id,
        email: user.email,
        ainame: user.ainame,
        firstName: user.firstName,
        lastName: user.lastName,
        verify: user.verify,
        token,
      });
    } else {
      // duplicate email
      res.status(400).json({
        message: "This email already exists",
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

const grantFacebook = async (req, res) => {
  try {
    const { email, accessToken } = req.body;

    const verify = await axios.get(`https://graph.facebook.com/v8.0/me?access_token=${accessToken}`)
      .then(res => { return res.data })
      .catch(error => res.error);

    const longAccessToken = await axios.get(`https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&
    client_id=${process.env.APP_ID}&
    client_secret=${process.env.APP_SECRET}&
    fb_exchange_token=${accessToken}`)
      .then(res => { return res.data })
      .catch(error => res.error);

    const firstName = verify.name.slice(0, verify.name.search(' '))
    const lastName = verify.name.slice((verify.name.search(' ') + 1))
    const password = uuidv4();

    let user = await User.findOne({ email }).exec();
    if (!user) {
      const customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
      });

      user = new User({
        email,
        password,
        firstName,
        lastName,
        verify: true,
        name: `${firstName} ${lastName}`,
        ainame: `${firstName}_${(Math.random() + 1)
          .toString(36)
          .substring(7)}`.toLowerCase(),
        customer_id: customer.id,
        fbAccountId: verify.id,
        fbAccessToken: longAccessToken.access_token,
      });

      await user.save();
      const roomChat = new Room({
        title: "General chat",
        type: "chat",
        user: user._id,
        isGeneral: true,
      });
      const roomImages = new Room({
        title: "General images",
        type: "images",
        user: user._id,
        isGeneral: true,
      });
      await roomChat.save();
      await roomImages.save();

      const url = `${process.env.BUSINESS_FRONTEND_URL}/auth/login`;
      const _html = `
        <div>
          <h4>Congratulations!</h4>
          <p>Your account has been activated. Log in now to discover more interesting things</p>
          <p><a href="${url}" target="_blank">Login Here</a></p>
          <p><strong>Note: This link will expire after 24 hours</strong></p>
          <p></p>
          <p>Regards,</p>
          <p>Support Team</p>
        </div>
      `;

      const msg = {
        to: user.email,
        from: process.env.FROM_EMAIL,
        subject: "Account activated",
        text: "Account activated",
        html: _html,
      };
      sgMail
        .send(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log(response[0].headers);
        })
        .catch((error) => {
          console.error('error', error);
        });
    }
    user.fbAccessToken = longAccessToken.access_token;
    user.save();

    const token = jwt.sign(
      {
        use: {
          _id: user._id,
          email: user.email,
        },
      },
      process.env.JWT_SECRET
    );
    res.status(200).json({
      _id: user._id,
      email: user.email,
      ainame: user.ainame,
      firstName: user.firstName,
      lastName: user.lastName,
      verify: user.verify,
      token,
    });

  } catch (error) {
    res.status(400).json({
      message: "Register failed, error:", error
    }
    );
  }
};

const sendLinkVerify = async (req, res) => {
  try {
    const { use } = req.user;
    // send email verify account
    const token = jwt.sign(
      {
        use: {
          _id: use._id,
          email: use.email,
        },
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    const url = `${process.env.BACKEND_URL}/api/verify?token=${token}`;
    const _html = `
      <div>
        <h4>Verify Email</h4>
        <p>Link Active: <a href="${url}" target="_blank">${url}</a></p>
        <p><strong>Note: This link will expire after 24 hours</strong></p>
        <p></p>
        <p>Regards,</p>
        <p>Support Team</p>
      </div>
    `;
    // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

    const msg = {
      to: use.email, // Change to your recipient
      from: process.env.FROM_EMAIL, // Change to your verified sender
      subject: "Verify Email",
      text: "Verify Account",
      html: _html,
    };
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });

    res.status(200).json({
      message: "Verification email sent. Please check your mailbox.",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Send mail verify failed",
    });
  }
};

const verifyAccount = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.use._id).exec();

    // create account stripe
    // const account = await stripe.accounts.create({
    //   type: 'custom',
    //   // country: 'US',
    //   email: user.email,
    //   capabilities: {
    //     card_payments: {requested: true},
    //     link_payments: {requested: true},
    //   },
    // });

    // create account link
    // const accountLink = await stripe.accountLinks.create({
    //   account: account.id,
    //   refresh_url: `${process.env.BUSINESS_FRONTEND_URL}/reauth`,
    //   return_url: `${process.env.BUSINESS_FRONTEND_URL}/return`,
    //   type: 'account_onboarding',
    // });

    // create customer stripe
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });

    user.verify = true;
    user.name = `${user.firstName} ${user.lastName}`;
    const txt = (Math.random() + 1).toString(36).substring(7);
    user.ainame = `${user.firstName}_${txt}`.toLowerCase();
    // user.account_id = account.id;
    // user.account_link = accountLink;
    user.customer_id = customer.id;
    await user.save();

    // create general 2 rooms
    const roomChat = new Room({
      title: "General chat",
      type: "chat",
      user: user._id,
      isGeneral: true,
    });
    const roomImages = new Room({
      title: "General images",
      type: "images",
      user: user._id,
      isGeneral: true,
    });
    await roomChat.save();
    await roomImages.save();

    const url = `${process.env.BUSINESS_FRONTEND_URL}/auth/login`;
    const _html = `
      <div>
        <h4>Congratulations!</h4>
        <p>Your account has been activated. Log in now to discover more interesting things</p>
        <p><a href="${url}" target="_blank">Login Here</a></p>
        <p><strong>Note: This link will expire after 24 hours</strong></p>
        <p></p>
        <p>Regards,</p>
        <p>Support Team</p>
      </div>
    `;
    // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

    const msg = {
      to: user.email, // Change to your recipient
      from: process.env.FROM_EMAIL, // Change to your verified sender
      subject: "Account activated",
      text: "Account activated",
      html: _html,
    };
    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error);
      });

    // create new token
    const _token = jwt.sign(
      {
        use: {
          _id: user._id,
          email: user.email,
        },
      },
      process.env.JWT_SECRET
    );

    res.redirect(
      `${process.env.BUSINESS_FRONTEND_URL}/auth/verify-account?token=${_token}`
    );
    // res.status(200).json({
    //   message: "Your account has been verified.",
    // });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Verify failed",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { use } = req.user;
    const user = await User.findById(use._id)
      .select("-password")
      .populate("followed", "-password")
      .exec();

    console.log("user: ", user);

    res.status(200).json(user);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Get user detail failed",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const avatar = req.file;
    console.log("avatar: ", avatar);
    const { use } = req.user;
    const { email, ainame, firstName, lastName } = req.body;
    // validate ainame
    // const checkUsername = await User.findOne({ ainame }).exec();
    // if (checkUsername) {
    //   res.status(400).json({
    //     message: "Username already exists. Please try another ainame",
    //   });
    // } else {
    if (avatar) {
      // user.avatar = avatar;
      const params = uploadParams;

      uploadParams.Key = `ai_profile/${ainame}_${Date.now().toString()}.${req.file.originalname
        .split(".")
        .pop()}`;
      // uploadParams.Key = "ai_profile/" + req.file.originalname;
      uploadParams.Body = req.file.buffer;
      console.log("params: ", params);
      await s3Client.upload(params, async (err, data) => {
        if (err) {
          console.log("err: ", err);
          res.status(400).json({ error: "Error -> " + err });
        }

        // update user
        const user = await User.findById(use._id).select("-password").exec();
        user.firstName = firstName;
        user.lastName = lastName;
        // user.name = name;
        user.avatar = data;
        await user.save();

        res.status(200).json(user);
      });
    } else {
      const user = await User.findById(use._id).select("-password").exec();
      user.firstName = firstName;
      user.lastName = lastName;
      // user.ainame = ainame;
      await user.save();
      res.status(200).json(user);
    }

    // }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update profile failed",
    });
  }
};

const createYourAi = async (req, res) => {
  try {
    const avatar = req.file;
    console.log("avatar: ", avatar);
    const { token, ainame, name } = req.body;
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // validate ainame
    const checkUsername = await User.findOne({ ainame }).exec();
    if (checkUsername) {
      res.status(400).json({
        message: "Username already exists. Please try another ainame",
      });
    } else {
      // upload avatar
      const params = uploadParams;

      uploadParams.Key = `generated_images/${ainame}_${Date.now().toString()}.${req.file.originalname
        .split(".")
        .pop()}`;
      // uploadParams.Key = "ai_profile/" + req.file.originalname;
      uploadParams.Body = req.file.buffer;
      console.log("params: ", params);
      await s3Client.upload(params, async (err, data) => {
        if (err) {
          console.log("err: ", err);
          res.status(400).json({ error: "Error -> " + err });
        }

        // update user
        const user = await User.findById(decoded.use._id)
          .select("-password")
          .exec();
        user.name = name;
        user.ainame = ainame;
        user.avatar = data;
        await user.save();

        // create general 2 rooms
        const roomChat = new Room({
          title: "General chat",
          type: "chat",
          user: user._id,
          isGeneral: true,
        });
        const roomImages = new Room({
          title: "General images",
          type: "images",
          user: user._id,
          isGeneral: true,
        });
        await roomChat.save();
        await roomImages.save();

        res.status(200).json(user);
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update profile failed",
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { use } = req.user;
    const { newPassword } = req.body;
    const user = await User.findById(use._id).exec();
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Updated password successfully",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Update password failed",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.use._id).exec();

    user.password = password;
    await user.save();

    res.status(200).json({
      message: "Updated new password",
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

const sendLinkResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // send email verify account
    const user = await User.findOne({ email }).select("-password").exec();
    if (!user) {
      res.status(400).json({
        message: "User not found.",
      });
    } else {
      const token = jwt.sign(
        {
          use: {
            _id: user._id,
            email: user.email,
          },
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      const url = `${process.env.BUSINESS_FRONTEND_URL}/auth/new-password?token=${token}`;
      const _html = `
            <div>
              <h4>Reset Password</h4>
              <p>Link Reset: <a href="${url}" target="_blank">${url}</a></p>
              <p><strong>Note: This link will expire after 24 hours</strong></p>
              <p></p>
              <p>Regards,</p>
              <p>Support Team</p>
            </div>
          `;
      // const send = await sendMail(email, "Welcome to MyMarvin!", "", _html);

      const msg = {
        to: user.email, // Change to your recipient
        from: process.env.FROM_EMAIL, // Change to your verified sender
        subject: "Reset Password",
        text: "Reset Password",
        html: _html,
      };
      sgMail
        .send(msg)
        .then((response) => {
          console.log(response[0].statusCode);
          console.log(response[0].headers);
        })
        .catch((error) => {
          console.error(error);
        });

      res.status(200).json({
        message: "Reset password sent. Please check your mailbox.",
      });
    }
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

const getCredit = async (req, res) => {
  try {
    const { use } = req.user;
    const user = await User.findOne({
      _id: use._id,
    }).exec();
    console.log(user.balance, "00000000User");
    res.status(200).json({
      message: `Your balance is ${user.balance}`,
      balance: user.balance,
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "Register failed",
    });
  }
};

module.exports = {
  login,
  register,
  verifyAccount,
  sendLinkVerify,
  getProfile,
  updateProfile,
  updatePassword,
  createYourAi,
  sendLinkResetPassword,
  resetPassword,
  getCredit,
  grantFacebook,
};
