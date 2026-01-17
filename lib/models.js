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
  createdAt: { type: Date, default: Date.now },
  lastCheckIn: Date,
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: String
});

const donationSchema = new mongoose.Schema({
  donorId: String,
  type: String,
  foodType: String,
  quantity: String,
  location: String,
  expiryDate: String,
  amount: String,
  verified: { type: Boolean, default: false },
  ngoId: String, // ID of the NGO who picked up
  donorRating: Number, // Rating given by Donor to NGO
  donorReview: String, // Review given by Donor to NGO
  verificationRating: Number,
  verificationReview: String,
  verificationPhoto: String,
  status: { type: String, default: 'pending' },
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
  expiry: String,
  note: String,
  alertDays: Number,
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
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const storySchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  image: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const rewardSchema = new mongoose.Schema({
  userId: String,
  rewardName: String,
  pointsCost: Number,
  code: String,
  redeemedAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);
export const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);
export const Volunteer = mongoose.models.Volunteer || mongoose.model('Volunteer', volunteerSchema);
export const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const EmergencyNeed = mongoose.models.EmergencyNeed || mongoose.model('EmergencyNeed', emergencyNeedSchema);
export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const Story = mongoose.models.Story || mongoose.model('Story', storySchema);
export const Reward = mongoose.models.Reward || mongoose.model('Reward', rewardSchema);