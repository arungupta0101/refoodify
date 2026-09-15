import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, default: 'user' },
  address: String,
  phone: String,
  bio: String,
  status: { type: String, default: 'Pending' },
  photoURL: String,
  fssai: String,
  workingHours: String,
  registrationNumber: String,
  coverageArea: String,
  organizationName: String,
  points: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  followers: { type: [String], default: [] },
  following: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastCheckIn: Date,
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: String,
  dashboardData: { type: mongoose.Schema.Types.Mixed, default: {} },
  resetOtp: String,
  resetOtpExpiry: Date
});

const donationSchema = new mongoose.Schema({
  donorId: String,
  type: String,
  foodType: String,
  quantity: String,
  location: String,
  expiryDate: String,
  amount: String,
  isEmergency: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  ngoId: String, // ID of the NGO who picked up
  ignoredBy: [String], // NGOs who ignored this request
  donorRating: Number, // Rating given by Donor to NGO
  donorReview: String, // Review given by Donor to NGO
  verificationRating: Number,
  verificationReview: String,
  verificationPhoto: String,
  status: { type: String, default: 'pending' },
  bookedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  ownerId: String,
  name: String,
  location: String,
  createdAt: { type: Date, default: Date.now }
});

const volunteerSchema = new mongoose.Schema({
  userId: String,
  volunteerName: String,
  volunteerEmail: String,
  volunteerPhone: String,
  city: String,
  role: String,
  vehicle: String,
  referenceNumber: String,
  status: { type: String, default: 'pending' },
  submittedAt: { type: Date, default: Date.now }
});

const faqSchema = new mongoose.Schema({
  userId: String,
  userEmail: String,
  description: String,
  screenshot: String, // Storing Base64 string for simplicity
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
  userId: String,
  name: String,
  quantity: String,
  unit: String,
  category: String,
  expiry: String,
  note: String,
  alertDays: Number,
  location: String,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  type: { type: String, default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const emergencyNeedSchema = new mongoose.Schema({
  ngoId: String,
  ngoName: String,
  title: String,
  description: String,
  requiredMeals: Number,
  raisedMeals: { type: Number, default: 0 },
  location: String,
  expiresAt: Date,
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  location: String,
  organizer: String,
  participants: [String],
  image: String,
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  content: String,
  type: { type: String, default: 'text' }, // text, image, audio
  fileUrl: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const communityStorySchema = new mongoose.Schema({
  author: {
    userId: String,
    name: String,
    avatar: String,
    handle: String,
    role: String,
    points: Number
  },
  image: { type: String, required: true },
  caption: String,
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24 hours
});

const wasteLogSchema = new mongoose.Schema({
  userId: String,
  itemName: String,
  quantity: String,
  category: String,
  reason: { type: String, default: 'Expired' }, // 'Expired', 'Over-purchased', 'Spoiled', 'Forgot in fridge'
  actionTaken: { type: String, default: 'composted' }, // 'composted', 'bio_waste_pickup', 'animal_shelter', 'upcycled', 'landfill'
  methaneSavedKg: { type: Number, default: 0.5 },
  co2SavedKg: { type: Number, default: 1.2 },
  pointsEarned: { type: Number, default: 25 },
  createdAt: { type: Date, default: Date.now }
});

const rewardSchema = new mongoose.Schema({
  title: String,
  description: String,
  pointsRequired: Number,
  category: String,
  code: String,
  createdAt: { type: Date, default: Date.now }
});

const demandHistorySchema = new mongoose.Schema({
  userId: { type: String, default: 'demo_user' },
  itemName: { type: String, required: true },
  quantityPrepared: { type: Number, required: true },
  quantityConsumed: { type: Number, required: true },
  quantityWasted: { type: Number, default: 0 },
  unit: { type: String, default: 'servings' },
  date: { type: Date, required: true },
  dayOfWeek: { type: String },
  notes: String,
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const demandPredictionSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo_user' },
  itemName: { type: String, required: true },
  predictedDemand: { type: Number, required: true },
  recommendedProduction: { type: Number, required: true },
  currentInventory: { type: Number, default: 0 },
  unit: { type: String, default: 'servings' },
  periodDays: { type: Number, default: 7 },
  historyRangeDays: { type: Number, default: 30 },
  trend: { type: String, default: 'stable' }, // 'increasing', 'decreasing', 'stable'
  trendPercentage: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 85 },
  insights: [String],
  dailyForecast: [{
    date: String,
    dayOfWeek: String,
    predictedDemand: Number,
    isWeekend: Boolean
  }],
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const surplusPredictionSchema = new mongoose.Schema({
  userId: { type: String, default: 'demo_user' },
  itemName: { type: String, required: true },
  productionQuantity: { type: Number, required: true },
  currentInventory: { type: Number, default: 0 },
  expectedConsumption: { type: Number, required: true },
  predictedSurplus: { type: Number, required: true },
  surplusPercentage: { type: Number, default: 0 },
  unit: { type: String, default: 'servings' },
  periodDays: { type: Number, default: 1 },
  riskLevel: { type: String, default: 'Medium' }, // 'Low', 'Medium', 'High'
  insight: String,
  recommendation: String,
  isDemo: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
export const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);
export const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
export const Faq = FAQ;
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const EmergencyNeed = mongoose.models.EmergencyNeed || mongoose.model('EmergencyNeed', emergencyNeedSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const CommunityStory = mongoose.models.CommunityStory || mongoose.model('CommunityStory', communityStorySchema);
export const WasteLog = mongoose.models.WasteLog || mongoose.model('WasteLog', wasteLogSchema);

export const Story = mongoose.models.Story || mongoose.model('Story', communityStorySchema);
export const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);

export const DemandHistory = mongoose.models.DemandHistory || mongoose.model('DemandHistory', demandHistorySchema);
export const DemandPrediction = mongoose.models.DemandPrediction || mongoose.model('DemandPrediction', demandPredictionSchema);
export const SurplusPrediction = mongoose.models.SurplusPrediction || mongoose.model('SurplusPrediction', surplusPredictionSchema);

