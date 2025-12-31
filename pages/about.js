import Header from '../components/Header';
import Footer from '../components/Footer';

export default function About() {
  const campaigns = [
    { title: 'Zero Waste Week', description: 'Join us in reducing food waste by 50% this week.' },
    { title: 'Community Drives', description: 'Monthly food drives in local communities.' },
    { title: 'School Programs', description: 'Educating children about food conservation.' },
  ];

  return (
    <>
      <Header />
      <main className="py-12 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">About Refoodify</h1>
        <p className="text-lg text-gray-700 mb-6">
          Refoodify is a platform dedicated to reducing food waste by connecting donors (restaurants, hotels, households) with NGOs and users in need. Our mission is to save food and save lives through smart inventory management and easy donations.
        </p>
        <p className="text-gray-600 mb-8">
          Founded in 2023, we use technology to make food donation seamless, with features like barcode scanning, expiry alerts, and real-time maps.
        </p>

        <h2 className="text-2xl font-bold mb-6">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-3xl font-bold text-primary">10,000+</h3>
            <p>Meals Distributed</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-3xl font-bold text-primary">500+</h3>
            <p>Active Donors</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <h3 className="text-3xl font-bold text-primary">200+</h3>
            <p>NGOs Helped</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Awareness Campaigns</h2>
        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{campaign.title}</h3>
              <p className="text-gray-600">{campaign.description}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}