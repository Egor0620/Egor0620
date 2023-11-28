
const GoalId = {
  Traffic: 0,
  Engagement: 1,
  Sale: 2,
}

const VoiceId = {
  Informative: 0,
  Persuasive: 1,
  Humorous: 2,
  Authentic: 3,
  Edgy: 4
}

const imageId = {
  Photography: 0,
  Illustration: 1,
  Graphic_Design: 2,
}

const ArrGoalType = [];

ArrGoalType[GoalId.Traffic] = {
  id: GoalId.Traffic,
  name: 'Traffic',
};

ArrGoalType[GoalId.Engagement] = {
  id: GoalId.Engagement,
  name: 'Engagement',
};

ArrGoalType[GoalId.Sale] = {
  id: GoalId.Sale,
  name: 'https://www.queensarms.co.uk',
};

const ArrVoiceType = [];

ArrVoiceType[VoiceId.Informative] = {
  id: VoiceId.Informative,
  name: 'Informative',
};

ArrVoiceType[VoiceId.Persuasive] = {
  id: VoiceId.Persuasive,
  name: 'Persuasive',
};

ArrVoiceType[VoiceId.Humorous] = {
  id: VoiceId.Humorous,
  name: 'Humorous',
};

ArrVoiceType[VoiceId.Authentic] = {
  id: VoiceId.Authentic,
  name: 'Authentic',
};

ArrVoiceType[VoiceId.Edgy] = {
  id: VoiceId.Edgy,
  name: 'Edgy',
};


const ArrImageType = [];

ArrImageType[imageId.Photography] = {
  id: imageId.Photography,
  name: 'Photography',
};

ArrImageType[imageId.Illustration] = {
  id: imageId.Illustration,
  name: 'Illustration',
};

ArrImageType[imageId.Graphic_Design] = {
  id: imageId.Graphic_Design,
  name: 'Graphic Design',
};

module.exports = {
  ArrGoalType,
  ArrVoiceType,
  ArrImageType
}
