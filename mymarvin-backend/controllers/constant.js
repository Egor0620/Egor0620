const constant = require("../common/constants");

const getTypeGoal = async (req, res) => {
  res.status(200).json({
    data: constant.ArrGoalType
  });
};

const getTypeVoice = async (req, res) => {
  res.status(200).json({
    data: constant.ArrVoiceType || []
  });
};

const getTypeImage = async (req, res) => {
  res.status(200).json({
    data: constant.ArrImageType || []
  });
};

module.exports = {
  getTypeGoal,
  getTypeVoice,
  getTypeImage
};
